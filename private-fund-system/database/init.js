const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres'
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('开始初始化数据库...');
    
    const dbName = process.env.DB_NAME || 'private_fund_dev';
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );
    
    if (dbCheck.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`数据库 ${dbName} 创建成功`);
    } else {
      console.log(`数据库 ${dbName} 已存在`);
    }
    
    client.release();
    
    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres'
    });
    
    const dbClient = await dbPool.connect();
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        real_name VARCHAR(50),
        email VARCHAR(100),
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'viewer',
        status VARCHAR(20) DEFAULT 'active',
        last_login TIMESTAMP,
        login_ip VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('users 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_name VARCHAR(200) NOT NULL,
        project_code VARCHAR(50) UNIQUE,
        project_type VARCHAR(20) NOT NULL,
        stage VARCHAR(20) DEFAULT 'prospect',
        industry VARCHAR(100),
        region VARCHAR(100),
        target_amount DECIMAL(20,2),
        actual_amount DECIMAL(20,2),
        currency VARCHAR(10) DEFAULT 'CNY',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        risk_level VARCHAR(20) DEFAULT 'medium',
        manager_id INTEGER REFERENCES users(id),
        description TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('projects 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS due_diligence (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        company_name VARCHAR(200),
        legal_representative VARCHAR(50),
        registered_capital DECIMAL(20,2),
        established_date TIMESTAMP,
        business_scope TEXT,
        financial_health JSONB,
        team_assessment JSONB,
        market_analysis JSONB,
        risk_factors JSONB,
        conclusion TEXT,
        score DECIMAL(5,2),
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('due_diligence 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS valuations (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        method VARCHAR(20) NOT NULL,
        valuation_date TIMESTAMP NOT NULL,
        enterprise_value DECIMAL(20,2),
        equity_value DECIMAL(20,2),
        ev_ebitda DECIMAL(10,2),
        pe_ratio DECIMAL(10,2),
        pb_ratio DECIMAL(10,2),
        assumptions JSONB,
        sensitivity_analysis JSONB,
        conclusion TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('valuations 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS investment_decisions (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        decision_date TIMESTAMP NOT NULL,
        decision VARCHAR(20) NOT NULL,
        conditions TEXT,
        voting_result JSONB,
        decision_maker INTEGER REFERENCES users(id),
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('investment_decisions 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS post_investment (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        report_date TIMESTAMP NOT NULL,
        report_type VARCHAR(20) NOT NULL,
        financial_data JSONB,
        operational_metrics JSONB,
        risk_indicators JSONB,
        key_events JSONB,
        exit_plan JSONB,
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('post_investment 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        data_type VARCHAR(20) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        name VARCHAR(200),
        price DECIMAL(20,4),
        change DECIMAL(10,4),
        change_percent DECIMAL(10,4),
        volume DECIMAL(20,2),
        market_cap DECIMAL(20,2),
        timestamp TIMESTAMP NOT NULL,
        source VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('market_data 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS wind_data (
        id SERIAL PRIMARY KEY,
        wind_code VARCHAR(50) NOT NULL,
        indicator VARCHAR(100) NOT NULL,
        value DECIMAL(20,6),
        date TIMESTAMP NOT NULL,
        frequency VARCHAR(20),
        source VARCHAR(50) DEFAULT 'wind',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('wind_data 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id VARCHAR(100),
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        tokens INTEGER,
        model VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('ai_conversations 表创建成功');
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(50),
        details JSONB,
        ip VARCHAR(50),
        user_agent VARCHAR(500),
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('system_logs 表创建成功');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const adminCheck = await dbClient.query(
      `SELECT 1 FROM users WHERE username = 'admin'`
    );
    
    if (adminCheck.rows.length === 0) {
      await dbClient.query(`
        INSERT INTO users (username, password, real_name, email, role, status)
        VALUES ('admin', '${hashedPassword}', '系统管理员', 'admin@example.com', 'admin', 'active')
      `);
      console.log('默认管理员账户创建成功');
      console.log('用户名: admin');
      console.log('密码: admin123');
    } else {
      console.log('管理员账户已存在');
    }
    
    await dbClient.query(`
      CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
      CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
      CREATE INDEX IF NOT EXISTS idx_wind_data_code ON wind_data(wind_code);
      CREATE INDEX IF NOT EXISTS idx_wind_data_date ON wind_data(date);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
    `);
    console.log('索引创建成功');
    
    dbClient.release();
    await dbPool.end();
    
    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('初始化脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
