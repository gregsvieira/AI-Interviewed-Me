import { Button } from '@/components/ui/button'
import { Calendar, Clock, BarChart2 } from 'lucide-react'
import { Interview } from '@/types/interview'

interface LastInterviewCardProps {
  interview: Interview | null
  onEvaluate: (interviewId: string) => void
}

export function LastInterviewCard({ interview, onEvaluate }: LastInterviewCardProps) {
  if (!interview) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-zinc-100 mb-4">Last Interview</h3>
        <p className="text-zinc-400 text-sm">No interviews yet</p>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-medium text-zinc-100 mb-4">Last Interview</h3>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Topic</span>
          <span className="text-zinc-100 font-medium capitalize">{interview.topic}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Subtopic</span>
          <span className="text-zinc-100 font-medium capitalize">{interview.subtopic}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Level</span>
          <span className="text-zinc-100 font-medium capitalize">{interview.level}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400 pt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(interview.startedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {interview.duration} min
          </div>
        </div>
      </div>

      <Button
        onClick={() => onEvaluate(interview.id)}
        variant="outline"
        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
      >
        <BarChart2 className="w-4 h-4 mr-2" />
        Evaluate Interview
      </Button>
    </div>
  )
}
