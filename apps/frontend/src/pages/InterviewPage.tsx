import { InterviewRoom } from '@/components/interview/InterviewRoom'
import { useHeaderStore } from '@/stores/header.store'
import { useEffect } from 'react'

export function InterviewPage() {
  const setTitle = useHeaderStore((state) => state.setTitle)
  
  useEffect(() => {
    setTitle("Interview")
  }, [setTitle])

  return <InterviewRoom />
}
