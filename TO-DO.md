# TO-DO

## Audio Streaming Refactor

### Remove SpeechRecognition API
- [x] Remove SpeechRecognition API usage
- [x] Remove webkitSpeechRecognition fallback
- [x] Remove recognition event handlers (onresult, onerror, onend)

### Implement Audio Capture with getUserMedia
- [x] Implement getUserMedia for audio capture
- [x] Store and manage MediaStream lifecycle
- [x] Stop tracks on cleanup

### Implement MediaRecorder
- [x] Implement MediaRecorder
- [x] Configure ondataavailable handler
- [x] Stream audio chunks via WebSocket
- [x] Set chunk interval (e.g., 250ms)
- [x] Ensure WebSocket connection before streaming
- [x] Emit audio:chunk events

### Backend Audio Processing
- [x] Receive audio chunks on backend
- [x] Convert Blob to Buffer
- [x] Normalize audio format (PCM 16-bit, 16kHz, mono)
- [x] Integrate STT engine (e.g., Whisper)

### Cross-Browser Audio Handling
- [x] Detect and handle MIME types (webm, mp4)
- [x] Normalize audio formats across browsers

### (Think about it) AudioWorklet Implementation
- [ ] Replace MediaRecorder with AudioWorklet
- [ ] Capture raw audio frames
- [ ] Stream Float32Array

### Security & Permissions
- [x] Enforce HTTPS or localhost
- [x] Handle permission errors (NotAllowedError)
- [x] Ensure user interaction before mic access
- [ ] Handle Safari/iOS restrictions

### Cleanup & Memory Management
- [x] Stop MediaRecorder on unmount
- [x] Close MediaStream tracks
- [x] Disconnect WebSocket
- [ ] Prevent memory leaks

### Monitoring & Debugging
- [x] Add logging for audio lifecycle events
- [ ] Measure end-to-end latency
