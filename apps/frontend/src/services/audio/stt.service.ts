import { STTService } from '@/types/audio'
import { WebSocketSTT } from './websocket.stt'

let instance: STTService | null = null

export function getSTTService(): STTService {
  if (!instance) {
    instance = new WebSocketSTT()
  }
  return instance
}
