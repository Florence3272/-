import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'auth_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export interface ApiResult<T> {
  success: boolean
  message: string
  data: T
}

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers['x-auth-token'] = token
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      clearToken()
    }
    const message =
      error?.response?.data?.message || error?.message || '网络请求失败'
    if (status !== 401 || !error.config?.url?.includes('/auth/me')) {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

/** 统一解包 Result<T> */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await instance.request<ApiResult<T>>(config)
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) {
      ElMessage.error(body.message || '请求失败')
      throw new Error(body.message)
    }
    return body.data
  }
  return body as unknown as T
}

export const http = {
  get: <T>(url: string, params?: Record<string, unknown>) => request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown) => request<T>({ method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: 'PUT', url, data }),
  del: <T>(url: string, params?: Record<string, unknown>) => request<T>({ method: 'DELETE', url, params }),
  upload: <T>(url: string, form: FormData) =>
    request<T>({ method: 'POST', url, data: form, headers: { 'Content-Type': 'multipart/form-data' } }),
}
