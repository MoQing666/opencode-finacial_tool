<template>
  <div class="market-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="市场概览" name="overview">
        <MarketOverview />
      </el-tab-pane>
      
      <el-tab-pane label="股票行情" name="stocks">
        <StockList />
      </el-tab-pane>
      
      <el-tab-pane label="债券市场" name="bonds">
        <BondList />
      </el-tab-pane>
      
      <el-tab-pane label="基金市场" name="funds">
        <FundList />
      </el-tab-pane>
      
      <el-tab-pane label="指数行情" name="indices">
        <IndexList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MarketOverview from '../components/MarketOverview.vue';
import StockList from '../components/StockList.vue';
import BondList from '../components/BondList.vue';
import FundList from '../components/FundList.vue';
import IndexList from '../components/IndexList.vue';

const activeTab = ref('overview');
</script>

<script>
import MarketOverview from '../components/MarketOverview.vue';
import StockList from '../components/StockList.vue';
import BondList from '../components/BondList.vue';
import FundList from '../components/FundList.vue';
import IndexList from '../components/IndexList.vue';

export default {
  components: {
    MarketOverview,
    StockList,
    BondList,
    FundList,
    IndexList
  }
};
</script>

<style lang="scss" scoped>
.market-container {
  padding: 20px;
}
</style>
