const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { initDatabase } = require('./database');
const { initLlamaModel } = require('./llama');
const { initWindApi } = require('./wind');
const { initAuth } = require('./auth');
const logger = require('./utils/logger');

let mainWindow;
let server;
let io;

const isDev = process.argv.includes('--dev');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.ico'),
    title: '私募基金管理系统'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '新建项目', click: () => mainWindow.webContents.send('menu:new-project') },
        { label: '导入数据', click: () => mainWindow.webContents.send('menu:import') },
        { label: '导出报告', click: () => mainWindow.webContents.send('menu:export') },
        { type: 'separator' },
        { label: '退出', click: () => app.quit() }
      ]
    },
    {
      label: '投资管理',
      submenu: [
        { label: '投前管理', click: () => mainWindow.webContents.send('menu:pre-investment') },
        { label: '投后管理', click: () => mainWindow.webContents.send('menu:post-investment') },
        { label: '市场信息', click: () => mainWindow.webContents.send('menu:market') }
      ]
    },
    {
      label: '工具',
      submenu: [
        { label: 'AI助手', click: () => mainWindow.webContents.send('menu:ai-assistant') },
        { label: 'Wind数据', click: () => mainWindow.webContents.send('menu:wind-data') },
        { label: '数据大屏', click: () => mainWindow.webContents.send('menu:dashboard') }
      ]
    },
    {
      label: '系统',
      submenu: [
        { label: '用户管理', click: () => mainWindow.webContents.send('menu:users') },
        { label: '系统设置', click: () => mainWindow.webContents.send('menu:settings') },
        { label: '日志查看', click: () => mainWindow.webContents.send('menu:logs') }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => showAbout() },
        { label: '文档', click: () => mainWindow.webContents.send('menu:docs') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于',
    message: '私募基金管理系统 v1.0.0',
    detail: '投前投后市场信息一体化平台\n支持Wind数据接口\n本地LLaMA模型驱动'
  });
}

async function startServer() {
  const expressApp = express();
  server = http.createServer(expressApp);
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  expressApp.use(cors());
  expressApp.use(helmet());
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));

  try {
    await initDatabase();
    logger.info('数据库初始化完成');

    await initLlamaModel();
    logger.info('LLaMA模型加载完成');

    await initWindApi();
    logger.info('Wind API初始化完成');

    initAuth(expressApp);
    initRoutes(expressApp);
    initSocketHandlers();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    throw error;
  }
}

function initRoutes(app) {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/projects', require('./routes/projects'));
  app.use('/api/market', require('./routes/market'));
  app.use('/api/wind', require('./routes/wind'));
  app.use('/api/ai', require('./routes/ai'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/users', require('./routes/users'));
}

function initSocketHandlers() {
  io.on('connection', (socket) => {
    logger.info(`客户端连接: ${socket.id}`);

    socket.on('wind:subscribe', (codes) => {
      windService.subscribe(codes, (data) => {
        socket.emit('wind:data', data);
      });
    });

    socket.on('ai:chat', async (message) => {
      const response = await llamaService.chat(message);
      socket.emit('ai:response', response);
    });

    socket.on('disconnect', () => {
      logger.info(`客户端断开: ${socket.id}`);
    });
  });
}

app.whenReady().then(async () => {
  createWindow();
  createMenu();
  await startServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (server) server.close();
    app.quit();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron
  };
});
