import type { ScenarioItem } from './scenarioCards'
import { LeftSidebarPanel } from './LeftSidebarPanel'
import type { TopTab } from './TopBar'

export function LeftSidebar({
  open,
  width = 260,
  resizing = false,
  scenarios,
  onScenariosChange,
  selectedScenarioId,
  onSelectScenario,
  sidebarMode = 'office',
  onCollapse,
  documentPath,
}: {
  open: boolean
  width?: number
  resizing?: boolean
  scenarios: ScenarioItem[]
  onScenariosChange: (next: ScenarioItem[]) => void
  selectedScenarioId: string | null
  onSelectScenario: (id: string | null) => void
  sidebarMode?: TopTab
  onCollapse: () => void
  documentPath?: string | null
}) {
  return (
    <aside
      aria-hidden={!open}
      style={open ? { width } : undefined}
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-[#F9FAFB] ${
        open
          ? `border-r border-[rgba(35,32,28,0.07)] ${resizing ? '' : 'transition-[width] duration-200 ease-out'}`
          : `w-0 ${resizing ? '' : 'transition-[width] duration-200 ease-out'}`
      }`}
    >
      <div className="flex h-full min-h-0 flex-col" style={{ width }}>
        {open ? (
          <LeftSidebarPanel
            scenarios={scenarios}
            onScenariosChange={onScenariosChange}
            selectedScenarioId={selectedScenarioId}
            onSelectScenario={onSelectScenario}
            sidebarMode={sidebarMode}
            onCollapse={onCollapse}
            documentPath={documentPath}
          />
        ) : null}
      </div>
    </aside>
  )
}
