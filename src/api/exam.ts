import request from './request'
import type { Result, PageResult, Exam, ExamQuery, ExamDTO } from '@/types'

// Get exam list for admin/teacher (paginated)
export function getExamList(params: ExamQuery) {
  return request.get<Result<PageResult<Exam>>>('/v1/exams', { params })
}

// Get a single exam by id (admin/teacher)
export function getExamById(examId: number) {
  return request.get<Result<Exam>>(`/v1/exams/${examId}`)
}

// Create an exam (admin/teacher)
export function createExam(data: ExamDTO) {
  return request.post<Result<void>>('/v1/exams', data)
}

// Update an exam (admin/teacher)
export function updateExam(examId: number, data: ExamDTO) {
  return request.put<Result<void>>(`/v1/exams/${examId}`, data)
}

// Publish an exam (admin/teacher)
export function publishExam(examId: number) {
  return request.put<Result<void>>(`/v1/exams/${examId}/publish`)
}

// Unpublish an exam (admin/teacher)
export function unpublishExam(examId: number) {
  return request.put<Result<void>>(`/v1/exams/${examId}/unpublish`)
}

// Delete an exam (admin/teacher)
export function deleteExam(examId: number) {
  return request.delete<Result<void>>(`/v1/exams/${examId}`)
}

// Get available exams for student
export function getAvailableExams() {
  return request.get<Result<Exam[]>>('/v1/exams/available')
}

// Start an exam
export function startExam(examId: number) {
  return request.post<Result<number>>(`/v1/exams/${examId}/start`)
}

// Get exam paper (questions without answers)
export function getExamPaper(examId: number) {
  return request.get<Result<import('@/types').ExamPaper>>(`/v1/exams/${examId}/paper`)
}

// Submit exam answers
export function submitExam(examId: number, answers: import('@/types').AnswerItem[]) {
  return request.post<Result<void>>(`/v1/exams/${examId}/submit`, { answers })
}

// Get exam result
export function getExamResult(examId: number) {
  return request.get<Result<import('@/types').ExamResult>>(`/v1/exams/${examId}/result`)
}

// Get student exam history
export function getMyRecords(current = 1, size = 10) {
  return request.get<Result<PageResult<import('@/types').ExamResult>>>(`/v1/exams/my-records`, {
    params: { current, size },
  })
}