import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeaderStore } from '@/stores/header.store'
import { interviewApi } from '@/services/api/interview.api'
import { InterviewStats } from '@/types/interview'
import {
  StatsCards,
  LastInterviewCard,
  StreakBadge,
  SkillRadar,
  Recommendations,
  QuickStart,
} from '@/components/dashboard'

export function HomePage() {
  const setTitle = useHeaderStore((state) => state.setTitle)
  const navigate = useNavigate()
  const [stats, setStats] = useState<InterviewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTitle('Dashboard')
  }, [setTitle])

  useEffect(() => {
    interviewApi
      .getStats()
      .then(setStats)
      .catch(() => {
        setStats(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleStartInterview = () => {
    navigate('/config')
  }

  const handleEvaluateInterview = (interviewId: string) => {
    navigate(`/history/${interviewId}`)
  }

  const getMostPracticedTopic = () => {
    if (!stats?.topicDistribution?.length) return null
    return stats.topicDistribution[0]
  }

  const getSuggestion = () => {
    if (!stats?.lastInterview) return undefined
    return {
      topic: stats.lastInterview.topic,
      subtopic: stats.lastInterview.subtopic,
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
        <StatsCards
          totalInterviews={stats?.totalInterviews || 0}
          totalTimeMinutes={stats?.totalTimeMinutes || 0}
          mostPracticedTopic={getMostPracticedTopic()}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <LastInterviewCard
              interview={stats?.lastInterview || null}
              onEvaluate={handleEvaluateInterview}
            />
          </div>
          <div className="space-y-4">
            <StreakBadge
              currentStreak={stats?.currentStreak || 0}
              longestStreak={stats?.longestStreak || 0}
            />
            <SkillRadar skills={stats?.skillLevels || []} />
          </div>
        </div>

        <Recommendations
          type={stats?.recommendation?.type || 'practice'}
          message={stats?.recommendation?.message || 'Start practicing to see recommendations!'}
        />

        <QuickStart suggestion={getSuggestion()} onStart={handleStartInterview} />
      </main>
    </div>
  )
}
