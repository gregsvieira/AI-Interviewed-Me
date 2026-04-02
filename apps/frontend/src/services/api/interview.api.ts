import { apiClient } from './client'
import { Topic, Interview, InterviewStats } from '@/types/interview'

export const interviewApi = {
  async getTopics(): Promise<Topic[]> {
    const response = await apiClient.get<Topic[]>('/topics')
    return response.data
  },

  async getHistory(): Promise<Interview[]> {
    const response = await apiClient.get<Interview[]>('/interview/history')
    return response.data
  },

  async getStats(): Promise<InterviewStats> {
    const response = await apiClient.get<InterviewStats>('/interview/stats')
    return response.data
  },

  async getInterview(id: string): Promise<Interview> {
    const response = await apiClient.get<Interview>(`/interview/${id}`)
    return response.data
  },
}
