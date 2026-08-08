<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon size="32"><Folder /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalProjects }}</div>
            <div class="stat-label">项目总数</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon size="32"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeProjects }}</div>
            <div class="stat-label">活跃项目</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon size="32"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatMoney(stats.totalInvestment) }}</div>
            <div class="stat-label">总投资额(万元)</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon size="32"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgReturn }}%</div>
            <div class="stat-label">平均收益率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>项目阶段分布</span>
          </template>
          <div ref="stageChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>行业分布</span>
          </template>
          <div ref="industryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <span>投资趋势</span>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>风险评估</span>
          </template>
          <div ref="riskChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>投资排行</span>
          </template>
          <el-table :data="topInvestments" style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="projectName" label="项目名称" />
            <el-table-column prop="actualAmount" label="投资金额(万元)" width="120">
              <template #default="{ row }">
                {{ formatMoney(row.actualAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="industry" label="行业" width="100" />
            <el-table-column prop="riskLevel" label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getRiskType(row.riskLevel)">{{ row.riskLevel }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="formatDate(activity.updatedAt)"
              placement="top"
            >
              <el-card shadow="never">
                <h4>{{ activity.projectName }}</h4>
                <p>阶段: {{ activity.stage }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { dashboardApi } from '../services/api';

const stats = ref({
  totalProjects: 0,
  activeProjects: 0,
  totalInvestment: 0,
  avgReturn: 0
});

const topInvestments = ref([]);
const recentActivities = ref([]);

const stageChartRef = ref(null);
const industryChartRef = ref(null);
const trendChartRef = ref(null);
const riskChartRef = ref(null);

let stageChart = null;
let industryChart = null;
let trendChart = null;
let riskChart = null;

onMounted(async () => {
  await fetchData();
  await nextTick();
  initCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  disposeCharts();
});

async function fetchData() {
  try {
    const [overviewRes, distributionRes, trendRes, riskRes, topRes, activitiesRes] = await Promise.all([
      dashboardApi.getOverview(),
      dashboardApi.getProjectDistribution(),
      dashboardApi.getInvestmentTrend({ months: 12 }),
      dashboardApi.getRiskAssessment(),
      dashboardApi.getTopInvestments(),
      dashboardApi.getRecentActivities({ limit: 10 })
    ]);
    
    if (overviewRes.data.success) {
      stats.value = overviewRes.data.data;
    }
    
    if (distributionRes.data.success) {
      renderStageChart(distributionRes.data.data.stage);
      renderIndustryChart(distributionRes.data.data.industry);
    }
    
    if (trendRes.data.success) {
      renderTrendChart(trendRes.data.data);
    }
    
    if (riskRes.data.success) {
      renderRiskChart(riskRes.data.data.distribution);
    }
    
    if (topRes.data.success) {
      topInvestments.value = topRes.data.data;
    }
    
    if (activitiesRes.data.success) {
      recentActivities.value = activitiesRes.data.data;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}

function initCharts() {
  stageChart = echarts.init(stageChartRef.value);
  industryChart = echarts.init(industryChartRef.value);
  trendChart = echarts.init(trendChartRef.value);
  riskChart = echarts.init(riskChartRef.value);
}

function disposeCharts() {
  stageChart?.dispose();
  industryChart?.dispose();
  trendChart?.dispose();
  riskChart?.dispose();
}

function handleResize() {
  stageChart?.resize();
  industryChart?.resize();
  trendChart?.resize();
  riskChart?.resize();
}

function renderStageChart(data) {
  const stageNames = {
    prospect: ' prospects',
    due_diligence: '尽职调查',
    valuation: '估值',
    decision: '决策',
    invested: '已投资',
    exited: '已退出'
  };
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data.map(item => ({
        name: stageNames[item.stage] || item.stage,
        value: item.count
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  stageChart.setOption(option);
}

function renderIndustryChart(data) {
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      labelLine: { show: false },
      data: data.map(item => ({
        name: item.industry || '未知',
        value: item.count
      }))
    }]
  };
  
  industryChart.setOption(option);
}

function renderTrendChart(data) {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['项目数量', '投资金额'] },
    xAxis: {
      type: 'category',
      data: data.map(item => item.month)
    },
    yAxis: [
      { type: 'value', name: '项目数量' },
      { type: 'value', name: '投资金额(万元)' }
    ],
    series: [
      {
        name: '项目数量',
        type: 'bar',
        data: data.map(item => item.count)
      },
      {
        name: '投资金额',
        type: 'line',
        yAxisIndex: 1,
        data: data.map(item => item.amount)
      }
    ]
  };
  
  trendChart.setOption(option);
}

function renderRiskChart(data) {
  const riskNames = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险'
  };
  
  const riskColors = {
    low: '#67c23a',
    medium: '#e6a23c',
    high: '#f56c6c',
    critical: '#ff0000'
  };
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: data.map(item => ({
        name: riskNames[item.riskLevel] || item.riskLevel,
        value: item.count,
        itemStyle: { color: riskColors[item.riskLevel] }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  riskChart.setOption(option);
}

function formatMoney(value) {
  if (!value) return '0';
  return Number(value).toLocaleString();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN');
}

function getRiskType(riskLevel) {
  const types = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  };
  return types[riskLevel] || 'info';
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  .el-card__body {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}
</style>
