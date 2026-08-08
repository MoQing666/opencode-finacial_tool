<template>
  <div class="post-investment-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>投后管理</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            新建投后报告
          </el-button>
        </div>
      </template>
      
      <div class="filter-bar">
        <el-select v-model="filter.projectId" placeholder="选择项目" clearable filterable style="width: 200px">
          <el-option
            v-for="project in projectOptions"
            :key="project.id"
            :label="project.projectName"
            :value="project.id"
          />
        </el-select>
        
        <el-select v-model="filter.reportType" placeholder="报告类型" clearable style="width: 120px">
          <el-option label="月度" value="monthly" />
          <el-option label="季度" value="quarterly" />
          <el-option label="年度" value="annual" />
          <el-option label="专项" value="special" />
        </el-select>
        
        <el-button type="primary" @click="fetchReports">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      
      <el-table :data="reports" style="width: 100%" v-loading="loading">
        <el-table-column prop="project.projectName" label="项目名称" min-width="200" />
        <el-table-column prop="reportType" label="报告类型" width="100">
          <template #default="{ row }">
            {{ reportTypeMap[row.reportType] }}
          </template>
        </el-table-column>
        <el-table-column prop="reportDate" label="报告日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.reportDate) }}
          </template>
        </el-table-column>
        <el-table-column label="财务指标" min-width="200">
          <template #default="{ row }">
            <div v-if="row.financialData">
              <span>收入: {{ formatMoney(row.financialData.revenue) }}万</span>
              <span style="margin-left: 10px">利润: {{ formatMoney(row.financialData.profit) }}万</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="风险指标" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.riskIndicators?.level" :type="getRiskType(row.riskIndicators.level)">
              {{ row.riskIndicators.level }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
            <el-button type="primary" link @click="editReport(row)">编辑</el-button>
            <el-button type="primary" link @click="generateAIReport(row)">AI分析</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑投后报告' : '新建投后报告'"
      width="800px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-tabs v-model="formTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="项目" prop="projectId">
              <el-select v-model="form.projectId" placeholder="请选择项目" filterable>
                <el-option
                  v-for="project in projectOptions"
                  :key="project.id"
                  :label="project.projectName"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="报告类型" prop="reportType">
              <el-select v-model="form.reportType" placeholder="请选择报告类型">
                <el-option label="月度报告" value="monthly" />
                <el-option label="季度报告" value="quarterly" />
                <el-option label="年度报告" value="annual" />
                <el-option label="专项报告" value="special" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="报告日期" prop="reportDate">
              <el-date-picker v-model="form.reportDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="财务数据" name="financial">
            <el-form-item label="财务数据">
              <el-input
                v-model="form.financialDataStr"
                type="textarea"
                :rows="6"
                placeholder='请输入JSON格式的财务数据，例如: {"revenue": 1000, "profit": 200, "return": 15}'
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="运营指标" name="operational">
            <el-form-item label="运营指标">
              <el-input
                v-model="form.operationalMetricsStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的运营指标"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="风险指标" name="risk">
            <el-form-item label="风险指标">
              <el-input
                v-model="form.riskIndicatorsStr"
                type="textarea"
                :rows="6"
                placeholder='请输入JSON格式的风险指标，例如: {"level": "medium", "factors": ["市场风险", "信用风险"]}'
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="重大事件" name="events">
            <el-form-item label="重大事件">
              <el-input
                v-model="form.keyEventsStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的重大事件"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="退出计划" name="exit">
            <el-form-item label="退出计划">
              <el-input
                v-model="form.exitPlanStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的退出计划"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="detailVisible"
      title="投后报告详情"
      width="800px"
    >
      <div v-if="currentReport" class="report-detail">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="项目名称">{{ currentReport.project?.projectName }}</el-descriptions-item>
          <el-descriptions-item label="报告类型">{{ reportTypeMap[currentReport.reportType] }}</el-descriptions-item>
          <el-descriptions-item label="报告日期">{{ formatDate(currentReport.reportDate) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusMap[currentReport.status] }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <h4>财务数据</h4>
        <pre>{{ JSON.stringify(currentReport.financialData, null, 2) }}</pre>
        
        <el-divider />
        
        <h4>AI分析</h4>
        <div v-if="aiAnalysis" class="ai-analysis">{{ aiAnalysis }}</div>
        <el-empty v-else description="暂无AI分析" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { projectApi, aiApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const detailVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const formRef = ref(null);
const formTab = ref('basic');

const reports = ref([]);
const projectOptions = ref([]);
const currentReport = ref(null);
const aiAnalysis = ref('');

const filter = reactive({
  projectId: '',
  reportType: ''
});

const form = reactive({
  projectId: '',
  reportType: '',
  reportDate: '',
  financialDataStr: '{}',
  operationalMetricsStr: '{}',
  riskIndicatorsStr: '{}',
  keyEventsStr: '[]',
  exitPlanStr: '{}'
});

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  reportType: [{ required: true, message: '请选择报告类型', trigger: 'change' }],
  reportDate: [{ required: true, message: '请选择报告日期', trigger: 'change' }]
};

const reportTypeMap = {
  monthly: '月度报告',
  quarterly: '季度报告',
  annual: '年度报告',
  special: '专项报告'
};

const statusMap = {
  draft: '草稿',
  submitted: '已提交',
  reviewed: '已审核'
};

const statusTypeMap = {
  draft: 'info',
  submitted: 'warning',
  reviewed: 'success'
};

onMounted(() => {
  fetchReports();
  fetchProjectOptions();
});

async function fetchReports() {
  loading.value = true;
  try {
    const res = await projectApi.getList({ stage: 'invested', ...filter });
    if (res.data.success) {
      reports.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取投后报告失败:', error);
  } finally {
    loading.value = false;
  }
}

async function fetchProjectOptions() {
  try {
    const res = await projectApi.getList({ pageSize: 100 });
    if (res.data.success) {
      projectOptions.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
}

function resetFilter() {
  filter.projectId = '';
  filter.reportType = '';
  fetchReports();
}

function showCreateDialog() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    projectId: '',
    reportType: '',
    reportDate: '',
    financialDataStr: '{}',
    operationalMetricsStr: '{}',
    riskIndicatorsStr: '{}',
    keyEventsStr: '[]',
    exitPlanStr: '{}'
  });
  dialogVisible.value = true;
}

function editReport(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    projectId: row.projectId,
    reportType: row.reportType,
    reportDate: row.reportDate,
    financialDataStr: JSON.stringify(row.financialData || {}, null, 2),
    operationalMetricsStr: JSON.stringify(row.operationalMetrics || {}, null, 2),
    riskIndicatorsStr: JSON.stringify(row.riskIndicators || {}, null, 2),
    keyEventsStr: JSON.stringify(row.keyEvents || [], null, 2),
    exitPlanStr: JSON.stringify(row.exitPlan || {}, null, 2)
  });
  dialogVisible.value = true;
}

