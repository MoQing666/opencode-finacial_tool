import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../services/api';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref(null);
  const loading = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => userInfo.value?.role === 'admin');
  const userName = computed(() => userInfo.value?.realName || userInfo.value?.username || '');

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function clearToken() {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('token');
  }

  async function login(username, password) {
    loading.value = true;
    try {
      const res = await authApi.login({ username, password });
      if (res.data.success) {
        setToken(res.data.data.token);
        userInfo.value = res.data.data.user;
        return true;
      }
      throw new Error(res.data.error);
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return;
    loading.value = true;
    try {
      const res = await authApi.getProfile();
      if (res.data.success) {
        userInfo.value = res.data.data;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      if (error.response?.status === 401) {
        clearToken();
      }
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    clearToken();
  }

  async function updateProfile(updateData) {
    loading.value = true;
    try {
      const res = await authApi.updateProfile(updateData);
      if (res.data.success) {
        userInfo.value = { ...userInfo.value, ...res.data.data };
        return true;
      }
      throw new Error(res.data.error);
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(oldPassword, newPassword) {
    loading.value = true;
    try {
      const res = await authApi.changePassword({ oldPassword, newPassword });
      if (res.data.success) {
        return true;
      }
      throw new Error(res.data.error);
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    token,
    userInfo,
    loading,
    isLoggedIn,
    isAdmin,
    userName,
    setToken,
    clearToken,
    login,
    fetchUserInfo,
    logout,
    updateProfile,
    changePassword
  };
});
