<template>
  <div class="exam-list">
    <h2 class="page-title">可参加的考试</h2>

    <el-empty v-if="!loading && exams.length === 0" description="暂无可参加的考试" />

    <el-table v-loading="loading" :data="exams" style="width: 100%" stripe>
      <el-table-column prop="title" label="考试名称" min-width="180" />
      <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="durationMinutes" label="时长(分钟)" width="120" align="center" />
      <el-table-column prop="totalScore" label="总分" width="80" align="center" />
      <el-table-column label="考试时间" min-width="220">
        <template #default="{ row }">
          {{ formatTime(row.startTime) }} ~ {{ formatTime(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleStart(row.id)">开始考试</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAvailableExams, startExam } from '@/api/exam'
import { ElMessage } from 'element-plus'
import type { Exam } from '@/types'

const router = useRouter()
const loading = ref(false)
const exams = ref<Exam[]>([])

onMounted(() => {
  fetchExams()
})

async function fetchExams() {
  loading.value = true
  try {
    const res = await getAvailableExams()
    exams.value = res.data.data
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleStart(examId: number) {
  try {
    const res = await startExam(examId)
    const recordId = res.data.data
    ElMessage.success('考试已开始')
    router.push({ name: 'ExamPaper', params: { examId }, query: { recordId: String(recordId) } })
  } catch (err: unknown) {
    // Error handled by interceptor, but check if already submitted
    const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (message?.includes('已经参加')) {
      // Navigate to paper directly
      router.push({ name: 'ExamPaper', params: { examId } })
    }
  }
}

function formatTime(time: string) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped lang="scss">
.exam-list {
  padding: 20px;

  .page-title {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
  }
}
</style>