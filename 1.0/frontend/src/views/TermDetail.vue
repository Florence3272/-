<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { databaseApi, favoriteApi, termApi, type TermDatabase } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const dbId = Number(route.params.dbId)
const termId = Number(route.params.termId)

const term = ref<any>(null)
const dbInfo = ref<TermDatabase | null>(null)
const favorited = ref(false)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const [t, d] = await Promise.all([termApi.byId(termId), databaseApi.byId(dbId)])
    term.value = t
    dbInfo.value = d
    if (store.isLoggedIn) {
      try {
        const c = await favoriteApi.check('term', termId)
        favorited.value = c.favorited
      } catch { /* ignore */ }
    }
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!store.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (favorited.value) {
    await favoriteApi.add({ targetType: 'term', targetId: termId })
    favorited.value = false
    ElMessage.success('已取消收藏')
  } else {
    await favoriteApi.add({ targetType: 'term', targetId: termId })
    favorited.value = true
    ElMessage.success('已收藏')
  }
}

const tags = (t: any) => (t?.tags ? String(t.tags).split(',').filter(Boolean) : [])

onMounted(load)
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <el-breadcrumb separator="/" class="mt-16">
        <el-breadcrumb-item :to="{ path: '/terminology' }">术语库</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/terminology/${dbId}` }">{{ dbInfo?.name || '分库' }}</el-breadcrumb-item>
        <el-breadcrumb-item>术语详情</el-breadcrumb-item>
      </el-breadcrumb>

      <template v-if="term">
        <div class="flex-between mt-16">
          <div>
            <h1 class="page-title">
              {{ term.cnTerm }}
              <el-button text circle @click="toggleFavorite">
                <el-icon :color="favorited ? '#ef4444' : '#9ca3af'"><StarFilled /></el-icon>
              </el-button>
            </h1>
            <p class="ru">{{ term.ruTerm }}</p>
          </div>
          <div class="actions">
            <el-button v-if="store.isLoggedIn" @click="router.push(`/terminology/${dbId}/term/${termId}/edit`)">
              <el-icon><Edit /></el-icon>&nbsp;编辑
            </el-button>
            <el-button type="primary" @click="router.push(`/learn/flashcard?dbId=${dbId}`)">
              <el-icon><Reading /></el-icon>&nbsp;学习
            </el-button>
          </div>
        </div>

        <el-row :gutter="16" class="mt-16">
          <el-col :xs="24" :sm="12" v-if="term.enTerm">
            <el-card shadow="never"><div class="lbl">英文参考</div><div class="val">{{ term.enTerm }}</div></el-card>
          </el-col>
          <el-col :xs="24" :sm="12" v-if="term.pos">
            <el-card shadow="never"><div class="lbl">词性</div><el-tag>{{ term.pos }}</el-tag></el-card>
          </el-col>
        </el-row>

        <el-card v-if="tags(term).length" shadow="never" class="mt-16">
          <div class="lbl">领域标签</div>
          <el-tag v-for="t in tags(term)" :key="t" class="tag" type="success" effect="light">{{ t.trim() }}</el-tag>
        </el-card>

        <el-card v-if="term.definition" shadow="never" class="mt-16">
          <div class="lbl">专业释义</div><p class="text">{{ term.definition }}</p>
        </el-card>
        <el-card v-if="term.context" shadow="never" class="mt-16">
          <div class="lbl">使用场景</div><p class="text">{{ term.context }}</p>
        </el-card>
        <el-card v-if="term.cultureNote" shadow="never" class="mt-16">
          <div class="lbl">文化注释</div><p class="text">{{ term.cultureNote }}</p>
        </el-card>

        <el-card v-if="term.media?.length" shadow="never" class="mt-16">
          <div class="lbl">富媒体</div>
          <ul>
            <li v-for="m in term.media" :key="m.id">{{ m.type }}：{{ m.url }}</li>
          </ul>
        </el-card>

        <p class="meta">版本 v{{ term.version }} · 更新于 {{ new Date(term.updatedAt).toLocaleString('zh-CN') }}</p>
      </template>

      <el-empty v-else-if="!loading" description="术语不存在" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.ru { font-size: 17px; color: #4b5563; margin: 0; }
.actions { display: flex; gap: 8px; }
.lbl { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.val { font-weight: 600; }
.text { margin: 0; line-height: 1.7; color: #374151; }
.tag { margin-right: 8px; }
.meta { font-size: 12px; color: #9ca3af; margin-top: 20px; }
</style>
