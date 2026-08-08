const express = require('express');
const router = express.Router();
const { Project, DueDiligence, Valuation, InvestmentDecision, PostInvestment, User } = require('../database');
const auth = require('../auth');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, stage, industry, keyword } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (stage) where.stage = stage;
    if (industry) where.industry = industry;
    if (keyword) {
      where[Op.or] = [
        { projectName: { [Op.iLike]: `%${keyword}%` } },
        { projectCode: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['createdAt', 'DESC']],
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
    logger.error('获取项目列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'username', 'realName'] },
        { model: DueDiligence },
        { model: Valuation },
        { model: InvestmentDecision },
        { model: PostInvestment }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('获取项目详情失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', auth.roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const projectData = req.body;
    projectData.managerId = req.user.id;
    
    const project = await Project.create(projectData);
    
    logger.info(`项目创建成功: ${project.projectName}`);
    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('创建项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', auth.roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const updateData = req.body;
    await project.update(updateData);
    
    logger.info(`项目更新成功: ${project.projectName}`);
    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('更新项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    await project.destroy();
    
    logger.info(`项目删除成功: ${project.projectName}`);
    res.json({ success: true, message: '项目删除成功' });
  } catch (error) {
    logger.error('删除项目失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/due-diligence', auth.roleMiddleware('admin', 'manager', 'analyst'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const ddData = req.body;
    ddData.projectId = project.id;
    
    const dueDiligence = await DueDiligence.create(ddData);
    
    await project.update({ stage: 'due_diligence' });
    
    logger.info(`尽调报告创建成功: ${project.projectName}`);
    res.json({ success: true, data: dueDiligence });
  } catch (error) {
    logger.error('创建尽调报告失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/valuation', auth.roleMiddleware('admin', 'manager', 'analyst'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const valuationData = req.body;
    valuationData.projectId = project.id;
    
    const valuation = await Valuation.create(valuationData);
    
    await project.update({ stage: 'valuation' });
    
    logger.info(`估值报告创建成功: ${project.projectName}`);
    res.json({ success: true, data: valuation });
  } catch (error) {
    logger.error('创建估值报告失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/decision', auth.roleMiddleware('admin', 'manager'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const decisionData = req.body;
    decisionData.projectId = project.id;
    decisionData.decisionMaker = req.user.id;
    
    const decision = await InvestmentDecision.create(decisionData);
    
    if (decision.decision === 'approve') {
      await project.update({ stage: 'invested' });
    }
    
    logger.info(`投资决策创建成功: ${project.projectName}`);
    res.json({ success: true, data: decision });
  } catch (error) {
    logger.error('创建投资决策失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/post-investment', auth.roleMiddleware('admin', 'manager', 'analyst'), async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: '项目不存在' });
    }

    const reportData = req.body;
    reportData.projectId = project.id;
    
    const report = await PostInvestment.create(reportData);
    
    logger.info(`投后报告创建成功: ${project.projectName}`);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('创建投后报告失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/statistics/overview', async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'active' } });
    const totalInvestment = await Project.sum('actualAmount');
    
    const stageDistribution = await Project.findAll({
      attributes: ['stage', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['stage']
    });

    const industryDistribution = await Project.findAll({
      attributes: ['industry', [require('sequelize').fn('COUNT', '*'), 'count']],
      group: ['industry']
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalInvestment,
        stageDistribution,
        industryDistribution
      }
    });
  } catch (error) {
    logger.error('获取项目统计失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
