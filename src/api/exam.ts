import request from './request'
import type { Result, PageResult, Exam, ExamPaper, ExamResult, AnswerItem } from '@/types'

interface ExamQuery {
  title?: string
  page: number
  pageSize: number
}

// Get available exams for student
export function getAvailableExams() {
  return request.get<Result<Exam[]>>('/v1/exams/available')
}

// Get exam list for admin/teacher (paginated)
export function getExamList(params: ExamQuery) {
  return request.get<Result<PageResult<Exam>>>('/v1/exams', { params })
}

// Start an exam
export function startExam(examId: number) {
  return request.post<Result<number>>(`/v1/exams/${examId}/start`)
}

// Get exam paper (questions without answers)
export function getExamPaper(examId: number) {
  return request.get<Result<ExamPaper>>(`/v1/exams/${examId}/paper`)
}

// Submit exam answers
export function submitExam(examId: number, answers: AnswerItem[]) {
  return request.post<Result<void>>(`/v1/exams/${examId}/submit`, { answers })
}

// Get exam result
export function getExamResult(examId: number) {
  return request.get<Result<ExamResult>>(`/v1/exams/${examId}/result`)
}

// Get student exam history
export function getMyRecords(current = 1, size = 10) {
  return request.get<Result<PageResult<ExamResult>>>(`/v1/exams/my-records`, {
    params: { current, size },
  })
}

// Publish an exam (admin/teacher)
export function publishExam(examId: number) {
  return request.put<Result<void>>(`/v1/exams/${examId}/publish`)
}

// Delete an exam (admin/teacher)
export function deleteExam(examId: number) {
  return request.delete<Result<void>>(`/v1/exams/${examId}`)
}