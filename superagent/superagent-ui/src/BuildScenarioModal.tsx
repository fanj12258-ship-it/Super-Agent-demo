import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ScenarioItem } from './scenarioCards'

type BuildScenarioModalProps = {
  open: boolean
  scenarios: ScenarioItem[]
  onCancel: () => void
  onConfirm: (scenarioId: string) => void
}

export function BuildScenarioModal({ open, scenarios, onCancel, onConfirm }: BuildScenarioModalProps) {
  const [pickedId, setPickedId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPickedId(scenarios[0]?.id ?? null)
  }, [open, scenarios])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="build-modal-root fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="build-modal-title"
        className="relative flex max-h-[min(520px,85vh)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#F0F0F0] px-5 py-4">
          <div>
            <h2 id="build-modal-title" className="m-0 text-[16px] font-semibold tracking-[-0.01em] text-[#1A1A1A]">
              选择要打造的场景
            </h2>
            <p className="m-0 mt-1 text-[13px] leading-snug text-[#888888]">
              从已有场景中选一个，进入场景打造能力线。
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {scenarios.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E0E0E0] bg-[#FAFAFA] px-4 py-8 text-center">
              <p className="m-0 text-[13px] font-medium text-[#555555]">暂无场景</p>
              <p className="m-0 mt-1 text-[12px] leading-relaxed text-[#999999]">
                请先在左侧边栏「场景」中新建场景，再进入打造。
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="已有场景">
              {scenarios.map((item) => {
                const checked = pickedId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setPickedId(item.id)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left transition-colors ${
                      checked
                        ? 'border-[#1A1A1A] bg-[#FAFAFA] ring-1 ring-[#1A1A1A]/10'
                        : 'border-[#EBEBEB] bg-white hover:border-[#D8D8D8] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          checked ? 'border-[#1A1A1A]' : 'border-[#C8C8C8]'
                        }`}
                        aria-hidden
                      >
                        {checked ? <span className="h-2 w-2 rounded-full bg-[#1A1A1A]" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-[#1A1A1A]">{item.title}</span>
                        <span className="mt-1 block truncate text-[12px] text-[#888888]">{item.desc}</span>
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#F0F0F0] px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-[#555555] hover:bg-[#F5F5F5]"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!pickedId}
            onClick={() => pickedId && onConfirm(pickedId)}
            className="rounded-full bg-[#1A1A1A] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#333333] disabled:cursor-not-allowed disabled:bg-[#E0E0E0] disabled:text-[#999999]"
          >
            开始打造
          </button>
        </div>
      </div>
    </div>
  )
}
