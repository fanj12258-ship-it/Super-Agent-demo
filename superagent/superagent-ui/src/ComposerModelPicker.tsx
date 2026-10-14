import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const MODELS = [
  'Auto',
  'deepseek-v4-pro',
  'deepseek-v4-pro-test',
  'MiniMax-M2.7.7',
  'grok-4.5',
  'qwen3.6-plus',
] as const

const INTENSITIES = ['Off', 'Low', 'Medium', 'High'] as const

type ModelId = (typeof MODELS)[number]
type IntensityId = (typeof INTENSITIES)[number]

export function ComposerModelPicker() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState<'model' | 'intensity' | null>(null)
  const [model, setModel] = useState<ModelId>('deepseek-v4-pro-test')
  const [intensity, setIntensity] = useState<IntensityId>('High')

  const isAuto = model === 'Auto'
  const shownIntensity = isAuto ? 'Auto' : intensity
  const summary = isAuto ? 'Auto' : `${model} ${intensity}`

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setMenu(null)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setMenu(null)
      }
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function toggleMenu(kind: 'model' | 'intensity') {
    setMenu((prev) => (prev === kind ? null : kind))
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((prev) => !prev)
          setMenu(null)
        }}
        className="inline-flex h-8 max-w-[280px] items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-[#5C5B56] hover:bg-[rgba(44,44,40,0.045)] hover:text-[#2C2C28]"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown size={16} strokeWidth={1.75} className="shrink-0 text-[#8C8B85]" />
      </button>

      {open ? (
        <div className="absolute right-0 bottom-[calc(100%+8px)] z-40 w-[292px] rounded-2xl border border-[rgba(44,44,40,0.08)] bg-white p-1.5 shadow-[0_10px_32px_rgba(44,44,40,0.1)]">
          <button
            type="button"
            onClick={() => toggleMenu('model')}
            className="flex h-11 w-full items-center justify-between gap-4 rounded-[10px] px-3 text-left hover:bg-[#F6F6F3]"
          >
            <span className="text-[14px] font-medium text-[#2C2C28]">模型</span>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-[14px] text-[#8C8B85]">
              <span className="truncate">{model}</span>
              <ChevronRight size={14} strokeWidth={1.75} />
            </span>
          </button>
          <button
            type="button"
            disabled={isAuto}
            onClick={() => toggleMenu('intensity')}
            className={`flex h-11 w-full items-center justify-between gap-4 rounded-[10px] px-3 text-left hover:bg-[#F6F6F3] ${
              isAuto ? 'pointer-events-none opacity-40' : ''
            }`}
          >
            <span className="text-[14px] font-medium text-[#2C2C28]">推理强度</span>
            <span className="inline-flex min-w-0 items-center gap-1.5 text-[14px] text-[#8C8B85]">
              <span className="truncate">{shownIntensity}</span>
              <ChevronRight size={14} strokeWidth={1.75} />
            </span>
          </button>

          {menu ? (
            <div className="absolute top-1.5 right-[calc(100%+8px)] z-[41] min-w-[228px] rounded-[14px] border border-[rgba(44,44,40,0.08)] bg-white p-1.5 shadow-[0_10px_32px_rgba(44,44,40,0.1)]">
              {(menu === 'model' ? MODELS : INTENSITIES).map((item) => {
                const selected = menu === 'model' ? item === model : item === intensity
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (menu === 'model') {
                        const next = item as ModelId
                        setModel(next)
                      } else {
                        setIntensity(item as IntensityId)
                      }
                      setMenu(null)
                    }}
                    className={`flex min-h-10 w-full items-center justify-between gap-4 rounded-lg px-3 text-left text-[14px] text-[#2C2C28] hover:bg-[#F6F6F3] ${
                      selected ? 'font-medium' : ''
                    }`}
                  >
                    <span>{item}</span>
                    {selected ? <Check size={16} strokeWidth={2} className="shrink-0" /> : null}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
