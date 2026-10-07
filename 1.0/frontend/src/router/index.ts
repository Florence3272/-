import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/api/http'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
  { path: '/terminology', name: 'terminology', component: () => import('@/views/Terminology.vue'), meta: { title: '术语库' } },
  { path: '/terminology/:dbId', name: 'database-terms', component: () => import('@/views/DatabaseTerms.vue'), meta: { title: '分库术语' } },
  { path: '/terminology/:dbId/term/:termId', name: 'term-detail', component: () => import('@/views/TermDetail.vue'), meta: { title: '术语详情' } },
  {
    path: '/terminology/:dbId/term/:termId/edit',
    name: 'term-edit',
    component: () => import('@/views/TermEdit.vue'),
    meta: { title: '编辑术语', requiresAuth: true },
  },
  { path: '/resources', name: 'resources', component: () => import('@/views/Resources.vue'), meta: { title: '教学资源' } },
  { path: '/resources/:dbId', name: 'database-resources', component: () => import('@/views/DatabaseResources.vue'), meta: { title: '分库资源' } },
  { path: '/learn/:mode', name: 'learn', component: () => import('@/views/Learn.vue'), meta: { title: '学习' } },
  { path: '/translate', name: 'translate', component: () => import('@/views/Translate.vue'), meta: { title: '翻译服务' } },
  { path: '/profile', name: 'profile', component: () => import('@/views/Profile.vue'), meta: { title: '个人中心', requiresAuth: true } },
  { path: '/admin', name: 'admin', component: () => import('@/views/Admin.vue'), meta: { title: '后台管理', requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const store = useUserStore()
  if (getToken() && !store.loaded) {
    await store.fetchMe()
  }
  if (to.meta.requiresAuth && !store.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !store.isAdmin) {
    return { path: '/' }
  }
  document.title = `${to.meta.title ?? ''} · 中俄能源装备术语库`
  return true
})

export default router
