# TO-DO

## Audio Streaming Refactor

### Remove SpeechRecognition API
- [ ] Remove SpeechRecognition API usage
- [ ] Remove webkitSpeechRecognition fallback
- [ ] Remove recognition event handlers (onresult, onerror, onend)

### Implement Audio Capture with getUserMedia
- [ ] Implement getUserMedia for audio capture
- [ ] Store and manage MediaStream lifecycle
- [ ] Stop tracks on cleanup

### Implement MediaRecorder
- [ ] Implement MediaRecorder
- [ ] Configure ondataavailable handler
- [ ] Stream audio chunks via WebSocket
- [ ] Set chunk interval (e.g., 250ms)
- [ ] Ensure WebSocket connection before streaming
- [ ] Emit audio:chunk events

### Backend Audio Processing
- [ ] Receive audio chunks on backend
- [ ] Convert Blob to Buffer
- [ ] Normalize audio format (PCM 16-bit, 16kHz, mono)
- [ ] Integrate STT engine (e.g., Whisper)

### Cross-Browser Audio Handling
- [ ] Detect and handle MIME types (webm, mp4)
- [ ] Normalize audio formats across browsers

### (Think about it) AudioWorklet Implementation
- [ ] Replace MediaRecorder with AudioWorklet
- [ ] Capture raw audio frames
- [ ] Stream Float32Array

### Security & Permissions
- [ ] Enforce HTTPS or localhost
- [ ] Handle permission errors (NotAllowedError)
- [ ] Ensure user interaction before mic access
- [ ] Handle Safari/iOS restrictions

### Cleanup & Memory Management
- [ ] Stop MediaRecorder on unmount
- [ ] Close MediaStream tracks
- [ ] Disconnect WebSocket
- [ ] Prevent memory leaks

### Monitoring & Debugging
- [ ] Add logging for audio lifecycle events
- [ ] Measure end-to-end latency
