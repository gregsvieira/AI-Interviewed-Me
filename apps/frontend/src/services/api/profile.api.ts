import { apiClient } from './client'
import { UserProfile } from '@/types/user'

export const profileApi = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/profile')
    return response.data
  },

  async updateProfile(data: { improvementTopics: string[] }): Promise<UserProfile> {
    const response = await apiClient.patch<UserProfile>('/profile', data)
    return response.data
  },
}
