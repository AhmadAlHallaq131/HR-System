import client from './client'
import { Company, CreateCompanyRequest } from '../types'

export const getCompanies = async (): Promise<Company[]> => {
  const { data } = await client.get('/admin/companies')
  return data
}

export const createCompany = async (req: CreateCompanyRequest): Promise<Company> => {
  const { data } = await client.post('/admin/companies', req)
  return data
}

export const updateCompany = async (id: number, name?: string, active?: boolean): Promise<Company> => {
  const { data } = await client.patch(`/admin/companies/${id}`, null, {
    params: { ...(name !== undefined && { name }), ...(active !== undefined && { active }) },
  })
  return data
}

export const getPlatformStats = async (): Promise<Record<string, number>> => {
  const { data } = await client.get('/admin/stats')
  return data
}
