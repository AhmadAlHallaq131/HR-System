import client from './client'
import { MyProfile, TeamMember } from '../types'

export const getMyProfile = async (): Promise<MyProfile> => {
  const { data } = await client.get('/me/profile')
  return data
}

export const getMyTeam = async (): Promise<TeamMember[]> => {
  const { data } = await client.get('/me/team')
  return data
}
