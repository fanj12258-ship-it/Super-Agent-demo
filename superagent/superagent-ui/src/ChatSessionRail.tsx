import { Plus, X } from 'lucide-react'
import type { ChatSession } from './chatSessions'

export function NewChatButton({ onClick, className = '' }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D0D0D0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:border-[#B8B8B8] hover:bg-[#FAFAFA] ${className}`}
    >
      <Plus size={14} strokeWidth={2.25} className="text-[#333333]" aria-hidden />
      新对话
    </button>
  )
}

export function ChatSessionRail({
  sessions,
  activeSessionId,
  onSelect,
  onNewChat,
  onClose,
}: {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onClose: (id: string) => void
}) {
  if (sessions.length === 0) return null

  return (
    <div className="chat-session-rail flex min-h-9 w-full items-center gap-2 py-1">
      <NewChatButton onClick={onNewChat} />
      <div
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
        role="tablist"
        aria-label="对话列表"
      >
        {sessions.map((session) => {
          const active = session.id === activeSessionId
          return (
            <div
              key={session.id}
              className={`inline-flex max-w-[200px] shrink-0 items-center rounded-full ${
                active ? 'bg-[#F0F0F0]' : 'bg-transparent hover:bg-[#F7F7F7]'
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                title={session.title}
                onClick={() => onSelect(session.id)}
                className={`min-w-0 flex-1 truncate py-1.5 pl-3 pr-1 text-[12px] font-medium ${
                  active ? 'text-[#1A1A1A]' : 'text-[#666666] hover:text-[#333333]'
                }`}
              >
                {session.title}
              </button>
              <button
                type="button"
                aria-label={`关闭并删除对话 ${session.title}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onClose(session.id)
                }}
                className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#999999] hover:bg-[#E8E8E8] hover:text-[#555555]"
              >
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
