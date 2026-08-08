<template>
  <div class="fund-list">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索基金代码/名称"
        clearable
        style="width: 200px"
        @clear="fetchFunds"
        @keyup.enter="fetchFunds"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="fetchFunds">查询</el-button>
    </div>
    
    <el-table :data="funds" style="width: 100%" v-loading="loading">
      <el-table-column prop="symbol" label="代码" width="100" />
      <el-table-column prop="name" label="名称" min-width="200" />
      <el-table-column prop="nav" label="净值" width="100">
        <template #default="{ row }">
          {{ row.nav?.toFixed(4) }}
        </template>
      </el-table-column>
      <el-table-column prop="accNav" label="累计净值" width="100">
        <template #default="{ row }">
          {{ row.accNav?.toFixed(4) }}
        </template>
      </el-table-column>
      <el-table-column prop="return1m" label="近1月(%)" width="100">
        <template #default="{ row }">
          <span :class="row.return1m >= 0 ? 'up' : 'down'">
            {{ row.return1m >= 0 ? '+' : '' }}{{ row.return1m?.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="return3m" label="近3月(%)" width="100">
        <template #default="{ row }">
          <span :class="row.return3m >= 0 ? 'up' : 'down'">
            {{ row.return3m >= 0 ? '+' : '' }}{{ row.return3m?.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="return1y" label="近1年(%)" width="100">
        <template #default="{ row }">
          <span :class="row.return1y >= 0 ? 'up' : 'down'">
            {{ row.return1y >= 0 ? '+' : '' }}{{ row.return1y?.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="sharpe" label="夏普比率" width="100">
        <template #default="{ row }">
          {{ row.sharpe?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchFunds"
        @current-change="fetchFunds"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marketApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const funds = ref([]);
const keyword = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

onMounted(() => {
  fetchFunds();
});

async function fetchFunds() {
  loading.value = true;
  try {
    const res = await marketApi.getFunds({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    });
    
    if (res.data.success) {
      funds.value = res.data.data.items;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取基金列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function viewDetail(row) {
  ElMessage.info('查看基金详情: ' + row.name);
}
</script>

<style lang="scss" scoped>
.fund-list {
  padding: 20px;
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

.up { color: #f56c6c; }
.down { color: #67c23a; }
</style>
