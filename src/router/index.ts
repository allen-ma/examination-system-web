import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
  } else {
    next()
  }
})

export default router