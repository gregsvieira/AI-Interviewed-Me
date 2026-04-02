import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

interface QuickStartProps {
  suggestion?: { topic: string; subtopic: string }
  onStart: () => void
}

export function QuickStart({ suggestion, onStart }: QuickStartProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold text-white mb-1">Ready to practice?</h3>
          {suggestion && (
            <p className="text-sm text-blue-100">
              Suggested: <span className="capitalize">{suggestion.topic}</span>
              {' / '}
              <span className="capitalize">{suggestion.subtopic}</span>
            </p>
          )}
        </div>
        <Button
          onClick={onStart}
          className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6"
        >
          <Zap className="w-4 h-4 mr-2" />
          Start Interview
        </Button>
      </div>
    </div>
  )
}
