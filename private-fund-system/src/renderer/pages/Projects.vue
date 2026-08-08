<template>
  <div class="projects-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            新建项目
          </el-button>
        </div>
      </template>
      
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索项目名称/编号"
          clearable
          style="width: 200px"
          @clear="fetchProjects"
          @keyup.enter="fetchProjects"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="filter.stage" placeholder="项目阶段" clearable style="width: 120px">
          <el-option label=" prospect" value="prospect" />
          <el-option label="尽职调查" value="due_diligence" />
          <el-option label="估值" value="valuation" />
          <el-option label="决策" value="decision" />
          <el-option label="已投资" value="invested" />
          <el-option label="已退出" value="exited" />
        </el-select>
        
        <el-select v-model="filter.status" placeholder="项目状态" clearable style="width: 120px">
          <el-option label="活跃" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已暂停" value="suspended" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        
        <el-button type="primary" @click="fetchProjects">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      
      <el-table :data="projects" style="width: 100%" v-loading="loading">
        <el-table-column prop="projectCode" label="项目编号" width="120" />
        <el-table-column prop="projectName" label="项目名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="viewProject(row.id)">{{ row.projectName }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="projectType" label="项目类型" width="100">
          <template #default="{ row }">
            {{ projectTypeMap[row.projectType] }}
          </template>
        </el-table-column>
        <el-table-column prop="industry" label="行业" width="120" />
        <el-table-column prop="stage" label="阶段" width="100">
          <template #default="{ row }">
            <el-tag :type="stageTypeMap[row.stage]">{{ stageMap[row.stage] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetAmount" label="目标金额(万元)" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.targetAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级" width="100">
          <template #default="{ row }">
            <el-tag :type="riskTypeMap[row.riskLevel]">{{ riskMap[row.riskLevel] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="100">
          <template #default="{ row }">
            {{ row.manager?.realName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewProject(row.id)">查看</el-button>
            <el-button type="primary" link @click="editProject(row)">编辑</el-button>
            <el-popconfirm title="确定删除该项目吗？" @confirm="deleteProject(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchProjects"
          @current-change="fetchProjects"
        />
      </div>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑项目' : '新建项目'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        
        <el-form-item label="项目编号" prop="projectCode">
          <el-input v-model="form.projectCode" placeholder="请输入项目编号" />
        </el-form-item>
        
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="form.projectType" placeholder="请选择项目类型">
            <el-option label="股权投资" value="equity" />
            <el-option label="债权投资" value="debt" />
            <el-option label="混合投资" value="mixed" />
            <el-option label="基金投资" value="fund" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属行业" prop="industry">
          <el-input v-model="form.industry" placeholder="请输入所属行业" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-input v-model="form.region" placeholder="请输入所在地区" />
        </el-form-item>
        
        <el-form-item label="目标金额" prop="targetAmount">
          <el-input-number v-model="form.targetAmount" :min="0" :precision="2" style="width: 100%" />
          <span class="unit">万元</span>
        </el-form-item>
        
        <el-form-item label="风险等级" prop="riskLevel">
          <el-select v-model="form.riskLevel" placeholder="请选择风险等级">
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
            <el-option label="极高风险" value="critical" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入项目描述" />
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
import { useRouter } from 'vue-router';
import { projectApi } from '../services/api';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const formRef = ref(null);

const projects = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const filter = reactive({
  keyword: '',
  stage: '',
  status: ''
});

const form = reactive({
  projectName: '',
  projectCode: '',
  projectType: '',
  industry: '',
  region: '',
  targetAmount: 0,
  riskLevel: 'medium',
  description: ''
});

const rules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectCode: [{ required: true, message: '请输入项目编号', trigger: 'blur' }],
  projectType: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  industry: [{ required: true, message: '请输入所属行业', trigger: 'blur' }]
};

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
  fetchProjects();
});

async function fetchProjects() {
  loading.value = true;
  try {
    const res = await projectApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    });
    
    if (res.data.success) {
      projects.value = res.data.data.items;
      pagination.total = res.data.data.total;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function resetFilter() {
  filter.keyword = '';
  filter.stage = '';
  filter.status = '';
  fetchProjects();
}

function showCreateDialog() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    projectName: '',
    projectCode: '',
    projectType: '',
    industry: '',
    region: '',
    targetAmount: 0,
    riskLevel: 'medium',
    description: ''
  });
  dialogVisible.value = true;
}

function editProject(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    projectName: row.projectName,
    projectCode: row.projectCode,
    projectType: row.projectType,
    industry: row.industry,
    region: row.region,
    targetAmount: row.targetAmount,
    riskLevel: row.riskLevel,
    description: row.description
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
      if (isEdit.value) {
        await projectApi.update(editId.value, form);
        ElMessage.success('项目更新成功');
      } else {
        await projectApi.create(form);
        ElMessage.success('项目创建成功');
      }
      dialogVisible.value = false;
      fetchProjects();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

async function deleteProject(id) {
  try {
    await projectApi.delete(id);
    ElMessage.success('项目删除成功');
    fetchProjects();
  } catch (error) {
    ElMessage.error(error.message || '删除失败');
  }
}

function viewProject(id) {
  router.push(`/projects/${id}`);
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
.projects-container {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.unit {
  margin-left: 8px;
  color: #909399;
}
</style>
