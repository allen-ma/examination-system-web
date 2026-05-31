<template>
  <div class="dashboard" v-if="isStudent">
    <h2 class="welcome">欢迎回来，{{ userStore.userInfo?.realName || userStore.userInfo?.username }}</h2>
    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="12">
        <el-card shadow="hover" class="action-card" @click="router.push('/exams')">
          <el-icon :size="40" color="#409eff"><Document /></el-icon>
          <h3>参加考试</h3>
          <p>查看可参加的考试并开始答题</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="action-card" @click="router.push('/exam-history')">
          <el-icon :size="40" color="#67c23a"><List /></el-icon>
          <h3>考试记录</h3>
          <p>查看历史考试成绩</p>
        </el-card>
      </el-col>
    </el-row>
  </div>

  <div class="dashboard" v-else>
    <h2 class="welcome">欢迎使用考试管理系统</h2>
    <el-row :gutter="20" style="margin-top: 24px">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>用户总数</template>
          <div class="stat-value">{{ stats.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>考试总数</template>
          <div class="stat-value">{{ stats.examCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>试卷总数</template>
          <div class="stat-value">{{ stats.paperCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>题目总数</template>
          <div class="stat-value">{{ stats.questionCount }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isStudent = computed(() => userStore.userInfo?.role === 'student')

const stats = reactive({
  userCount: 0,
  examCount: 0,
  paperCount: 0,
  questionCount: 0,
})
</script>

<style scoped lang="scss">
.dashboard {
  padding: 20px;

  .welcome {
    font-size: 22px;
    color: #333;
  }

  .stat-value {
    font-size: 32px;
    font-weight: bold;
    color: #409eff;
    text-align: center;
    padding: 10px 0;
  }

  .action-card {
    text-align: center;
    padding: 20px;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-4px);
    }

    h3 {
      margin: 12px 0 6px;
      font-size: 18px;
      color: #333;
    }

    p {
      color: #999;
      font-size: 14px;
    }
  }
}
</style>