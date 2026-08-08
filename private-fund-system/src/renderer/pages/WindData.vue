<template>
  <div class="wind-data-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>Wind数据查询</span>
          <el-tag type="success">已连接</el-tag>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="股票数据" name="stock">
          <div class="query-form">
            <el-form :inline="true">
              <el-form-item label="股票代码">
                <el-input v-model="stockQuery.code" placeholder="如: 600519.SH" style="width: 200px" />
              </el-form-item>
              <el-form-item label="开始日期">
                <el-date-picker v-model="stockQuery.startDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker v-model="stockQuery.endDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryStock" :loading="loading">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="stockData" style="width: 100%" v-if="stockData.length > 0">
            <el-table-column prop="code" label="代码" width="100" />
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column
              v-for="(value, key) in stockData[0]?.indicators"
              :key="key"
              :prop="'indicators.' + key"
              :label="key"
              width="120"
            />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="债券数据" name="bond">
          <div class="query-form">
            <el-form :inline="true">
              <el-form-item label="债券代码">
                <el-input v-model="bondQuery.code" placeholder="如: 019733.SH" style="width: 200px" />
              </el-form-item>
              <el-form-item label="开始日期">
                <el-date-picker v-model="bondQuery.startDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker v-model="bondQuery.endDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryBond" :loading="loading">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="bondData" style="width: 100%" v-if="bondData.length > 0">
            <el-table-column prop="code" label="代码" width="100" />
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column
              v-for="(value, key) in bondData[0]?.indicators"
              :key="key"
              :prop="'indicators.' + key"
              :label="key"
              width="120"
            />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="基金数据" name="fund">
          <div class="query-form">
            <el-form :inline="true">
              <el-form-item label="基金代码">
                <el-input v-model="fundQuery.code" placeholder="如: 510300.SH" style="width: 200px" />
              </el-form-item>
              <el-form-item label="开始日期">
                <el-date-picker v-model="fundQuery.startDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker v-model="fundQuery.endDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryFund" :loading="loading">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="fundData" style="width: 100%" v-if="fundData.length > 0">
            <el-table-column prop="code" label="代码" width="100" />
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column
              v-for="(value, key) in fundData[0]?.indicators"
              :key="key"
              :prop="'indicators.' + key"
              :label="key"
              width="120"
            />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="指数数据" name="index">
          <div class="query-form">
            <el-form :inline="true">
              <el-form-item label="指数代码">
                <el-input v-model="indexQuery.code" placeholder="如: 000001.SH" style="width: 200px" />
              </el-form-item>
              <el-form-item label="开始日期">
                <el-date-picker v-model="indexQuery.startDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item label="结束日期">
                <el-date-picker v-model="indexQuery.endDate" type="date" placeholder="选择日期" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="queryIndex" :loading="loading">查询</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="indexData" style="width: 100%" v-if="indexData.length > 0">
            <el-table-column prop="code" label="代码" width="100" />
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column
              v-for="(value, key) in indexData[0]?.indicators"
              :key="key"
              :prop="'indicators.' + key"
              :label="key"
              width="120"
            />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="证券搜索" name="search">
          <div class="query-form">
            <el-form :inline="true">
              <el-form-item label="关键词">
                <el-input v-model="searchQuery.keyword" placeholder="输入证券名称/代码" style="width: 200px" />
              </el-form-item>
              <el-form-item label="类型">
                <el-select v-model="searchQuery.type" placeholder="全部" clearable>
                  <el-option label="股票" value="stock" />
                  <el-option label="债券" value="bond" />
                  <el-option label="基金" value="fund" />
                  <el-option label="指数" value="index" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="searchSecurities" :loading="loading">搜索</el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <el-table :data="searchResults" style="width: 100%" v-if="searchResults.length > 0">
            <el-table-column prop="code" label="代码" width="120" />
            <el-table-column prop="name" label="名称" width="200" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="exchange" label="交易所" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link @click="addToQuery(row)">添加查询</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { windApi } from '../services/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const activeTab = ref('stock');

const stockQuery = reactive({ code: '', startDate: '', endDate: '' });
const bondQuery = reactive({ code: '', startDate: '', endDate: '' });
const fundQuery = reactive({ code: '', startDate: '', endDate: '' });
const indexQuery = reactive({ code: '', startDate: '', endDate: '' });
const searchQuery = reactive({ keyword: '', type: '' });

const stockData = ref([]);
const bondData = ref([]);
const fundData = ref([]);
const indexData = ref([]);
const searchResults = ref([]);

async function queryStock() {
  if (!stockQuery.code) {
    ElMessage.warning('请输入股票代码');
    return;
  }
  
  loading.value = true;
  try {
    const res = await windApi.getStock(stockQuery.code, {
      startDate: stockQuery.startDate,
      endDate: stockQuery.endDate
    });
    
    if (res.data.success) {
      stockData.value = res.data.data;
      ElMessage.success(`获取到 ${stockData.value.length} 条数据`);
    }
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function queryBond() {
  if (!bondQuery.code) {
    ElMessage.warning('请输入债券代码');
    return;
  }
  
  loading.value = true;
  try {
    const res = await windApi.getBond(bondQuery.code, {
      startDate: bondQuery.startDate,
      endDate: bondQuery.endDate
    });
    
    if (res.data.success) {
      bondData.value = res.data.data;
      ElMessage.success(`获取到 ${bondData.value.length} 条数据`);
    }
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function queryFund() {
  if (!fundQuery.code) {
    ElMessage.warning('请输入基金代码');
    return;
  }
  
  loading.value = true;
  try {
    const res = await windApi.getFund(fundQuery.code, {
      startDate: fundQuery.startDate,
      endDate: fundQuery.endDate
    });
    
    if (res.data.success) {
      fundData.value = res.data.data;
      ElMessage.success(`获取到 ${fundData.value.length} 条数据`);
    }
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function queryIndex() {
  if (!indexQuery.code) {
    ElMessage.warning('请输入指数代码');
    return;
  }
  
  loading.value = true;
  try {
    const res = await windApi.getIndex(indexQuery.code, {
      startDate: indexQuery.startDate,
      endDate: indexQuery.endDate
    });
    
    if (res.data.success) {
      indexData.value = res.data.data;
      ElMessage.success(`获取到 ${indexData.value.length} 条数据`);
    }
  } catch (error) {
    ElMessage.error('查询失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

async function searchSecurities() {
  if (!searchQuery.keyword) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  
  loading.value = true;
  try {
    const res = await windApi.search({
      keyword: searchQuery.keyword,
      type: searchQuery.type
    });
    
    if (res.data.success) {
      searchResults.value = res.data.data;
      ElMessage.success(`找到 ${searchResults.value.length} 个结果`);
    }
  } catch (error) {
    ElMessage.error('搜索失败: ' + error.message);
  } finally {
    loading.value = false;
  }
}

function addToQuery(row) {
  const queryMap = {
    stock: stockQuery,
    bond: bondQuery,
    fund: fundQuery,
    index: indexQuery
  };
  
  const query = queryMap[row.type];
  if (query) {
    query.code = row.code;
    activeTab.value = row.type;
    ElMessage.success('已添加到查询');
  }
}
</script>

<style lang="scss" scoped>
.wind-data-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.query-form {
  margin-bottom: 20px;
}
</style>
