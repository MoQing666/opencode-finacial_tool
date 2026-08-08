<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    userStore.setToken(token);
    userStore.fetchUserInfo();
  } else {
    router.push('/login');
  }
});
</script>

<style lang="scss">
.app-container {
  width: 100%;
  height: 100vh;
}
</style>
