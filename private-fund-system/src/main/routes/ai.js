const express = require('express');
const router = express.Router();
const llama = require('../llama');
const { AIConversation } = require('../database');
const logger = require('../utils/logger');

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, options } = req.body;
    const userId = req.user.id;
    
    const response = await llama.chat(message, options);
    
    await AIConversation.create({
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      role: 'user',
      content: message,
      tokens: message.length,
      model: 'llama-2-7b-chat'
    });
    
    await AIConversation.create({
      userId,
      sessionId: sessionId || `session_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      tokens: response.tokens,
      model: response.model
    });
    
    res.json({ success: true, data: response });
  } catch (error) {
    logger.error('AI对话接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze/project', async (req, res) => {
  try {
    const projectData = req.body;
    
    const analysis = await llama.analyzeProject(projectData);
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('项目分析接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze/financial', async (req, res) => {
  try {
    const financialData = req.body;
    
    const analysis = await llama.analyzeFinancialData(financialData);
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('财务分析接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/report/generate', async (req, res) => {
  try {
    const { projectId, reportType } = req.body;
    
    const report = await llama.generateReport(projectId, reportType);
    
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('报告生成接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/market/summarize', async (req, res) => {
  try {
    const marketData = req.body;
    
    const summary = await llama.summarizeMarketData(marketData);
    
    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('市场总结接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;
    const userId = req.user.id;
    
    const where = { userId };
    if (sessionId) where.sessionId = sessionId;
    
    const conversations = await AIConversation.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    logger.error('获取对话历史失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sessions = await AIConversation.findAll({
      where: { userId },
      attributes: ['sessionId'],
      group: ['sessionId'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, data: sessions.map(s => s.sessionId) });
  } catch (error) {
    logger.error('获取会话列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    await AIConversation.destroy({
      where: { userId, sessionId }
    });
    
    res.json({ success: true, message: '会话已删除' });
  } catch (error) {
    logger.error('删除会话失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/model/info', async (req, res) => {
  try {
    const info = llama.getModelInfo();
    res.json({ success: true, data: info });
  } catch (error) {
    logger.error('获取模型信息失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
