const { getLlama, LlamaChatSession } = require('node-llama-cpp');
const path = require('path');
const logger = require('./utils/logger');

let llama = null;
let model = null;
let context = null;
let session = null;

const MODEL_PATH = process.env.LLAMA_MODEL_PATH || path.join(__dirname, '../../models/llama-2-7b-chat.Q4_K_M.gguf');
const CONTEXT_SIZE = parseInt(process.env.LLAMA_CONTEXT_SIZE) || 4096;
const GPU_LAYERS = parseInt(process.env.LLAMA_GPU_LAYERS) || 0;

async function initLlamaModel() {
  try {
    logger.info('正在加载LLaMA模型...');
    
    llama = await getLlama({
      gpuLayers: GPU_LAYERS,
      logger: {
        log: (level, message) => {
          if (level === 'error') logger.error(message);
          else if (level === 'warn') logger.warn(message);
        }
      }
    });

    model = await llama.loadModel({
      modelPath: MODEL_PATH
    });

    context = await model.createContext({
      contextSize: CONTEXT_SIZE
    });

    session = new LlamaChatSession({
      contextSequence: context.getSequence()
    });

    logger.info('LLaMA模型加载完成');
    return true;
  } catch (error) {
    logger.error('LLaMA模型加载失败:', error);
    throw error;
  }
}

async function chat(message, options = {}) {
  if (!session) {
    throw new Error('LLaMA模型未初始化');
  }

  try {
    const systemPrompt = options.systemPrompt || `你是一个专业的私募基金投资助手，擅长：
1. 投资项目分析和评估
2. 财务数据分析和解读
3. 市场趋势分析
4. 风险评估和管理
5. 投资报告撰写

请用专业、准确、简洁的中文回答问题。`;

    const response = await session.prompt(message, {
      systemPrompt,
      maxTokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.9,
      repeatPenalty: options.repeatPenalty || 1.1
    });

    return {
      content: response,
      tokens: response.length,
      model: 'llama-2-7b-chat'
    };
  } catch (error) {
    logger.error('LLaMA对话失败:', error);
    throw error;
  }
}

async function analyzeProject(projectData) {
  const prompt = `请分析以下投资项目的基本情况，并给出专业评估：

项目名称：${projectData.projectName}
项目类型：${projectData.projectType}
所属行业：${projectData.industry}
目标金额：${projectData.targetAmount}万元
项目阶段：${projectData.stage}

请从以下维度进行分析：
1. 行业前景
2. 项目可行性
3. 风险因素
4. 投资建议

请给出结构化的分析报告。`;

  return await chat(prompt, {
    systemPrompt: '你是一个资深的投资分析师，请对投资项目进行专业、客观的分析。',
    temperature: 0.5
  });
}

async function analyzeFinancialData(financialData) {
  const prompt = `请分析以下财务数据，并给出专业解读：

${JSON.stringify(financialData, null, 2)}

请从以下方面进行分析：
1. 盈利能力
2. 偿债能力
3. 运营效率
4. 成长性
5. 风险提示

请给出详细的财务分析报告。`;

  return await chat(prompt, {
    systemPrompt: '你是一个专业的财务分析师，请对财务数据进行深入分析。',
    temperature: 0.3
  });
}

async function generateReport(projectId, reportType) {
  const prompt = `请为项目ID ${projectId} 生成${reportType}报告。

请包含以下内容：
1. 项目概况
2. 关键指标分析
3. 风险评估
4. 未来展望
5. 投资建议

请用专业的投资报告格式撰写。`;

  return await chat(prompt, {
    systemPrompt: '你是一个专业的投资报告撰写专家，请生成规范、专业的投资报告。',
    temperature: 0.4
  });
}

async function summarizeMarketData(marketData) {
  const prompt = `请总结以下市场数据，并给出投资建议：

${JSON.stringify(marketData, null, 2)}

请分析：
1. 市场整体趋势
2. 行业轮动情况
3. 重点投资机会
4. 风险提示

请给出简洁明了的市场总结。`;

  return await chat(prompt, {
    systemPrompt: '你是一个资深的市场分析师，请对市场数据进行专业分析。',
    temperature: 0.5
  });
}

function getModelInfo() {
  return {
    loaded: !!model,
    modelPath: MODEL_PATH,
    contextSize: CONTEXT_SIZE,
    gpuLayers: GPU_LAYERS
  };
}

module.exports = {
  initLlamaModel,
  chat,
  analyzeProject,
  analyzeFinancialData,
  generateReport,
  summarizeMarketData,
  getModelInfo
};
