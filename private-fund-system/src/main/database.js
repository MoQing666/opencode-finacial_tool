const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../src/main/utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const User = sequelize.define('User', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: Sequelize.STRING(50), unique: true, allowNull: false },
  password: { type: Sequelize.STRING(255), allowNull: false },
  realName: { type: Sequelize.STRING(50) },
  email: { type: Sequelize.STRING(100) },
  phone: { type: Sequelize.STRING(20) },
  role: { type: Sequelize.ENUM('admin', 'manager', 'analyst', 'viewer'), defaultValue: 'viewer' },
  status: { type: Sequelize.ENUM('active', 'inactive', 'locked'), defaultValue: 'active' },
  lastLogin: { type: Sequelize.DATE },
  loginIp: { type: Sequelize.STRING(50) }
}, { tableName: 'users', timestamps: true });

const Project = sequelize.define('Project', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  projectName: { type: Sequelize.STRING(200), allowNull: false },
  projectCode: { type: Sequelize.STRING(50), unique: true },
  projectType: { type: Sequelize.ENUM('equity', 'debt', 'mixed', 'fund'), allowNull: false },
  stage: { type: Sequelize.ENUM('prospect', 'due_diligence', 'valuation', 'decision', 'invested', 'exited'), defaultValue: 'prospect' },
  industry: { type: Sequelize.STRING(100) },
  region: { type: Sequelize.STRING(100) },
  targetAmount: { type: Sequelize.DECIMAL(20, 2) },
  actualAmount: { type: Sequelize.DECIMAL(20, 2) },
  currency: { type: Sequelize.STRING(10), defaultValue: 'CNY' },
  startDate: { type: Sequelize.DATE },
  endDate: { type: Sequelize.DATE },
  status: { type: Sequelize.ENUM('active', 'completed', 'suspended', 'cancelled'), defaultValue: 'active' },
  riskLevel: { type: Sequelize.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  managerId: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
  description: { type: Sequelize.TEXT },
  tags: { type: Sequelize.ARRAY(Sequelize.STRING) }
}, { tableName: 'projects', timestamps: true });

const DueDiligence = sequelize.define('DueDiligence', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' } },
  companyName: { type: Sequelize.STRING(200) },
  legalRepresentative: { type: Sequelize.STRING(50) },
  registeredCapital: { type: Sequelize.DECIMAL(20, 2) },
  establishedDate: { type: Sequelize.DATE },
  businessScope: { type: Sequelize.TEXT },
  financialHealth: { type: Sequelize.JSONB },
  teamAssessment: { type: Sequelize.JSONB },
  marketAnalysis: { type: Sequelize.JSONB },
  riskFactors: { type: Sequelize.JSONB },
  conclusion: { type: Sequelize.TEXT },
  score: { type: Sequelize.DECIMAL(5, 2) },
  status: { type: Sequelize.ENUM('draft', 'submitted', 'approved', 'rejected'), defaultValue: 'draft' }
}, { tableName: 'due_diligence', timestamps: true });

const Valuation = sequelize.define('Valuation', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' } },
  method: { type: Sequelize.ENUM('dcf', 'comparable', 'asset', 'hybrid'), allowNull: false },
  valuationDate: { type: Sequelize.DATE, allowNull: false },
  enterpriseValue: { type: Sequelize.DECIMAL(20, 2) },
  equityValue: { type: Sequelize.DECIMAL(20, 2) },
  evEbitda: { type: Sequelize.DECIMAL(10, 2) },
  peRatio: { type: Sequelize.DECIMAL(10, 2) },
  pbRatio: { type: Sequelize.DECIMAL(10, 2) },
  assumptions: { type: Sequelize.JSONB },
  sensitivityAnalysis: { type: Sequelize.JSONB },
  conclusion: { type: Sequelize.TEXT },
  status: { type: Sequelize.ENUM('draft', 'final', 'approved'), defaultValue: 'draft' }
}, { tableName: 'valuations', timestamps: true });

const InvestmentDecision = sequelize.define('InvestmentDecision', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' } },
  decisionDate: { type: Sequelize.DATE, allowNull: false },
  decision: { type: Sequelize.ENUM('approve', 'reject', 'conditional', 'defer'), allowNull: false },
  conditions: { type: Sequelize.TEXT },
  votingResult: { type: Sequelize.JSONB },
  decisionMaker: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
  comments: { type: Sequelize.TEXT }
}, { tableName: 'investment_decisions', timestamps: true });

