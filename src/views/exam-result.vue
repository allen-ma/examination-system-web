<template>
  <div class="exam-result" v-loading="loading">
    <template v-if="result.recordId">
      <!-- Score card -->
      <div class="score-card">
        <div class="score-number">
          <span class="score-value" :class="scoreClass">{{ result.totalScore ?? 0 }}</span>
          <span class="score-total">/ {{ result.examTotalScore }}</span>
        </div>
        <div class="score-label">考试成绩</div>
        <el-tag :type="statusTag(result.status)" size="large">{{ statusLabel(result.status) }}</el-tag>
      </div>

      <!-- Meta info -->
      <div class="meta-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="考试名称">{{ result.examTitle }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatTime(result.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ result.submitTime ? formatTime(result.submitTime) : '未提交' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- Answer details -->
      <div class="answer-details" v-if="result.answers && result.answers.length > 0">
        <h3 class="section-title">答题详情</h3>
        <div
          v-for="(ans, index) in result.answers"
          :key="ans.questionId"
          class="answer-card"
          :class="ans.isCorrect === 1 ? 'correct' : 'wrong'"
        >
          <div class="answer-header">
            <span class="answer-index">第 {{ index + 1 }} 题</span>
            <el-tag :type="typeTag(ans.type)" size="small">{{ typeLabel(ans.type) }}</el-tag>
            <el-tag :type="ans.isCorrect === 1 ? 'success' : 'danger'" size="small">
              {{ ans.isCorrect === 1 ? '✓ 正确' : '✗ 错误' }}
            </el-tag>
            <span class="answer-score">得分：{{ ans.score }} 分</span>
          </div>
          <div class="answer-content">{{ ans.questionContent }}</div>
          <div class="answer-compare">
            <div class="answer-row">
              <span class="answer-label">你的答案：</span>
              <span class="answer-val" :class="ans.isCorrect === 1 ? 'text-success' : 'text-danger'">
                {{ ans.studentAnswer || '未作答' }}
              </span>
            </div>
            <div class="answer-row">
              <span class="answer-label">正确答案：</span>
              <span class="answer-val text-success">{{ ans.correctAnswer }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <el-button type="primary" @click="router.push({ name: 'ExamList' })">返回考试列表</el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getExamResult } from '@/api/exam'
import type { ExamResult } from '@/types'

const route = useRoute()
const router = useRouter()
const examId = Number(route.params.examId)

const loading = ref(false)
const result = reactive<ExamResult>({
  recordId: 0,
  examId: 0,
  examTitle: '',
  startTime: '',
  submitTime: null,
  status: '',
  totalScore: null,
  examTotalScore: 0,
  answers: [],
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await getExamResult(examId)
    Object.assign(result, res.data.data)
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
})

function formatTime(time: string) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
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

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    in_progress: '考试中',
    submitted: '已提交',
    graded: '已批改',
  }
  return labels[status] || status
}

function statusTag(status: string) {
  const map: Record<string, string> = {
    in_progress: '',
    submitted: 'warning',
    graded: 'success',
  }
  return map[status] || ''
}

const scoreClass = ref('')
function scoreClassComputed() {
  if (result.totalScore == null) return ''
  const ratio = result.totalScore / result.examTotalScore
  return ratio >= 0.8 ? 'text-success' : ratio >= 0.6 ? 'text-warning' : 'text-danger'
}
</script>

<style scoped lang="scss">
.exam-result {
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;

  .score-card {
    background: #fff;
    border-radius: 8px;
    padding: 32px;
    text-align: center;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .score-number {
      margin-bottom: 8px;

      .score-value {
        font-size: 56px;
        font-weight: bold;
      }

      .score-total {
        font-size: 24px;
        color: #999;
        margin-left: 4px;
      }
    }

    .score-label {
      font-size: 16px;
      color: #666;
      margin-bottom: 12px;
    }
  }

  .meta-info {
    margin-bottom: 20px;
  }

  .answer-details {
    .section-title {
      font-size: 18px;
      color: #333;
      margin-bottom: 16px;
    }

    .answer-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-left: 4px solid #ddd;

      &.correct {
        border-left-color: #67c23a;
      }

      &.wrong {
        border-left-color: #f56c6c;
      }

      .answer-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;

        .answer-index {
          font-weight: 600;
          font-size: 15px;
        }

        .answer-score {
          font-size: 14px;
          color: #999;
          margin-left: auto;
        }
      }

      .answer-content {
        font-size: 15px;
        color: #333;
        margin-bottom: 12px;
        line-height: 1.6;
      }

      .answer-compare {
        .answer-row {
          margin-bottom: 6px;
          font-size: 14px;

          .answer-label {
            color: #666;
            margin-right: 8px;
          }

          .answer-val {
            font-weight: 500;
          }
        }
      }
    }
  }

  .actions {
    text-align: center;
    margin-top: 24px;
  }
}

.text-success { color: #67c23a; }
.text-warning { color: #e6a23c; }
.text-danger { color: #f56c6c; }
</style>