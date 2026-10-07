<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { databaseApi, termApi } from '@/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const router = useRouter()

const dbId = Number(route.params.dbId)
const termId = Number(route.params.termId)
const isNew = !termId || termId === 0

const loading = ref(false)
const submitting = ref(false)
const form = reactive({
  cnTerm: '',
  ruTerm: '',
  enTerm: '',
  pos: '',
  tags: '',
  definition: '',
  context: '',
  cultureNote: '',
})

onMounted(async () => {
  if (isNew) return
  loading.value = true
  try {
    const t: any = await termApi.byId(termId)
    Object.assign(form, {
      cnTerm: t.cnTerm ?? '',
      ruTerm: t.ruTerm ?? '',
      enTerm: t.enTerm ?? '',
      pos: t.pos ?? '',
      tags: t.tags ?? '',
      definition: t.definition ?? '',
      context: t.context ?? '',
      cultureNote: t.cultureNote ?? '',
    })
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (!form.cnTerm || !form.ruTerm) {
    ElMessage.warning('中文名和俄文名为必填')
    return
  }
  submitting.value = true
  try {
    if (isNew) {
      await databaseApi.createTerm(dbId, { ...form })
      ElMessage.success('新增成功')
      router.push(`/terminology/${dbId}`)
    } else {
      await termApi.update(termId, { ...form })
      ElMessage.success('已保存')
      router.push(`/terminology/${dbId}/term/${termId}`)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <el-link :underline="false" class="back" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>&nbsp;返回
      </el-link>

      <h1 class="page-title mt-16">{{ isNew ? '新增术语' : '编辑术语' }}</h1>

      <el-card shadow="never" class="mt-16">
        <el-form :model="form" label-width="90px">
          <el-row :gutter="12">
            <el-col :span="12"><el-form-item label="中文名" required><el-input v-model="form.cnTerm" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="俄文名" required><el-input v-model="form.ruTerm" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="英文参考"><el-input v-model="form.enTerm" /></el-form-item>
          <el-row :gutter="12">
            <el-col :span="12"><el-form-item label="词性"><el-input v-model="form.pos" placeholder="如：名词、动词" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="领域标签"><el-input v-model="form.tags" placeholder="如：钻井,机械,采油" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="专业释义"><el-input v-model="form.definition" type="textarea" :rows="4" /></el-form-item>
          <el-form-item label="使用场景"><el-input v-model="form.context" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="文化注释"><el-input v-model="form.cultureNote" type="textarea" :rows="3" /></el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
            <el-button @click="router.back()">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.back { font-size: 13px; color: #6b7280; cursor: pointer; }
</style>
