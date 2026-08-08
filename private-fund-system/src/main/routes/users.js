const express = require('express');
const router = express.Router();
const { User, SystemLog } = require('../database');
const auth = require('../auth');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

router.get('/', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, role, status } = req.query;
    
    const where = {};
    if (keyword) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${keyword}%` } },
        { realName: { [Op.iLike]: `%${keyword}%` } },
        { email: { [Op.iLike]: `%${keyword}%` } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
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
    logger.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('获取用户详情失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const userData = req.body;
    
    const existingUser = await User.findOne({
      where: { username: userData.username }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: '用户名已存在' });
    }

    const hashedPassword = await auth.hashPassword(userData.password);
    userData.password = hashedPassword;

    const user = await User.create(userData);
    
    const { password, ...userWithoutPassword } = user.toJSON();
    
    logger.info(`用户创建成功: ${user.username}`);
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    logger.error('创建用户失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const updateData = req.body;
    
    if (updateData.password) {
      updateData.password = await auth.hashPassword(updateData.password);
    }

    await user.update(updateData);
    
    const { password, ...userWithoutPassword } = user.toJSON();
    
    logger.info(`用户更新成功: ${user.username}`);
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    logger.error('更新用户失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: '不能删除管理员账户' });
    }

    await user.destroy();
    
    logger.info(`用户删除成功: ${user.username}`);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    logger.error('删除用户失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/reset-password', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    await auth.resetPassword(req.params.id, newPassword);
    
    logger.info(`用户密码重置成功: ${req.params.id}`);
    res.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    logger.error('重置密码失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/toggle-status', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: '不能修改管理员账户状态' });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await user.update({ status: newStatus });
    
    logger.info(`用户状态更新成功: ${user.username} -> ${newStatus}`);
    res.json({ success: true, data: { status: newStatus } });
  } catch (error) {
    logger.error('更新用户状态失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs/list', auth.roleMiddleware('admin'), async (req, res) => {
  try {
    const { page = 1, pageSize = 50, userId, action, module, status } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (module) where.module = module;
    if (status) where.status = status;

    const { count, rows } = await SystemLog.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'realName'] }
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
    logger.error('获取系统日志失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
