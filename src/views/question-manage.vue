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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增题目
      </el-button>

      <el-table :data="tableData" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="题型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="题目内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="难度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="difficultyTagType(row.difficulty)" size="small">
              {{ difficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="出题人" width="120" />
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

    <!-- Add/Edit dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑题目' : '新增题目'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="dialogFormRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="题型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="single">单选题</el-radio>
            <el-radio value="multiple">多选题</el-radio>
            <el-radio value="true_false">判断题</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="题目内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <!-- Options for single/multiple choice -->
        <template v-if="formData.type === 'single' || formData.type === 'multiple'">
          <el-form-item label="选项A" prop="optionA">
            <el-input v-model="formData.optionA" placeholder="请输入选项A内容" />
          </el-form-item>
          <el-form-item label="选项B" prop="optionB">
            <el-input v-model="formData.optionB" placeholder="请输入选项B内容" />
          </el-form-item>
          <el-form-item label="选项C" prop="optionC">
            <el-input v-model="formData.optionC" placeholder="请输入选项C内容" />
          </el-form-item>
          <el-form-item label="选项D" prop="optionD">
            <el-input v-model="formData.optionD" placeholder="请输入选项D内容" />
          </el-form-item>

          <el-form-item label="正确答案" prop="answer">
            <template v-if="formData.type === 'single'">
              <el-radio-group v-model="formData.answer">
                <el-radio value="A">A</el-radio>
                <el-radio value="B">B</el-radio>
                <el-radio value="C">C</el-radio>
                <el-radio value="D">D</el-radio>
              </el-radio-group>
            </template>
            <template v-else>
              <el-checkbox-group v-model="formData.answerMultiple">
                <el-checkbox value="A">A</el-checkbox>
                <el-checkbox value="B">B</el-checkbox>
                <el-checkbox value="C">C</el-checkbox>
                <el-checkbox value="D">D</el-checkbox>
              </el-checkbox-group>
            </template>
          </el-form-item>
        </template>

        <!-- True/False answer -->
        <el-form-item v-if="formData.type === 'true_false'" label="正确答案" prop="answer">
          <el-radio-group v-model="formData.answer">
            <el-radio value="正确">正确</el-radio>
            <el-radio value="错误">错误</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Direct answer input for types without options -->
        <el-form-item
          v-if="formData.type !== 'single' && formData.type !== 'multiple' && formData.type !== 'true_false'"
          label="正确答案"
          prop="answer"
        >
          <el-input v-model="formData.answer" placeholder="请输入正确答案" />
        </el-form-item>

        <el-form-item label="难度" prop="difficulty">
          <el-radio-group v-model="formData.difficulty">
            <el-radio :value="1">简单</el-radio>
            <el-radio :value="2">中等</el-radio>
            <el-radio :value="3">困难</el-radio>
          </el-radio-group>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getQuestionList, createQuestion, updateQuestion, deleteQuestion } from '@/api/question'
import type { Question, QuestionQuery, QuestionDTO } from '@/types'

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
    const params: QuestionQuery = {
      page: queryForm.page,
      pageSize: queryForm.pageSize,
      type: queryForm.type,
      difficulty: queryForm.difficulty,
    }
    const res = await getQuestionList(params)
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

// --- Dialog ---
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const dialogFormRef = ref<FormInstance>()
const submitLoading = ref(false)

interface QuestionFormData {
  type: string
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answer: string
  answerMultiple: string[]
  difficulty: number
}

const defaultForm = (): QuestionFormData => ({
  type: 'single',
  content: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answer: '',
  answerMultiple: [],
  difficulty: 1,
})

const formData = reactive<QuestionFormData>(defaultForm())

const formRules = reactive<FormRules>({
  type: [{ required: true, message: '请选择题型', trigger: 'change' }],
  content: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入正确答案', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
})

function handleAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(formData, defaultForm())
  dialogVisible.value = true
}

function handleEdit(row: Question) {
  isEdit.value = true
  editId.value = row.id
  formData.type = row.type
  formData.content = row.content
  formData.difficulty = row.difficulty

  // Parse options from JSON string
  try {
    const opts = typeof row.options === 'string' ? JSON.parse(row.options) : row.options
    formData.optionA = opts?.A || ''
    formData.optionB = opts?.B || ''
    formData.optionC = opts?.C || ''
    formData.optionD = opts?.D || ''
  } catch {
    formData.optionA = ''
    formData.optionB = ''
    formData.optionC = ''
    formData.optionD = ''
  }

  // Parse answer
  if (row.type === 'multiple') {
    const ans = row.answer.split(',').filter(Boolean)
    formData.answerMultiple = ans
    formData.answer = ans.join(',')
  } else {
    formData.answer = row.answer
    formData.answerMultiple = []
  }

  dialogVisible.value = true
}

function resetForm() {
  Object.assign(formData, defaultForm())
  dialogFormRef.value?.clearValidate()
}

function buildOptions(): string {
  const opts: Record<string, string> = {}
  if (formData.optionA) opts.A = formData.optionA
  if (formData.optionB) opts.B = formData.optionB
  if (formData.optionC) opts.C = formData.optionC
  if (formData.optionD) opts.D = formData.optionD
  return JSON.stringify(opts)
}

function buildAnswer(): string {
  if (formData.type === 'multiple') {
    return formData.answerMultiple.sort().join(',')
  }
  return formData.answer
}

async function handleSubmit() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // Validate options for choice questions
  if (formData.type === 'single' || formData.type === 'multiple') {
    if (!formData.optionA || !formData.optionB) {
      ElMessage.warning('请至少填写选项A和B的内容')
      return
    }
  }

  // Validate multiple choice answer
  if (formData.type === 'multiple' && formData.answerMultiple.length === 0) {
    ElMessage.warning('请至少选择一个正确答案')
    return
  }

  submitLoading.value = true
  try {
    const dto: QuestionDTO = {
      type: formData.type,
      content: formData.content,
      options: formData.type === 'single' || formData.type === 'multiple' ? buildOptions() : '',
      answer: buildAnswer(),
      difficulty: formData.difficulty,
    }

    if (isEdit.value && editId.value !== null) {
      await updateQuestion(editId.value, dto)
      ElMessage.success('更新成功')
    } else {
      await createQuestion(dto)
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

// --- Delete ---
async function handleDelete(row: Question) {
  try {
    await ElMessageBox.confirm(`确定要删除题目 "${row.content.slice(0, 20)}${row.content.length > 20 ? '...' : ''}" 吗？`, '提示', {
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