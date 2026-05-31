<template>
  <div class="question-manage">
    <!-- Query form -->
    <el-card style="margin-bottom: 16px">
      <el-form :model="queryForm" inline>
        <el-form-item label="题型">
          <el-select v-model="queryForm.type" placeholder="全部" clearable style="width: 140px">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="true_false" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="queryForm.difficulty" placeholder="全部" clearable style="width: 100px">
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
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
        <el-table-column prop="type" label="题型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="题目内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ difficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分值" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getQuestionList, deleteQuestion } from '@/api/question'
import type { Question, QuestionQuery } from '@/types'

const router = useRouter()

// --- Query form ---
const queryForm = reactive<Omit<QuestionQuery, 'difficulty'> & { difficulty?: number }>({
  type: undefined,
  difficulty: undefined,
  page: 1,
  pageSize: 10,
})

// --- Table data ---
const tableData = ref<Question[]>([])
const total = ref(0)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      current: queryForm.page,
      size: queryForm.pageSize,
    }
    if (queryForm.type) params.type = queryForm.type
    if (queryForm.difficulty) params.difficulty = queryForm.difficulty
    const res = await getQuestionList(params as any)
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
  queryForm.type = undefined
  queryForm.difficulty = undefined
  queryForm.page = 1
  fetchData()
}

function handleSizeChange() {
  queryForm.page = 1
  fetchData()
}

// --- Actions ---
function handleEdit(row: Question) {
  // Navigate to a future edit page; for now just show a message
  ElMessage.info('编辑功能开发中')
}

async function handleDelete(row: Question) {
  try {
    await ElMessageBox.confirm(`确定要删除题目 "${row.content.slice(0, 20)}..." 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteQuestion(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error handled by interceptor
  }
}

// --- Type display ---
const typeLabelMap: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  true_false: '判断题',
}
const typeTypeMap: Record<string, string> = {
  single: '',
  multiple: 'warning',
  true_false: 'success',
}

function typeLabel(type: string) {
  return typeLabelMap[type] || type
}
function typeTagType(type: string) {
  return typeTypeMap[type] || ''
}

function difficultyLabel(d: number) {
  return d === 1 ? '简单' : d === 2 ? '中等' : '困难'
}
function difficultyTagType(d: number) {
  return d === 1 ? 'success' : d === 2 ? 'warning' : 'danger'
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.question-manage {
  padding: 20px;
}
</style>
