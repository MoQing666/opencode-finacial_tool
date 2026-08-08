<template>
  <div class="pre-investment-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="尽职调查" name="due-diligence">
        <DueDiligencePanel />
      </el-tab-pane>
      
      <el-tab-pane label="项目估值" name="valuation">
        <ValuationPanel />
      </el-tab-pane>
      
      <el-tab-pane label="投资决策" name="decision">
        <DecisionPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DueDiligencePanel from '../components/DueDiligencePanel.vue';
import ValuationPanel from '../components/ValuationPanel.vue';
import DecisionPanel from '../components/DecisionPanel.vue';

const activeTab = ref('due-diligence');
</script>

<script>
import DueDiligencePanel from '../components/DueDiligencePanel.vue';
import ValuationPanel from '../components/ValuationPanel.vue';
import DecisionPanel from '../components/DecisionPanel.vue';

export default {
  components: {
    DueDiligencePanel,
    ValuationPanel,
    DecisionPanel
  }
};
</script>

<style lang="scss" scoped>
.pre-investment-container {
  padding: 20px;
}
</style>
