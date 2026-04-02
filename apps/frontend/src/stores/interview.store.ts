import { create } from 'zustand'
import { Topic, Subtopic, Message } from '@/types/interview'
import { Gender } from '@/types/audio'

export type LevelOption = 'entry' | 'mid' | 'senior'

export interface PreloadedMessage {
  text: string
  interviewerName: string
  interviewerGender?: Gender
}

interface InterviewState {
  selectedTopic: Topic | null
  selectedSubtopic: Subtopic | null
  selectedDuration: number
  selectedLevel: LevelOption
  isInterviewActive: boolean
  isAiSpeaking: boolean
  isUserSpeaking: boolean
  conversationLog: Message[]
  timeRemaining: number
  preloadedMessage: PreloadedMessage | null
  interviewerGender: Gender
  setConfig: (topic: Topic | null, subtopic: Subtopic | null, duration: number, level: LevelOption) => void
  startInterview: () => void
  endInterview: () => void
  addMessage: (message: Omit<Message, 'id'> & { id?: string }) => string
  updateMessage: (id: string, text: string) => void
  setAiSpeaking: (speaking: boolean) => void
  setUserSpeaking: (speaking: boolean) => void
  decrementTime: () => void
  reset: () => void
  setPreloadedMessage: (message: PreloadedMessage | null) => void
  setInterviewerGender: (gender: Gender) => void
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  selectedTopic: null,
  selectedSubtopic: null,
  selectedDuration: 15,
  selectedLevel: 'mid',
  isInterviewActive: false,
  isAiSpeaking: false,
  isUserSpeaking: false,
  conversationLog: [],
  timeRemaining: 15 * 60,
  preloadedMessage: null,
  interviewerGender: 'male',

  setConfig: (topic, subtopic, duration, level) => {
    set({
      selectedTopic: topic,
      selectedSubtopic: subtopic,
      selectedDuration: duration,
      selectedLevel: level,
      timeRemaining: duration * 60,
    })
  },

  startInterview: () => {
    set({ isInterviewActive: true, conversationLog: [], timeRemaining: get().selectedDuration * 60 })
  },

  endInterview: () => {
    set({ isInterviewActive: false })
  },

  addMessage: (message) => {
    const id = message.id || crypto.randomUUID()
    set((state) => ({
      conversationLog: [...state.conversationLog, { ...message, id, timestamp: new Date() }],
    }))
    return id
  },

  updateMessage: (id, text) => {
    set((state) => ({
      conversationLog: state.conversationLog.map((msg) =>
        msg.id === id ? { ...msg, text } : msg
      ),
    }))
  },

  setAiSpeaking: (speaking) => {
    set({ isAiSpeaking: speaking })
  },

  setUserSpeaking: (speaking) => {
    set({ isUserSpeaking: speaking })
  },

  decrementTime: () => {
    const current = get().timeRemaining
    if (current > 0) {
      set({ timeRemaining: current - 1 })
    } else {
      set({ isInterviewActive: false })
    }
  },

  reset: () => {
    set({
      selectedTopic: null,
      selectedSubtopic: null,
      selectedDuration: 15,
      selectedLevel: 'mid',
      isInterviewActive: false,
      isAiSpeaking: false,
      isUserSpeaking: false,
      conversationLog: [],
      timeRemaining: 15 * 60,
      preloadedMessage: null,
      interviewerGender: 'male',
    })
  },

  setPreloadedMessage: (message) => {
    set({ 
      preloadedMessage: message,
      interviewerGender: message?.interviewerGender || 'male'
    })
  },

  setInterviewerGender: (gender) => {
    set({ interviewerGender: gender })
  },
}))
