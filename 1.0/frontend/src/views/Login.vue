<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  confirm: '',
  name: '',
  email: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度 3-20 位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '只能包含字母、数字、下划线和汉字', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度 6-30 位', trigger: 'blur' },
  ],
  confirm: [
    {
      validator: (_r, value, cb) => {
        if (mode.value === 'register' && value !== form.password) cb(new Error('两次输入的密码不一致'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

async function submit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (mode.value === 'login') {
        await store.login(form.username.trim(), form.password)
        ElMessage.success('登录成功')
      } else {
        await store.register({
          username: form.username.trim(),
          password: form.password,
          name: form.name || undefined,
          email: form.email || undefined,
        })
        ElMessage.success('注册成功')
      }
      router.push((route.query.redirect as string) || '/')
    } catch {
      /* 错误提示已由拦截器处理 */
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="login-page">
    <el-card class="card" shadow="always">
      <div class="brand">
        <el-icon :size="26" color="#1a6b4f"><Collection /></el-icon>
        <h1>中俄能源装备术语库</h1>
        <p>{{ mode === 'login' ? '登录以管理术语与学习资源' : '创建账号，开始术语学习' }}</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="3-20 位，字母/数字/下划线/汉字" />
        </el-form-item>

        <template v-if="mode === 'register'">
          <el-form-item label="昵称">
            <el-input v-model="form.name" placeholder="选填" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="选填" />
          </el-form-item>
        </template>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="6-30 位" />
        </el-form-item>

        <el-form-item v-if="mode === 'register'" label="确认密码" prop="confirm">
          <el-input v-model="form.confirm" type="password" show-password placeholder="再次输入密码" />
        </el-form-item>

        <el-button type="primary" class="submit" :loading="loading" @click="submit">
          {{ mode === 'login' ? '登录' : '注册' }}
        </el-button>
      </el-form>

      <div class="switch">
        <span v-if="mode === 'login'">还没有账号？</span>
        <span v-else>已有账号？</span>
        <el-link type="primary" @click="mode = mode === 'login' ? 'register' : 'login'">
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </el-link>
      </div>

    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef6f2, #d9ece3);
  padding: 24px;
}
.card { width: 100%; max-width: 420px; padding: 8px; }
.brand { text-align: center; margin-bottom: 18px; }
.brand h1 { font-size: 19px; margin: 8px 0 4px; }
.brand p { font-size: 13px; color: #6b7280; margin: 0; }
.submit { width: 100%; }
.switch { text-align: center; margin-top: 14px; font-size: 13px; color: #6b7280; }
.tip { margin-top: 16px; }
</style>
