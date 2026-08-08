<template>
  <div class="project-detail-container" v-loading="loading">
    <el-page-header @back="goBack" :content="project?.projectName || '项目详情'" />
    
    <el-tabs v-model="activeTab" style="margin-top: 20px">
      <el-tab-pane label="基本信息" name="basic">
        <el-card shadow="hover">
          <el-descriptions title="项目信息" :column="2" border>
            <el-descriptions-item label="项目编号">{{ project?.projectCode }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ project?.projectName }}</el-descriptions-item>
            <el-descriptions-item label="项目类型">{{ projectTypeMap[project?.projectType] }}</el-descriptions-item>
            <el-descriptions-item label="所属行业">{{ project?.industry }}</el-descriptions-item>
            <el-descriptions-item label="所在地区">{{ project?.region }}</el-descriptions-item>
            <el-descriptions-item label="项目阶段">
              <el-tag :type="stageTypeMap[project?.stage]">{{ stageMap[project?.stage] }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="目标金额">{{ formatMoney(project?.targetAmount) }}万元</el-descriptions-item>
            <el-descriptions-item label="实际金额">{{ formatMoney(project?.actualAmount) }}万元</el-descriptions-item>
            <el-descriptions-item label="风险等级">
              <el-tag :type="riskTypeMap[project?.riskLevel]">{{ riskMap[project?.riskLevel] }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负责人">{{ project?.manager?.realName }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(project?.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDate(project?.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="项目描述" :span="2">{{ project?.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="尽职调查" name="dd">
        <DueDiligencePanel :project-id="projectId" />
      </el-tab-pane>
      
      <el-tab-pane label="估值分析" name="valuation">
        <ValuationPanel :project-id="projectId" />
      </el-tab-pane>
      
      <el-tab-pane label="投资决策" name="decision">
        <DecisionPanel :project-id="projectId" />
      </el-tab-pane>
      
      <el-tab-pane label="投后管理" name="post">
        <PostInvestmentPanel :project-id="projectId" />
      </el-tab-pane>
      
      <el-tab-pane label="AI分析" name="ai">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>AI智能分析</span>
              <el-button type="primary" @click="generateAIAnalysis" :loading="aiLoading">
                <el-icon><MagicStick /></el-icon>
                生成分析
              </el-button>
            </div>
          </template>
          
          <div v-if="aiAnalysis" class="ai-analysis">{{ aiAnalysis }}</div>
          <el-empty v-else description="点击按钮生成AI分析报告" />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { projectApi, aiApi } from '../services/api';
import { ElMessage } from 'element-plus';
import DueDiligencePanel from '../components/DueDiligencePanel.vue';
import ValuationPanel from '../components/ValuationPanel.vue';
import DecisionPanel from '../components/DecisionPanel.vue';
import PostInvestmentPanel from '../components/PostInvestmentPanel.vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const aiLoading = ref(false);
const activeTab = ref('basic');
const project = ref(null);
const aiAnalysis = ref('');

const projectId = route.params.id;

const projectTypeMap = {
  equity: '股权投资',
  debt: '债权投资',
  mixed: '混合投资',
  fund: '基金投资'
};

const stageMap = {
  prospect: ' prospect',
  due_diligence: '尽职调查',
  valuation: '估值',
  decision: '决策',
  invested: '已投资',
  exited: '已退出'
};

const stageTypeMap = {
  prospect: 'info',
  due_diligence: 'warning',
  valuation: '',
  decision: 'danger',
  invested: 'success',
  exited: 'info'
};

const riskMap = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '极高风险'
};

const riskTypeMap = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger'
};

onMounted(() => {
  fetchProject();
});

async function fetchProject() {
  loading.value = true;
  try {
    const res = await projectApi.getDetail(projectId);
    if (res.data.success) {
      project.value = res.data.data;
    }
  } catch (error) {
    ElMessage.error('获取项目详情失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
}

async function generateAIAnalysis() {
  aiLoading.value = true;
  try {
    const res = await aiApi.analyzeProject(project.value);
    if (res.data.success) {
      aiAnalysis.value = res.data.data.content;
    }
  } catch (error) {
    ElMessage.error('AI分析失败: ' + error.message);
  } finally {
    aiLoading.value = false;
  }
}

function goBack() {
  router.push('/projects');
}

function formatMoney(value) {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}
</script>

<script>
import DueDiligencePanel from '../components/DueDiligencePanel.vue';
import ValuationPanel from '../components/ValuationPanel.vue';
import DecisionPanel from '../components/DecisionPanel.vue';
import PostInvestmentPanel from '../components/PostInvestmentPanel.vue';

export default {
  components: {
    DueDiligencePanel,
    ValuationPanel,
    DecisionPanel,
    PostInvestmentPanel
  }
};
</script>

<style lang="scss" scoped>
.project-detail-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-analysis {
  background: #ecf5ff;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
