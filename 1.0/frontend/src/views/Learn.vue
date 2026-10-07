<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { learnApi, type QuizQuestion, type Term } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const store = useUserStore()

const mode = computed(() => String(route.params.mode || 'flashcard'))
const dbId = computed(() => {
  const v = Number(route.query.dbId)
  return Number.isFinite(v) && v > 0 ? v : undefined
})

// ---------------- 闪卡 ----------------
const cards = ref<Term[]>([])
const cardIndex = ref(0)
const flipped = ref(false)
const known = ref(0)
const unknown = ref(0)
const loading = ref(false)

// ---------------- 测试 ----------------
const quizMode = ref<'zh_to_ru' | 'ru_to_zh'>('zh_to_ru')
const questions = ref<QuizQuestion[]>([])
const qIndex = ref(0)
const selected = ref<string | null>(null)
const answered = ref<{ correct: boolean }[]>([])

const currentCard = computed(() => cards.value[cardIndex.value])
const currentQuestion = computed(() => questions.value[qIndex.value])
const finished = computed(() => cardIndex.value >= cards.value.length && cards.value.length > 0)
const quizFinished = computed(() => questions.value.length > 0 && answered.value.length >= questions.value.length)

async function loadFlashcards() {
  loading.value = true
  try {
    cards.value = await learnApi.flashcards(dbId.value, 20)
    cardIndex.value = 0
    flipped.value = false
    known.value = 0
    unknown.value = 0
  } finally {
    loading.value = false
  }
}

async function loadQuiz() {
  loading.value = true
  try {
    questions.value = await learnApi.quiz(dbId.value, quizMode.value, 10)
    qIndex.value = 0
    selected.value = null
    answered.value = []
  } finally {
    loading.value = false
  }
}

async function judge(isKnown: boolean) {
  const card = currentCard.value
  if (!card) return
  if (isKnown) known.value++
  else unknown.value++
  if (store.isLoggedIn) {
    await learnApi.record({ targetType: 'term', targetId: card.id, dbId: dbId.value, mode: 'flashcard', score: isKnown ? 1 : 0 }).catch(() => {})
  }
  flipped.value = false
  cardIndex.value++
}

async function answer(opt: string) {
  if (selected.value || !currentQuestion.value) return
  selected.value = opt
  const correct = opt === currentQuestion.value.correctAnswer
  answered.value.push({ correct })
  if (store.isLoggedIn) {
    await learnApi.record({ targetType: 'term', targetId: currentQuestion.value.id, dbId: dbId.value, mode: 'quiz', score: correct ? 1 : 0 }).catch(() => {})
  }
}

function nextQuestion() {
  qIndex.value++
  selected.value = null
}

// ---------------- 对比 ----------------
const compareTerms = ref<Term[]>([])

async function loadCompare() {
  loading.value = true
  try {
    compareTerms.value = await learnApi.compare(dbId.value ?? 1)
  } finally {
    loading.value = false
  }
}

function reload() {
  if (mode.value === 'flashcard') loadFlashcards()
  else if (mode.value === 'quiz') loadQuiz()
  else loadCompare()
}

onMounted(reload)
watch(mode, reload)
watch(quizMode, loadQuiz)

