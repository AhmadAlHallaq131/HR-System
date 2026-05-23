import client from './client'
import { AttendanceRecord } from '../types'

export const checkIn = async (): Promise<AttendanceRecord> => {
  const { data } = await client.post('/attendance/check-in')
  return data
}

export const checkOut = async (): Promise<AttendanceRecord> => {
  const { data } = await client.post('/attendance/check-out')
  return data
}

export const getTodayAttendance = async (): Promise<AttendanceRecord | null> => {
  const res = await client.get('/attendance/today')
  if (res.status === 204) return null
  return res.data
}

export const getMyAttendanceHistory = async (year: number, month: number): Promise<AttendanceRecord[]> => {
  const { data } = await client.get('/attendance/my', { params: { year, month } })
  return data
}

export const getAllAttendance = async (date?: string, employeeId?: number): Promise<AttendanceRecord[]> => {
  const { data } = await client.get('/attendance', {
    params: { ...(date && { date }), ...(employeeId && { employeeId }) },
  })
  return data
}

export const getTodaySummary = async (): Promise<Record<string, number>> => {
  const { data } = await client.get('/attendance/today/summary')
  return data
}
