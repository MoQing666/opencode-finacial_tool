const express = require('express');
const router = express.Router();
const auth = require('../auth');
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    const result = await auth.login(username, password, ip);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('登录接口错误:', error);
    res.status(401).json({ success: false, error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    const result = await auth.register(userData, ip);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('注册接口错误:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/change-password', auth.authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    await auth.changePassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    logger.error('修改密码接口错误:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/profile', auth.authMiddleware, async (req, res) => {
  try {
    const userInfo = await auth.getUserInfo(req.user.id);
    res.json({ success: true, data: userInfo });
  } catch (error) {
    logger.error('获取用户信息接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/profile', auth.authMiddleware, async (req, res) => {
  try {
    const updateData = req.body;
    
    const result = await auth.updateUserInfo(req.user.id, updateData);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('更新用户信息接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/refresh-token', auth.authMiddleware, async (req, res) => {
  try {
    const user = await auth.getUserInfo(req.user.id);
    const token = auth.generateToken(user);
    res.json({ success: true, data: { token } });
  } catch (error) {
    logger.error('刷新令牌接口错误:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
