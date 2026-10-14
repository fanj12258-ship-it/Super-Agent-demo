import { useEffect, useState } from 'react'
import { DocsPanel } from './DocsPanel'
import type { ScenarioItem } from './scenarioCards'
import { ScenarioPanel } from './ScenarioPanel'
import { SidebarTools } from './SidebarTools'
import type { TopTab } from './TopBar'

type SidebarTab = 'scene' | 'docs'

export function LeftSidebarPanel({
  scenarios,
  onScenariosChange,
  selectedScenarioId,
  onSelectScenario,
  onCollapse,
  documentPath,
}: {
  scenarios: ScenarioItem[]
  onScenariosChange: (next: ScenarioItem[]) => void
  selectedScenarioId: string | null
  onSelectScenario: (id: string | null) => void
  sidebarMode?: TopTab
  onCollapse: () => void
  documentPath?: string | null
}) {
  const [tab, setTab] = useState<SidebarTab>('scene')

  useEffect(() => {
    if (documentPath) setTab('docs')
  }, [documentPath])

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F9FAFB]">
      <div className="flex shrink-0 items-center justify-between gap-2 py-2 pr-2 pl-3.5">
        <div className="text-[11px] font-normal leading-none tracking-[-0.02em] text-[#8A8A8A]">
          AgentOS<span className="ml-0.5">v1.0.0</span>
        </div>
        <SidebarTools sidebarOpen onToggleSidebar={onCollapse} />
      </div>
      <div className="sidebar-tabs shrink-0 border-b border-[rgba(35,32,28,0.07)] px-2.5 pt-2" role="tablist" aria-label="左侧边栏">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'scene'}
          className={`sidebar-tab ${tab === 'scene' ? 'is-active' : ''}`}
          onClick={() => setTab('scene')}
        >
          场景
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'docs'}
          className={`sidebar-tab ${tab === 'docs' ? 'is-active' : ''}`}
          onClick={() => setTab('docs')}
        >
          文档
        </button>
      </div>

      {tab === 'docs' ? (
        <DocsPanel selectedDocId={documentPath ? 'file-sales-readme' : undefined} />
      ) : (
        <ScenarioPanel
          scenarios={scenarios}
          onScenariosChange={onScenariosChange}
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={onSelectScenario}
        />
      )}
    </div>
  )
}
