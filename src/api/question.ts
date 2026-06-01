import request from './request'
import type { Result, PageResult, Question, QuestionQuery, QuestionDTO } from '@/types'

export function getQuestionList(params: QuestionQuery) {
  return request.get<Result<PageResult<Question>>>('/v1/questions', { params })
}

export function getQuestionById(id: number) {
  return request.get<Result<Question>>(`/v1/questions/${id}`)
}

export function createQuestion(data: QuestionDTO) {
  return request.post<Result<void>>('/v1/questions', data)
}

export function updateQuestion(id: number, data: QuestionDTO) {
  return request.put<Result<void>>(`/v1/questions/${id}`, data)
}

export function deleteQuestion(id: number) {
  return request.delete<Result<void>>(`/v1/questions/${id}`)
}