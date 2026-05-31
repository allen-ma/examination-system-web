<template>
  <div class="exam-paper" v-loading="pageLoading">
    <!-- Header bar -->
    <div class="paper-header">
      <div class="paper-info">
        <h2 class="paper-title">{{ paper.title }}</h2>
        <div class="paper-meta">
          <span>总分：{{ paper.totalScore }} 分</span>
          <span class="divider">|</span>
          <span>时长：{{ paper.durationMinutes }} 分钟</span>
          <span class="divider">|</span>
          <span>题目：{{ paper.questions.length }} 道</span>
        </div>
      </div>
      <div class="paper-actions">
        <div class="timer" :class="{ warning: remainingMinutes < 10 }">
          <el-icon><Clock /></el-icon>
          剩余 {{ formatTime(remainingSeconds) }}
        </div>
        <el-button type="danger" @click="handleSubmit" :disabled="Object.keys(answersMap).length === 0">
          提交答卷
        </el-button>
      </div>
    </div>

    <!-- Question list -->
    <div class="questions">
      <div
        v-for="(q, index) in paper.questions"
        :key="q.questionId"
        class="question-card"
        :id="'q-' + q.questionId"
      >
        <div class="question-header">
          <span class="question-index">第 {{ index + 1 }} 题</span>
          <el-tag :type="typeTag(q.type)" size="small">{{ typeLabel(q.type) }}</el-tag>
          <span class="question-score">（{{ q.score }} 分）</span>
        </div>
        <div class="question-content">{{ q.content }}</div>

        <!-- Single choice -->
        <div v-if="q.type === 'single'" class="options">
          <el-radio-group v-model="answersMap[q.questionId]">
            <el-radio
              v-for="(optText, key) in parseOptions(q.options)"
              :key="key"
              :value="key"
              class="option-item"
            >
              {{ key }}. {{ optText }}
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Multiple choice -->
        <div v-else-if="q.type === 'multiple'" class="options">
          <el-checkbox-group v-model="answersMap[q.questionId]">
            <el-checkbox
              v-for="(optText, key) in parseOptions(q.options)"
              :key="key"
              :value="key"
              class="option-item"
            >
              {{ key }}. {{ optText }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- True/False -->
        <div v-else-if="q.type === 'true_false'" class="options">
          <el-radio-group v-model="answersMap[q.questionId]">
            <el-radio value="T" class="option-item">正确</el-radio>
            <el-radio value="F" class="option-item">错误</el-radio>
          </el-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamPaper, submitExam } from '@/api/exam'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import type { ExamPaper, AnswerItem } from '@/types'

const route = useRoute()
const router = useRouter()
const examId = Number(route.params.examId)

const pageLoading = ref(false)
const paper = reactive<ExamPaper>({
  examId: 0,
  title: '',
  durationMinutes: 0,
  totalScore: 0,
  questions: [],
})

// answers: questionId -> answer (string for single/true_false, string[] for multiple)
const answersMap = reactive<Record<number, string | string[]>>({})

// Timer
const remainingSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  pageLoading.value = true
  try {
    const res = await getExamPaper(examId)
    Object.assign(paper, res.data.data)
    remainingSeconds.value = paper.durationMinutes * 60
    startTimer()
  } catch {
    // Error handled by interceptor
  } finally {
    pageLoading.value = false
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function startTimer() {
  timer = setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      if (timer) clearInterval(timer)
      ElMessage.warning('考试时间到，自动提交')
      doSubmit()
    }
  }, 1000)
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const remainingMinutes = computed(() => Math.floor(remainingSeconds.value / 60))

function parseOptions(optionsJson: string): Record<string, string> {
  try {
    return JSON.parse(optionsJson) as Record<string, string>
  } catch {
    return {}
  }
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    true_false: '判断题',
  }
  return labels[type] || type
}

function typeTag(type: string) {
  const map: Record<string, string> = {
    single: '',
    multiple: 'warning',
    true_false: 'success',
  }
  return map[type] || ''
}

async function handleSubmit() {
  const answered = Object.keys(answersMap).filter(
    (k) => {
      const v = answersMap[Number(k)]
      return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
    },
  ).length
  try {
    await ElMessageBox.confirm(
      `您已作答 ${answered}/${paper.questions.length} 题，确认提交吗？`,
      '确认提交',
      { type: 'warning' },
    )
    await doSubmit()
  } catch {
    // User cancelled
  }
}

async function doSubmit() {
  if (timer) clearInterval(timer)

  const answers: AnswerItem[] = paper.questions.map((q) => {
    const val = answersMap[q.questionId]
    let studentAnswer = ''
    if (Array.isArray(val)) {
      studentAnswer = val.sort().join(',')
    } else if (val) {
      studentAnswer = String(val)
    }
    return { questionId: q.questionId, studentAnswer }
  })

  try {
    await submitExam(examId, answers)
    ElMessage.success('提交成功')
    router.push({ name: 'ExamResult', params: { examId } })
  } catch {
    // Error handled by interceptor
  }
}
</script>

<style scoped lang="scss">
.exam-paper {
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;

  .paper-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .paper-title {
      font-size: 22px;
      color: #333;
      margin-bottom: 8px;
    }

    .paper-meta {
      font-size: 14px;
      color: #666;

      .divider {
        margin: 0 12px;
        color: #ddd;
      }
    }

    .paper-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .timer {
        font-size: 18px;
        font-weight: 600;
        color: #409eff;
        display: flex;
        align-items: center;
        gap: 6px;

        &.warning {
          color: #f56c6c;
          animation: blink 1s infinite;
        }
      }
    }
  }

  .questions {
    .question-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .question-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;

        .question-index {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .question-score {
          font-size: 14px;
          color: #999;
        }
      }

      .question-content {
        font-size: 15px;
        color: #333;
        margin-bottom: 16px;
        line-height: 1.6;
      }

      .options {
        .option-item {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>