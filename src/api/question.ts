import request from './request'
import type { Result, PageResult, QuestionQuery, Question } from '@/types'

export function getQuestionList(params: QuestionQuery) {
  return request.get<Result<PageResult<Question>>>('/v1/questions', { params })
}

export function getQuestionById(id: number) {
  return request.get<Result<Question>>(`/v1/questions/${id}`)
}

export function createQuestion(data: Partial<Question>) {
  return request.post<Result<number>>('/v1/questions', data)
}

export function updateQuestion(id: number, data: Partial<Question>) {
  return request.put<Result<void>>(`/v1/questions/${id}`, data)
}

export function deleteQuestion(id: number) {
  return request.delete<Result<void>>(`/v1/questions/${id}`)
}
