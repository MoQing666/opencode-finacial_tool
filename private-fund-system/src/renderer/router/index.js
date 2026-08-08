import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { title: '数据大屏', icon: 'DataBoard' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../pages/Projects.vue'),
        meta: { title: '项目管理', icon: 'Folder' }
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('../pages/ProjectDetail.vue'),
        meta: { title: '项目详情', hidden: true }
      },
      {
        path: 'pre-investment',
        name: 'PreInvestment',
        component: () => import('../pages/PreInvestment.vue'),
        meta: { title: '投前管理', icon: 'Document' }
      },
      {
        path: 'post-investment',
        name: 'PostInvestment',
        component: () => import('../pages/PostInvestment.vue'),
        meta: { title: '投后管理', icon: 'TrendCharts' }
      },
      {
        path: 'market',
        name: 'Market',
        component: () => import('../pages/Market.vue'),
        meta: { title: '市场信息', icon: 'Market' }
      },
      {
        path: 'wind-data',
        name: 'WindData',
        component: () => import('../pages/WindData.vue'),
        meta: { title: 'Wind数据', icon: 'DataLine' }
      },
      {
        path: 'ai-assistant',
        name: 'AIAssistant',
        component: () => import('../pages/AIAssistant.vue'),
        meta: { title: 'AI助手', icon: 'ChatDotRound' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../pages/Users.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['admin'] }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../pages/Logs.vue'),
        meta: { title: '系统日志', icon: 'List', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth !== false && !userStore.token) {
    next('/login');
  } else if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo?.role)) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
