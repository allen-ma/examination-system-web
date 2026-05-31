import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/LayoutDefault.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/user-list.vue'),
        meta: { title: '用户管理', roles: ['admin'] },
      },
      // Student routes
      {
        path: 'exams',
        name: 'ExamList',
        component: () => import('@/views/exam-list.vue'),
        meta: { title: '参加考试', roles: ['student'] },
      },
      {
        path: 'exams/:examId/paper',
        name: 'ExamPaper',
        component: () => import('@/views/exam-paper.vue'),
        meta: { title: '考试答题', roles: ['student'] },
      },
      {
        path: 'exams/:examId/result',
        name: 'ExamResult',
        component: () => import('@/views/exam-result.vue'),
        meta: { title: '考试成绩', roles: ['student'] },
      },
      {
        path: 'exam-history',
        name: 'ExamHistory',
        component: () => import('@/views/exam-history.vue'),
        meta: { title: '考试记录', roles: ['student'] },
      },
      // Admin/Teacher manage routes
      {
        path: 'exam-manage',
        name: 'ExamManage',
        component: () => import('@/views/exam-manage.vue'),
        meta: { title: '考试管理', roles: ['admin', 'teacher'] },
      },
      {
        path: 'question-manage',
        name: 'QuestionManage',
        component: () => import('@/views/question-manage.vue'),
        meta: { title: '题目管理', roles: ['admin', 'teacher'] },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.matched.some((record) => record.meta.requiresAuth) && !token) {
    next('/login')
    return
  }

  // 角色校验：如果路由定义了 meta.roles，检查当前用户角色是否匹配
  const roles = to.meta.roles as string[] | undefined
  if (roles && roles.length > 0) {
    const raw = localStorage.getItem('userInfo')
    const userInfo = raw ? JSON.parse(raw) : null
    if (!userInfo || !roles.includes(userInfo.role)) {
      ElMessage.error('权限不足')
      next('/dashboard')
      return
    }
  }

  next()
})

export default router