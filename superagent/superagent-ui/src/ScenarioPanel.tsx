import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CreateScenarioModal, type CreateSceneDraft } from './CreateScenarioModal'
import { createScenario, type ScenarioItem } from './scenarioCards'

function SceneTag({ label, tone = 'muted' }: { label: string; tone?: 'app' | 'win' | 'muted' }) {
  const toneClass =
    tone === 'app'
      ? 'border-[#3B82F6] text-[#3B82F6]'
      : tone === 'win'
        ? 'border-[#FECDD3] bg-[#FFF1F2] text-[#F43F5E]'
        : 'border-[#E5E5E5] text-[#888888]'
  return (
    <span className={`inline-flex h-[22px] items-center rounded-full border bg-white px-2 text-[11px] leading-none ${toneClass}`}>
      {label}
    </span>
  )
}

function SceneUnit({
  kind,
  title,
  desc,
  priority,
  menuOpen,
  onToggleMenu,
  onCreate,
  onEdit,
  onDelete,
}: {
  kind: 'app' | 'biz'
  title: string
  desc: string
  priority?: string
  menuOpen: boolean
  onToggleMenu: () => void
  onCreate: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-2">
        <h4 className="m-0 min-w-0 text-[14px] font-semibold leading-[1.4] text-[#1A1A1A]">{title || '未命名场景'}</h4>
        <button
          type="button"
          aria-label="更多操作"
          onClick={(event) => {
            event.stopPropagation()
            onToggleMenu()
          }}
          className="-mr-1 -mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#B0B0B0] tracking-[0.5px] hover:bg-[#F5F5F5] hover:text-[#555555]"
        >
          ···
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {kind === 'app' ? <SceneTag label="应用" tone="app" /> : <SceneTag label="业务" />}
        {kind === 'biz' && priority ? <SceneTag label={priority} tone={priority === '速赢' ? 'win' : 'muted'} /> : null}
        <SceneTag label="已上线" />
      </div>
      {desc ? (
        <p className="mt-2 mb-0 line-clamp-3 text-[12px] leading-[1.65] text-[#9A9A9A]">{desc}</p>
      ) : null}
      {menuOpen ? (
        <div
          className="absolute top-7 right-0 z-10 min-w-[128px] rounded-xl border border-[#F0F0F0] bg-white p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onCreate}
            className="block h-9 w-full rounded-lg px-3 text-left text-[13px] text-[#333333] hover:bg-[#F7F7F7]"
          >
            新建场景
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="block h-9 w-full rounded-lg px-3 text-left text-[13px] text-[#333333] hover:bg-[#F7F7F7]"
          >
            修改场景
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="block h-9 w-full rounded-lg px-3 text-left text-[13px] text-[#F43F5E] hover:bg-[#FFF1F2]"
          >
            删除场景
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function ScenarioPanel({
  scenarios,
  onScenariosChange,
  selectedScenarioId: _selectedScenarioId,
  onSelectScenario: _onSelectScenario,
}: {
  scenarios: ScenarioItem[]
  onScenariosChange: (next: ScenarioItem[]) => void
  selectedScenarioId: string | null
  onSelectScenario: (id: string | null) => void
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<ScenarioItem | null>(null)
  const [menuKey, setMenuKey] = useState<string | null>(null)

  useEffect(() => {
    if (!menuKey) return
    function onDocClick() {
      setMenuKey(null)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [menuKey])

  function openCreateModal() {
    setEditing(null)
    setMenuKey(null)
    setCreateOpen(true)
  }

  function openEditModal(item: ScenarioItem) {
    setEditing(item)
    setMenuKey(null)
    setCreateOpen(true)
  }

  function handleCreate(draft: CreateSceneDraft) {
    if (editing) {
      const next = { ...createScenario(draft), id: editing.id }
      onScenariosChange(scenarios.map((item) => (item.id === editing.id ? next : item)))
    } else {
      onScenariosChange([...scenarios, createScenario(draft)])
    }
    setEditing(null)
    setCreateOpen(false)
  }

  function handleDelete(id: string) {
    setMenuKey(null)
    onScenariosChange(scenarios.filter((item) => item.id !== id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CreateScenarioModal
        open={createOpen}
        mode={editing ? 'edit' : 'create'}
        initial={editing}
        onCancel={() => {
          setCreateOpen(false)
          setEditing(null)
        }}
        onConfirm={handleCreate}
      />
      <div className="scene-panel-scroll min-h-0 flex-1 overflow-y-auto p-2">
        {scenarios.length === 0 ? (
          <div className="flex w-full flex-col items-center rounded-2xl border border-[rgba(35,32,28,0.08)] bg-transparent px-3.5 pb-4 pt-5 text-center">
            <h3 className="m-0 text-[13px] font-semibold tracking-[-0.01em] text-[#1A1A1A]">暂无可用场景</h3>
            <p className="m-0 mt-2 text-[12px] font-normal leading-[1.65] text-[#9A9A9A]">
              无转型场景思路可从对话启动，由AgentOS辅助推导需求；已有明确场景则直接新建，即刻开始打造。
            </p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={openCreateModal}
                className="h-8 rounded-full border border-dashed border-[rgba(35,32,28,0.18)] bg-transparent px-4 text-[12px] font-medium whitespace-nowrap text-[#555555] hover:border-[rgba(35,32,28,0.28)] hover:bg-[rgba(35,32,28,0.045)] hover:text-[#2A2A27]"
              >
                新建场景+
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {scenarios.map((item) => (
              <article key={item.id} className="rounded-2xl border border-[#EBEBEB] bg-white px-3 py-3.5">
                <SceneUnit
                  kind="app"
                  title={item.appName || item.title}
                  desc={item.appDesc || item.desc}
                  menuOpen={menuKey === `${item.id}-app`}
                  onToggleMenu={() => setMenuKey((prev) => (prev === `${item.id}-app` ? null : `${item.id}-app`))}
                  onCreate={openCreateModal}
                  onEdit={() => openEditModal(item)}
                  onDelete={() => handleDelete(item.id)}
                />
                {item.businesses.map((biz, index) => (
                  <div key={`${item.id}-biz-${index}`} className="mt-4">
                    <SceneUnit
                      kind="biz"
                      title={biz.name}
                      desc={biz.desc}
                      priority={biz.priority}
                      menuOpen={menuKey === `${item.id}-biz-${index}`}
                      onToggleMenu={() =>
                        setMenuKey((prev) => (prev === `${item.id}-biz-${index}` ? null : `${item.id}-biz-${index}`))
                      }
                      onCreate={openCreateModal}
                      onEdit={() => openEditModal(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  </div>
                ))}
              </article>
            ))}
            <button
              type="button"
              onClick={openCreateModal}
              className="scene-add-row flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#E0E0E0] bg-transparent px-3 py-2.5 text-[12px] font-medium text-[#777777] transition-colors hover:border-[#C8C8C8] hover:bg-white hover:text-[#333333]"
            >
              <Plus size={14} strokeWidth={2} />
              新建场景+
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
