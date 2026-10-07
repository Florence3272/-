<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { databaseApi, termApi, announcementApi, type TermDatabase } from '@/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = useRouter()
const store = useUserStore()

const keyword = ref('')
const stats = ref({ totalTerms: 0, totalDatabases: 0, totalResources: 0, totalUsers: 0 })
const hotDatabases = ref<TermDatabase[]>([])
const notices = ref<Record<string, any>[]>([])
const loading = ref(true)

const entries = [
  { path: '/terminology', title: '术语库管理', desc: '分库浏览、检索与术语维护', icon: 'Collection', color: '#1a6b4f' },
  { path: '/resources', title: '教学资源', desc: '情境对话、微课、习题与文化贴士', icon: 'Reading', color: '#2563eb' },
  { path: '/translate', title: '翻译服务', desc: '中俄互译与术语辅助翻译', icon: 'Switch', color: '#d97706' },
  { path: '/profile', title: '个人中心', desc: '学习记录、收藏与笔记', icon: 'User', color: '#db2777' },
]

const paths = [
  { name: '新手入门', desc: '从零开始掌握能源装备基础术语', mode: 'flashcard' },
  { name: '情境学习', desc: '真实贸易场景对话演练', mode: 'quiz' },
  { name: '术语测试', desc: '检验掌握程度，生成错题集', mode: 'quiz' },
]

function search() {
  if (keyword.value.trim()) {
    router.push({ path: '/terminology', query: { search: keyword.value.trim() } })
  }
}

onMounted(async () => {
  try {
    const [s, dbs, ns] = await Promise.all([
      termApi.stats(),
      databaseApi.list(),
      announcementApi.list().catch(() => []),
    ])
    stats.value = s
    hotDatabases.value = dbs.slice(0, 6)
    notices.value = ns.slice(0, 3)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <section class="hero">
        <h1>中俄能源装备贸易 · 行业术语库与教学资源</h1>
        <p>覆盖"专业技能 + 语言能力 + 跨域文化"三维度，服务"一带一路"经贸合作人才培养。</p>
        <div class="search">
          <el-input v-model="keyword" size="large" placeholder="搜索术语（中/俄/英）..." clearable @keyup.enter="search">
            <template #append>
              <el-button type="primary" @click="search"><el-icon><Search /></el-icon></el-button>
            </template>
          </el-input>
        </div>
      </section>

      <el-row :gutter="16" class="mt-24">
        <el-col :xs="12" :sm="6" v-for="s in [
          { label: '术语条目', value: stats.totalTerms, icon: 'Collection' },
          { label: '分数据库', value: stats.totalDatabases, icon: 'Files' },
          { label: '教学资源', value: stats.totalResources, icon: 'Reading' },
          { label: '注册用户', value: stats.totalUsers, icon: 'User' },
        ]" :key="s.label">
          <el-card shadow="never" class="stat-card">
            <el-icon :size="22" color="#1a6b4f"><component :is="s.icon" /></el-icon>
            <div class="num">{{ s.value }}</div>
            <div class="label">{{ s.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">功能入口</h2>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6" v-for="e in entries" :key="e.path">
          <el-card shadow="hover" class="entry" @click="router.push(e.path)">
            <el-icon :size="26" :color="e.color"><component :is="e.icon" /></el-icon>
            <h3>{{ e.title }}</h3>
            <p>{{ e.desc }}</p>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">热门分库</h2>
      <el-row :gutter="16" v-loading="loading">
        <el-col :xs="24" :sm="12" :md="8" v-for="db in hotDatabases" :key="db.id">
          <el-card shadow="hover" class="db-card" @click="router.push(`/terminology/${db.id}`)">
            <div class="flex-between">
              <strong>{{ db.name }}</strong>
              <el-tag size="small" type="info">{{ db.category }}</el-tag>
            </div>
            <p class="desc">{{ db.description }}</p>
            <div class="meta">
              <span>{{ db.termCount }} 术语</span>
              <span>{{ new Date(db.updatedAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <template v-if="notices.length">
        <h2 class="section-title">公告与推荐</h2>
        <el-card shadow="never">
          <el-timeline>
            <el-timeline-item v-for="n in notices" :key="n.id" :timestamp="String(n.type)" placement="top">
              <strong>{{ n.title }}</strong>
              <p class="desc">{{ n.content }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </template>

      <h2 class="section-title">推荐学习路径</h2>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="8" v-for="p in paths" :key="p.name">
          <el-card shadow="hover" class="entry" @click="router.push(`/learn/${p.mode}`)">
            <h3>{{ p.name }}</h3>
            <p>{{ p.desc }}</p>
          </el-card>
        </el-col>
      </el-row>

      <p v-if="!store.isLoggedIn" class="login-tip">
        还没有账号？<router-link to="/login" class="link">立即登录 / 注册</router-link>
      </p>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #1a6b4f, #0e4a35);
  color: #fff;
  border-radius: 14px;
  padding: 40px 28px;
  text-align: center;
}
.hero h1 { margin: 0 0 8px; font-size: 24px; }
.hero p { margin: 0 0 20px; opacity: 0.85; font-size: 14px; }
.search { max-width: 560px; margin: 0 auto; }
.section-title { font-size: 17px; margin: 28px 0 14px; }
.stat-card { text-align: center; }
.stat-card .num { font-size: 26px; font-weight: 700; margin-top: 6px; }
.stat-card .label { font-size: 12px; color: #6b7280; }
.entry { cursor: pointer; text-align: center; }
.entry h3 { margin: 10px 0 6px; font-size: 15px; }
.entry p { margin: 0; font-size: 12px; color: #6b7280; }
.db-card { cursor: pointer; }
.db-card .desc { font-size: 12px; color: #6b7280; min-height: 34px; margin: 8px 0; }
.db-card .meta { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
.login-tip { text-align: center; margin-top: 28px; color: #6b7280; font-size: 14px; }
.link { color: var(--brand); }
</style>
