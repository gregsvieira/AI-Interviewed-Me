export interface Subtopic {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subtopics: Subtopic[]
}

export interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  timestamp?: Date
}

export interface Interview {
  id: string
  topic: string
  subtopic: string
  level: string
  duration: number
  startedAt: Date
  endedAt?: Date
  messages: Message[]
}

export interface TopicDistribution {
  id: string
  name: string
  count: number
  percentage: number
}

export interface LevelDistribution {
  level: string
  count: number
  percentage: number
}

export interface SkillLevel {
  topicId: string
  name: string
  level: number
}

export interface InterviewStats {
  totalInterviews: number
  totalTimeMinutes: number
  lastInterview: Interview | null
  topicDistribution: TopicDistribution[]
  levelDistribution: LevelDistribution[]
  skillLevels: SkillLevel[]
  currentStreak: number
  longestStreak: number
  recommendation: {
    type: 'practice' | 'level' | 'motivation'
    message: string
  }
}
