<template>
  <div class="due-diligence-panel">
    <div class="panel-header">
      <h3>尽职调查管理</h3>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新建尽调报告
      </el-button>
    </div>
    
    <el-table :data="ddList" style="width: 100%" v-loading="loading">
      <el-table-column prop="project.projectName" label="项目名称" min-width="200" />
      <el-table-column prop="companyName" label="公司名称" width="150" />
      <el-table-column prop="legalRepresentative" label="法定代表人" width="100" />
      <el-table-column prop="registeredCapital" label="注册资本(万元)" width="120">
        <template #default="{ row }">
          {{ formatMoney(row.registeredCapital) }}
        </template>
      </el-table-column>
      <el-table-column prop="score" label="评分" width="80">
        <template #default="{ row }">
          <el-tag :type="getScoreType(row.score)">{{ row.score }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="120">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          <el-button type="primary" link @click="editDD(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑尽调报告' : '新建尽调报告'"
      width="800px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
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
            
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="form.companyName" placeholder="请输入公司名称" />
            </el-form-item>
            
            <el-form-item label="法定代表人" prop="legalRepresentative">
              <el-input v-model="form.legalRepresentative" placeholder="请输入法定代表人" />
            </el-form-item>
            
            <el-form-item label="注册资本" prop="registeredCapital">
              <el-input-number v-model="form.registeredCapital" :min="0" :precision="2" style="width: 100%" />
              <span class="unit">万元</span>
            </el-form-item>
            
            <el-form-item label="成立日期" prop="establishedDate">
              <el-date-picker v-model="form.establishedDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
            
            <el-form-item label="经营范围" prop="businessScope">
              <el-input v-model="form.businessScope" type="textarea" :rows="3" placeholder="请输入经营范围" />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="财务健康" name="financial">
            <el-form-item label="财务数据">
              <el-input
                v-model="form.financialHealthStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的财务数据"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="团队评估" name="team">
            <el-form-item label="团队信息">
              <el-input
                v-model="form.teamAssessmentStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的团队评估信息"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="市场分析" name="market">
            <el-form-item label="市场数据">
              <el-input
                v-model="form.marketAnalysisStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的市场分析数据"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="风险因素" name="risk">
            <el-form-item label="风险因素">
              <el-input
                v-model="form.riskFactorsStr"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式的风险因素"
              />
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="结论" name="conclusion">
            <el-form-item label="结论">
              <el-input v-model="form.conclusion" type="textarea" :rows="4" placeholder="请输入尽调结论" />
            </el-form-item>
            
            <el-form-item label="评分" prop="score">
              <el-input-number v-model="form.score" :min="0" :max="100" :precision="1" style="width: 100%" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
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
const formTab = ref('basic');

const ddList = ref([]);
const projectOptions = ref([]);

const form = reactive({
  projectId: '',
  companyName: '',
  legalRepresentative: '',
  registeredCapital: 0,
  establishedDate: '',
  businessScope: '',
  financialHealthStr: '{}',
  teamAssessmentStr: '{}',
  marketAnalysisStr: '{}',
  riskFactorsStr: '{}',
  conclusion: '',
  score: 0
});

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }]
};

const statusMap = {
  draft: '草稿',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝'
};

const statusTypeMap = {
  draft: 'info',
  submitted: 'warning',
  approved: 'success',
  rejected: 'danger'
};

onMounted(() => {
  fetchDDList();
  fetchProjectOptions();
});

async function fetchDDList() {
  loading.value = true;
  try {
    const res = await projectApi.getList({ stage: 'due_diligence' });
    if (res.data.success) {
      ddList.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取尽调列表失败:', error);
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
    companyName: '',
    legalRepresentative: '',
    registeredCapital: 0,
    establishedDate: '',
    businessScope: '',
    financialHealthStr: '{}',
    teamAssessmentStr: '{}',
    marketAnalysisStr: '{}',
    riskFactorsStr: '{}',
    conclusion: '',
    score: 0
  });
  dialogVisible.value = true;
}

function editDD(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    projectId: row.projectId,
    companyName: row.companyName,
    legalRepresentative: row.legalRepresentative,
    registeredCapital: row.registeredCapital,
    establishedDate: row.establishedDate,
    businessScope: row.businessScope,
    financialHealthStr: JSON.stringify(row.financialHealth || {}, null, 2),
    teamAssessmentStr: JSON.stringify(row.teamAssessment || {}, null, 2),
    marketAnalysisStr: JSON.stringify(row.marketAnalysis || {}, null, 2),
    riskFactorsStr: JSON.stringify(row.riskFactors || {}, null, 2),
    conclusion: row.conclusion,
    score: row.score
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
        financialHealth: JSON.parse(form.financialHealthStr),
        teamAssessment: JSON.parse(form.teamAssessmentStr),
        marketAnalysis: JSON.parse(form.marketAnalysisStr),
        riskFactors: JSON.parse(form.riskFactorsStr)
      };
      
      if (isEdit.value) {
        await projectApi.update(editId.value, submitData);
        ElMessage.success('尽调报告更新成功');
      } else {
        await projectApi.addDueDiligence(form.projectId, submitData);
        ElMessage.success('尽调报告创建成功');
      }
      dialogVisible.value = false;
      fetchDDList();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

function viewDetail(row) {
  ElMessage.info('查看尽调详情: ' + row.companyName);
}

function formatMoney(value) {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

function getScoreType(score) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
}
</script>

<style lang="scss" scoped>
.due-diligence-panel {
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

.unit {
  margin-left: 8px;
  color: #909399;
}
</style>
