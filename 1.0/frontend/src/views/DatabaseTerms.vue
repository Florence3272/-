<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { databaseApi, termApi, type Term, type TermDatabase } from '@/api'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

const dbId = Number(route.params.dbId)
const dbInfo = ref<TermDatabase | null>(null)
const terms = ref<Term[]>([])
const posList = ref<string[]>([])
const loading = ref(false)
const search = ref('')
const pos = ref('')

const dialogVisible = ref(false)
const submitting = ref(false)
const emptyForm = { cnTerm: '', ruTerm: '', enTerm: '', definition: '', context: '', cultureNote: '', pos: '', tags: '' }
const form = reactive({ ...emptyForm })

async function load() {
  loading.value = true
  try {
    const [info, page, poss] = await Promise.all([
      databaseApi.byId(dbId),
      databaseApi.terms(dbId, { search: search.value || undefined, pos: pos.value || undefined }),
      termApi.posList(),
    ])
    dbInfo.value = info
    terms.value = page.list
    posList.value = poss
  } finally {
    loading.value = false
  }
}

async function createTerm() {
  if (!form.cnTerm || !form.ruTerm) {
    ElMessage.warning('中文名和俄文名为必填')
    return
  }
  submitting.value = true
  try {
    await databaseApi.createTerm(dbId, { ...form })
    ElMessage.success('新增成功')
    dialogVisible.value = false
    Object.assign(form, emptyForm)
    await load()
  } finally {
    submitting.value = false
  }
}

async function removeTerm(term: Term) {
  await ElMessageBox.confirm(`确认删除术语「${term.cnTerm}」？`, '提示', { type: 'warning' })
  await termApi.remove(term.id)
  ElMessage.success('已删除')
  await load()
}

onMounted(load)
</script>

<template>
  <DefaultLayout>
    <div class="page">
      <el-link :underline="false" class="back" @click="router.push('/terminology')">
        <el-icon><ArrowLeft /></el-icon>&nbsp;返回术语库
      </el-link>

      <div v-if="dbInfo" class="flex-between mt-16">
        <div>
          <h1 class="page-title">{{ dbInfo.name }}</h1>
          <p class="page-desc">{{ dbInfo.description }}</p>
          <el-tag type="success" size="small">{{ dbInfo.termCount }} 术语</el-tag>
        </div>
        <el-button v-if="store.isLoggedIn" type="primary" @click="dialogVisible = true">
          <el-icon><Plus /></el-icon>&nbsp;新增术语
        </el-button>
      </div>

      <el-card shadow="never" class="mt-16">
        <div class="filters">
          <el-input v-model="search" placeholder="搜索术语（中/俄/英）..." clearable style="max-width: 320px" @change="load" />
          <el-select v-model="pos" placeholder="全部词性" clearable style="width: 160px" @change="load">
            <el-option v-for="p in posList" :key="p" :label="p" :value="p" />
          </el-select>
        </div>
      </el-card>

      <el-table :data="terms" v-loading="loading" class="mt-16" border stripe>
        <el-table-column prop="cnTerm" label="中文名" min-width="140" />
        <el-table-column prop="ruTerm" label="俄文名" min-width="180" />
        <el-table-column prop="enTerm" label="英文" min-width="140" show-overflow-tooltip />
        <el-table-column prop="pos" label="词性" width="90">
          <template #default="{ row }"><el-tag v-if="row.pos" size="small" type="info">{{ row.pos }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" text @click="router.push(`/terminology/${dbId}/term/${row.id}`)">查看</el-button>
            <template v-if="store.isLoggedIn">
              <el-button size="small" text @click="router.push(`/terminology/${dbId}/term/${row.id}/edit`)">编辑</el-button>
              <el-button size="small" text type="danger" @click="removeTerm(row)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && terms.length === 0" :description="search || pos ? '未找到匹配的术语' : '暂无术语'" />

      <el-dialog v-model="dialogVisible" title="新增术语" width="620px">
        <el-form :model="form" label-width="90px">
          <el-row :gutter="12">
            <el-col :span="12"><el-form-item label="中文名" required><el-input v-model="form.cnTerm" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="俄文名" required><el-input v-model="form.ruTerm" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="英文参考"><el-input v-model="form.enTerm" /></el-form-item>
          <el-row :gutter="12">
            <el-col :span="12"><el-form-item label="词性"><el-input v-model="form.pos" placeholder="如：名词" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="领域标签"><el-input v-model="form.tags" placeholder="如：钻井,机械" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="专业释义"><el-input v-model="form.definition" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="使用场景"><el-input v-model="form.context" type="textarea" :rows="2" /></el-form-item>
          <el-form-item label="文化注释"><el-input v-model="form.cultureNote" type="textarea" :rows="2" /></el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="createTerm">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.back { font-size: 13px; color: #6b7280; cursor: pointer; }
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
</style>
