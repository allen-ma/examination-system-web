<template>
  <el-header class="layout-header">
    <div class="header-left">
      <h1 class="system-title">考试管理系统</h1>
      <nav class="nav-menu">
        <a
          :class="['nav-item', { active: route.path === '/' || route.path === '/dashboard' }]"
          @click="router.push('/dashboard')"
        >
          首页
        </a>
        <a
          v-if="isAdmin"
          :class="['nav-item', { active: route.path === '/users' }]"
          @click="router.push('/users')"
        >
          用户管理
        </a>
        <a
          v-if="isStudent"
          :class="['nav-item', { active: route.path.startsWith('/exams') && route.path !== '/exam-history' }]"
          @click="router.push('/exams')"
        >
          参加考试
        </a>
        <a
          v-if="isStudent"
          :class="['nav-item', { active: route.path === '/exam-history' }]"
          @click="router.push('/exam-history')"
        >
          考试记录
        </a>
      </nav>
    </div>
    <div class="header-right">
      <span class="username">{{ userStore.userInfo?.username ?? '用户' }}</span>
      <el-tag size="small" :type="roleTagType">{{ roleLabel }}</el-tag>
      <el-button type="text" @click="handleLogout">退出登录</el-button>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const role = computed(() => userStore.userInfo?.role ?? '')
const isAdmin = computed(() => role.value === 'admin')
const isStudent = computed(() => role.value === 'student')

const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: '管理员', teacher: '教师', student: '学生' }
  return map[role.value] || role.value
})

const roleTagType = computed(() => {
  const map: Record<string, string> = { admin: 'danger', teacher: 'warning', student: 'success' }
  return map[role.value] || ''
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #409eff;
  color: #fff;
  padding: 0 20px;
  height: 60px !important;

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;

    .system-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      white-space: nowrap;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 60px;

      .nav-item {
        color: rgba(255, 255, 255, 0.85);
        padding: 0 16px;
        height: 60px;
        line-height: 60px;
        font-size: 15px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        user-select: none;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          color: #fff;
          border-bottom-color: #fff;
          font-weight: 500;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .username {
      font-size: 14px;
    }

    .el-button {
      color: #fff;

      &:hover {
        color: #e6e6e6;
      }
    }
  }
}
</style>