async function handleSubmit() {
  const formEl = formRef.value;
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (!valid) return;
    
    submitLoading.value = true;
    try {
      const submitData = {
        ...form,
        financialData: JSON.parse(form.financialDataStr),
        operationalMetrics: JSON.parse(form.operationalMetricsStr),
        riskIndicators: JSON.parse(form.riskIndicatorsStr),
        keyEvents: JSON.parse(form.keyEventsStr),
        exitPlan: JSON.parse(form.exitPlanStr)
      };
      
      if (isEdit.value) {
        await projectApi.update(editId.value, submitData);
        ElMessage.success('投后报告更新成功');
      } else {
        await projectApi.addPostInvestment(form.projectId, submitData);
        ElMessage.success('投后报告创建成功');
      }
      dialogVisible.value = false;
      fetchReports();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

function viewDetail(row) {
  currentReport.value = row;
  aiAnalysis.value = '';
  detailVisible.value = true;
}

async function generateAIReport(row) {
  try {
    const res = await aiApi.analyzeFinancial(row.financialData);
    if (res.data.success) {
      aiAnalysis.value = res.data.data.content;
      currentReport.value = row;
      detailVisible.value = true;
    }
  } catch (error) {
    ElMessage.error('AI分析失败: ' + error.message);
  }
}

function formatMoney(value) {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

function getRiskType(level) {
  const types = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };
  return types[level] || 'info';
}
</script>

<style lang="scss" scoped>
.post-investment-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.report-detail {
  h4 {
    margin: 16px 0 8px;
    color: #303133;
  }
  
  pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    overflow-x: auto;
  }
}

.ai-analysis {
  background: #ecf5ff;
  padding: 16px;
  border-radius: 4px;
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
