import client from './client'
import { User } from '../types'

export const login = async (username: string, password: string): Promise<User> => {
  const { data } = await client.post('/auth/login', { username, password })
  return data
}
