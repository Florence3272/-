<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { translateApi } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const store = useUserStore()

const sourceText = ref('')
const sourceLang = ref<'zh' | 'ru'>('zh')
const translating = ref(false)
const result = ref<{ result: string; matchedTerms: { cn: string; ru: string; source: string }[]; isMachineTranslated: boolean } | null>(null)

const quickQuery = ref('')
const quickResult = ref<{ found: boolean; source?: string; terms: any[] } | null>(null)

const history = ref<any[]>([])
const fileUploading = ref(false)

async function translate() {
  if (!sourceText.value.trim()) return
  translating.value = true
  try {
    result.value = await translateApi.text({
      text: sourceText.value,
      sourceLang: sourceLang.value,
      targetLang: sourceLang.value === 'zh' ? 'ru' : 'zh',
    })
    if (store.isLoggedIn) await loadHistory()
  } finally {
    translating.value = false
  }
}

function swap() {
  sourceLang.value = sourceLang.value === 'zh' ? 'ru' : 'zh'
  if (result.value) {
    sourceText.value = result.value.result
    result.value = null
  }
}

async function copy() {
  if (!result.value) return
  await navigator.clipboard.writeText(result.value.result)
  ElMessage.success('已复制')
}

async function quickSearch() {
  if (!quickQuery.value.trim()) return
  quickResult.value = (await translateApi.quick(quickQuery.value.trim())) as any
}

async function loadHistory() {
  history.value = await translateApi.history(10)
}

async function upload(file: any) {
  fileUploading.value = true
  try {
    await translateApi.file(file.raw as File, sourceLang.value)
    ElMessage.success('文件翻译完成')
    await loadHistory()
  } finally {
    fileUploading.value = false
  }
}

onMounted(() => {
  if (store.isLoggedIn) loadHistory().catch(() => {})
})
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <h1 class="page-title">翻译服务</h1>
      <p class="page-desc">中俄互译，智能术语匹配</p>

      <el-card shadow="never">
        <div class="lang-switch">
          <el-radio-group v-model="sourceLang">
            <el-radio-button value="zh">中文</el-radio-button>
            <el-radio-button value="ru">俄文</el-radio-button>
          </el-radio-group>
          <el-button text @click="swap"><el-icon><Switch /></el-icon>&nbsp;互换</el-button>
        </div>

        <el-input v-model="sourceText" type="textarea" :rows="5"
          :placeholder="sourceLang === 'zh' ? '输入中文文本...' : 'Введите текст на русском...'" />

        <el-button type="primary" class="mt-16 full" :loading="translating" @click="translate">翻译</el-button>

        <template v-if="result">
          <el-divider />
          <div class="flex-between">
            <strong>翻译结果</strong>
            <div>
              <el-tag v-if="result.isMachineTranslated" size="small" type="warning">机器翻译</el-tag>
              <el-button text @click="copy"><el-icon><CopyDocument /></el-icon></el-button>
            </div>
          </div>
          <div class="result-box">{{ result.result }}</div>
          <template v-if="result.matchedTerms.length">
            <p class="mt-16 small">术语匹配（{{ result.matchedTerms.length }}）</p>
            <el-tag v-for="(t, i) in result.matchedTerms" :key="i" class="tag" type="success" effect="light">
              {{ t.cn }} → {{ t.ru }}
            </el-tag>
          </template>
        </template>
      </el-card>

      <h2 class="section-title">快速查词</h2>
      <el-card shadow="never">
        <div class="quick">
          <el-input v-model="quickQuery" placeholder="输入术语快速查询..." @keyup.enter="quickSearch" />
          <el-button type="primary" @click="quickSearch">查询</el-button>
        </div>
        <template v-if="quickResult">
          <el-divider />
          <template v-if="quickResult.found">
            <div v-for="(t, i) in quickResult.terms" :key="i" class="quick-item">
              <strong>{{ t.cnTerm }}</strong>
              <span class="ru">{{ t.ruTerm }}</span>
              <span class="en">{{ t.enTerm }}</span>
            </div>
          </template>
          <el-empty v-else description="未找到匹配的术语" />
        </template>
      </el-card>

      <h2 class="section-title">文件翻译</h2>
      <el-card shadow="never">
        <el-upload :auto-upload="false" :show-file-list="false" accept=".txt,.md,.csv,.json,.docx,.xlsx,.xls" @change="upload">
          <el-button :loading="fileUploading"><el-icon><Upload /></el-icon>&nbsp;上传文件翻译（txt/md/csv/json/docx/xlsx）</el-button>
        </el-upload>
      </el-card>

      <template v-if="store.isLoggedIn">
        <h2 class="section-title">翻译历史</h2>
        <el-card shadow="never">
          <el-empty v-if="history.length === 0" description="暂无翻译记录" />
          <div v-for="h in history" :key="h.id" class="history-item">
            <div class="flex-between">
              <el-tag size="small" type="info">{{ h.sourceLang === 'zh' ? '中→俄' : '俄→中' }}</el-tag>
              <span class="small">{{ new Date(h.createdAt).toLocaleString('zh-CN') }}</span>
            </div>
            <p class="small line">{{ h.sourceText }}</p>
            <p class="small line muted">{{ h.resultText }}</p>
          </div>
        </el-card>
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.lang-switch { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
.full { width: 100%; }
.result-box { background: #f9fafb; border-radius: 8px; padding: 14px; margin-top: 8px; line-height: 1.7; }
.section-title { font-size: 17px; margin: 28px 0 14px; }
.quick { display: flex; gap: 12px; }
.quick-item { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.quick-item .ru { margin-left: 12px; color: #374151; }
.quick-item .en { margin-left: 12px; color: #9ca3af; font-size: 12px; }
.tag { margin: 4px 8px 0 0; }
.small { font-size: 12px; color: #6b7280; }
.line { margin: 4px 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.muted { color: #9ca3af; }
.history-item { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
</style>
