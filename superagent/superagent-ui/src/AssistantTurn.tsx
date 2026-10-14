import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Ellipsis,
  Files,
  List,
  RefreshCw,
  RotateCcw,
  Share,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ChatMarkdown } from './ChatMarkdown'
import type { FileChangeSet, FourStepItem, ToolCallDemo } from './demoAgentReply'
import { splitMarkdownBlocks, splitPlainChunks } from './streamMarkdown'

/**
 * Deep-thinking chrome LOCKED from colleague CUI demo:
 * https://agentos-cui-demo.vercel.app/
 * Crawl refs: workbench/tokens/refs/cui-demo.*
 */

type AssistantTurnProps = {
  thinking: string
  answer: string
  fourSteps?: FourStepItem[]
  fileChanges?: FileChangeSet
  tools?: ToolCallDemo[]
  thinkDoneLabel?: string
  thinkVariant?: 'card' | 'plain'
  onStreamTick?: () => void
  onOpenDocument?: (path: string, label: string) => void
}

const THINKING_STATUS_LABELS = [
  '思考中…',
  '斟酌中…',
  '沉思中…',
  '推演中…',
  '仔细推敲中…',
  '构思中…',
  '理清思路中…',
  '细致考量中…',
  '深入思考中…',
  '进一步思考中…',
]

function formatDuration(ms: number): string {
  const secs = Math.max(1, Math.round(ms / 1000))
  if (secs < 60) return `用时 ${secs}秒`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return s ? `用时 ${m}分钟 ${s}秒` : `用时 ${m}分钟`
}

