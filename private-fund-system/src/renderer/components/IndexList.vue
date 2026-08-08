<template>
  <div class="index-list">
    <el-table :data="indices" style="width: 100%" v-loading="loading">
      <el-table-column prop="symbol" label="代码" width="100" />
      <el-table-column prop="name" label="名称" width="150" />
      <el-table-column prop="price" label="现价" width="120">
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
      <el-table-column prop="volume" label="成交量(亿手)" width="120">
        <template #default="{ row }">
          {{ (row.volume / 100000000)?.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="成交额(亿)" width="120">
        <template #default="{ row }">
          {{ (row.amount / 100000000)?.toFixed(2) }}
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
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marketApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const indices = ref([]);

onMounted(() => {
  fetchIndices();
});

async function fetchIndices() {
  loading.value = true;
  try {
    const res = await marketApi.getIndices();
    
    if (res.data.success) {
      indices.value = res.data.data.items;
    }
  } catch (error) {
    console.error('获取指数列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function viewDetail(row) {
  ElMessage.info('查看指数详情: ' + row.name);
}
</script>

<style lang="scss" scoped>
.index-list {
  padding: 20px;
}

.up { color: #f56c6c; }
.down { color: #67c23a; }
</style>
