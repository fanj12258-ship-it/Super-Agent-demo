import { ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

const PRIORITIES = ['速赢', '重要', '长期'] as const

export type CreateBusinessDraft = {
  id: number
  name: string
  desc: string
  priority: (typeof PRIORITIES)[number]
}

export type CreateSceneDraft = {
  title: string
  desc: string
  appName: string
  appDesc: string
  businesses: Array<{ name: string; desc: string; priority: string }>
}

type CreateScenarioModalProps = {
  open: boolean
  onCancel: () => void
  onConfirm: (draft: CreateSceneDraft) => void
  mode?: 'create' | 'edit'
  initial?: {
    appName?: string
    appDesc?: string
    title?: string
    desc?: string
    businesses?: Array<{ name: string; desc: string; priority: string }>
  } | null
}

function emptyBiz(id: number): CreateBusinessDraft {
  return { id, name: '', desc: '', priority: '速赢' }
}

export function CreateScenarioModal({ open, onCancel, onConfirm, mode = 'create', initial = null }: CreateScenarioModalProps) {
  const [appName, setAppName] = useState('')
  const [appDesc, setAppDesc] = useState('')
  const [businesses, setBusinesses] = useState<CreateBusinessDraft[]>([emptyBiz(1)])
  const bizId = useRef(1)
  const nameRef = useRef<HTMLInputElement>(null)
  const canSubmit = appName.trim().length > 0

  useEffect(() => {
    if (!open) return
    if (initial) {
      const next = (initial.businesses?.length ? initial.businesses : [{ name: '', desc: '', priority: '速赢' }]).map(
        (item, index) => ({
          id: index + 1,
          name: item.name || '',
          desc: item.desc || '',
          priority: (PRIORITIES.includes(item.priority as CreateBusinessDraft['priority'])
            ? item.priority
            : '速赢') as CreateBusinessDraft['priority'],
        }),
      )
      bizId.current = next.length
      setAppName(initial.appName || initial.title || '')
      setAppDesc(initial.appDesc || initial.desc || '')
      setBusinesses(next)
    } else {
      bizId.current = 1
      setAppName('')
      setAppDesc('')
      setBusinesses([emptyBiz(1)])
    }
    const timer = window.setTimeout(() => nameRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  function patchBiz(id: number, patch: Partial<CreateBusinessDraft>) {
    setBusinesses((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextTitle = appName.trim()
    if (!nextTitle) return
    onConfirm({
      title: nextTitle,
      desc: appDesc.trim() || businesses[0]?.desc.trim() || '补充场景目标与交付物',
      appName: nextTitle,
      appDesc: appDesc.trim(),
      businesses: businesses.map((item) => ({
        name: item.name.trim(),
        desc: item.desc.trim(),
        priority: item.priority,
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-scene-title"
        className="relative flex max-h-[min(860px,92vh)] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-6 pt-5">
          <div>
            <h2 id="create-scene-title" className="m-0 text-[16px] font-semibold text-[#1A1A1A]">
              {mode === 'edit' ? '修改场景' : '新建场景'}
            </h2>
            <p className="m-0 mt-2 text-[13px] leading-[1.65] text-[#8C8C8C]">
              应用类场景未来将打造为 AgentTeam，支持跨 Agentt、角色协同；业务类场景未来将打造为单体Agentt，支持更专业的智能落地
            </p>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onCancel}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#888888] hover:bg-[#F5F5F5] hover:text-[#333333]"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form id="create-scene-form" className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-2" onSubmit={handleSubmit}>
          <section className="mb-3 rounded-xl bg-[#F7F8FA] px-4 pb-3.5 pt-4">
            <h3 className="mb-3.5 text-[14px] font-semibold text-[#1A1A1A]">新应用场景</h3>
            <div className="mb-3 flex items-start gap-2.5">
              <label className="w-[108px] shrink-0 pt-2.5 text-[13px] text-[#555555]">
                <span className="mr-0.5 text-[#F04343]">*</span>应用场景名称
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  ref={nameRef}
                  value={appName}
                  onChange={(event) => setAppName(event.target.value.slice(0, 50))}
                  maxLength={50}
                  placeholder="输入应用名称"
                  autoComplete="off"
                  className="h-10 w-full rounded-[10px] border border-[#E6E6E6] bg-white px-3 pr-[52px] text-[13px] text-[#2C2C28] outline-none placeholder:text-[#C4C4C4] focus:border-[#B7C9F0]"
                />
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[12px] text-[#C0C0C0]">
                  {appName.length}/50
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <label className="w-[108px] shrink-0 pt-2.5 text-[13px] text-[#555555]">场景描述与目标</label>
              <div className="relative min-w-0 flex-1">
                <textarea
                  value={appDesc}
                  onChange={(event) => setAppDesc(event.target.value.slice(0, 500))}
                  maxLength={500}
                  rows={3}
                  placeholder="简要描述这个应用要解决的问题"
                  className="min-h-[72px] w-full resize-none rounded-[10px] border border-[#E6E6E6] bg-white px-3 pt-2.5 pb-6 text-[13px] leading-snug text-[#2C2C28] outline-none placeholder:text-[#C4C4C4] focus:border-[#B7C9F0]"
                />
                <span className="pointer-events-none absolute right-2.5 bottom-2.5 text-[12px] text-[#C0C0C0]">
                  {appDesc.length}/500
                </span>
              </div>
            </div>
          </section>

          {businesses.map((biz) => (
            <section key={biz.id} className="mb-3 rounded-xl bg-[#F7F8FA] px-4 pb-3.5 pt-4">
              <div className="mb-3.5 flex items-center justify-between">
                <h3 className="m-0 text-[14px] font-semibold text-[#1A1A1A]">新业务场景</h3>
                <button
                  type="button"
                  aria-label="删除业务场景"
                  onClick={() => setBusinesses((prev) => prev.filter((item) => item.id !== biz.id))}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#B0B0B0] hover:bg-[#EEEEEE] hover:text-[#666666]"
                >
                  <Trash2 size={15} strokeWidth={1.6} />
                </button>
              </div>
              <div className="mb-3 flex flex-wrap items-start gap-2.5">
                <label className="w-[108px] shrink-0 pt-2.5 text-[13px] text-[#555555]">
                  <span className="mr-0.5 text-[#F04343]">*</span>业务场景名称
                </label>
                <div className="relative min-w-0 flex-1">
                  <input
                    value={biz.name}
                    onChange={(event) => patchBiz(biz.id, { name: event.target.value.slice(0, 50) })}
                    maxLength={50}
                    placeholder="输入业务场景名称"
                    autoComplete="off"
                    className="h-10 w-full rounded-[10px] border border-[#E6E6E6] bg-white px-3 pr-[52px] text-[13px] text-[#2C2C28] outline-none placeholder:text-[#C4C4C4] focus:border-[#B7C9F0]"
                  />
                  <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[12px] text-[#C0C0C0]">
                    {biz.name.length}/50
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[13px] text-[#555555]">优先级</span>
                  <div className="relative">
                    <select
                      value={biz.priority}
                      onChange={(event) =>
                        patchBiz(biz.id, { priority: event.target.value as CreateBusinessDraft['priority'] })
                      }
                      className="h-10 w-[108px] appearance-none rounded-[10px] border border-[#E6E6E6] bg-white px-3 pr-7 text-[13px] text-[#2C2C28] outline-none focus:border-[#B7C9F0]"
                    >
                      {PRIORITIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[#999999]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <label className="w-[108px] shrink-0 pt-2.5 text-[13px] text-[#555555]">场景描述与目标</label>
                <div className="relative min-w-0 flex-1">
                  <textarea
                    value={biz.desc}
                    onChange={(event) => patchBiz(biz.id, { desc: event.target.value.slice(0, 500) })}
                    maxLength={500}
                    rows={3}
                    placeholder="描述该场景要解决的具体问题"
                    className="min-h-[72px] w-full resize-none rounded-[10px] border border-[#E6E6E6] bg-white px-3 pt-2.5 pb-6 text-[13px] leading-snug text-[#2C2C28] outline-none placeholder:text-[#C4C4C4] focus:border-[#B7C9F0]"
                  />
                  <span className="pointer-events-none absolute right-2.5 bottom-2.5 text-[12px] text-[#C0C0C0]">
                    {biz.desc.length}/500
                  </span>
                </div>
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={() => {
              bizId.current += 1
              setBusinesses((prev) => [...prev, emptyBiz(bizId.current)])
            }}
            className="flex h-10 w-full items-center justify-center rounded-full border border-dashed border-[#D8D8D8] bg-white text-[13px] font-medium text-[#666666] hover:border-[#C0C0C0] hover:text-[#333333]"
          >
            <Plus size={14} strokeWidth={2} className="mr-1" />
            新增业务场景
          </button>
        </form>

        <div className="flex shrink-0 justify-end gap-2 px-6 pt-2 pb-5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-full border border-[#E4E4E4] bg-white px-4 text-[13px] font-medium text-[#333333] hover:bg-[#FAFAFA]"
          >
            取消
          </button>
          <button
            type="submit"
            form="create-scene-form"
            disabled={!canSubmit}
            className="h-9 rounded-full bg-[#4C8DFF] px-4 text-[13px] font-medium text-white hover:bg-[#3B7EF0] disabled:bg-[#C9DBFF]"
          >
            {mode === 'edit' ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
