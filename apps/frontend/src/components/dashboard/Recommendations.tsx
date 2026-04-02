import { Lightbulb, TrendingUp, Calendar } from 'lucide-react'

interface RecommendationsProps {
  type: 'practice' | 'level' | 'motivation'
  message: string
}

export function Recommendations({ type, message }: RecommendationsProps) {
  const icons = {
    practice: TrendingUp,
    level: Lightbulb,
    motivation: Calendar,
  }

  const Icon = icons[type]

  const bgColors = {
    practice: 'bg-blue-500/10',
    level: 'bg-amber-500/10',
    motivation: 'bg-emerald-500/10',
  }

  const iconColors = {
    practice: 'text-blue-400',
    level: 'text-amber-400',
    motivation: 'text-emerald-400',
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${bgColors[type]}`}>
          <Icon className={`w-4 h-4 ${iconColors[type]}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-100">Recommendation</p>
          <p className="text-sm text-zinc-400 mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}
