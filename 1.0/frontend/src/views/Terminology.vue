<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { databaseApi, type TermDatabase } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const store = useUserStore()
const route = useRoute()

const databases = ref<TermDatabase[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const search = ref((route.query.search as string) || '')
const category = ref('')

const dialogVisible = ref(false)
const submitting = ref(false)
const form = reactive({ name: '', category: '', description: '', visibility: 'public' })

async function load() {
  loading.value = true
  try {
    const [dbs, cats] = await Promise.all([
      databaseApi.list({ search: search.value || undefined, category: category.value || undefined }),
      databaseApi.categories(),
    ])
    databases.value = dbs
    categories.value = cats
  } finally {
    loading.value = false
  }
}

async function createDatabase() {
  if (!form.name || !form.category) {
    ElMessage.warning('请填写库名称与所属领域')
    return
  }
  submitting.value = true
  try {
    await databaseApi.create({ ...form })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    Object.assign(form, { name: '', category: '', description: '', visibility: 'public' })
    await load()
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <div class="flex-between">
        <div>
          <h1 class="page-title">术语库管理</h1>
          <p class="page-desc">管理分数据库，浏览和编辑术语条目</p>
        </div>
        <el-button v-if="store.isLoggedIn" type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>&nbsp;创建分库
        </el-button>
      </div>

      <el-card shadow="never" class="mt-16">
        <div class="filters">
          <el-input v-model="search" placeholder="按名称搜索分库..." clearable style="max-width: 280px" @change="load" />
          <el-select v-model="category" placeholder="全部领域" clearable style="width: 180px" @change="load">
            <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
          </el-select>
          <el-button @click="load">查询</el-button>
        </div>
      </el-card>

      <el-row :gutter="16" class="mt-16" v-loading="loading">
        <el-col :xs="24" :sm="12" :md="8" v-for="db in databases" :key="db.id">
          <el-card shadow="hover" class="db-card" @click="$router.push(`/terminology/${db.id}`)">
            <div class="flex-between">
              <strong>{{ db.name }}</strong>
              <el-tag size="small" type="info">{{ db.category }}</el-tag>
            </div>
            <p class="desc">{{ db.description || '暂无描述' }}</p>
            <div class="meta">
              <span>{{ db.termCount }} 术语</span>
              <span>{{ new Date(db.updatedAt).toLocaleDateString('zh-CN') }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && databases.length === 0" description="暂无分库，点击右上角创建第一个分库" />

      <el-dialog v-model="dialogVisible" title="创建分数据库" width="480px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="库名称" required>
            <el-input v-model="form.name" placeholder="如：油气开采装备" />
          </el-form-item>
          <el-form-item label="所属领域" required>
            <el-input v-model="form.category" placeholder="如：油气领域" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要描述该分库内容范围" />
          </el-form-item>
          <el-form-item label="可见性">
            <el-radio-group v-model="form.visibility">
              <el-radio value="public">公开</el-radio>
              <el-radio value="private">私有</el-radio>
              <el-radio value="team">团队</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="createDatabase">创建</el-button>
        </template>
      </el-dialog>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.db-card { cursor: pointer; }
.db-card .desc { font-size: 12px; color: #6b7280; min-height: 36px; margin: 8px 0; }
.db-card .meta { display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; }
</style>
