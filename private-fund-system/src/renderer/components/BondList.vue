<template>
  <div class="bond-list">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索债券代码/名称"
        clearable
        style="width: 200px"
        @clear="fetchBonds"
        @keyup.enter="fetchBonds"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="fetchBonds">查询</el-button>
    </div>
    
    <el-table :data="bonds" style="width: 100%" v-loading="loading">
      <el-table-column prop="symbol" label="代码" width="100" />
      <el-table-column prop="name" label="名称" min-width="200" />
      <el-table-column prop="price" label="现价" width="100">
        <template #default="{ row }">
          {{ row.price?.toFixed(4) }}
        </template>
      </el-table-column>
      <el-table-column prop="yield" label="收益率(%)" width="100">
        <template #default="{ row }">
          {{ row.yield?.toFixed(4) }}
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="久期" width="80">
        <template #default="{ row }">
          {{ row.duration?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="couponRate" label="票面利率(%)" width="100">
        <template #default="{ row }">
          {{ row.couponRate?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="maturityDate" label="到期日" width="120">
        <template #default="{ row }">
          {{ formatDate(row.maturityDate) }}
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
        @size-change="fetchBonds"
        @current-change="fetchBonds"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marketApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const bonds = ref([]);
const keyword = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

onMounted(() => {
  fetchBonds();
});

async function fetchBonds() {
  loading.value = true;
  try {
    const res = await marketApi.getBonds({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    });
    
    if (res.data.success) {
      bonds.value = res.data.data.items;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取债券列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function viewDetail(row) {
  ElMessage.info('查看债券详情: ' + row.name);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}
</script>

<style lang="scss" scoped>
.bond-list {
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
</style>
