import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/api/request'
import type { Result } from '@/types'

interface UserInfo {
  id: number
  username: string
  realName: string
  role: string
  email: string
  phone: string
  status: number
  createTime: string
}

function loadUserInfo(): UserInfo | null {
  const raw = localStorage.getItem('userInfo')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(loadUserInfo())

  async function login(username: string, password: string) {
    const res = await request.post<Result<{ token: string; user: UserInfo }>>('/auth/login', {
      username,
      password,
    })
    const tokenValue = res.data.data.token
    const user = res.data.data.user
    token.value = tokenValue
    userInfo.value = user
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('userInfo', JSON.stringify(user))
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    login,
    logout,
  }
})