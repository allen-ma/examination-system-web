<template>
  <div class="user-list">
    <!-- Query form -->
    <el-card style="margin-bottom: 16px">
      <el-form :model="queryForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable />
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

    <!-- Action bar -->
    <el-card>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>

      <!-- Table -->
      <el-table :data="tableData" v-loading="loading" stripe style="margin-top: 16px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="真实姓名" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)" size="small">{{ roleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
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
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="dialogFormRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
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
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import type { User, UserDTO, UserQuery } from '@/types'

// --- Role display ---
const roleLabelMap: Record<string, string> = {
  admin: '管理员',
  teacher: '教师',
  student: '学生',
}
const roleTypeMap: Record<string, string> = {
  admin: 'danger',
  teacher: 'warning',
  student: 'success',
}

function roleLabel(role: string) {
  return roleLabelMap[role] || role
}
function roleTagType(role: string): any {
  return roleTypeMap[role] || ''
}

// --- Query form ---
const queryForm = reactive<UserQuery>({
  username: '',
  page: 1,
  pageSize: 10,
})

// --- Table data ---
const tableData = ref<User[]>([])
const total = ref(0)
const loading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserList(queryForm)
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
  queryForm.username = ''
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

interface FormData {
  username: string
  password: string
  realName: string
  role: string
  email: string
  phone: string
}

const formData = reactive<FormData>({
  username: '',
  password: '',
  realName: '',
  role: '',
  email: '',
  phone: '',
})

const formRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
})

function handleAdd() {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEdit.value = true
  editId.value = row.id
  formData.username = row.username
  formData.password = ''
  formData.realName = row.realName
  formData.role = row.role
  formData.email = row.email
  formData.phone = row.phone
  dialogVisible.value = true
}

function resetForm() {
  formData.username = ''
  formData.password = ''
  formData.realName = ''
  formData.role = ''
  formData.email = ''
  formData.phone = ''
  dialogFormRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const dto: UserDTO = {
      username: formData.username,
      realName: formData.realName,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
    }
    if (isEdit.value && editId.value !== null) {
      await updateUser(editId.value, dto)
      ElMessage.success('更新成功')
    } else {
      await createUser({ ...dto, password: formData.password })
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

// --- Toggle status ---
async function handleToggleStatus(row: User) {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await updateUser(row.id, {
      username: row.username,
      realName: row.realName,
      role: row.role,
      email: row.email,
      phone: row.phone,
      status: row.status === 1 ? 0 : 1,
    })
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch {
    // cancelled or error handled by interceptor
  }
}

// --- Delete ---
async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // cancelled or error handled by interceptor
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.user-list {
  padding: 20px;
}
</style>
