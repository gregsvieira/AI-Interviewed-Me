import { io, Socket } from 'socket.io-client'
import { WS_URL } from '@/lib/utils'

export class WebSocketSTT {
  private socket: Socket | null = null
  private mediaRecorder: MediaRecorder | null = null
  private mediaStream: MediaStream | null = null
  private isRecording = false
  private isStopped = false
  private resultCallback?: (text: string) => void
  private speakingCallback?: (speaking: boolean) => void
  private chunkInterval = 250
  private connectionTimeout: ReturnType<typeof setTimeout> | null = null

  async start(): Promise<void> {
    if (this.isRecording) {
      console.log('[WebSocketSTT] Already recording')
      return
    }

    this.isStopped = false
    console.log('[WebSocketSTT] Starting...')

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })

      console.log('[WebSocketSTT] MediaStream obtained')

      const mimeType = this.getSupportedMimeType()
      console.log('[WebSocketSTT] Using MIME type:', mimeType || 'default')

      this.socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: false,
      })

      await new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not initialized'))
          return
        }

        this.connectionTimeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 10000)

        this.socket!.on('connect', () => {
          console.log('[WebSocketSTT] Socket connected')
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }
          resolve()
        })

        this.socket!.on('connect_error', (err) => {
          console.error('[WebSocketSTT] Socket connection error:', err)
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }
          reject(err)
        })
      })

      this.setupSocketListeners()

      const recorderOptions: MediaRecorderOptions = {}
      if (mimeType) {
        recorderOptions.mimeType = mimeType
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions)

      this.mediaRecorder.ondataavailable = (event) => {
        if (this.isStopped) return
        if (event.data.size > 0 && this.socket?.connected) {
          console.log('[WebSocketSTT] Sending audio chunk:', event.data.size, 'bytes')
          this.socket.emit('audio:chunk', { audio: event.data })
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('[WebSocketSTT] MediaRecorder error:', event)
        this.isStopped = true
      }

      this.mediaRecorder.onstop = () => {
        console.log('[WebSocketSTT] MediaRecorder stopped')
      }

      this.mediaRecorder.start(this.chunkInterval)
      this.isRecording = true
      this.speakingCallback?.(true)
      console.log('[WebSocketSTT] Recording started')
    } catch (error) {
      console.error('[WebSocketSTT] Failed to start:', error)
      this.cleanup()
      throw error
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return

    this.socket.off('stt:result')
    this.socket.off('stt:interim')

    this.socket.on('stt:result', (data: { text: string }) => {
      console.log('[WebSocketSTT] STT result:', data.text)
      this.resultCallback?.(data.text)
      this.speakingCallback?.(false)
    })

    this.socket.on('stt:interim', (data: { text: string }) => {
      console.log('[WebSocketSTT] STT interim:', data.text)
    })
  }

  stop(): void {
    console.log('[WebSocketSTT] Stopping...')
    this.isStopped = true
    this.cleanup()
  }

  private cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop()
      } catch (e) {
        console.log('[WebSocketSTT] MediaRecorder stop error:', e)
      }
      this.isRecording = false
      console.log('[WebSocketSTT] Recording stopped')
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch (e) {
          console.log('[WebSocketSTT] Track stop error:', e)
        }
      })
      this.mediaStream = null
      console.log('[WebSocketSTT] MediaStream tracks stopped')
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }

    if (this.socket) {
      try {
        this.socket.removeAllListeners()
        this.socket.disconnect()
      } catch (e) {
        console.log('[WebSocketSTT] Socket disconnect error:', e)
      }
      this.socket = null
      console.log('[WebSocketSTT] Socket disconnected')
    }

    this.speakingCallback?.(false)
    this.resultCallback = undefined
    this.speakingCallback = undefined
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

  isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent)
  }

  private getSupportedMimeType(): string {
    const isSafari = this.isSafari()
    const isIOS = this.isIOS()

    let types: string[]

    if (isIOS) {
      types = [
        'audio/mp4',
        'audio/m4a',
        'audio/aac',
      ]
    } else if (isSafari) {
      types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/aac',
      ]
    } else {
      types = [
        'audio/webm;codecs=opus',
        'audio/webm;codecs=vp8',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ]
    }

    for (const type of types) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log('[WebSocketSTT] MIME type supported:', type)
          return type
        }
      } catch (e) {
        console.log('[WebSocketSTT] Error checking MIME type:', type, e)
      }
    }

    console.log('[WebSocketSTT] No specific MIME type supported, using default')
    return ''
  }
}
