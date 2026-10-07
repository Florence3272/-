<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { favoriteApi, learnApi, noteApi, userApi } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const store = useUserStore()

const stats = ref({ totalSessions: 0, totalDuration: 0, avgScore: 0, masteredCount: 0 })
const records = ref<any[]>([])
const favorites = ref<any[]>([])
const notes = ref<any[]>([])
const loading = ref(true)

const profileDialog = ref(false)
const profileForm = reactive({ name: '', email: '', phone: '', bio: '' })

const noteDialog = ref(false)
const noteForm = reactive({ title: '', content: '' })
const editingNoteId = ref<number | null>(null)

async function load() {
  loading.value = true
  try {
    const [s, r, f, n] = await Promise.all([
      learnApi.stats(),
      learnApi.records(8),
      favoriteApi.list(),
      noteApi.list(),
    ])
    stats.value = s
    records.value = r
    favorites.value = f
    notes.value = n
  } finally {
    loading.value = false
  }
}

function openProfile() {
  Object.assign(profileForm, {
    name: store.user?.name ?? '',
    email: store.user?.email ?? '',
    phone: store.user?.phone ?? '',
    bio: store.user?.bio ?? '',
  })
  profileDialog.value = true
}

async function saveProfile() {
  await store.updateProfile({ ...profileForm })
  ElMessage.success('已保存')
  profileDialog.value = false
}

function openNote(note?: any) {
  editingNoteId.value = note?.id ?? null
  noteForm.title = note?.title ?? ''
  noteForm.content = note?.content ?? ''
  noteDialog.value = true
}

async function saveNote() {
  if (!noteForm.content.trim()) {
    ElMessage.warning('笔记内容不能为空')
    return
  }
  if (editingNoteId.value) await noteApi.update(editingNoteId.value, { ...noteForm })
  else await noteApi.create({ ...noteForm })
  ElMessage.success('已保存')
  noteDialog.value = false
  notes.value = await noteApi.list()
}

async function removeNote(id: number) {
  await ElMessageBox.confirm('确认删除该笔记？', '提示', { type: 'warning' })
  await noteApi.remove(id)
  notes.value = await noteApi.list()
}

async function removeFavorite(id: number) {
  await favoriteApi.remove(id)
  favorites.value = await favoriteApi.list()
}

onMounted(load)
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <div class="flex-between">
        <div class="profile-head">
          <el-avatar :size="56" class="avatar">{{ (store.user?.name || store.user?.username || 'U').charAt(0) }}</el-avatar>
          <div>
            <h1 class="page-title">{{ store.user?.name || store.user?.username }}</h1>
            <p class="page-desc">{{ store.user?.email || '@' + store.user?.username }}</p>
            <el-tag size="small" :type="store.isAdmin ? 'danger' : 'success'">
              {{ store.isAdmin ? '管理员' : store.user?.role === 'teacher' ? '教师' : store.user?.role === 'student' ? '学生' : '普通用户' }}
            </el-tag>
          </div>
        </div>
        <el-button @click="openProfile">编辑资料</el-button>
      </div>

      <el-row :gutter="16" class="mt-16">
        <el-col :xs="12" :sm="6">
          <el-card shadow="never" class="stat"><div class="num">{{ stats.totalSessions }}</div><div class="lbl">学习次数</div></el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="never" class="stat"><div class="num">{{ Math.round(stats.totalDuration / 60) }}</div><div class="lbl">学习时长(分)</div></el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="never" class="stat"><div class="num">{{ stats.avgScore }}</div><div class="lbl">平均分</div></el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card shadow="never" class="stat"><div class="num">{{ favorites.length }}</div><div class="lbl">收藏</div></el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="mt-16">
        <el-col :xs="24" :md="12">
          <el-card shadow="never">
            <template #header><strong>最近学习</strong></template>
            <el-empty v-if="records.length === 0" description="暂无学习记录" />
            <div v-for="r in records" :key="r.id" class="row">
              <el-tag size="small" type="info">{{ r.mode === 'flashcard' ? '闪卡' : r.mode === 'quiz' ? '测试' : r.mode }}</el-tag>
              <span class="small">{{ r.targetType }} #{{ r.targetId }}</span>
              <span class="small muted">{{ new Date(r.createdAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never">
            <template #header><strong>我的收藏</strong></template>
            <el-empty v-if="favorites.length === 0" description="暂无收藏" />
            <div v-for="f in favorites" :key="f.id" class="row">
              <span>{{ f.cnTerm || f.targetType + ' #' + f.targetId }}</span>
              <span class="small muted">{{ f.ruTerm }}</span>
              <el-button size="small" text type="danger" @click="removeFavorite(f.id)">取消</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="flex-between mt-24">
        <h2 class="section-title">我的笔记</h2>
        <el-button type="primary" size="small" @click="openNote()"><el-icon><Plus /></el-icon>&nbsp;新建笔记</el-button>
      </div>
      <el-card shadow="never">
        <el-empty v-if="notes.length === 0" description="暂无笔记" />
        <div v-for="n in notes" :key="n.id" class="row">
          <strong>{{ n.title || '无标题' }}</strong>
          <span class="small line">{{ n.content }}</span>
          <el-button size="small" text @click="openNote(n)">编辑</el-button>
          <el-button size="small" text type="danger" @click="removeNote(n.id)">删除</el-button>
        </div>
      </el-card>

      <el-dialog v-model="profileDialog" title="编辑资料" width="460px">
        <el-form :model="profileForm" label-width="70px">
          <el-form-item label="昵称"><el-input v-model="profileForm.name" /></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="profileForm.email" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="profileForm.phone" /></el-form-item>
          <el-form-item label="简介"><el-input v-model="profileForm.bio" type="textarea" :rows="3" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="profileDialog = false">取消</el-button>
          <el-button type="primary" @click="saveProfile">保存</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="noteDialog" :title="editingNoteId ? '编辑笔记' : '新建笔记'" width="520px">
        <el-form :model="noteForm" label-width="60px">
          <el-form-item label="标题"><el-input v-model="noteForm.title" /></el-form-item>
          <el-form-item label="内容"><el-input v-model="noteForm.content" type="textarea" :rows="6" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="noteDialog = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.profile-head { display: flex; align-items: center; gap: 16px; }
.avatar { background: rgba(26, 107, 79, 0.12); color: #1a6b4f; font-size: 22px; }
.stat { text-align: center; }
.stat .num { font-size: 24px; font-weight: 700; }
.stat .lbl { font-size: 12px; color: #6b7280; }
.section-title { font-size: 17px; margin: 0; }
.row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.small { font-size: 12px; color: #6b7280; }
.muted { color: #9ca3af; margin-left: auto; }
.line { flex: 1; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>
