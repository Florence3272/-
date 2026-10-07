<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const store = useUserStore()
const router = useRouter()

const menus = [
  { path: '/terminology', label: '术语库', icon: 'Collection' },
  { path: '/resources', label: '教学资源', icon: 'Reading' },
  { path: '/translate', label: '翻译', icon: 'Switch' },
  { path: '/profile', label: '个人中心', icon: 'User' },
]

async function handleLogout() {
  await store.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <el-header class="app-header">
    <div class="inner">
      <router-link to="/" class="logo">
        <el-icon :size="20"><Collection /></el-icon>
        <span>中俄术语库</span>
      </router-link>

      <nav class="nav">
        <router-link v-for="m in menus" :key="m.path" :to="m.path" class="nav-item">
          {{ m.label }}
        </router-link>
        <router-link v-if="store.isAdmin" to="/admin" class="nav-item">后台管理</router-link>
      </nav>

      <div class="right">
        <template v-if="store.isLoggedIn">
          <router-link to="/profile" class="user">
            <el-icon><UserFilled /></el-icon>
            <span>{{ store.user?.name || store.user?.username }}</span>
          </router-link>
          <el-button size="small" text @click="handleLogout">退出</el-button>
        </template>
        <el-button v-else type="primary" size="small" @click="router.push('/login')">登录</el-button>
      </div>
    </div>
  </el-header>
</template>

<style scoped>
.app-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}
.inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: var(--brand);
  white-space: nowrap;
}
.nav {
  display: flex;
  gap: 4px;
  flex: 1;
}
.nav-item {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #4b5563;
}
.nav-item:hover,
.nav-item.router-link-active {
  background: rgba(26, 107, 79, 0.1);
  color: var(--brand);
}
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
}
</style>
