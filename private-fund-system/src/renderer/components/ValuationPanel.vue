<template>
  <div class="valuation-panel">
    <div class="panel-header">
      <h3>项目估值管理</h3>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新建估值报告
      </el-button>
    </div>
    
    <el-table :data="valuationList" style="width: 100%" v-loading="loading">
      <el-table-column prop="project.projectName" label="项目名称" min-width="200" />
      <el-table-column prop="method" label="估值方法" width="120">
        <template #default="{ row }">
          {{ methodMap[row.method] }}
        </template>
      </el-table-column>
      <el-table-column prop="enterpriseValue" label="企业价值(万元)" width="130">
        <template #default="{ row }">
          {{ formatMoney(row.enterpriseValue) }}
        </template>
      </el-table-column>
      <el-table-column prop="equityValue" label="股权价值(万元)" width="130">
        <template #default="{ row }">
          {{ formatMoney(row.equityValue) }}
        </template>
      </el-table-column>
      <el-table-column prop="evEbitda" label="EV/EBITDA" width="100" />
      <el-table-column prop="peRatio" label="PE" width="80" />
      <el-table-column prop="pbRatio" label="PB" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="valuationDate" label="估值日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.valuationDate) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          <el-button type="primary" link @click="editValuation(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑估值报告' : '新建估值报告'"
      width="700px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
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
        
        <el-form-item label="估值方法" prop="method">
          <el-select v-model="form.method" placeholder="请选择估值方法">
            <el-option label="DCF法" value="dcf" />
            <el-option label="可比公司法" value="comparable" />
            <el-option label="资产基础法" value="asset" />
            <el-option label="混合法" value="hybrid" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="估值日期" prop="valuationDate">
          <el-date-picker v-model="form.valuationDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业价值" prop="enterpriseValue">
              <el-input-number v-model="form.enterpriseValue" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="股权价值" prop="equityValue">
              <el-input-number v-model="form.equityValue" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="EV/EBITDA">
              <el-input-number v-model="form.evEbitda" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="PE">
              <el-input-number v-model="form.peRatio" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="PB">
              <el-input-number v-model="form.pbRatio" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="假设条件">
          <el-input
            v-model="form.assumptionsStr"
            type="textarea"
            :rows="4"
            placeholder="请输入JSON格式的假设条件"
          />
        </el-form-item>
        
        <el-form-item label="敏感性分析">
          <el-input
            v-model="form.sensitivityAnalysisStr"
            type="textarea"
            :rows="4"
            placeholder="请输入JSON格式的敏感性分析"
          />
        </el-form-item>
        
        <el-form-item label="结论">
          <el-input v-model="form.conclusion" type="textarea" :rows="3" placeholder="请输入估值结论" />
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
import { ref, reactive, onMounted } from 'vue';
import { projectApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const formRef = ref(null);

const valuationList = ref([]);
const projectOptions = ref([]);

const form = reactive({
  projectId: '',
  method: '',
  valuationDate: '',
  enterpriseValue: 0,
  equityValue: 0,
  evEbitda: 0,
  peRatio: 0,
  pbRatio: 0,
  assumptionsStr: '{}',
  sensitivityAnalysisStr: '{}',
  conclusion: ''
});

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  method: [{ required: true, message: '请选择估值方法', trigger: 'change' }],
  valuationDate: [{ required: true, message: '请选择估值日期', trigger: 'change' }]
};

const methodMap = {
  dcf: 'DCF法',
  comparable: '可比公司法',
  asset: '资产基础法',
  hybrid: '混合法'
};

const statusMap = {
  draft: '草稿',
  final: '定稿',
  approved: '已批准'
};

const statusTypeMap = {
  draft: 'info',
  final: 'warning',
  approved: 'success'
};

onMounted(() => {
  fetchValuationList();
  fetchProjectOptions();
});

async function fetchValuationList() {
  loading.value = true;
  try {
    const res = await projectApi.getList({ stage: 'valuation' });
    if (res.data.success) {
      valuationList.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取估值列表失败:', error);
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

function showCreateDialog() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    projectId: '',
    method: '',
    valuationDate: '',
    enterpriseValue: 0,
    equityValue: 0,
    evEbitda: 0,
    peRatio: 0,
    pbRatio: 0,
    assumptionsStr: '{}',
    sensitivityAnalysisStr: '{}',
    conclusion: ''
  });
  dialogVisible.value = true;
}

function editValuation(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    projectId: row.projectId,
    method: row.method,
    valuationDate: row.valuationDate,
    enterpriseValue: row.enterpriseValue,
    equityValue: row.equityValue,
    evEbitda: row.evEbitda,
    peRatio: row.peRatio,
    pbRatio: row.pbRatio,
    assumptionsStr: JSON.stringify(row.assumptions || {}, null, 2),
    sensitivityAnalysisStr: JSON.stringify(row.sensitivityAnalysis || {}, null, 2),
    conclusion: row.conclusion
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
        assumptions: JSON.parse(form.assumptionsStr),
        sensitivityAnalysis: JSON.parse(form.sensitivityAnalysisStr)
      };
      
      if (isEdit.value) {
        await projectApi.update(editId.value, submitData);
        ElMessage.success('估值报告更新成功');
      } else {
        await projectApi.addValuation(form.projectId, submitData);
        ElMessage.success('估值报告创建成功');
      }
      dialogVisible.value = false;
      fetchValuationList();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

function viewDetail(row) {
  ElMessage.info('查看估值详情');
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
.valuation-panel {
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
