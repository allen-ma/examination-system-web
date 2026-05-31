<template>
  <div class="exam-history">
    <h2 class="page-title">我的考试记录</h2>

    <el-empty v-if="!loading && records.length === 0" description="暂无考试记录" />

    <el-table v-loading="loading" :data="records" style="width: 100%" stripe>
      <el-table-column prop="examTitle" label="考试名称" min-width="180" />
      <el-table-column label="考试时间" min-width="180">
        <template #default="{ row }">{{ formatTime(row.startTime) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="成绩" width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.totalScore != null">{{ row.totalScore }} / {{ row.examTotalScore }}</span>
          <span v-else>—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'graded' || row.status === 'submitted'"
            type="primary"
            size="small"
            @click="viewResult(row.examId)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchRecords"
        @size-change="fetchRecords"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyRecords } from '@/api/exam'
import type { ExamResult } from '@/types'

const router = useRouter()
const loading = ref(false)
const records = ref<ExamResult[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

onMounted(() => {
  fetchRecords()
})

async function fetchRecords() {
  loading.value = true
  try {
    const res = await getMyRecords(currentPage.value, pageSize.value)
    records.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    // Error handled by interceptor
  } finally {
    loading.value = false
  }
}

function viewResult(examId: number) {
  router.push({ name: 'ExamResult', params: { examId } })
}

function formatTime(time: string) {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
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
</script>

<style scoped lang="scss">
.exam-history {
  padding: 20px;

  .page-title {
    font-size: 20px;
    color: #333;
    margin-bottom: 20px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>