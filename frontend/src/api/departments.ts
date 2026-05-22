import client from './client'
import { Department, DepartmentRequest } from '../types'

export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await client.get('/departments')
  return data
}

export const createDepartment = async (req: DepartmentRequest): Promise<Department> => {
  const { data } = await client.post('/departments', req)
  return data
}

export const updateDepartment = async (id: number, req: DepartmentRequest): Promise<Department> => {
  const { data } = await client.put(`/departments/${id}`, req)
  return data
}

export const deleteDepartment = async (id: number): Promise<void> => {
  await client.delete(`/departments/${id}`)
}