/** Mock AgentOS avatar — locked chrome, not product brand asset */
function AgentOsAvatar() {
  return (
    <span className="ao-turn-avatar" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="8" width="16" height="11.5" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 8V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="4" r="1.1" fill="currentColor" />
        <path d="M9 13.2v1.6M15 13.2v1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function FileChangesCard({ data }: { data: FileChangeSet }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="file-change-card ao-card mt-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--ao-dt-desc)]">
            <Files size={14} strokeWidth={1.7} />
          </span>
          <div className="flex min-w-0 items-baseline gap-2">
            <div className="text-[12px] font-medium text-[var(--text-primary)]">已编辑 {data.files.length} 个文件</div>
            <div className="text-[11px] leading-none">
              <span className="text-[var(--status-live-text)]">+{data.added}</span>
              <span className="ml-1 text-[var(--text-muted)]">-{data.removed}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-[var(--text-quiet)]">
          <button type="button" title="撤销" className="ao-icon-btn">
            <RotateCcw size={13} strokeWidth={1.8} />
          </button>
          <button type="button" title="审核" className="ao-icon-btn">
            <Check size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            title={open ? '收起文件' : '展开文件'}
            onClick={() => setOpen((value) => !value)}
            className="ao-icon-btn gap-1 px-1.5 text-[11px]"
          >
            {open ? '收起' : '查看'}
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[var(--border-soft)] bg-[var(--bg-subtle)] px-3 py-1">
          {data.files.map((file) => (
            <div key={file.path} className="flex items-center justify-between gap-4 py-1.5">
              <span className="min-w-0 truncate font-mono text-[10.5px] text-[var(--text-quiet)]">{file.path}</span>
              <span className="shrink-0 font-mono text-[10.5px] tabular-nums">
                <span className="text-[var(--status-live-text)]">+{file.added}</span>
                <span className="ml-1.5 text-[var(--text-muted)]">-{file.removed}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ToolActivity({ tool, defaultOpen }: { tool: ToolCallDemo; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const running = false
  return (
    <div className="activity-block">
      <button
        type="button"
        className="activity-row"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <List size={16} strokeWidth={1.6} className="shrink-0" aria-hidden />
        <span className={running ? 'thinking-copy' : undefined}>{tool.label}</span>
        <img className="activity-hover-chevron" src="/activity-chevron.svg" width={16} height={16} alt="" />
      </button>
      <div className={`collapse${open ? ' is-open' : ''}`}>
        <div className="collapse-clip">
          <div className="collapse-content">
            {tool.command || tool.output ? (
              <div className="activity-details">
                <pre className="ao-tool-pre">
                  {tool.command ? <code className="ao-tool-cmd">{tool.command}</code> : null}
                  {tool.command && tool.output ? '\n' : null}
                  {tool.output ? <code>{tool.output}</code> : null}
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeepThoughtBlock({
  text,
  running,
  defaultOpen,
}: {
  text: string
  running: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen ?? running))
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (running) setOpen(true)
  }, [running])

  useEffect(() => {
    const el = detailsRef.current
    if (el && open) el.scrollTop = el.scrollHeight
  }, [text, open])

  return (
    <div className="activity-block stream-enter">
      <button
        type="button"
        className="activity-row deep-thought-row"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <img src="/deep-thought.svg" width={16} height={16} alt="" />
        <span className={running ? 'thinking-copy' : undefined}>深度思考</span>
        <img className="activity-hover-chevron" src="/activity-chevron.svg" width={16} height={16} alt="" />
      </button>
      <div className={`collapse${open ? ' is-open' : ''}`}>
        <div className="collapse-clip">
          <div className="collapse-content">
            <div className="activity-details deep-thought-details" ref={detailsRef}>
              <div className="deep-thought-copy">
                {text}
                {running ? <span className="ao-think-cursor" /> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssistantTurn({
  thinking,
  answer,
  fourSteps = [],
  fileChanges,
  tools = [],
  thinkDoneLabel,
  onStreamTick,
  onOpenDocument,
}: AssistantTurnProps) {
  const [thinkText, setThinkText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [phase, setPhase] = useState<'thinking' | 'answer' | 'done'>('thinking')
  const [processOpen, setProcessOpen] = useState(true)
  const [statusIdx, setStatusIdx] = useState(0)
  const [durationLabel, setDurationLabel] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const startedAt = useRef(Date.now())
  const timers = useRef<number[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)
  const stickBottom = useRef(true)
  const onTickRef = useRef(onStreamTick)
  onTickRef.current = onStreamTick

  const generating = phase === 'thinking'

  useEffect(() => {
    if (!generating) return
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % THINKING_STATUS_LABELS.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [generating])

  useEffect(() => {
    const thinkChunks = splitPlainChunks(thinking)
    const answerBlocks = splitMarkdownBlocks(answer)
    let thinkIdx = 0
    let answerIdx = 0

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timers.current.push(id)
    }

    const streamAnswer = () => {
      if (answerIdx >= answerBlocks.length) {
        setPhase('done')
        schedule(() => setShowSteps(true), 280)
        onTickRef.current?.()
        return
      }
      const block = answerBlocks[answerIdx]
      answerIdx += 1
      setAnswerText((prev) => (prev ? `${prev}\n\n${block}` : block))
      onTickRef.current?.()
      const delay = block.includes('|') ? 420 : 120 + Math.min(block.length, 280)
      schedule(streamAnswer, delay)
    }

    const streamThink = () => {
      if (thinkIdx >= thinkChunks.length) {
        setDurationLabel(thinkDoneLabel || formatDuration(Date.now() - startedAt.current))
        setPhase('answer')
        setProcessOpen(false)
        onTickRef.current?.()
        schedule(streamAnswer, 320)
        return
      }
      const chunk = thinkChunks[thinkIdx]
      thinkIdx += 1
      setThinkText((prev) => (prev ? `${prev}\n\n${chunk}` : chunk))
      onTickRef.current?.()
      schedule(streamThink, 160 + Math.random() * 140)
    }

    streamThink()

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [thinking, answer, thinkDoneLabel])

  useEffect(() => {
    const el = viewportRef.current
    if (!el || !stickBottom.current) return
    el.scrollTop = el.scrollHeight
  }, [thinkText, tools, processOpen, generating])

  const statusText = generating
    ? THINKING_STATUS_LABELS[statusIdx]
    : durationLabel || '用时 1秒'

  return (
    <div className="ao-turn">
      <div className="ao-turn-head">
        <AgentOsAvatar />
        <div className="ao-turn-head-main">
          <div className="ao-turn-name">AgentOS</div>
        </div>
      </div>

      {/* CUI process: status + deep thought + tools */}
      <div className="ao-process">
        <div className={`status-row${generating ? '' : ' done'}`}>
          <button
            type="button"
            className="ghost-btn muted small"
            aria-expanded={processOpen}
            onClick={() => setProcessOpen((v) => !v)}
          >
            {generating ? <span className="thinking-copy">{statusText}</span> : <span>{statusText}</span>}
            <span className={`status-chevron${processOpen ? '' : ' closed'}`} aria-hidden>
              <ChevronRight size={12} strokeWidth={2} />
            </span>
          </button>
        </div>

        <div className={`collapse process-collapse${processOpen ? ' is-open' : ''}`}>
          <div className="collapse-clip">
            <div className="collapse-content">
              <div
                ref={viewportRef}
                className={`process-viewport${generating ? ' is-generating' : ''}`}
                onWheel={(e) => {
                  if (e.deltaY < 0) stickBottom.current = false
                }}
                onScroll={(e) => {
                  const z = e.currentTarget
                  if (z.scrollHeight - z.scrollTop - z.clientHeight < 2) stickBottom.current = true
                }}
              >
                <div className="process-items">
                  <DeepThoughtBlock text={thinkText} running={generating} defaultOpen={generating} />
                  {tools.map((tool, i) => (
                    <ToolActivity key={`${tool.label}-${i}`} tool={tool} defaultOpen={!generating && i === 0} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {answerText ? (
        <div className="ao-answer answer-body chat-prose">
          <ChatMarkdown content={answerText} onOpenDocument={onOpenDocument} />
          {phase === 'answer' ? <span className="ao-answer-cursor" /> : null}
        </div>
      ) : null}

      {showSteps && fileChanges ? <FileChangesCard data={fileChanges} /> : null}

      {showSteps && fourSteps.length > 0 ? (
        <div className="four-steps-guide ao-card mt-4 border-t border-[var(--border)] pt-3">
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <h3 className="m-0 text-[12px] font-semibold text-[var(--text-primary)]">用四步法把这条需求跑通</h3>
            <p className="m-0 text-[10.5px] text-[var(--ao-dt-desc)]">把口头任务收成可执行链路</p>
          </div>
          <ol className="four-steps-list m-0 grid list-none gap-x-5 gap-y-2 p-0 sm:grid-cols-2">
            {fourSteps.map((item) => (
              <li key={item.step} className="grid grid-cols-[18px_1fr] gap-x-2 border-t border-[var(--border-soft)] py-2">
                <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--bg-chip)] text-[10px] font-medium text-[var(--text-soft)]">
                  {item.step}
                </span>
                <div>
                  <div className="text-[11.5px] font-semibold text-[var(--text-primary)]">{item.title}</div>
                  <p className="m-0 mt-0.5 text-[10.5px] leading-[1.5] text-[var(--text-quiet)]">{item.desc}</p>
                  <p className="m-0 mt-1 text-[10.5px] text-[var(--status-ready-text)]">{item.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {phase === 'done' ? (
        <div className="ao-turn-foot">
          <div className="ao-turn-actions">
            <button type="button" className="ao-icon-btn" title="复制" aria-label="复制">
              <Copy size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="有帮助" aria-label="有帮助">
              <ThumbsUp size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="没帮助" aria-label="没帮助">
              <ThumbsDown size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="朗读" aria-label="朗读">
              <Volume2 size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="重试" aria-label="重试">
              <RefreshCw size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="分享" aria-label="分享">
              <Share size={14} strokeWidth={1.7} />
            </button>
            <button type="button" className="ao-icon-btn" title="更多" aria-label="更多">
              <Ellipsis size={14} strokeWidth={1.7} />
            </button>
          </div>
          <div className="ao-turn-foot-meta">
            <span>共消耗 0.5</span>
            <span className="ao-turn-foot-dot" aria-hidden />
            <span>AgentOS</span>
            <span className="ao-turn-foot-dot" aria-hidden />
            <span>
              {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
