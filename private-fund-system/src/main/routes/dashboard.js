const express = require('express');
const router = express.Router();
const { Project, MarketData, WindData, PostInvestment } = require('../database');
const logger = require('../utils/logger');
const { Op, fn, col } = require('sequelize');

router.get('/overview', async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'active' } });
    const totalInvestment = await Project.sum('actualAmount') || 0;
    const avgReturn = await PostInvestment.findAll({
      attributes: [[fn('AVG', col('financialData.return')), 'avgReturn']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalInvestment,
        avgReturn: avgReturn[0]?.avgReturn || 0
      }
    });
  } catch (error) {
    logger.error('获取概览数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/project-distribution', async (req, res) => {
  try {
    const stageDistribution = await Project.findAll({
      attributes: ['stage', [fn('COUNT', '*'), 'count']],
      group: ['stage'],
      raw: true
    });

    const industryDistribution = await Project.findAll({
      attributes: ['industry', [fn('COUNT', '*'), 'count']],
      group: ['industry'],
      raw: true
    });

    const regionDistribution = await Project.findAll({
      attributes: ['region', [fn('COUNT', '*'), 'count']],
      group: ['region'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        stage: stageDistribution,
        industry: industryDistribution,
        region: regionDistribution
      }
    });
  } catch (error) {
    logger.error('获取项目分布数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/investment-trend', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const projects = await Project.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('COUNT', '*'), 'count'],
        [fn('SUM', col('actualAmount')), 'amount']
      ],
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });

    res.json({ success: true, data: projects });
  } catch (error) {
    logger.error('获取投资趋势数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/risk-assessment', async (req, res) => {
  try {
    const riskDistribution = await Project.findAll({
      attributes: ['riskLevel', [fn('COUNT', '*'), 'count']],
      group: ['riskLevel'],
      raw: true
    });

    const highRiskProjects = await Project.findAll({
      where: { riskLevel: { [Op.in]: ['high', 'critical'] } },
      attributes: ['id', 'projectName', 'riskLevel', 'status'],
      limit: 10,
      order: [['riskLevel', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        distribution: riskDistribution,
        highRiskProjects
      }
    });
  } catch (error) {
    logger.error('获取风险评估数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/performance-metrics', async (req, res) => {
  try {
    const metrics = await PostInvestment.findAll({
      attributes: [
        'reportType',
        [fn('AVG', col('financialData.revenue')), 'avgRevenue'],
        [fn('AVG', col('financialData.profit')), 'avgProfit'],
        [fn('AVG', col('financialData.return')), 'avgReturn']
      ],
      group: ['reportType'],
      raw: true
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    logger.error('获取绩效指标数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/market-indices', async (req, res) => {
  try {
    const indices = await MarketData.findAll({
      where: { dataType: 'index' },
      order: [['timestamp', 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: indices });
  } catch (error) {
    logger.error('获取市场指数数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/top-investments', async (req, res) => {
  try {
    const topInvestments = await Project.findAll({
      where: { status: 'active' },
      attributes: ['id', 'projectName', 'actualAmount', 'industry', 'riskLevel'],
      order: [['actualAmount', 'DESC']],
      limit: 10
    });

    res.json({ success: true, data: topInvestments });
  } catch (error) {
    logger.error('获取投资排行数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recent-activities', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentProjects = await Project.findAll({
      attributes: ['id', 'projectName', 'stage', 'createdAt', 'updatedAt'],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ success: true, data: recentProjects });
  } catch (error) {
    logger.error('获取最近活动数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