function optionClass(opt: string) {
  if (!selected.value) return ''
  const correct = currentQuestion.value?.correctAnswer
  if (opt === correct) return 'opt-correct'
  if (opt === selected.value) return 'opt-wrong'
  return ''
}
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <el-link :underline="false" class="back" @click="$router.push('/resources')">
        <el-icon><ArrowLeft /></el-icon>&nbsp;返回教学资源
      </el-link>

      <!-- 闪卡 -->
      <template v-if="mode === 'flashcard'">
        <h1 class="page-title mt-16">闪卡记忆</h1>
        <template v-if="cards.length === 0">
          <el-empty description="暂无术语数据" />
        </template>
        <template v-else-if="finished">
          <el-result icon="success" title="学习完成！" :sub-title="`已掌握 ${known} 个，待复习 ${unknown} 个`">
            <template #extra><el-button type="primary" @click="reload">重新开始</el-button></template>
          </el-result>
        </template>
        <template v-else>
          <p class="progress">{{ cardIndex + 1 }} / {{ cards.length }}</p>
          <el-progress :percentage="Math.round(((cardIndex + 1) / cards.length) * 100)" />
          <el-card class="flashcard" shadow="hover" @click="flipped = !flipped">
            <template v-if="!flipped">
              <span class="hint">中文</span>
              <h2>{{ currentCard?.cnTerm }}</h2>
              <p class="sub">{{ currentCard?.enTerm }}</p>
              <p class="tip">点击卡片翻转查看俄文</p>
            </template>
            <template v-else>
              <span class="hint ru">俄文</span>
              <h2>{{ currentCard?.ruTerm }}</h2>
              <p class="sub">{{ currentCard?.definition }}</p>
            </template>
          </el-card>
          <div class="controls">
            <el-button type="danger" plain :disabled="!flipped" @click="judge(false)">未掌握</el-button>
            <el-button @click="flipped = !flipped">翻转</el-button>
            <el-button type="primary" :disabled="!flipped" @click="judge(true)">已掌握</el-button>
          </div>
        </template>
      </template>

      <!-- 测试 -->
      <template v-else-if="mode === 'quiz'">
        <h1 class="page-title mt-16">术语测试</h1>
        <el-radio-group v-model="quizMode" class="mt-16">
          <el-radio-button value="zh_to_ru">中译俄</el-radio-button>
          <el-radio-button value="ru_to_zh">俄译中</el-radio-button>
        </el-radio-group>

        <el-result v-if="quizFinished" class="mt-16" icon="success" title="测试完成！"
          :sub-title="`得分 ${Math.round((answered.filter((a) => a.correct).length / questions.length) * 100)}%（答对 ${answered.filter((a) => a.correct).length}/${questions.length}）`">
          <template #extra><el-button type="primary" @click="reload">再测一次</el-button></template>
        </el-result>

        <template v-else-if="currentQuestion">
          <p class="progress mt-16">{{ qIndex + 1 }} / {{ questions.length }}</p>
          <el-card shadow="never">
            <h3>{{ currentQuestion.question }}</h3>
            <div class="options">
              <div v-for="(opt, i) in currentQuestion.options" :key="i" class="opt" :class="optionClass(opt)" @click="answer(opt)">
                <strong>{{ String.fromCharCode(65 + i) }}.</strong> {{ opt }}
              </div>
            </div>
          </el-card>
          <div class="controls" v-if="selected">
            <el-button type="primary" @click="nextQuestion">下一题</el-button>
          </div>
        </template>
        <el-empty v-else-if="!loading" description="暂无测试题目" />
      </template>

      <!-- 对比 -->
      <template v-else>
        <h1 class="page-title mt-16">对比学习</h1>
        <el-table :data="compareTerms" border stripe class="mt-16">
          <el-table-column prop="cnTerm" label="中文" min-width="140" />
          <el-table-column prop="ruTerm" label="俄文" min-width="180" />
          <el-table-column prop="enTerm" label="英文" min-width="140" />
          <el-table-column prop="definition" label="释义" min-width="240" show-overflow-tooltip />
        </el-table>
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.back { font-size: 13px; color: #6b7280; cursor: pointer; }
.progress { text-align: right; font-size: 13px; color: #6b7280; margin: 8px 0; }
.flashcard { cursor: pointer; text-align: center; min-height: 240px; display: flex; align-items: center; justify-content: center; }
.flashcard .hint { font-size: 12px; color: #9ca3af; letter-spacing: 2px; }
.flashcard .hint.ru { color: #1a6b4f; }
.flashcard h2 { font-size: 26px; margin: 12px 0; }
.flashcard .sub { color: #6b7280; font-size: 13px; }
.flashcard .tip { color: #9ca3af; font-size: 12px; margin-top: 16px; }
.controls { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.options { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.opt { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; cursor: pointer; }
.opt:hover { border-color: #1a6b4f; background: rgba(26, 107, 79, 0.04); }
.opt-correct { border-color: #22c55e; background: #f0fdf4; color: #166534; }
.opt-wrong { border-color: #ef4444; background: #fef2f2; color: #991b1b; }
</style>
