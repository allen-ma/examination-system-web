# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 技术栈
### 前端
- Vue 3.4 + script setup
- Vite 5
- Element Plus
- Axios（带拦截器）
- 端口：5173
- baseURL: /api

## 目录结构
### frontend
src/
├── views/
├── components/
├── api/
├── utils/
├── stores/
└── router/

## 编码规范
### 前端
- 组件用 <script setup lang="ts">
- 文件名：kebab-case（如 user-list.vue）
- API 统一封装在 src/api/
- 请求带 token，401 自动跳登录
- 表单用 Element Plus 校验

## 常用命令
- 前端启动：npm run dev
- 前端构建：npm run build