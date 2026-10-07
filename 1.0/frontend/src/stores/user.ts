import { defineStore } from 'pinia'
import { authApi, userApi, type User } from '@/api'
import { clearToken, getToken, setToken } from '@/api/http'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    loaded: false,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
  },
  actions: {
    async fetchMe() {
      if (!getToken()) {
        this.user = null
        this.loaded = true
        return null
      }
      try {
        this.user = await authApi.me()
      } catch {
        this.user = null
      }
      this.loaded = true
      return this.user
    },
    async login(username: string, password: string) {
      const data = await authApi.login({ username, password })
      setToken(data.token)
      await this.fetchMe()
      return this.user
    },
    async register(payload: { username: string; password: string; name?: string; email?: string }) {
      const data = await authApi.register(payload)
      setToken(data.token)
      await this.fetchMe()
      return this.user
    },
    async updateProfile(data: Partial<User>) {
      this.user = await userApi.update(data)
      return this.user
    },
    async logout() {
      try {
        await authApi.logout()
      } catch {
        /* ignore */
      }
      clearToken()
      this.user = null
    },
  },
})
