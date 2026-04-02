import { Mic, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpeakingCircleProps {
  isSpeaking: boolean
  label: string
  size?: 'sm' | 'md' | 'lg'
  showMicButton?: boolean
  onMicPress?: () => void
  onMicRelease?: () => void
  isUserCircle?: boolean
  isRecording?: boolean
  avatar?: string
}

export function SpeakingCircle({
  isSpeaking,
  label,
  size = 'md',
  showMicButton,
  onMicPress,
  onMicRelease,
  isUserCircle = false,
  isRecording = false,
  avatar,
}: SpeakingCircleProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-24 h-24 text-base',
    lg: 'w-32 h-32 text-lg',
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', isUserCircle && 'relative')}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-all duration-300 border-2 overflow-hidden',
          sizeClasses[size],
          isRecording
            ? 'bg-gradient-to-br from-red-700 to-red-800 border-red-500 shadow-lg shadow-red-500/50'
            : 'bg-gradient-to-br from-zinc-700 to-zinc-800 border-zinc-600',
          isSpeaking && !isUserCircle && 'shadow-lg shadow-blue-500/50'
        )}
        style={isSpeaking || isRecording ? { animation: 'gentleBounce 0.6s ease-in-out infinite' } : undefined}
      >
        {avatar && isUserCircle ? (
          <img src={avatar} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className={cn('font-medium', isRecording ? 'text-red-100' : 'text-zinc-300')}>{label}</span>
        )}
      </div>

      {showMicButton && isUserCircle && (
        <button
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer z-10',
            isRecording
              ? 'hover:bg-red-500/20 active:bg-red-500/40'
              : 'hover:bg-blue-500/20 active:bg-blue-500/40'
          )}
          onMouseDown={onMicPress}
          onMouseUp={onMicRelease}
          onMouseLeave={onMicRelease}
          onTouchStart={onMicPress}
          onTouchEnd={onMicRelease}
          style={{ borderRadius: '50%' }}
        >
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-200',
              isRecording ? 'bg-red-500' : 'bg-blue-500'
            )}
          >
            {isRecording ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>
        </button>
      )}

      {showMicButton && !isUserCircle && (
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              'w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center cursor-pointer transition-all duration-200',
              'hover:bg-blue-500/30 active:bg-blue-500/40'
            )}
            onMouseDown={onMicPress}
            onMouseUp={onMicRelease}
            onMouseLeave={onMicRelease}
            onTouchStart={onMicPress}
            onTouchEnd={onMicRelease}
          >
            <Mic className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-xs text-zinc-400">Hold to speak</span>
        </div>
      )}

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
