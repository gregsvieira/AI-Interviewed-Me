import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useHeaderStore } from '@/stores/header.store'
import { profileApi } from '@/services/api/profile.api'
import { UserProfile } from '@/types/user'
import { Topic } from '@/types/interview'
import { Check, ArrowLeft, Save } from 'lucide-react'

const TOPICS_DATA: Topic[] = [
  { id: 'softskills', name: 'Soft Skills', subtopics: [] },
  { id: 'frontend', name: 'Frontend', subtopics: [] },
  { id: 'backend', name: 'Backend', subtopics: [] },
  { id: 'fullstack', name: 'FullStack', subtopics: [] },
  { id: 'devops', name: 'DevOps', subtopics: [] },
  { id: 'database', name: 'Database', subtopics: [] },
]

export function ProfilePage() {
  const setTitle = useHeaderStore((state) => state.setTitle)
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setTitle('Settings')
  }, [setTitle])

  useEffect(() => {
    profileApi
      .getProfile()
      .then((data) => {
        setProfile(data)
        setSelectedTopics(data.improvementTopics)
      })
      .catch(() => {
        navigate('/')
      })
      .finally(() => setIsLoading(false))
  }, [navigate])

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) => {
      const newTopics = prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
      return newTopics
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      await profileApi.updateProfile({ improvementTopics: selectedTopics })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-zinc-100">Profile</h2>
              <p className="text-sm text-zinc-400 mt-1">{profile?.email}</p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-md font-medium text-zinc-100 mb-2">Name</h3>
            <p className="text-zinc-300">{profile?.name}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              Topics to Improve
            </h2>
            <p className="text-sm text-zinc-400">
              Select the topics you want to track and see your skill levels on the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TOPICS_DATA.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isSelected ? 'text-blue-400' : 'text-zinc-300'
                    }`}
                  >
                    {topic.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              )
            })}
          </div>

          {selectedTopics.length === 0 && (
            <p className="text-sm text-amber-400 mt-4">
              Select at least one topic to see your skill levels on the dashboard.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </main>
    </div>
  )
}
