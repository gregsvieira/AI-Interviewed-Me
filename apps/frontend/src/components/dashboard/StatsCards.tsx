import { Clock, MessageSquare, Target } from 'lucide-react'

interface StatsCardsProps {
  totalInterviews: number
  totalTimeMinutes: number
  mostPracticedTopic: { name: string; count: number } | null
}

export function StatsCards({ totalInterviews, totalTimeMinutes, mostPracticedTopic }: StatsCardsProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-100">{totalInterviews}</p>
            <p className="text-sm text-zinc-400">Interviews</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-100">{formatTime(totalTimeMinutes)}</p>
            <p className="text-sm text-zinc-400">Total Time</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-semibold text-zinc-100 truncate">
              {mostPracticedTopic?.name || 'None'}
            </p>
            <p className="text-sm text-zinc-400">
              {mostPracticedTopic ? `${mostPracticedTopic.count} sessions` : 'No data'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
