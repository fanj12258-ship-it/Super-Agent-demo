import { ArrowUp, Copy, FileText, Maximize2, PanelRight, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AssistantTurn } from './AssistantTurn'
import { ChatSessionRail } from './ChatSessionRail'
import {
  createChatSession,
  sessionTitleFromText,
  type ChatMessage,
  type ChatSession,
  type ComposerRefDraft,
} from './chatSessions'
import { getDemoTurn, pickDemoTurn } from './demoAgentReply'
import { getComposerRefClass, getFeaturesForTab, type FeatureItem } from './features'
import { BuildScenarioModal } from './BuildScenarioModal'
import { LeftSidebar } from './LeftSidebar'
import { DEFAULT_SCENARIOS, type ScenarioItem } from './scenarioCards'
import { ComposerModelPicker } from './ComposerModelPicker'
import { ComposerTokenUsage } from './ComposerTokenUsage'
import { TopBar, type AgentId, type TopTab } from './TopBar'

type OpenDocument = { path: string; label: string }

const LEFT_SIDEBAR_DEFAULT = 260
const RIGHT_SIDEBAR_DEFAULT = 640

function SidebarResizeHandle({
  side,
  onResize,
}: {
  side: 'left' | 'right'
  onResize: (clientX: number) => void
}) {
  const dragging = useRef(false)

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragging.current) return
      onResize(event.clientX)
    }
    function onUp() {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [onResize])

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={side === 'left' ? '调整左侧边栏宽度' : '调整右侧边栏宽度'}
      onPointerDown={(event) => {
        event.preventDefault()
        dragging.current = true
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      }}
      className={`group relative z-20 w-0 shrink-0 cursor-col-resize ${
        side === 'left' ? '-ml-px' : '-mr-px'
      }`}
    >
      <div className="absolute inset-y-0 -left-1.5 w-3" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-[#C9C9C9] group-active:bg-[#A8A8A8]" />
    </div>
  )
}

