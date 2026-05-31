import request from './request'
import type { User, UserQuery, UserDTO, Result, PageResult } from '@/types'

export function getUserList(params: UserQuery) {
  return request.get<Result<PageResult<User>>>('/users', { params })
}

export function getUserById(id: number) {
  return request.get<Result<User>>(`/users/${id}`)
}

export function createUser(data: UserDTO) {
  return request.post<Result<void>>('/users', data)
}

export function updateUser(id: number, data: UserDTO) {
  return request.put<Result<void>>(`/users/${id}`, data)
}

export function deleteUser(id: number) {
  return request.delete<Result<void>>(`/users/${id}`)
}