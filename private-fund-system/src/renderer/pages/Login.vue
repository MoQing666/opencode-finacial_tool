<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>私募基金管理系统</h1>
        <p>投前投后市场信息一体化平台</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary">忘记密码？</el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>本地部署 · 数据安全 · AI驱动</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur' }
  ]
};

async function handleLogin() {
  const formEl = loginFormRef.value;
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      const success = await userStore.login(loginForm.username, loginForm.password);
      if (success) {
        ElMessage.success('登录成功');
        router.push('/dashboard');
      }
    } catch (error) {
      ElMessage.error(error.message || '登录失败');
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 28px;
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  .el-input {
    height: 44px;
  }
}

.login-options {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  
  p {
    font-size: 12px;
    color: #909399;
  }
}
</style>
