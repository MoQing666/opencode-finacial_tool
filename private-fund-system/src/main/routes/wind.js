const express = require('express');
const router = express.Router();
const wind = require('../wind');
const logger = require('../utils/logger');

router.get('/stock/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate, indicators } = req.query;
    
    const data = await wind.getStockData(code, {
      startDate,
      endDate,
      indicators: indicators ? indicators.split(',') : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取股票数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bond/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate, indicators } = req.query;
    
    const data = await wind.getBondData(code, {
      startDate,
      endDate,
      indicators: indicators ? indicators.split(',') : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取债券数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fund/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate, indicators } = req.query;
    
    const data = await wind.getFundData(code, {
      startDate,
      endDate,
      indicators: indicators ? indicators.split(',') : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取基金数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/index/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate, indicators } = req.query;
    
    const data = await wind.getIndexData(code, {
      startDate,
      endDate,
      indicators: indicators ? indicators.split(',') : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取指数数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/market/overview', async (req, res) => {
  try {
    const data = await wind.getMarketOverview();
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取市场概览失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/industry/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { startDate, endDate, indicators } = req.query;
    
    const data = await wind.getIndustryData(code, {
      startDate,
      endDate,
      indicators: indicators ? indicators.split(',') : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取行业数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { keyword, type, exchange, limit } = req.query;
    
    const data = await wind.searchSecurities(keyword, {
      type,
      exchange,
      limit: limit ? parseInt(limit) : undefined
    });
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('证券搜索失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { codes, indicators, startDate, endDate } = req.body;
    
    const data = await wind.getWindData(codes, indicators, startDate, endDate);
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('批量获取数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
