<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { databaseApi, resourceApi, type Resource, type TermDatabase } from '@/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const dbId = Number(route.params.dbId)

const dbInfo = ref<TermDatabase | null>(null)
const resources = ref<Resource[]>([])
const activeTab = ref('dialogue')
const loading = ref(true)

const moduleTypes = [
  { value: 'dialogue', label: '情境对话' },
  { value: 'reading', label: '专业阅读' },
  { value: 'case', label: '案例分析' },
  { value: 'video', label: '微课视频' },
  { value: 'quiz', label: '习题测试' },
  { value: 'culture', label: '文化贴士' },
]

const difficultyLabel: Record<string, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
}

const items = computed(() => resources.value.filter((r) => r.moduleType === activeTab.value))

onMounted(async () => {
  try {
    const [info, list] = await Promise.all([databaseApi.byId(dbId), resourceApi.list({ dbId })])
    dbInfo.value = info
    resources.value = list
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <el-link :underline="false" class="back" @click="$router.push('/resources')">
        <el-icon><ArrowLeft /></el-icon>&nbsp;返回教学资源
      </el-link>

      <h1 class="page-title mt-16">{{ dbInfo?.name || '分库资源' }}</h1>
      <p class="page-desc">{{ dbInfo?.description }}</p>

      <el-tabs v-model="activeTab">
        <el-tab-pane v-for="m in moduleTypes" :key="m.value" :label="m.label" :name="m.value">
          <el-empty v-if="items.length === 0" :description="`暂无${m.label}资源`" />
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" v-for="r in items" :key="r.id">
              <el-card shadow="hover">
                <div class="flex-between">
                  <strong>{{ r.title }}</strong>
                  <el-tag size="small">{{ difficultyLabel[r.difficulty] || r.difficulty }}</el-tag>
                </div>
                <p v-if="r.duration" class="dur">{{ r.duration }} 分钟</p>
                <p class="desc">{{ (r.content || '暂无描述').slice(0, 100) }}</p>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.back { font-size: 13px; color: #6b7280; cursor: pointer; }
.dur { font-size: 12px; color: #9ca3af; margin: 4px 0; }
.desc { font-size: 12px; color: #6b7280; margin: 4px 0 0; }
</style>
