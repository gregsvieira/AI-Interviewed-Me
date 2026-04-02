export interface UserProfile {
  id: string
  email: string
  name: string
  improvementTopics: string[]
  lastInterviewDate: string | null
  avatar?: string
}
