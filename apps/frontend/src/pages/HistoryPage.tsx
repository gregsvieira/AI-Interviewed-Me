import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { interviewApi } from '@/services/api/interview.api'
import { useHeaderStore } from '@/stores/header.store'
import { Interview } from '@/types/interview'
import { ArrowLeft, Calendar, Clock, MessageSquare, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function HistoryPage() {
  const setTitle = useHeaderStore((state) => state.setTitle)
  const navigate = useNavigate()
  const params = useParams()
  const interviewId = params.id

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTitle(interviewId ? 'Interview Details' : 'History')
  }, [setTitle, interviewId])

  useEffect(() => {
    if (interviewId) {
      interviewApi
        .getInterview(interviewId)
        .then(setSelectedInterview)
        .catch(() => setSelectedInterview(null))
        .finally(() => setIsLoading(false))
    } else {
      interviewApi
        .getHistory()
        .then(setInterviews)
        .catch(() => setInterviews([]))
        .finally(() => setIsLoading(false))
    }
  }, [interviewId])

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (interviewId && selectedInterview) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/history')}
            className="text-zinc-400 hover:text-zinc-100 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-zinc-100 capitalize">
                {selectedInterview.topic} / {selectedInterview.subtopic}
              </CardTitle>
              <p className="text-zinc-400 capitalize">Level: {selectedInterview.level}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(selectedInterview.startedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDuration(selectedInterview.duration)}
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {selectedInterview.messages.length} messages
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-zinc-100">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
              {selectedInterview.messages.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">No messages in this interview</p>
              ) : (
                selectedInterview.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        message.role === 'ai'
                          ? 'bg-zinc-800 text-zinc-100'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1 opacity-70">
                        {message.role === 'ai' ? 'Interviewer' : 'You'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="container mx-auto px-4 py-8">
        {interviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-zinc-300 mb-2">
              No history found
            </h2>
            <p className="text-zinc-500 mb-6">
              Start your first interview to see your history here
            </p>
            <Button
              onClick={() => navigate('/config')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Interview
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <Card
                key={interview.id}
                className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                onClick={() => navigate(`/history/${interview.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-zinc-100 text-lg capitalize">
                    {interview.topic}
                  </CardTitle>
                  <p className="text-sm text-zinc-400 capitalize">{interview.subtopic}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(interview.startedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(interview.duration)}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-sm text-zinc-400">
                      {interview.messages?.length || 0} messages exchanged
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
