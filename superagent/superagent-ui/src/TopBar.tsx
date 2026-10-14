import { ChevronDown, ChevronLeft } from 'lucide-react'
import { NewChatButton } from './ChatSessionRail'
import { SidebarTools } from './SidebarTools'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type TopTab = 'office' | 'enterprise'
type AgentId = 'chat' | 'codex'

const TABS: { id: TopTab; label: string; icon: ReactNode }[] = [
  {
    id: 'office',
    label: 'AgentOS',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M4.25 6.25H11.75C12.302 6.25 12.75 6.698 12.75 7.25V9.5C12.75 11.571 11.071 13.25 9 13.25C6.929 13.25 5.25 11.571 5.25 9.5V7.25C5.25 6.698 5.698 6.25 6.25 6.25H4.25Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M6 6.25V4.75C6 3.507 6.895 2.5 8 2.5C9.105 2.5 10 3.507 10 4.75V6.25"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'enterprise',
    label: '场景打造',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M3 6.5H13V12.25C13 12.664 12.664 13 12.25 13H3.75C3.336 13 3 12.664 3 12.25V6.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 6.5V5.25C5.5 4.007 6.507 3 7.75 3H8.25C9.493 3 10.5 4.007 10.5 5.25V6.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path d="M3 8.25H13" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
]

const AGENTS: { id: AgentId; name: string; desc: string }[] = [
  { id: 'chat', name: 'AgentOS Chat', desc: '创建、学习和探索' },
  { id: 'codex', name: 'Four steps', desc: '构建、调试和发布' },
]

function PanelToggle({
  label,
  side,
  pressed,
  onToggle,
}: {
  label: string
  side: 'left' | 'right'
  pressed: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onToggle}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-[#333333] ${
        pressed ? 'bg-[#F0F0F0] text-[#222222]' : ''
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <rect x="3" y="4" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        {side === 'left' ? (
          <path d="M7 4V14" stroke="currentColor" strokeWidth="1.2" />
        ) : (
          <path d="M11 4V14" stroke="currentColor" strokeWidth="1.2" />
        )}
      </svg>
    </button>
  )
}

export function AgentPicker({
  selectedAgent,
  onSelect,
}: {
  selectedAgent: AgentId
  onSelect: (id: AgentId) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = AGENTS.find((a) => a.id === selectedAgent) ?? AGENTS[0]

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  return (
    <div ref={rootRef} className="relative w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 border-none bg-transparent p-0 text-[14px] font-medium text-[#222222] hover:opacity-70"
      >
        {selected.name}
        <ChevronDown size={16} strokeWidth={1.75} className="text-[#666666]" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="选择 Agent"
          className="absolute left-0 top-[calc(100%+8px)] z-20 min-w-[300px] rounded-[14px] border border-[#ECECEC] bg-white p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
        >
          {AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgent
            return (
              <button
                key={agent.id}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onSelect(agent.id)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left hover:bg-[#F7F7F7]"
              >
                <div>
                  <div className="text-[14px] font-medium leading-tight text-[#222222]">{agent.name}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-[#888888]">{agent.desc}</div>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                  className={`shrink-0 text-[#222222] ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                >
                  <path
                    d="M4.5 9.75L7.5 12.75L13.5 5.25"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

type TopBarProps = {
  chatStarted: boolean
  activeTab: TopTab
  onTabChange: (tab: TopTab) => void
  focusedScenarioTitle: string | null
  onClearScenarioFocus: () => void
  selectedAgent: AgentId
  onAgentChange: (id: AgentId) => void
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  onLeftSidebarToggle: () => void
  onRightSidebarToggle: () => void
  onNewChat?: () => void
}

export function TopBar({
  chatStarted,
  activeTab,
  onTabChange,
  focusedScenarioTitle,
  onClearScenarioFocus,
  selectedAgent,
  onAgentChange,
  leftSidebarOpen,
  rightSidebarOpen,
  onLeftSidebarToggle,
  onRightSidebarToggle,
  onNewChat,
}: TopBarProps) {
  const centerMainClass =
    chatStarted || focusedScenarioTitle
      ? 'justify-start'
      : 'justify-center'

  return (
    <header className="flex h-[52px] shrink-0 items-center border-b border-[#F0F0F0] bg-white">
      <div className="flex shrink-0 items-center pl-5">
        {leftSidebarOpen ? null : (
          <SidebarTools sidebarOpen={false} onToggleSidebar={onLeftSidebarToggle} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 justify-center px-6">
        <div className={`flex w-full max-w-[900px] items-center ${centerMainClass}`}>
          {chatStarted ? (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <AgentPicker selectedAgent={selectedAgent} onSelect={onAgentChange} />
              {onNewChat ? <NewChatButton onClick={onNewChat} /> : null}
            </div>
          ) : focusedScenarioTitle ? (
            <button
              type="button"
              onClick={onClearScenarioFocus}
              className="inline-flex max-w-[min(100%,420px)] items-center gap-1 rounded-lg px-2 py-1.5 text-[14px] font-medium text-[#1A1A1A] hover:bg-[#F5F5F5]"
              title="展开 AgentOS / 场景打造"
            >
              <ChevronLeft size={16} strokeWidth={2} className="shrink-0 text-[#888888]" aria-hidden />
              <span className="truncate">{focusedScenarioTitle}</span>
            </button>
          ) : (
            <div
              className="inline-flex items-center rounded-full p-[3px]"
              style={{ backgroundColor: '#F5F5F5' }}
              role="tablist"
              aria-label="模式切换"
            >
              {TABS.map((tab) => {
                const active = tab.id === activeTab
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTabChange(tab.id)}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-white text-[#333333] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'
                        : 'bg-transparent text-[#666666] hover:text-[#333333]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-0.5 pr-5">
        <button
          type="button"
          aria-label="工作台"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#555555] transition-colors hover:bg-[#FAFAFA] hover:text-[#333333]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </button>
        <PanelToggle
          label="右侧边栏"
          side="right"
          pressed={rightSidebarOpen}
          onToggle={onRightSidebarToggle}
        />
      </div>
    </header>
  )
}

export type { AgentId, TopTab }
