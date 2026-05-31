# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技术栈
- Vue 3.4 + script setup lang="ts"
- Vite 5 (端口 5173)
- Element Plus + @element-plus/icons-vue
- Vue Router + Pinia
- Axios（带拦截器）
- Sass
- baseURL: /api（开发代理到 localhost:8080）

## 目录结构
src/
├── api/
│   ├── request.ts              # Axios 实例（token/401 拦截）
│   └── user.ts                 # 示例 API（CRUD）
├── components/
│   └── LayoutHeader.vue        # 全局头部组件
├── router/index.ts             # 路由 + 鉴权守卫
├── stores/user.ts              # Pinia 用户状态
├── types/index.ts              # 全局类型定义
└── views/
    ├── login.vue               # 登录页
    ├── dashboard.vue           # 首页仪表盘
    └── user-list.vue           # 示例 CRUD 页面

## 编码规范
- 组件用 <script setup lang="ts">
- 文件名：kebab-case（如 user-list.vue）
- API 统一封装在 src/api/
- 请求带 token，401 自动跳登录
- 表单用 Element Plus 校验
- 无 any 类型
- 路径别名 @ -> src/

## 常用命令
- 安装依赖：npm install
- 前端启动：npm run dev
- 前端构建：npm run build
- 生产预览：npm run preview