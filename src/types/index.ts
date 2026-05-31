export interface User {
  id: number
  username: string
  realName: string
  role: string
  email: string
  phone: string
  status: number
  createTime: string
}

export interface UserQuery {
  username?: string
  page: number
  pageSize: number
}

export interface UserDTO {
  username: string
  realName: string
  role?: string
  email: string
  phone: string
  status?: number
}

export interface Result<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

// ---- Exam related ----

export interface Exam {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  durationMinutes: number
  totalScore: number
  status: string
  teacherName?: string
  createTime: string
}

export interface ExamPaper {
  examId: number
  title: string
  durationMinutes: number
  totalScore: number
  questions: QuestionItem[]
}

export interface QuestionItem {
  questionId: number
  type: string // single / multiple / true_false
  content: string
  options: string // JSON string like {"A":"...","B":"..."}
  score: number
  sortOrder: number
}

export interface ExamResult {
  recordId: number
  examId: number
  examTitle: string
  startTime: string
  submitTime: string | null
  status: string // in_progress / submitted / graded
  totalScore: number | null
  examTotalScore: number
  answers?: AnswerDetail[]
}

export interface AnswerDetail {
  questionId: number
  questionContent: string
  type: string
  studentAnswer: string
  correctAnswer: string
  isCorrect: number // 0 or 1
  score: number
}

export interface AnswerItem {
  questionId: number
  studentAnswer: string
}