<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { databaseApi, resourceApi, type TermDatabase } from '@/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const router = useRouter()
const databases = ref<TermDatabase[]>([])
const moduleTypes = ref<{ value: string; label: string }[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [dbs, types] = await Promise.all([databaseApi.list(), resourceApi.moduleTypes()])
    databases.value = dbs
    moduleTypes.value = types
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <h1 class="page-title">教学资源库</h1>
      <p class="page-desc">情境对话、专业阅读、案例分析、微课视频、习题测试、文化贴士</p>

      <el-row :gutter="12">
        <el-col :xs="8" :sm="4" v-for="m in moduleTypes" :key="m.value">
          <el-card shadow="hover" class="module" @click="router.push(`/resources?module=${m.value}`)">
            <el-icon :size="22" color="#1a6b4f"><Reading /></el-icon>
            <div class="label">{{ m.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">按分库浏览</h2>
      <el-row :gutter="16" v-loading="loading">
        <el-col :xs="24" :sm="12" :md="8" v-for="db in databases" :key="db.id">
          <el-card shadow="hover" class="db-card" @click="router.push(`/resources/${db.id}`)">
            <strong>{{ db.name }}</strong>
            <p class="desc">{{ db.description }}</p>
            <el-tag size="small" type="success" effect="light">教学资源</el-tag>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">快速学习</h2>
      <el-row :gutter="16">
        <el-col :xs="24" :sm="8" v-for="q in [
          { to: '/learn/flashcard', title: '闪卡记忆', desc: '翻卡记忆术语，支持中俄互查' },
          { to: '/learn/quiz', title: '术语测试', desc: '多种题型，自动判分' },
          { to: '/learn/compare', title: '对比学习', desc: '同类术语中俄差异对比' },
        ]" :key="q.to">
          <el-card shadow="hover" class="module-entry" @click="router.push(q.to)">
            <strong>{{ q.title }}</strong>
            <p class="desc">{{ q.desc }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.module { cursor: pointer; text-align: center; }
.module .label { font-size: 13px; margin-top: 6px; }
.section-title { font-size: 17px; margin: 28px 0 14px; }
.db-card { cursor: pointer; }
.db-card .desc { font-size: 12px; color: #6b7280; min-height: 34px; }
.module-entry { cursor: pointer; }
.module-entry .desc { font-size: 12px; color: #6b7280; }
</style>
