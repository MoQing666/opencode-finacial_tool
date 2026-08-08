<template>
  <div class="decision-panel">
    <div class="panel-header">
      <h3>投资决策管理</h3>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        新建投资决策
      </el-button>
    </div>
    
    <el-table :data="decisionList" style="width: 100%" v-loading="loading">
      <el-table-column prop="project.projectName" label="项目名称" min-width="200" />
      <el-table-column prop="decision" label="决策结果" width="100">
        <template #default="{ row }">
          <el-tag :type="decisionTypeMap[row.decision]">{{ decisionMap[row.decision] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="decisionDate" label="决策日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.decisionDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="decisionMaker" label="决策人" width="100" />
      <el-table-column prop="conditions" label="附加条件" min-width="200" show-overflow-tooltip />
      <el-table-column prop="comments" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          <el-button type="primary" link @click="editDecision(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑投资决策' : '新建投资决策'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
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
        
        <el-form-item label="决策日期" prop="decisionDate">
          <el-date-picker v-model="form.decisionDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="决策结果" prop="decision">
          <el-radio-group v-model="form.decision">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">拒绝</el-radio>
            <el-radio value="conditional">有条件通过</el-radio>
            <el-radio value="defer">暂缓</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="附加条件" v-if="form.decision === 'conditional'">
          <el-input v-model="form.conditions" type="textarea" :rows="3" placeholder="请输入附加条件" />
        </el-form-item>
        
        <el-form-item label="投票结果">
          <el-input
            v-model="form.votingResultStr"
            type="textarea"
            :rows="3"
            placeholder="请输入JSON格式的投票结果"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input v-model="form.comments" type="textarea" :rows="3" placeholder="请输入备注" />
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

const decisionList = ref([]);
const projectOptions = ref([]);

const form = reactive({
  projectId: '',
  decisionDate: '',
  decision: '',
  conditions: '',
  votingResultStr: '{}',
  comments: ''
});

const rules = {
  projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
  decisionDate: [{ required: true, message: '请选择决策日期', trigger: 'change' }],
  decision: [{ required: true, message: '请选择决策结果', trigger: 'change' }]
};

const decisionMap = {
  approve: '通过',
  reject: '拒绝',
  conditional: '有条件通过',
  defer: '暂缓'
};

const decisionTypeMap = {
  approve: 'success',
  reject: 'danger',
  conditional: 'warning',
  defer: 'info'
};

onMounted(() => {
  fetchDecisionList();
  fetchProjectOptions();
});

async function fetchDecisionList() {
  loading.value = true;
  try {
    const res = await projectApi.getList({ stage: 'decision' });
    if (res.data.success) {
      decisionList.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取决策列表失败:', error);
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
    decisionDate: '',
    decision: '',
    conditions: '',
    votingResultStr: '{}',
    comments: ''
  });
  dialogVisible.value = true;
}

function editDecision(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    projectId: row.projectId,
    decisionDate: row.decisionDate,
    decision: row.decision,
    conditions: row.conditions,
    votingResultStr: JSON.stringify(row.votingResult || {}, null, 2),
    comments: row.comments
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
        votingResult: JSON.parse(form.votingResultStr)
      };
      
      if (isEdit.value) {
        await projectApi.update(editId.value, submitData);
        ElMessage.success('投资决策更新成功');
      } else {
        await projectApi.addDecision(form.projectId, submitData);
        ElMessage.success('投资决策创建成功');
      }
      dialogVisible.value = false;
      fetchDecisionList();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

function viewDetail(row) {
  ElMessage.info('查看决策详情');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}
</script>

<style lang="scss" scoped>
.decision-panel {
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
