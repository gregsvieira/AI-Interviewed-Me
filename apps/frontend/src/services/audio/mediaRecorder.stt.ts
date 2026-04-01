import { STTService } from '@/types/audio'

export class MediaRecorderSTT implements STTService {
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private chunkCallback?: (chunks: Blob[]) => void
  private isRecording = false

  async start(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      const mimeType = this.getSupportedMimeType()
      console.log('[MediaRecorderSTT] Using MIME type:', mimeType)

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
      })

      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          this.chunkCallback?.(this.audioChunks)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('[MediaRecorderSTT] MediaRecorder error:', event)
      }

      this.mediaRecorder.start(250)
      this.isRecording = true
      console.log('[MediaRecorderSTT] Recording started')
    } catch (error) {
      console.error('[MediaRecorderSTT] Failed to start recording:', error)
      this.stop()
      throw error
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      console.log('[MediaRecorderSTT] Recording stopped')
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
      console.log('[MediaRecorderSTT] MediaStream tracks stopped')
    }
  }

  onResult(_callback: (text: string) => void): void {
  }

  onInterimResult(_callback: (text: string) => void): void {
  }

  onSpeakingChange(_callback: (speaking: boolean) => void): void {
  }

  onChunk(callback: (chunks: Blob[]) => void): void {
    this.chunkCallback = callback
  }

  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return ''
  }

  getChunks(): Blob[] {
    return this.audioChunks
  }

  clearChunks(): void {
    this.audioChunks = []
  }
}
