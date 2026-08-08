<template>
  <div class="users-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            新建用户
          </el-button>
        </div>
      </template>
      
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索用户名/姓名/邮箱"
          clearable
          style="width: 200px"
          @clear="fetchUsers"
          @keyup.enter="fetchUsers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="filter.role" placeholder="角色" clearable style="width: 120px">
          <el-option label="管理员" value="admin" />
          <el-option label="经理" value="manager" />
          <el-option label="分析师" value="analyst" />
          <el-option label="查看者" value="viewer" />
        </el-select>
        
        <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="活跃" value="active" />
          <el-option label="未激活" value="inactive" />
          <el-option label="锁定" value="locked" />
        </el-select>
        
        <el-button type="primary" @click="fetchUsers">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTypeMap[row.role]">{{ roleMap[row.role] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最后登录" width="180">
          <template #default="{ row }">
            {{ row.lastLogin ? formatDate(row.lastLogin) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editUser(row)">编辑</el-button>
            <el-button type="primary" link @click="resetPassword(row)">重置密码</el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              link
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm title="确定删除该用户吗？" @confirm="deleteUser(row.id)">
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
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchUsers"
          @current-change="fetchUsers"
        />
      </div>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新建用户'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="分析师" value="analyst" />
            <el-option label="查看者" value="viewer" />
          </el-select>
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
import { userApi } from '../services/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref(null);
const formRef = ref(null);

const users = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const filter = reactive({
  keyword: '',
  role: '',
  status: ''
});

const form = reactive({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  role: 'viewer'
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
};

const roleMap = {
  admin: '管理员',
  manager: '经理',
  analyst: '分析师',
  viewer: '查看者'
};

const roleTypeMap = {
  admin: 'danger',
  manager: 'warning',
  analyst: '',
  viewer: 'info'
};

const statusMap = {
  active: '活跃',
  inactive: '未激活',
  locked: '锁定'
};

const statusTypeMap = {
  active: 'success',
  inactive: 'info',
  locked: 'danger'
};

onMounted(() => {
  fetchUsers();
});

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await userApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    });
    
    if (res.data.success) {
      users.value = res.data.data.items;
      pagination.total = res.data.data.total;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function resetFilter() {
  filter.keyword = '';
  filter.role = '';
  filter.status = '';
  fetchUsers();
}

function showCreateDialog() {
  isEdit.value = false;
  editId.value = null;
  Object.assign(form, {
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    role: 'viewer'
  });
  dialogVisible.value = true;
}

function editUser(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    username: row.username,
    password: '',
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    role: row.role
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
        await userApi.update(editId.value, form);
        ElMessage.success('用户更新成功');
      } else {
        await userApi.create(form);
        ElMessage.success('用户创建成功');
      }
      dialogVisible.value = false;
      fetchUsers();
    } catch (error) {
      ElMessage.error(error.message || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
}

async function resetPassword(row) {
  try {
    await ElMessageBox.confirm(`确定重置用户 ${row.username} 的密码吗？`, '提示', {
      type: 'warning'
    });
    
    const newPassword = '123456';
    await userApi.resetPassword(row.id, newPassword);
    ElMessage.success(`密码已重置为: ${newPassword}`);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败');
    }
  }
}

async function toggleStatus(row) {
  try {
    await userApi.toggleStatus(row.id);
    ElMessage.success('状态更新成功');
    fetchUsers();
  } catch (error) {
    ElMessage.error('状态更新失败');
  }
}

async function deleteUser(id) {
  try {
    await userApi.delete(id);
    ElMessage.success('用户删除成功');
    fetchUsers();
  } catch (error) {
    ElMessage.error('删除失败');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}
</script>

<style lang="scss" scoped>
.users-container {
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
</style>
