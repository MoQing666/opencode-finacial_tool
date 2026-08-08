<template>
  <div class="market-overview">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>主要指数</span>
          </template>
          <div ref="indexChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>市场概况</span>
          </template>
          <div class="market-summary">
            <div class="summary-item" v-for="item in marketSummary" :key="item.name">
              <span class="name">{{ item.name }}</span>
              <span class="value" :class="item.change >= 0 ? 'up' : 'down'">
                {{ item.value }}
                <span class="change">{{ item.change >= 0 ? '+' : '' }}{{ item.change }}%</span>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>行业涨幅榜</span>
          </template>
          <el-table :data="industryTop" style="width: 100%" size="small">
            <el-table-column prop="name" label="行业" />
            <el-table-column prop="change" label="涨幅" width="100">
              <template #default="{ row }">
                <span :class="row.change >= 0 ? 'up' : 'down'">
                  {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="leadingStock" label="领涨股" width="100" />
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>热门股票</span>
          </template>
          <el-table :data="hotStocks" style="width: 100%" size="small">
            <el-table-column prop="code" label="代码" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="price" label="现价" width="80" />
            <el-table-column prop="change" label="涨跌幅" width="100">
              <template #default="{ row }">
                <span :class="row.change >= 0 ? 'up' : 'down'">
                  {{ row.change >= 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { marketApi } from '../services/api';

const indexChartRef = ref(null);
let indexChart = null;

const marketSummary = ref([
  { name: '上证指数', value: '3,200.50', change: 0.5 },
  { name: '深证成指', value: '10,800.20', change: -0.3 },
  { name: '创业板指', value: '2,150.80', change: 1.2 },
  { name: '科创50', value: '980.50', change: 0.8 },
  { name: '北证50', value: '850.30', change: -0.5 }
]);

const industryTop = ref([
  { name: '半导体', change: 3.5, leadingStock: '中芯国际' },
  { name: '新能源', change: 2.8, leadingStock: '宁德时代' },
  { name: '人工智能', change: 2.2, leadingStock: '科大讯飞' },
  { name: '生物医药', change: 1.5, leadingStock: '药明康德' },
  { name: '军工', change: 1.2, leadingStock: '中航沈飞' }
]);

const hotStocks = ref([
  { code: '600519', name: '贵州茅台', price: '1,800.00', change: 1.5 },
  { code: '000858', name: '五粮液', price: '180.50', change: 2.3 },
  { code: '300750', name: '宁德时代', price: '450.20', change: 3.1 },
  { code: '601318', name: '中国平安', price: '48.50', change: -0.8 },
  { code: '000001', name: '平安银行', price: '12.30', change: 0.5 }
]);

onMounted(async () => {
  await nextTick();
  initChart();
  fetchData();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  indexChart?.dispose();
});

function initChart() {
  indexChart = echarts.init(indexChartRef.value);
  
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['上证指数', '深证成指', '创业板指'] },
    xAxis: {
      type: 'category',
      data: ['09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00']
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '上证指数',
        type: 'line',
        data: [3200, 3210, 3205, 3215, 3220, 3218, 3225, 3230, 3228, 3200],
        smooth: true
      },
      {
        name: '深证成指',
        type: 'line',
        data: [10800, 10820, 10810, 10830, 10840, 10835, 10850, 10860, 10855, 10800],
        smooth: true
      },
      {
        name: '创业板指',
        type: 'line',
        data: [2150, 2160, 2155, 2170, 2175, 2172, 2180, 2185, 2182, 2150],
        smooth: true
      }
    ]
  };
  
  indexChart.setOption(option);
}

function handleResize() {
  indexChart?.resize();
}

async function fetchData() {
  try {
    const res = await marketApi.getOverview();
    if (res.data.success) {
      // Update data from API
    }
  } catch (error) {
    console.error('获取市场数据失败:', error);
  }
}
</script>

<style lang="scss" scoped>
.market-overview {
  padding: 20px;
}

.chart-container {
  height: 300px;
}

.market-summary {
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .name {
      color: #606266;
    }
    
    .value {
      font-weight: bold;
      
      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
      
      .change {
        font-size: 12px;
        margin-left: 8px;
      }
    }
  }
}

.up { color: #f56c6c; }
.down { color: #67c23a; }
</style>
