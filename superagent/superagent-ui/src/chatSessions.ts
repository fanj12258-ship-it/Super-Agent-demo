import type { ReactNode } from 'react'

export type ComposerRefDraft = {
  id: number
  label: string
  tone?: string
  icon: ReactNode
}

export type ChatMessage =
  | { id: number; role: 'user'; content: string }
  | { id: number; role: 'assistant'; kind: 'turn'; scriptId: string }

export type ChatSession = {
  id: string
  title: string
  messages: ChatMessage[]
  draft: {
    message: string
    composerRefs: ComposerRefDraft[]
  }
}

export function createChatSession(title = '新对话'): ChatSession {
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    messages: [],
    draft: { message: '', composerRefs: [] },
  }
}

export function sessionTitleFromText(text: string, fallback = '新对话'): string {
  const trimmed = text.trim()
  if (!trimmed) return fallback
  return trimmed.length > 18 ? `${trimmed.slice(0, 18)}…` : trimmed
}
