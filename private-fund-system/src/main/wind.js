const axios = require('axios');
const WebSocket = require('ws');
const logger = require('./utils/logger');

let windConfig = {
  apiKey: process.env.WIND_API_KEY || '',
  apiSecret: process.env.WIND_API_SECRET || '',
  restUrl: process.env.WIND_REST_URL || 'https://api.wind.com.cn',
  wsUrl: process.env.WIND_WS_URL || 'wss://ws.wind.com.cn',
  timeout: 30000
};

let wsClient = null;
let subscriptions = new Map();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

async function initWindApi() {
  try {
    if (!windConfig.apiKey) {
      logger.warn('Wind API密钥未配置，部分功能将不可用');
      return false;
    }

    await testConnection();
    logger.info('Wind API连接成功');
    return true;
  } catch (error) {
    logger.error('Wind API初始化失败:', error);
    throw error;
  }
}

async function testConnection() {
  try {
    const response = await axios.get(`${windConfig.restUrl}/v1/health`, {
      headers: getHeaders(),
      timeout: windConfig.timeout
    });
    return response.data.status === 'ok';
  } catch (error) {
    throw new Error(`Wind API连接测试失败: ${error.message}`);
  }
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${windConfig.apiKey}`,
    'Content-Type': 'application/json',
    'X-Wind-Client': 'private-fund-system/1.0.0'
  };
}

async function getWindData(codes, indicators, startDate, endDate, options = {}) {
  try {
    const params = {
      codes: Array.isArray(codes) ? codes.join(',') : codes,
      indicators: Array.isArray(indicators) ? indicators.join(',') : indicators,
      startDate: startDate || getDefaultStartDate(),
      endDate: endDate || new Date().toISOString().split('T')[0],
      frequency: options.frequency || 'daily',
      adjustFlag: options.adjustFlag || '1'
    };

    const response = await axios.get(`${windConfig.restUrl}/v1/data`, {
      params,
      headers: getHeaders(),
      timeout: windConfig.timeout
    });

    return formatWindResponse(response.data);
  } catch (error) {
    logger.error('Wind数据获取失败:', error);
    throw error;
  }
}

async function getStockData(stockCode, options = {}) {
  const indicators = options.indicators || [
    'rt_last', 'rt_chg', 'rt_chg_pct', 'rt_vol', 'rt_amount',
    'rt_pe', 'rt_pb', 'rt_market_cap'
  ];
  
  return await getWindData(stockCode, indicators, options.startDate, options.endDate, options);
}

async function getBondData(bondCode, options = {}) {
  const indicators = options.indicators || [
    'rt_last', 'rt_yield', 'rt_duration', 'rt_convexity',
    'rt_coupon_rate', 'rt_maturity_date'
  ];
  
  return await getWindData(bondCode, indicators, options.startDate, options.endDate, options);
}

async function getFundData(fundCode, options = {}) {
  const indicators = options.indicators || [
    'rt_last', 'rt_nav', 'rt_acc_nav', 'rt_return_1m', 'rt_return_3m',
    'rt_return_1y', 'rt_sharpe', 'rt_max_drawdown'
  ];
  
  return await getWindData(fundCode, indicators, options.startDate, options.endDate, options);
}

async function getIndexData(indexCode, options = {}) {
  const indicators = options.indicators || [
    'rt_last', 'rt_chg', 'rt_chg_pct', 'rt_vol', 'rt_amount',
    'rt_pe', 'rt_pb'
  ];
  
  return await getWindData(indexCode, indicators, options.startDate, options.endDate, options);
}

async function getMarketOverview() {
  try {
    const response = await axios.get(`${windConfig.restUrl}/v1/market/overview`, {
      headers: getHeaders(),
      timeout: windConfig.timeout
    });
    return response.data;
  } catch (error) {
    logger.error('获取市场概览失败:', error);
    throw error;
  }
}

async function getIndustryData(industryCode, options = {}) {
  try {
    const params = {
      industryCode,
      indicators: options.indicators || ['rt_last', 'rt_chg_pct', 'rt_pe', 'rt_pb'],
      startDate: options.startDate || getDefaultStartDate(),
      endDate: options.endDate || new Date().toISOString().split('T')[0]
    };

    const response = await axios.get(`${windConfig.restUrl}/v1/industry`, {
      params,
      headers: getHeaders(),
      timeout: windConfig.timeout
    });

    return response.data;
  } catch (error) {
    logger.error('获取行业数据失败:', error);
    throw error;
  }
}

async function searchSecurities(keyword, options = {}) {
  try {
    const params = {
      keyword,
      type: options.type || 'all',
      exchange: options.exchange || 'all',
      limit: options.limit || 20
    };

    const response = await axios.get(`${windConfig.restUrl}/v1/search`, {
      params,
      headers: getHeaders(),
      timeout: windConfig.timeout
    });

    return response.data;
  } catch (error) {
    logger.error('证券搜索失败:', error);
    throw error;
  }
}

function connectWebSocket() {
  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    return;
  }

  wsClient = new WebSocket(windConfig.wsUrl, {
    headers: getHeaders()
  });

  wsClient.on('open', () => {
    logger.info('Wind WebSocket连接成功');
    reconnectAttempts = 0;
    resubscribeAll();
  });

  wsClient.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      handleRealtimeData(parsed);
    } catch (error) {
      logger.error('WebSocket消息解析失败:', error);
    }
  });

  wsClient.on('close', () => {
    logger.warn('Wind WebSocket连接关闭');
    attemptReconnect();
  });

  wsClient.on('error', (error) => {
    logger.error('Wind WebSocket错误:', error);
  });
}

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error('Wind WebSocket重连次数超限');
    return;
  }

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
  
  logger.info(`Wind WebSocket将在${delay}ms后重连 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  setTimeout(connectWebSocket, delay);
}

function subscribe(codes, callback) {
  const codeList = Array.isArray(codes) ? codes : [codes];
  
  codeList.forEach(code => {
    subscriptions.set(code, callback);
  });

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({
      action: 'subscribe',
      codes: codeList
    }));
  }
}

function unsubscribe(codes) {
  const codeList = Array.isArray(codes) ? codes : [codes];
  
  codeList.forEach(code => {
    subscriptions.delete(code);
  });

  if (wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({
      action: 'unsubscribe',
      codes: codeList
    }));
  }
}

function resubscribeAll() {
  if (subscriptions.size > 0 && wsClient && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({
      action: 'subscribe',
      codes: Array.from(subscriptions.keys())
    }));
  }
}

function handleRealtimeData(data) {
  const { code, ...rest } = data;
  const callback = subscriptions.get(code);
  
  if (callback) {
    callback({
      code,
      ...rest,
      timestamp: new Date().toISOString()
    });
  }
}

function formatWindResponse(data) {
  if (!data || !data.data) return [];
  
  return data.data.map(item => ({
    code: item.code,
    name: item.name,
    date: item.date,
    indicators: item.indicators || {},
    metadata: item.metadata || {}
  }));
}

function getDefaultStartDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split('T')[0];
}

function disconnect() {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
  subscriptions.clear();
}

module.exports = {
  initWindApi,
  getWindData,
  getStockData,
  getBondData,
  getFundData,
  getIndexData,
  getMarketOverview,
  getIndustryData,
  searchSecurities,
  subscribe,
  unsubscribe,
  connectWebSocket,
  disconnect
};
