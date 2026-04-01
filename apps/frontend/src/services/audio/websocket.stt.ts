import { io, Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/utils'

export class WebSocketSTT {
  private socket: Socket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private mediaStream: MediaStream | null = null
  private isRecording = false
  private resultCallback?: (text: string) => void
  private speakingCallback?: (speaking: boolean) => void
  private chunkInterval = 250

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
      console.log('[WebSocketSTT] Using MIME type:', mimeType)

      this.socket = io(WS_URL, {
        transports: ['websocket'],
      })

      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not initialized'))
          return
        }

        this.socket!.on('connect', () => {
          console.log('[WebSocketSTT] Socket connected')
          resolve()
        })

        this.socket!.on('connect_error', (err) => {
          console.error('[WebSocketSTT] Socket connection error:', err)
          reject(err)
        })

        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      })

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
      })

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.socket?.connected) {
          console.log('[WebSocketSTT] Sending audio chunk:', event.data.size, 'bytes')
          this.socket.emit('audio:chunk', { audio: event.data })
        }
      }

      this.socket.on('stt:result', (data: { text: string }) => {
        console.log('[WebSocketSTT] STT result:', data.text)
        this.resultCallback?.(data.text)
        this.speakingCallback?.(false)
      })

      this.socket.on('stt:interim', (data: { text: string }) => {
        console.log('[WebSocketSTT] STT interim:', data.text)
      })

      this.mediaRecorder.start(this.chunkInterval)
      this.isRecording = true
      this.speakingCallback?.(true)
      console.log('[WebSocketSTT] Recording started')
    } catch (error) {
      console.error('[WebSocketSTT] Failed to start:', error)
      this.stop()
      throw error
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      console.log('[WebSocketSTT] Recording stopped')
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
      console.log('[WebSocketSTT] MediaStream tracks stopped')
    }

    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('[WebSocketSTT] Socket disconnected')
    }

    this.speakingCallback?.(false)
  }

  onResult(callback: (text: string) => void): void {
    this.resultCallback = callback
  }

  onInterimResult(_callback: (text: string) => void): void {
  }

  onSpeakingChange(callback: (speaking: boolean) => void): void {
    this.speakingCallback = callback
  }

  onChunk(_callback: (chunks: Blob[]) => void): void {
  }

  isSupported(): boolean {
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined'
    return hasMediaDevices && hasMediaRecorder
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm;codecs=vp8',
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
}
