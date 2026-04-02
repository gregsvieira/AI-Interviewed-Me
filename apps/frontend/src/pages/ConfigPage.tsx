import { ConfigScreen } from '@/components/interview/ConfigScreen'
import { useHeaderStore } from '@/stores/header.store'
import { useEffect } from 'react'

export function ConfigPage() {
  const setTitle = useHeaderStore((state) => state.setTitle)

  useEffect(() => {
    setTitle("Configuration")
  }, [setTitle])
  
  return <ConfigScreen />
}
