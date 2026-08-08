<template>
  <div class="stock-list">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索股票代码/名称"
        clearable
        style="width: 200px"
        @clear="fetchStocks"
        @keyup.enter="fetchStocks"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="fetchStocks">查询</el-button>
    </div>
    
    <el-table :data="stocks" style="width: 100%" v-loading="loading">
      <el-table-column prop="symbol" label="代码" width="100" />
      <el-table-column prop="name" label="名称" width="120" />
      <el-table-column prop="price" label="现价" width="100">
        <template #default="{ row }">
          {{ row.price?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="change" label="涨跌额" width="100">
        <template #default="{ row }">
          <span :class="row.change >= 0 ? 'up' : 'down'">
            {{ row.change >= 0 ? '+' : '' }}{{ row.change?.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="changePercent" label="涨跌幅" width="100">
        <template #default="{ row }">
          <span :class="row.changePercent >= 0 ? 'up' : 'down'">
            {{ row.changePercent >= 0 ? '+' : '' }}{{ row.changePercent?.toFixed(2) }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="volume" label="成交量(手)" width="120">
        <template #default="{ row }">
          {{ formatVolume(row.volume) }}
        </template>
      </el-table-column>
      <el-table-column prop="marketCap" label="市值(亿)" width="120">
        <template #default="{ row }">
          {{ formatMarketCap(row.marketCap) }}
        </template>
      </el-table-column>
      <el-table-column prop="pe" label="市盈率" width="100">
        <template #default="{ row }">
          {{ row.pe?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="pb" label="市净率" width="100">
        <template #default="{ row }">
          {{ row.pb?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
          <el-button type="primary" link @click="addToWatch(row)">关注</el-button>
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
        @size-change="fetchStocks"
        @current-change="fetchStocks"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marketApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const stocks = ref([]);
const keyword = ref('');
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);

onMounted(() => {
  fetchStocks();
});

async function fetchStocks() {
  loading.value = true;
  try {
    const res = await marketApi.getStocks({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    });
    
    if (res.data.success) {
      stocks.value = res.data.data.items;
      total.value = res.data.data.total;
    }
  } catch (error) {
    console.error('获取股票列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function viewDetail(row) {
  ElMessage.info('查看股票详情: ' + row.name);
}

function addToWatch(row) {
  ElMessage.success('已添加关注: ' + row.name);
}

function formatVolume(volume) {
  if (!volume) return '0';
  return (volume / 100).toLocaleString();
}

function formatMarketCap(cap) {
  if (!cap) return '0';
  return (cap / 100000000).toFixed(2);
}
</script>

<style lang="scss" scoped>
.stock-list {
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
