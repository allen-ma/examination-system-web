<template>
  <div class="exam-manage">
    <!-- Query form -->
    <el-card style="margin-bottom: 16px">
      <el-form :model="queryForm" inline>
        <el-form-item label="考试名称">
          <el-input v-model="queryForm.title" placeholder="请输入考试名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table -->
    <el-card>
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="考试名称" min-width="180" />
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="durationMinutes" label="时长(分钟)" width="120" align="center" />
        <el-table-column prop="totalScore" label="总分" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="success"
              link
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="queryForm.page"
        v-model:page-size="queryForm.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="fetchData"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getExamList, publishExam, deleteExam } from '@/api/exam'
import type { Exam } from '@/types'

const route = useRoute()
const router = useRouter()

// --- Query form ---
const queryForm = reactive({
  title: '',
  page: 1,
  pageSize: 10,
})

// Pre-fill status from query param
const statusFilter = ref<string | undefined>(
  typeof route.query.status === 'string' ? route.query.status : undefined,
)

// --- Table data ---
const tableData = ref<Exam[]>([])
const total = ref(0)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      current: queryForm.page,
      size: queryForm.pageSize,
    }
    if (queryForm.title) params.title = queryForm.title
    if (statusFilter.value) params.status = statusFilter.value
    const res = await getExamList(params as any)
    tableData.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.page = 1
  fetchData()
}

function handleReset() {
  queryForm.title = ''
  queryForm.page = 1
  statusFilter.value = undefined
  fetchData()
}

function handleSizeChange() {
  queryForm.page = 1
  fetchData()
}

// --- Actions ---
function handleView(row: Exam) {
  router.push({ path: `/exams/${row.id}` })
}

async function handlePublish(row: Exam) {
  try {
    await ElMessageBox.confirm(`确定要发布考试 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await publishExam(row.id)
    ElMessage.success('发布成功')
    fetchData()
  } catch {
    // cancelled or error handled by interceptor
  }
}

async function handleDelete(row: Exam) {
  try {
    await ElMessageBox.confirm(`确定要删除考试 "${row.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteExam(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error handled by interceptor
  }
}

// --- Status display ---
const statusLabelMap: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  ended: '已结束',
}
const statusTypeMap: Record<string, string> = {
  draft: 'info',
  published: 'success',
  ended: 'warning',
}

function statusLabel(status: string) {
  return statusLabelMap[status] || status
}
function statusTagType(status: string) {
  return statusTypeMap[status] || ''
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.exam-manage {
  padding: 20px;
}
</style>
