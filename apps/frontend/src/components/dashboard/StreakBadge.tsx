import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
}

export function StreakBadge({ currentStreak, longestStreak }: StreakBadgeProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2">
        <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-zinc-600'}`} />
        <span className="text-3xl font-bold text-zinc-100">{currentStreak}</span>
      </div>
      <p className="text-sm text-zinc-400">
        {currentStreak === 1 ? 'day streak' : 'days streak'}
      </p>
      {longestStreak > 0 && (
        <p className="text-xs text-zinc-500 mt-1">
          Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
        </p>
      )}
    </div>
  )
}