function DocumentPreviewPanel({
  open,
  width,
  resizing = false,
  onClose,
}: {
  open: boolean
  width: number
  resizing?: boolean
  document: OpenDocument | null
  onClose: () => void
}) {
  return (
    <aside
      aria-hidden={!open}
      style={open ? { width } : undefined}
      className={`shrink-0 overflow-hidden bg-white ${
        open
          ? `border-l border-[#E7E7E7] ${resizing ? '' : 'transition-[width] duration-200 ease-out'}`
          : `w-0 min-w-0 ${resizing ? '' : 'transition-[width] duration-200 ease-out'}`
      }`}
    >
      <div className="flex h-full min-h-0 flex-col" style={{ width }}>
        <div className="flex h-9 shrink-0 items-center border-b border-[#EEEEEE] bg-white px-1.5 shadow-[inset_0_1px_0_#D7DCE3]">
          <div className="flex h-7 w-[132px] min-w-0 items-center gap-2 rounded-md bg-[#F5F5F5] px-2">
            <FileText size={12} strokeWidth={1.6} className="shrink-0 text-[#666666]" />
            <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-[#363636]">README.md</span>
            <button
              type="button"
              aria-label="关闭文档"
              onClick={onClose}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#A4A4A4] hover:bg-[#E8E8E8] hover:text-[#333333]"
            >
              <X size={10} strokeWidth={1.7} />
            </button>
          </div>
          <button type="button" aria-label="新建标签页" className="ml-1 flex h-7 w-7 items-center justify-center rounded text-[#A0A0A0] hover:bg-[#F3F3F3]">
            <Plus size={13} strokeWidth={1.5} />
          </button>
          <div className="ml-auto flex items-center gap-0.5">
            <button type="button" aria-label="展开文档" className="flex h-7 w-7 items-center justify-center rounded text-[#9B9B9B] hover:bg-[#F3F3F3] hover:text-[#555555]">
              <Maximize2 size={11} strokeWidth={1.5} />
            </button>
            <button type="button" aria-label="收起右侧面板" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded text-[#797979] hover:bg-[#F3F3F3] hover:text-[#333333]">
              <PanelRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex h-8 shrink-0 items-center gap-1 border-b border-[#EEEEEE] px-4 text-[10px] text-[#8B8B8B]">
          <span>wo-xi</span><span>›</span><span>outputs</span><span>›</span>
          <span>sales_allocation_agent</span><span>›</span><span className="text-[#555555]">README.md</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="mx-auto w-full max-w-[720px] px-7 py-5 text-[11px] leading-[1.7] text-[#3C3C3C]">
            <div className="flex items-center justify-between gap-4">
              <h1 className="m-0 text-[16px] font-semibold tracking-[-0.02em] text-[#202020]">销售门店分货 Agent MVP</h1>
              <button type="button" aria-label="复制文档" className="flex h-7 w-7 items-center justify-center rounded-md text-[#989898] hover:bg-[#F3F3F3]">
                <Copy size={13} strokeWidth={1.6} />
              </button>
            </div>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">目标</h2>
            <p className="m-0">
              这个 MVP 用于支持“总部/仓库给销售门店分货”。它先用透明规则生成可解释的分货建议，后续可以接入对话式 Agent，让用户用自然语言调整策略、锁定门店、复算方案并导出结果。
            </p>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">输入数据</h2>
            <p className="m-0 mb-2">模板在 <code className="doc-inline-code">templates/</code> 目录：</p>
            <ul className="m-0 space-y-1 pl-5">
              <li><code>inventory.csv</code>：SKU 可分配库存、箱规、最小分货单位。</li>
              <li><code>stores.csv</code>：门店基础信息、等级、区域优先级、活动标记。</li>
              <li><code>sales.csv</code>：门店-SKU 的近 7/14/30 天销量、当前库存、在途库存。</li>
              <li><code>targets.csv</code>：门店-SKU 的目标库存或需求量。</li>
              <li><code>rules.csv</code>：保底量、封顶量、锁定量、禁配标记。</li>
            </ul>
            <p className="mt-3 mb-0">样例数据在 <code className="doc-inline-code">examples/</code> 目录。</p>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">核心逻辑</h2>
            <ol className="m-0 space-y-4 pl-5">
              <li>
                <span>计算真实缺口：</span>
                <pre className="doc-code-block">{`缺口 = max(目标库存 - 当前库存 - 在途库存, 0)`}</pre>
              </li>
              <li>
                <span>计算门店-SKU 分货权重：</span>
                <pre className="doc-code-block">{`权重 =
  近30天销量标准化分 * 0.40
+ 门店等级分         * 0.25
+ 售罄速度分         * 0.20
+ 活动门店分         * 0.15`}</pre>
              </li>
              <li>
                <span>应用规则：</span>
                <ul className="mt-2 space-y-1 pl-5">
                  <li>禁配门店不分货。</li>
                  <li>锁定量优先满足。</li>
                  <li>重点门店保底量优先满足。</li>
                  <li>建议分货不超过缺口和封顶量。</li>
                  <li>按箱规或最小分货单位取整。</li>
                  <li>库存不足时，按权重分配剩余库存。</li>
                </ul>
              </li>
            </ol>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">策略参数</h2>
            <p className="m-0 mb-2">脚本支持三种策略：</p>
            <ul className="m-0 space-y-1 pl-5">
              <li><code>balanced</code>：均衡策略，适合常规补货。</li>
              <li><code>growth</code>：冲销量策略，更偏向高销量和高等级门店。</li>
              <li><code>coverage</code>：铺货策略，更偏向让更多门店拿到基础货量。</li>
            </ul>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">使用方式</h2>
            <p className="m-0 mb-2">在当前目录运行：</p>
            <pre className="doc-code-block">{`python3 outputs/sales_allocation_agent/src/allocate.py \\
  --input-dir outputs/sales_allocation_agent/examples \\
  --output-dir outputs/sales_allocation_agent/results \\
  --strategy balanced`}</pre>
            <p className="mt-3 mb-2">输出文件：</p>
            <ul className="m-0 space-y-1 pl-5">
              <li><code>allocation_result.csv</code>：分货建议。</li>
              <li><code>allocation_alerts.csv</code>：异常提醒。</li>
            </ul>
            <p className="mt-3 mb-2">也可以运行对话式 Agent 原型：</p>
            <pre className="doc-code-block">python3 outputs/sales_allocation_agent/src/agent.py</pre>
            <p className="mt-3 mb-2">示例指令：</p>
            <pre className="doc-code-block">{`用冲销量策略分货
用铺货策略跑一版
均衡分货，输入目录用 outputs/sales_allocation_agent/examples
查看上一版结果摘要
退出`}</pre>

            <h2 className="mt-5 mb-2 text-[13px] font-semibold text-[#242424]">后续 Agent 化方向</h2>
            <p className="m-0 mb-2">可以把这个算法封装为一个工具，由 Agent 负责：</p>
            <ul className="m-0 space-y-1 pl-5">
              <li>识别上传表格字段。</li>
              <li>追问缺失字段或自动映射近似字段。</li>
              <li>根据用户口径选择策略。</li>
              <li>解释每个 SKU/门店的分货原因。</li>
              <li>支持用户说“上海 A 类店多给 20%”“新品先铺重点店”等自然语言调整。</li>
            </ul>
          </article>
        </div>
      </div>
    </aside>
  )
}

export function SuperAgentHome() {
  const [activeTopTab, setActiveTopTab] = useState<TopTab>('office')
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [homeDraft, setHomeDraft] = useState<{ message: string; composerRefs: ComposerRefDraft[] }>({
    message: '',
    composerRefs: [],
  })
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('chat')
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(LEFT_SIDEBAR_DEFAULT)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(RIGHT_SIDEBAR_DEFAULT)
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null)
  const [openDocument, setOpenDocument] = useState<OpenDocument | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioItem[]>(DEFAULT_SCENARIOS)
  const [buildModalOpen, setBuildModalOpen] = useState(false)
  const [focusedScenarioId, setFocusedScenarioId] = useState<string | null>(null)
  const composerRef = useRef<HTMLInputElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const refIdCounter = useRef(0)
  const messageIdCounter = useRef(0)
  const features = useMemo(() => getFeaturesForTab(activeTopTab), [activeTopTab])

  const conversationUi = sessions.length > 0
  const activeSession = useMemo(
    () => sessions.find((item) => item.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  )
  const messages = activeSession?.messages ?? []
  const message = conversationUi ? (activeSession?.draft.message ?? '') : homeDraft.message
  const composerRefs = conversationUi ? (activeSession?.draft.composerRefs ?? []) : homeDraft.composerRefs

  const focusedScenario = scenarios.find((item) => item.id === focusedScenarioId) ?? null

  const handleLeftResize = useCallback((clientX: number) => {
    setResizingSide('left')
    setLeftSidebarWidth(Math.max(0, clientX))
  }, [])

  const handleRightResize = useCallback((clientX: number) => {
    setResizingSide('right')
    setRightSidebarWidth(Math.max(0, window.innerWidth - clientX))
  }, [])

  useEffect(() => {
    if (!resizingSide) return
    function clearResize() {
      setResizingSide(null)
    }
    window.addEventListener('pointerup', clearResize)
    return () => window.removeEventListener('pointerup', clearResize)
  }, [resizingSide])

  function focusScenario(id: string | null) {
    setFocusedScenarioId(id)
  }

  function handleTopTabChange(tab: TopTab) {
    if (tab === 'enterprise') {
      setBuildModalOpen(true)
      return
    }
    setFocusedScenarioId(null)
    setActiveTopTab(tab)
  }

  const patchActiveSession = useCallback(
    (patch: Partial<ChatSession> | ((session: ChatSession) => ChatSession)) => {
      if (!activeSessionId) return
      setSessions((prev) =>
        prev.map((item) => {
          if (item.id !== activeSessionId) return item
          return typeof patch === 'function' ? patch(item) : { ...item, ...patch }
        }),
      )
    },
    [activeSessionId],
  )

  const setDraft = useCallback(
    (next: { message?: string; composerRefs?: ComposerRefDraft[] }) => {
      if (!conversationUi) {
        setHomeDraft((prev) => ({
          message: next.message ?? prev.message,
          composerRefs: next.composerRefs ?? prev.composerRefs,
        }))
        return
      }
      patchActiveSession((session) => ({
        ...session,
        draft: {
          message: next.message ?? session.draft.message,
          composerRefs: next.composerRefs ?? session.draft.composerRefs,
        },
      }))
    },
    [conversationUi, patchActiveSession],
  )

  function addComposerRef(label: string, tone: FeatureItem['refTone'] | undefined, icon: ReactNode) {
    if (conversationUi) return
    if (composerRefs.some((ref) => ref.label === label)) return
    refIdCounter.current += 1
    setDraft({ composerRefs: [{ id: refIdCounter.current, label, tone, icon }] })
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  function removeComposerRef(id: number) {
    setDraft({ composerRefs: composerRefs.filter((item) => item.id !== id) })
  }

  const hasComposerContent = message.trim().length > 0 || composerRefs.length > 0

  function handleNewChat() {
    const session = createChatSession()
    setSessions((prev) => [...prev, session])
    setActiveSessionId(session.id)
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  function handleSelectSession(id: string) {
    setActiveSessionId(id)
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  function handleCloseSession(id: string) {
    setSessions((prev) => {
      const next = prev.filter((item) => item.id !== id)
      if (activeSessionId === id) {
        const closedIndex = prev.findIndex((item) => item.id === id)
        const fallback = next[Math.min(closedIndex, next.length - 1)] ?? null
        setActiveSessionId(fallback?.id ?? null)
      }
      return next
    })
  }

  function handleSend() {
    if (!hasComposerContent) return
    const outgoing =
      message.trim() ||
      composerRefs
        .map((ref) => ref.label)
        .join('、')

    let sessionId = activeSessionId
    if (!sessionId) {
      const script = pickDemoTurn(outgoing)
      const session = createChatSession(sessionTitleFromText(outgoing))
      session.messages = [
        { id: (messageIdCounter.current += 1), role: 'user', content: outgoing },
        ...(script
          ? [{ id: (messageIdCounter.current += 1), role: 'assistant' as const, kind: 'turn' as const, scriptId: script.id }]
          : []),
      ]
      session.draft = { message: '', composerRefs: [] }
      setSessions([session])
      setActiveSessionId(session.id)
      setHomeDraft({ message: '', composerRefs: [] })
      requestAnimationFrame(() => composerRef.current?.focus())
      return
    }

    setSessions((prev) =>
      prev.map((item) => {
        if (item.id !== sessionId) return item
        const usedIds = item.messages
          .filter((msg): msg is Extract<ChatMessage, { role: 'assistant' }> => msg.role === 'assistant')
          .map((msg) => msg.scriptId)
        const script = pickDemoTurn(outgoing, usedIds)
        const nextMessages: ChatMessage[] = [
          ...item.messages,
          { id: (messageIdCounter.current += 1), role: 'user', content: outgoing },
        ]
        if (script) {
          nextMessages.push({
            id: (messageIdCounter.current += 1),
            role: 'assistant',
            kind: 'turn',
            scriptId: script.id,
          })
        }
        const title =
          item.title === '新对话' && item.messages.length === 0
            ? sessionTitleFromText(outgoing)
            : item.title
        return {
          ...item,
          title,
          messages: nextMessages,
          draft: { message: '', composerRefs: [] },
        }
      }),
    )
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  const scrollChatToBottom = () => {
    if (!chatScrollRef.current) return
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }

  useEffect(() => {
    if (!conversationUi) return
    scrollChatToBottom()
  }, [conversationUi, activeSessionId, messages])

  const composerCard = (
    <div
      className={`rounded-2xl border border-[rgba(44,44,40,0.1)] bg-white px-4 pb-2.5 pt-3.5 transition-colors focus-within:border-[rgba(44,44,40,0.18)] ${
        hasComposerContent ? 'has-text' : ''
      }`}
    >
      <div
        className="mb-2.5 flex min-h-9 flex-nowrap items-center gap-2 overflow-x-auto overflow-y-hidden"
        aria-label="消息输入区"
      >
        {composerRefs.length > 0 ? (
          <div className="flex shrink-0 flex-nowrap items-center gap-2" aria-label="已引用技能">
            {composerRefs.map((ref) => (
              <span
                key={ref.id}
                className={`inline-flex h-[26px] shrink-0 items-center gap-[5px] rounded-full border py-0 pl-2.5 pr-1.5 text-[12px] font-normal tracking-[0.01em] text-[#333333] ${getComposerRefClass(ref.tone as FeatureItem['refTone'] | undefined)}`}
              >
                <span className="ref-icon flex h-3.5 w-3.5 shrink-0 items-center justify-center [&_svg]:block [&_svg]:h-3.5 [&_svg]:w-3.5">
                  {ref.icon}
                </span>
                <span className="max-w-[160px] truncate font-medium text-[#2A2A2A]">{ref.label}</span>
                <button
                  type="button"
                  aria-label={`移除引用 ${ref.label}`}
                  onClick={() => removeComposerRef(ref.id)}
                  className="ml-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[#B0B0B0] transition-colors hover:bg-[#F3F3F3] hover:text-[#666666]"
                >
                  <X size={11} strokeWidth={1.75} />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <input
          ref={composerRef}
          type="text"
          value={message}
          onChange={(e) => setDraft({ message: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="随便问，或交给 Agent 完成任务…"
          aria-label="消息输入"
          autoComplete="off"
          className="h-[26px] min-w-[120px] flex-1 border-none bg-transparent p-0 text-[12.5px] leading-[26px] text-[#1A1A1A] outline-none placeholder:text-[12.5px] placeholder:text-[#B8B8B8]"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="添加"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#555555] hover:bg-[#F5F5F5]"
        >
          <Plus size={20} strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-1">
          <ComposerModelPicker />
          <ComposerTokenUsage />
          <button
            type="button"
            aria-label="发送"
            onClick={handleSend}
            className={`ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              hasComposerContent
                ? 'bg-[#2F2F2F] text-white hover:bg-[#1A1A1A]'
                : 'bg-[#ECECEC] text-[#9A9A9A] hover:bg-[#E3E3E3]'
            }`}
          >
            <ArrowUp size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <BuildScenarioModal
        open={buildModalOpen}
        scenarios={scenarios}
        onCancel={() => setBuildModalOpen(false)}
        onConfirm={(scenarioId) => {
          focusScenario(scenarioId)
          setActiveTopTab('enterprise')
          setBuildModalOpen(false)
        }}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar
          open={leftSidebarOpen}
          width={leftSidebarWidth}
          resizing={resizingSide === 'left'}
          scenarios={scenarios}
          onScenariosChange={setScenarios}
          selectedScenarioId={focusedScenarioId}
          onSelectScenario={focusScenario}
          sidebarMode={activeTopTab}
          onCollapse={() => setLeftSidebarOpen(false)}
          documentPath={openDocument?.path}
        />
        {leftSidebarOpen ? <SidebarResizeHandle side="left" onResize={handleLeftResize} /> : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar
            chatStarted={conversationUi}
            activeTab={activeTopTab}
            onTabChange={handleTopTabChange}
            focusedScenarioTitle={conversationUi ? null : focusedScenario?.title ?? null}
            onClearScenarioFocus={() => setFocusedScenarioId(null)}
            selectedAgent={selectedAgent}
            onAgentChange={setSelectedAgent}
            leftSidebarOpen={leftSidebarOpen}
            rightSidebarOpen={rightSidebarOpen}
            onLeftSidebarToggle={() => setLeftSidebarOpen((open) => !open)}
            onRightSidebarToggle={() => setRightSidebarOpen((open) => !open)}
            onNewChat={conversationUi ? handleNewChat : undefined}
          />
          {conversationUi ? (
            <div className="flex shrink-0 items-center border-b border-[#F0F0F0] bg-white">
              <div className="flex w-[56px] shrink-0 pl-5" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 justify-center px-6">
                <div className="flex w-full max-w-[900px] justify-start">
                  <ChatSessionRail
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelect={handleSelectSession}
                    onNewChat={handleNewChat}
                    onClose={handleCloseSession}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 pr-5" aria-hidden="true">
                <div className="h-9 w-[76px]" />
              </div>
            </div>
          ) : null}
          <div
            className={`flex min-h-0 flex-1 flex-col ${conversationUi ? 'overflow-hidden pb-5' : 'overflow-auto px-6'}`}
          >
            {!conversationUi ? (
              <div className="relative mx-auto flex min-h-full w-full max-w-[900px] flex-1 -translate-y-10 flex-col">
                <div className="flex flex-1 flex-col justify-end pb-5">
                  <h1 className="m-0 text-center text-[28px] font-medium leading-[1.25] tracking-[-0.03em] text-[#2C2C28]">
                    AgentOS Chat, 我帮你
                  </h1>
                </div>
                <div className="flex shrink-0 flex-col gap-2.5">
                  <div className="flex min-h-7 justify-start">
                    <div className="flex flex-wrap items-center justify-start gap-1.5">
                      {features
                        .filter(
                          (feature) =>
                            composerRefs.length === 0 ||
                            composerRefs.some((ref) => ref.label === feature.label),
                        )
                        .map((feature) => (
                          <button
                            key={feature.label}
                            type="button"
                            onClick={() => addComposerRef(feature.label, feature.refTone, feature.icon)}
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-normal transition-colors ${feature.chipClassName}`}
                          >
                            {feature.icon}
                            <span className="whitespace-nowrap">{feature.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                  {composerCard}
                </div>
                <div className="min-h-0 flex-1" aria-hidden />
              </div>
            ) : (
              <>
                <div
                  ref={chatScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto py-1"
                  aria-label="对话区域"
                >
                  <div className="mx-auto flex w-full max-w-[780px] flex-col gap-3.5 px-6">
                    {messages.map((item) =>
                      item.role === 'user' ? (
                        <div key={item.id} className="flex justify-end">
                          <div className="max-w-[min(85%,640px)] whitespace-pre-wrap break-words rounded-xl rounded-br-[4px] bg-[#F3F3F3] px-3 py-2 text-[12px] leading-[1.5] text-[#2A2A2A]">
                            {item.content}
                          </div>
                        </div>
                      ) : (
                        <div key={`${activeSessionId}-${item.id}`} className="pr-1">
                          <AssistantTurn
                            thinking={getDemoTurn(item.scriptId)?.thinking ?? ''}
                            answer={getDemoTurn(item.scriptId)?.answer ?? ''}
                            fourSteps={getDemoTurn(item.scriptId)?.fourSteps ?? []}
                            fileChanges={getDemoTurn(item.scriptId)?.fileChanges}
                            tools={getDemoTurn(item.scriptId)?.tools}
                            thinkDoneLabel={getDemoTurn(item.scriptId)?.thinkDoneLabel}
                            thinkVariant={getDemoTurn(item.scriptId)?.thinkVariant}
                            onStreamTick={scrollChatToBottom}
                            onOpenDocument={(path, label) => {
                              setOpenDocument({ path, label })
                              setLeftSidebarOpen(true)
                              setRightSidebarOpen(true)
                            }}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="mx-auto mt-auto w-full max-w-[780px] shrink-0 px-6">{composerCard}</div>
              </>
            )}
          </div>
        </div>
        {rightSidebarOpen ? <SidebarResizeHandle side="right" onResize={handleRightResize} /> : null}
        <DocumentPreviewPanel
          open={rightSidebarOpen}
          width={rightSidebarWidth}
          resizing={resizingSide === 'right'}
          document={openDocument}
          onClose={() => setRightSidebarOpen(false)}
        />
      </div>
    </div>
  )
}
