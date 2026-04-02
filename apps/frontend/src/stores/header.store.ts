import { create } from 'zustand'

interface HeaderState {
  title: string
  setTitle: (title: string) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: 'Home',
  setTitle: (title) => set({ title }),
}))
