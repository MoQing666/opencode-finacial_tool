const express = require('express');
const router = express.Router();
const { MarketData } = require('../database');
const wind = require('../wind');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

router.get('/stocks', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword } = req.query;
    
    const where = { dataType: 'stock' };
    if (keyword) {
      where[Op.or] = [
        { symbol: { [Op.iLike]: `%${keyword}%` } },
        { name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await MarketData.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      success: true,
      data: {
        items: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    logger.error('获取股票列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bonds', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword } = req.query;
    
    const where = { dataType: 'bond' };
    if (keyword) {
      where[Op.or] = [
        { symbol: { [Op.iLike]: `%${keyword}%` } },
        { name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await MarketData.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      success: true,
      data: {
        items: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    logger.error('获取债券列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/funds', async (req, res) => {
  try {
    const { page = 1, pageSize = 50, keyword } = req.query;
    
    const where = { dataType: 'fund' };
    if (keyword) {
      where[Op.or] = [
        { symbol: { [Op.iLike]: `%${keyword}%` } },
        { name: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await MarketData.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      success: true,
      data: {
        items: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    logger.error('获取基金列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/indices', async (req, res) => {
  try {
    const { page = 1, pageSize = 50 } = req.query;
    
    const where = { dataType: 'index' };

    const { count, rows } = await MarketData.findAndCountAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    res.json({
      success: true,
      data: {
        items: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    logger.error('获取指数列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { keyword, type } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ success: false, error: '请输入搜索关键词' });
    }

    const where = {
      [Op.or]: [
        { symbol: { [Op.iLike]: `%${keyword}%` } },
        { name: { [Op.iLike]: `%${keyword}%` } }
      ]
    };
    
    if (type) where.dataType = type;

    const results = await MarketData.findAll({
      where,
      order: [['timestamp', 'DESC']],
      limit: 20
    });

    res.json({ success: true, data: results });
  } catch (error) {
    logger.error('市场数据搜索失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { startDate, endDate, frequency = 'daily' } = req.query;
    
    const where = { symbol };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const data = await MarketData.findAll({
      where,
      order: [['timestamp', 'ASC']]
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取历史数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/realtime/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const data = await wind.getStockData(symbol);
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('获取实时数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const overview = await wind.getMarketOverview();
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('获取市场概览失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
