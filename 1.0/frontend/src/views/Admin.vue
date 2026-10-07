<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi, type Term, type User } from '@/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const stats = ref<Record<string, number>>({})
const users = ref<User[]>([])
const recentTerms = ref<Term[]>([])
const growth = ref<{ month: string; count: number }[]>([])
const auditLogs = ref<any[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const [s, u, a, g, l] = await Promise.all([
      adminApi.stats(),
      adminApi.users(),
      adminApi.activities(),
      adminApi.termGrowth(),
      adminApi.auditLogs(20),
    ])
    stats.value = s
    users.value = u
    recentTerms.value = a.recentTerms
    growth.value = g
    auditLogs.value = l
  } finally {
    loading.value = false
  }
}

async function changeRole(user: User, role: string) {
  await adminApi.updateRole(user.id, role)
  ElMessage.success('已更新角色')
  users.value = await adminApi.users()
}

async function toggleStatus(user: User) {
  const next = user.status === 'active' ? 'disabled' : 'active'
  await adminApi.updateStatus(user.id, next)
  ElMessage.success('已更新状态')
  users.value = await adminApi.users()
}

const cards = [
  { key: 'userCount', label: '用户总数' },
  { key: 'dbCount', label: '分库数量' },
  { key: 'termCount', label: '术语数量' },
  { key: 'resourceCount', label: '教学资源' },
  { key: 'recordCount', label: '学习记录' },
  { key: 'translationCount', label: '翻译次数' },
]

onMounted(load)
</script>

<template>
  <DefaultLayout>
    <div class="page" v-loading="loading">
      <h1 class="page-title">后台管理</h1>
      <p class="page-desc">系统概览、用户管理与操作审计</p>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="8" :md="4" v-for="c in cards" :key="c.key">
          <el-card shadow="never" class="stat">
            <div class="num">{{ stats[c.key] ?? 0 }}</div>
            <div class="lbl">{{ c.label }}</div>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">用户管理</h2>
      <el-table :data="users" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-select :model-value="row.role" size="small" @change="(v: string) => changeRole(row, v)">
              <el-option label="普通用户" value="user" />
              <el-option label="学生" value="student" />
              <el-option label="教师" value="teacher" />
              <el-option label="管理员" value="admin" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" text :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row :gutter="16" class="mt-16">
        <el-col :xs="24" :md="12">
          <el-card shadow="never">
            <template #header><strong>最近新增术语</strong></template>
            <el-empty v-if="recentTerms.length === 0" description="暂无动态" />
            <div v-for="t in recentTerms" :key="t.id" class="row">
              <span>{{ t.cnTerm }}</span>
              <span class="small muted">{{ new Date(t.createdAt!).toLocaleDateString('zh-CN') }}</span>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never">
            <template #header><strong>术语增长（按月）</strong></template>
            <el-empty v-if="growth.length === 0" description="暂无数据" />
            <div v-for="g in growth" :key="g.month" class="row">
              <span>{{ g.month }}</span>
              <el-progress :percentage="Math.min(100, Number(g.count) * 10)" :format="() => String(g.count)" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <h2 class="section-title">操作审计</h2>
      <el-table :data="auditLogs" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="action" label="操作" width="140" />
        <el-table-column prop="targetType" label="对象" width="120" />
        <el-table-column prop="targetId" label="对象ID" width="90" />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="createdAt" label="时间" min-width="170" />
      </el-table>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.stat { text-align: center; }
.stat .num { font-size: 22px; font-weight: 700; }
.stat .lbl { font-size: 12px; color: #6b7280; }
.section-title { font-size: 17px; margin: 28px 0 14px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.small { font-size: 12px; color: #6b7280; }
.muted { color: #9ca3af; }
</style>
