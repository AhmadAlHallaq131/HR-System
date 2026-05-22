import client from './client'
import { Employee, EmployeeRequest } from '../types'

export const getEmployees = async (): Promise<Employee[]> => {
  const { data } = await client.get('/employees')
  return data
}

export const getEmployee = async (id: number): Promise<Employee> => {
  const { data } = await client.get(`/employees/${id}`)
  return data
}

export const createEmployee = async (req: EmployeeRequest): Promise<Employee> => {
  const { data } = await client.post('/employees', req)
  return data
}

export const updateEmployee = async (id: number, req: EmployeeRequest): Promise<Employee> => {
  const { data } = await client.put(`/employees/${id}`, req)
  return data
}

export const deleteEmployee = async (id: number): Promise<void> => {
  await client.delete(`/employees/${id}`)
}

export const searchEmployees = async (q: string): Promise<Employee[]> => {
  const { data } = await client.get('/employees/search', { params: { q } })
  return data
}
