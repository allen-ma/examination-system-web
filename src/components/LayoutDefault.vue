<template>
  <el-container style="height: 100vh">
    <el-header style="padding: 0">
      <LayoutHeader />
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import LayoutHeader from '@/components/LayoutHeader.vue'
</script>