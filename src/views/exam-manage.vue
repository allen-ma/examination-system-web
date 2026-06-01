<template>
  <div class="exam-manage">
    <!-- Query form -->
    <el-card style="margin-bottom: 16px">
      <el-form :model="queryForm" inline>
        <el-form-item label="考试名称">
          <el-input v-model="queryForm.title" placeholder="请输入考试名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已结束" value="ended" />
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增考试
      </el-button>

      <el-table :data="tableData" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="考试名称" min-width="180" />
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="durationMinutes" label="时长(分钟)" width="120" align="center" />
        <el-table-column prop="totalScore" label="总分" width="80" align="center" />
        <el-table-column label="考试时间" min-width="280">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }} ~ {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="创建人" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'draft'"
              type="success"
              link
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'published'"
              type="warning"
              link
              @click="handleUnpublish(row)"
            >
              取消发布
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

    <!-- Add/Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑考试' : '新增考试'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="dialogFormRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="考试名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入考试名称" />
        </el-form-item>

        <el-form-item label="考试说明" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入考试说明"
          />
        </el-form-item>

        <el-form-item label="考试时长" prop="durationMinutes">
          <el-input-number
            v-model="formData.durationMinutes"
            :min="1"
            :max="999"
            placeholder="分钟"
          />
          <span style="margin-left: 8px; color: #909399">分钟</span>
        </el-form-item>

        <el-form-item label="总分" prop="totalScore">
          <el-input-number v-model="formData.totalScore" :min="1" :max="9999" />
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getExamList,
  createExam,
  updateExam,
  publishExam,
  unpublishExam,
  deleteExam,
} from '@/api/exam'
import type { Exam, ExamQuery, ExamDTO } from '@/types'

const route = useRoute()
const router = useRouter()

// --- Query form ---
const queryForm = reactive({
  title: '',
  status: '' as string | undefined,
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
    const params: ExamQuery = {
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      title: queryForm.title || undefined,
      status: statusFilter.value,
    }
    const res = await getExamList(params)
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
  statusFilter.value = undefined
  queryForm.status = ''
  queryForm.page = 1
  fetchData()
}

function handleSizeChange() {
  queryForm.page = 1
  fetchData()
}

// --- Dialog ---
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const dialogFormRef = ref<FormInstance>()
const submitLoading = ref(false)

interface ExamFormData {
  title: string
  description: string
  durationMinutes: number
  totalScore: number
  startTime: string
  endTime: string
}

const defaultForm = (): ExamFormData => ({
  title: '',
  description: '',
  durationMinutes: 120,
  totalScore: 100,
  startTime: '',
  endTime: '',
})

const formData = reactive<ExamFormData>(defaultForm())

const formRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入考试名称', trigger: 'blur' }],
  durationMinutes: [{ required: true, message: '请输入考试时长', trigger: 'blur' }],
  totalScore: [{ required: true, message: '请输入总分', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
})

function handleAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(formData, defaultForm())
  dialogVisible.value = true
}

function handleEdit(row: Exam) {
  isEdit.value = true
  editId.value = row.id
  formData.title = row.title
  formData.description = row.description
  formData.durationMinutes = row.durationMinutes
  formData.totalScore = row.totalScore
  formData.startTime = row.startTime
  formData.endTime = row.endTime
  dialogVisible.value = true
}

function resetForm() {
  Object.assign(formData, defaultForm())
  dialogFormRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // Validate time
  if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
    ElMessage.warning('结束时间必须晚于开始时间')
    return
  }

  submitLoading.value = true
  try {
    const dto: ExamDTO = {
      title: formData.title,
      description: formData.description,
      durationMinutes: formData.durationMinutes,
      totalScore: formData.totalScore,
      startTime: formData.startTime,
      endTime: formData.endTime,
    }

    if (isEdit.value && editId.value !== null) {
      await updateExam(editId.value, dto)
      ElMessage.success('更新成功')
    } else {
      await createExam(dto)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    // error handled by interceptor
  } finally {
    submitLoading.value = false
  }
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '--'
  return dateStr.replace('T', ' ').slice(0, 16)
}

// --- Actions ---
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

async function handleUnpublish(row: Exam) {
  try {
    await ElMessageBox.confirm(`确定要取消发布考试 "${row.title}" 吗？取消后学生将无法参加该考试。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await unpublishExam(row.id)
    ElMessage.success('取消发布成功')
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