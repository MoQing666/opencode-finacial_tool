<template>
  <div class="logs-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统日志</span>
          <el-button @click="fetchLogs">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <div class="filter-bar">
        <el-input
          v-model="filter.userId"
          placeholder="用户ID"
          clearable
          style="width: 100px"
        />
        
        <el-select v-model="filter.action" placeholder="操作类型" clearable style="width: 120px">
          <el-option label="登录" value="login" />
          <el-option label="注册" value="register" />
          <el-option label="修改密码" value="change_password" />
          <el-option label="更新资料" value="update_profile" />
        </el-select>
        
        <el-select v-model="filter.module" placeholder="模块" clearable style="width: 120px">
          <el-option label="认证" value="auth" />
          <el-option label="项目" value="project" />
          <el-option label="市场" value="market" />
          <el-option label="系统" value="system" />
        </el-select>
        
        <el-select v-model="filter.status" placeholder="状态" clearable style="width: 100px">
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failure" />
          <el-option label="错误" value="error" />
        </el-select>
        
        <el-button type="primary" @click="fetchLogs">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </div>
      
      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user.username" label="用户" width="100" />
        <el-table-column prop="action" label="操作" width="120">
          <template #default="{ row }">
            <el-tag>{{ actionMap[row.action] || row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="80" />
        <el-table-column prop="details" label="详情" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ JSON.stringify(row.details) }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { userApi } from '../services/api';

const loading = ref(false);
const logs = ref([]);
const pagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0
});

const filter = reactive({
  userId: '',
  action: '',
  module: '',
  status: ''
});

const actionMap = {
  login: '登录',
  register: '注册',
  change_password: '修改密码',
  reset_password: '重置密码',
  update_profile: '更新资料'
};

const statusMap = {
  success: '成功',
  failure: '失败',
  error: '错误'
};

const statusTypeMap = {
  success: 'success',
  failure: 'warning',
  error: 'danger'
};

onMounted(() => {
  fetchLogs();
});

async function fetchLogs() {
  loading.value = true;
  try {
    const res = await userApi.getLogs({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    });
    
    if (res.data.success) {
      logs.value = res.data.data.items;
      pagination.total = res.data.data.total;
    }
  } catch (error) {
    console.error('获取日志失败:', error);
  } finally {
    loading.value = false;
  }
}

function resetFilter() {
  filter.userId = '';
  filter.action = '';
  filter.module = '';
  filter.status = '';
  fetchLogs();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('zh-CN');
}
</script>

<style lang="scss" scoped>
.logs-container {
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
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
