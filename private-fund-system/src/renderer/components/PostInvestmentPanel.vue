<template>
  <div class="post-investment-panel">
    <div class="panel-header">
      <h3>投后管理</h3>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新建投后报告
      </el-button>
    </div>
    
    <el-table :data="reports" style="width: 100%" v-loading="loading">
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
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          <el-button type="primary" link @click="editReport(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑投后报告' : '新建投后报告'"
      width="700px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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
        
        <el-form-item label="财务数据">
          <el-input
            v-model="form.financialDataStr"
            type="textarea"
            :rows="4"
            placeholder='请输入JSON格式的财务数据，例如: {"revenue": 1000, "profit": 200}'
          />
        </el-form-item>
        
        <el-form-item label="运营指标">
          <el-input
            v-model="form.operationalMetricsStr"
            type="textarea"
            :rows="4"
            placeholder="请输入JSON格式的运营指标"
          />
        </el-form-item>
        
        <el-form-item label="风险指标">
          <el-input
            v-model="form.riskIndicatorsStr"
            type="textarea"
            :rows="4"
            placeholder='请输入JSON格式的风险指标，例如: {"level": "medium"}'
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { projectApi } from '../services/api';
import { ElMessage } from 'element-plus';

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
});

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const formRef = ref(null);

const reports = ref([]);

const form = reactive({
  reportType: '',
  reportDate: '',
  financialDataStr: '{}',
  operationalMetricsStr: '{}',
  riskIndicatorsStr: '{}'
});

const rules = {
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
});

watch(() => props.projectId, () => {
  fetchReports();
});

async function fetchReports() {
  loading.value = true;
  try {
    const res = await projectApi.getDetail(props.projectId);
    if (res.data.success) {
      reports.value = res.data.data.PostInvestments || [];
    }
  } catch (error) {
    console.error('获取投后报告失败:', error);
  } finally {
    loading.value = false;
  }
}

function showCreateDialog() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    reportType: '',
    reportDate: '',
    financialDataStr: '{}',
    operationalMetricsStr: '{}',
    riskIndicatorsStr: '{}'
  });
  dialogVisible.value = true;
}

function editReport(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    reportType: row.reportType,
    reportDate: row.reportDate,
    financialDataStr: JSON.stringify(row.financialData || {}, null, 2),
    operationalMetricsStr: JSON.stringify(row.operationalMetrics || {}, null, 2),
    riskIndicatorsStr: JSON.stringify(row.riskIndicators || {}, null, 2)
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
        riskIndicators: JSON.parse(form.riskIndicatorsStr)
      };
      
      await projectApi.addPostInvestment(props.projectId, submitData);
      ElMessage.success('投后报告创建成功');
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
  ElMessage.info('查看投后报告详情');
}

function formatMoney(value) {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}
</script>

<style lang="scss" scoped>
.post-investment-panel {
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #303133;
  }
}
</style>
