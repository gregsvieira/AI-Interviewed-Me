export type Gender = 'male' | 'female'

export interface STTService {
  start(): Promise<void>
  stop(): void
  onResult(callback: (text: string) => void): void
  onInterimResult(callback: (text: string) => void): void
  onSpeakingChange(callback: (speaking: boolean) => void): void
  onChunk(callback: (chunks: Blob[]) => void): void
  isSupported(): boolean
}

export interface TTSService {
  speak(text: string, gender?: Gender): Promise<void>
  stop(): void
  getEstimatedDuration(text: string): number
  onSpeakingChange(callback: (speaking: boolean) => void): void
  isSupported(): boolean
}
