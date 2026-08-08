const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, SystemLog } = require('./database');
const logger = require('./utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'private-fund-system-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: '认证令牌无效或已过期' });
  }

  req.user = decoded;
  next();
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
}

async function login(username, password, ip) {
  try {
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      await logAction(null, 'login', 'auth', { username, reason: '用户不存在' }, ip, 'failure');
      throw new Error('用户名或密码错误');
    }

    if (user.status === 'locked') {
      await logAction(user.id, 'login', 'auth', { reason: '账户已锁定' }, ip, 'failure');
      throw new Error('账户已被锁定，请联系管理员');
    }

    if (user.status === 'inactive') {
      await logAction(user.id, 'login', 'auth', { reason: '账户未激活' }, ip, 'failure');
      throw new Error('账户未激活，请联系管理员');
    }

    const isValid = await comparePassword(password, user.password);
    
    if (!isValid) {
      await logAction(user.id, 'login', 'auth', { reason: '密码错误' }, ip, 'failure');
      throw new Error('用户名或密码错误');
    }

    await user.update({
      lastLogin: new Date(),
      loginIp: ip
    });

    const token = generateToken(user);
    
    await logAction(user.id, 'login', 'auth', { success: true }, ip, 'success');

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    };
  } catch (error) {
    logger.error('登录失败:', error);
    throw error;
  }
}

async function register(userData, ip) {
  try {
    const existingUser = await User.findOne({
      where: { username: userData.username }
    });

    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await hashPassword(userData.password);

    const user = await User.create({
      username: userData.username,
      password: hashedPassword,
      realName: userData.realName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'viewer',
      status: 'active'
    });

    await logAction(user.id, 'register', 'auth', { username: user.username }, ip, 'success');

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      role: user.role
    };
  } catch (error) {
    logger.error('注册失败:', error);
    throw error;
  }
}

async function changePassword(userId, oldPassword, newPassword) {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }

    const isValid = await comparePassword(oldPassword, user.password);
    
    if (!isValid) {
      throw new Error('原密码错误');
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    await logAction(userId, 'change_password', 'auth', { success: true }, null, 'success');

    return true;
  } catch (error) {
    logger.error('修改密码失败:', error);
    throw error;
  }
}

async function resetPassword(userId, newPassword) {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    await logAction(userId, 'reset_password', 'auth', { success: true }, null, 'success');

    return true;
  } catch (error) {
    logger.error('重置密码失败:', error);
    throw error;
  }
}

async function logAction(userId, action, module, details, ip, status) {
  try {
    await SystemLog.create({
      userId,
      action,
      module,
      details,
      ip,
      status
    });
  } catch (error) {
    logger.error('记录日志失败:', error);
  }
}

async function getUserInfo(userId) {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    throw error;
  }
}

async function updateUserInfo(userId, updateData) {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('用户不存在');
    }

    const allowedFields = ['realName', 'email', 'phone'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);

    await logAction(userId, 'update_profile', 'auth', { fields: Object.keys(filteredData) }, null, 'success');

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
  } catch (error) {
    logger.error('更新用户信息失败:', error);
    throw error;
  }
}

function initAuth(app) {
  app.use((req, res, next) => {
    if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
      return next();
    }
    authMiddleware(req, res, next);
  });
}

module.exports = {
  initAuth,
  authMiddleware,
  roleMiddleware,
  login,
  register,
  changePassword,
  resetPassword,
  getUserInfo,
  updateUserInfo,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};
