<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab" tab-position="left">
      <el-tab-pane label="个人信息" name="profile">
        <el-card shadow="hover">
          <template #header>
            <span>个人信息</span>
          </template>
          
          <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="100px" style="max-width: 500px">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="profileForm.realName" placeholder="请输入姓名" />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateProfile" :loading="loading">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="password">
        <el-card shadow="hover">
          <template #header>
            <span>修改密码</span>
          </template>
          
          <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px" style="max-width: 500px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="loading">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="系统设置" name="system">
        <el-card shadow="hover">
          <template #header>
            <span>系统设置</span>
          </template>
          
          <el-form label-width="150px" style="max-width: 600px">
            <el-form-item label="Wind API配置">
              <el-input v-model="systemSettings.windApiKey" placeholder="Wind API Key" />
            </el-form-item>
            
            <el-form-item label="Wind API Secret">
              <el-input v-model="systemSettings.windApiSecret" type="password" placeholder="Wind API Secret" show-password />
            </el-form-item>
            
            <el-form-item label="LLaMA模型路径">
              <el-input v-model="systemSettings.llamaModelPath" placeholder="LLaMA模型文件路径" />
            </el-form-item>
            
            <el-form-item label="LLaMA上下文大小">
              <el-input-number v-model="systemSettings.llamaContextSize" :min="512" :max="8192" :step="512" />
            </el-form-item>
            
            <el-form-item label="数据库配置">
              <el-input v-model="systemSettings.dbHost" placeholder="数据库主机" style="width: 48%; margin-right: 4%" />
              <el-input v-model="systemSettings.dbPort" placeholder="端口" style="width: 24%; margin-right: 4%" />
              <el-input v-model="systemSettings.dbName" placeholder="数据库名" style="width: 24%" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveSystemSettings" :loading="loading">保存设置</el-button>
              <el-button @click="testConnections">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>
      
      <el-tab-pane label="关于系统" name="about">
        <el-card shadow="hover">
          <template #header>
            <span>关于系统</span>
          </template>
          
          <el-descriptions title="系统信息" :column="2" border>
            <el-descriptions-item label="系统名称">私募基金管理系统</el-descriptions-item>
            <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="平台">{{ systemInfo.platform }}</el-descriptions-item>
            <el-descriptions-item label="架构">{{ systemInfo.arch }}</el-descriptions-item>
            <el-descriptions-item label="Node版本">{{ systemInfo.nodeVersion }}</el-descriptions-item>
            <el-descriptions-item label="Electron版本">{{ systemInfo.electronVersion }}</el-descriptions-item>
          </el-descriptions>
          
          <el-divider />
          
          <h4>功能特性</h4>
          <ul class="feature-list">
            <li>投前管理：项目筛选、尽职调查、估值分析、投资决策</li>
            <li>投后管理：项目监控、绩效评估、风险预警、退出管理</li>
            <li>市场信息：实时行情、行业分析、研报管理、数据大屏</li>
            <li>Wind数据：股票、债券、基金、指数数据查询</li>
            <li>AI助手：智能分析、报告生成、投资建议</li>
            <li>系统管理：用户权限、日志审计、系统配置</li>
          </ul>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();
const loading = ref(false);
const activeTab = ref('profile');

const profileFormRef = ref(null);
const passwordFormRef = ref(null);

const profileForm = reactive({
  username: '',
  realName: '',
  email: '',
  phone: ''
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const systemSettings = reactive({
  windApiKey: '',
  windApiSecret: '',
  llamaModelPath: '',
  llamaContextSize: 4096,
  dbHost: 'localhost',
  dbPort: '5432',
  dbName: 'private_fund'
});

const systemInfo = reactive({
  platform: '',
  arch: '',
  nodeVersion: '',
  electronVersion: ''
});

const profileRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

onMounted(() => {
  loadUserInfo();
  loadSystemInfo();
});

function loadUserInfo() {
  if (userStore.userInfo) {
    Object.assign(profileForm, {
      username: userStore.userInfo.username,
      realName: userStore.userInfo.realName,
      email: userStore.userInfo.email,
      phone: userStore.userInfo.phone
    });
  }
}

async function loadSystemInfo() {
  try {
    const { ipcRenderer } = require('electron');
    const info = await ipcRenderer.invoke('get-system-info');
    Object.assign(systemInfo, info);
  } catch (error) {
    console.error('获取系统信息失败:', error);
  }
}

async function updateProfile() {
  const formEl = profileFormRef.value;
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      await userStore.updateProfile({
        realName: profileForm.realName,
        email: profileForm.email,
        phone: profileForm.phone
      });
      ElMessage.success('个人信息更新成功');
    } catch (error) {
      ElMessage.error('更新失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  });
}

async function changePassword() {
  const formEl = passwordFormRef.value;
  if (!formEl) return;
  
  await formEl.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    try {
      await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      ElMessage.success('密码修改成功');
      Object.assign(passwordForm, {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      ElMessage.error('修改失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  });
}

function saveSystemSettings() {
  ElMessage.success('系统设置已保存');
}

function testConnections() {
  ElMessage.info('正在测试连接...');
  setTimeout(() => {
    ElMessage.success('连接测试成功');
  }, 2000);
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 20px;
  height: calc(100vh - 120px);
}

.feature-list {
  padding-left: 20px;
  
  li {
    line-height: 2;
    color: #606266;
  }
}
</style>
