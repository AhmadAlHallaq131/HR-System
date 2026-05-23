import client from './client'
import { LeaveResponse, LeaveRequestDto } from '../types'

export const getLeaves = async (): Promise<LeaveResponse[]> => {
  const { data } = await client.get('/leaves')
  return data
}

export const getMyLeaves = async (): Promise<LeaveResponse[]> => {
  const { data } = await client.get('/leaves/my')
  return data
}

export const submitLeave = async (employeeId: number, dto: LeaveRequestDto): Promise<LeaveResponse> => {
  const { data } = await client.post(`/leaves/employee/${employeeId}`, dto)
  return data
}

export const approveLeave = async (id: number): Promise<LeaveResponse> => {
  const { data } = await client.put(`/leaves/${id}/approve`)
  return data
}

export const rejectLeave = async (id: number): Promise<LeaveResponse> => {
  const { data } = await client.put(`/leaves/${id}/reject`)
  return data
}
