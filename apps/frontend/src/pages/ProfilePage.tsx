import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useHeaderStore } from '@/stores/header.store'
import { profileApi } from '@/services/api/profile.api'
import { UserProfile } from '@/types/user'
import { Topic } from '@/types/interview'
import { Check, ArrowLeft, Save, Camera, User, X, CheckCircle } from 'lucide-react'

const TOPICS_DATA: Topic[] = [
  { id: 'softskills', name: 'Soft Skills', subtopics: [] },
  { id: 'frontend', name: 'Frontend', subtopics: [] },
  { id: 'backend', name: 'Backend', subtopics: [] },
  { id: 'fullstack', name: 'FullStack', subtopics: [] },
  { id: 'devops', name: 'DevOps', subtopics: [] },
  { id: 'database', name: 'Database', subtopics: [] },
]

interface ImageCropperProps {
  image: string
  onCrop: (croppedImage: string) => void
  onCancel: () => void
}

function ImageCropper({ image, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const displaySize = 200
          const minSize = Math.min(img.width, img.height)
          canvas.width = displaySize
          canvas.height = displaySize
          ctx.clearRect(0, 0, displaySize, displaySize)
          
          const scale = displaySize / minSize
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const offsetX = (displaySize - scaledWidth) / 2
          const offsetY = (displaySize - scaledHeight) / 2
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
        }
      }
      
      imageRef.current = img
    }
    img.src = image
  }, [image])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return

    const newX = e.clientX - startPos.x
    const newY = e.clientY - startPos.y

    const container = containerRef.current
    const img = imageRef.current
    if (!container || !img) return

    const displaySize = 200
    const scale = displaySize / Math.min(img.width, img.height)
    const scaledWidth = img.width * scale
    const scaledHeight = img.height * scale

    const maxOffsetX = Math.max(0, (scaledWidth - displaySize) / 2)
    const maxOffsetY = Math.max(0, (scaledHeight - displaySize) / 2)

    const clampedX = Math.min(maxOffsetX, Math.max(-maxOffsetX, newX))
    const clampedY = Math.min(maxOffsetY, Math.max(-maxOffsetY, newY))

    setOffset({ x: clampedX, y: clampedY })

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, displaySize, displaySize)
        ctx.save()
        ctx.beginPath()
        ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, Math.PI * 2)
        ctx.clip()
        const offsetX = (displaySize - scaledWidth) / 2 + clampedX
        const offsetY = (displaySize - scaledHeight) / 2 + clampedY
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
        ctx.restore()
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleConfirm = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (ctx && imageRef.current) {
      ctx.beginPath()
      ctx.arc(100, 100, 100, 0, Math.PI * 2)
      ctx.clip()
      const img = imageRef.current
      const scale = 200 / Math.min(img.width, img.height)
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (200 - scaledWidth) / 2 + offset.x
      const offsetY = (200 - scaledHeight) / 2 + offset.y
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
      const result = canvas.toDataURL('image/jpeg', 0.8)
      onCrop(result)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-zinc-100 mb-4 text-center">
          Position your photo
        </h3>
        <p className="text-sm text-zinc-400 mb-4 text-center">
          Drag to adjust the position
        </p>
        
        <div
          ref={containerRef}
          className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-zinc-600 cursor-move select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const setTitle = useHeaderStore((state) => state.setTitle)
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [avatar, setAvatar] = useState<string | undefined>(undefined)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)

  useEffect(() => {
    setTitle('Settings')
  }, [setTitle])

  useEffect(() => {
    profileApi
      .getProfile()
      .then((data) => {
        setProfile(data)
        setSelectedTopics(data.improvementTopics || [])
        setAvatar(data.avatar)
        setPreviewAvatar(data.avatar || null)
      })
      .catch(() => {
        navigate('/')
      })
      .finally(() => setIsLoading(false))
  }, [navigate])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setTempImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = (croppedImage: string) => {
    setPreviewAvatar(croppedImage)
    setAvatar(croppedImage)
    setTempImage(null)
    setHasChanges(true)
  }

  const handleCropCancel = () => {
    setTempImage(null)
  }

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
      await profileApi.updateProfile({
        improvementTopics: selectedTopics,
        avatar: avatar,
      })
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
      {tempImage && (
        <ImageCropper
          image={tempImage}
          onCrop={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

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
          <h2 className="text-lg font-medium text-zinc-100 mb-6">Profile</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                {previewAvatar ? (
                  <img
                    src={previewAvatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-zinc-600" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-xl font-medium text-zinc-100">{profile?.name}</h3>
              <p className="text-sm text-zinc-400">{profile?.email}</p>
            </div>
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
