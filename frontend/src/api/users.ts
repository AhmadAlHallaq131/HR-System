import client from './client'
import { CreateEmployeeUserRequest, Employee } from '../types'

export const createEmployeeUser = async (req: CreateEmployeeUserRequest): Promise<Employee> => {
  const { data } = await client.post('/users', req)
  return data
}

export const deactivateUser = async (userId: number): Promise<void> => {
  await client.put(`/users/${userId}/deactivate`)
}

export const activateUser = async (userId: number): Promise<void> => {
  await client.put(`/users/${userId}/activate`)
}

export const resetUserPassword = async (userId: number, password: string): Promise<void> => {
  await client.put(`/users/${userId}/reset-password`, { password })
}