const PostInvestment = sequelize.define('PostInvestment', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  projectId: { type: Sequelize.INTEGER, references: { model: 'projects', key: 'id' } },
  reportDate: { type: Sequelize.DATE, allowNull: false },
  reportType: { type: Sequelize.ENUM('monthly', 'quarterly', 'annual', 'special'), allowNull: false },
  financialData: { type: Sequelize.JSONB },
  operationalMetrics: { type: Sequelize.JSONB },
  riskIndicators: { type: Sequelize.JSONB },
  keyEvents: { type: Sequelize.JSONB },
  exitPlan: { type: Sequelize.JSONB },
  status: { type: Sequelize.ENUM('draft', 'submitted', 'reviewed'), defaultValue: 'draft' }
}, { tableName: 'post_investment', timestamps: true });

const MarketData = sequelize.define('MarketData', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  dataType: { type: Sequelize.ENUM('stock', 'bond', 'fund', 'index', 'commodity', 'forex'), allowNull: false },
  symbol: { type: Sequelize.STRING(50), allowNull: false },
  name: { type: Sequelize.STRING(200) },
  price: { type: Sequelize.DECIMAL(20, 4) },
  change: { type: Sequelize.DECIMAL(10, 4) },
  changePercent: { type: Sequelize.DECIMAL(10, 4) },
  volume: { type: Sequelize.DECIMAL(20, 2) },
  marketCap: { type: Sequelize.DECIMAL(20, 2) },
  timestamp: { type: Sequelize.DATE, allowNull: false },
  source: { type: Sequelize.STRING(50) },
  metadata: { type: Sequelize.JSONB }
}, { tableName: 'market_data', timestamps: true, indexes: [{ fields: ['symbol', 'timestamp'] }] });

const WindData = sequelize.define('WindData', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  windCode: { type: Sequelize.STRING(50), allowNull: false },
  indicator: { type: Sequelize.STRING(100), allowNull: false },
  value: { type: Sequelize.DECIMAL(20, 6) },
  date: { type: Sequelize.DATE, allowNull: false },
  frequency: { type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual') },
  source: { type: Sequelize.STRING(50), defaultValue: 'wind' },
  metadata: { type: Sequelize.JSONB }
}, { tableName: 'wind_data', timestamps: true, indexes: [{ fields: ['windCode', 'indicator', 'date'] }] });

const AIConversation = sequelize.define('AIConversation', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
  sessionId: { type: Sequelize.STRING(100) },
  role: { type: Sequelize.ENUM('user', 'assistant', 'system'), allowNull: false },
  content: { type: Sequelize.TEXT, allowNull: false },
  tokens: { type: Sequelize.INTEGER },
  model: { type: Sequelize.STRING(50) },
  metadata: { type: Sequelize.JSONB }
}, { tableName: 'ai_conversations', timestamps: true });

const SystemLog = sequelize.define('SystemLog', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: Sequelize.INTEGER },
  action: { type: Sequelize.STRING(100), allowNull: false },
  module: { type: Sequelize.STRING(50) },
  details: { type: Sequelize.JSONB },
  ip: { type: Sequelize.STRING(50) },
  userAgent: { type: Sequelize.STRING(500) },
  status: { type: Sequelize.ENUM('success', 'failure', 'error') }
}, { tableName: 'system_logs', timestamps: true });

Project.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
DueDiligence.belongsTo(Project, { foreignKey: 'projectId' });
Valuation.belongsTo(Project, { foreignKey: 'projectId' });
InvestmentDecision.belongsTo(Project, { foreignKey: 'projectId' });
PostInvestment.belongsTo(Project, { foreignKey: 'projectId' });
AIConversation.belongsTo(User, { foreignKey: 'userId' });

async function initDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
    await sequelize.sync({ alter: true });
    logger.info('数据库表同步完成');
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    throw error;
  }
}

module.exports = {
  sequelize,
  initDatabase,
  User,
  Project,
  DueDiligence,
  Valuation,
  InvestmentDecision,
  PostInvestment,
  MarketData,
  WindData,
  AIConversation,
  SystemLog
};
