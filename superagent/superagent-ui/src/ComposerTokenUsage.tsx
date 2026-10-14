import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const USED_RATIO = 0.226
const CIRCUMFERENCE = 2 * Math.PI * 7.2

const ITEMS = [
  { label: 'System Prompt', value: '~4.0K', color: '#5B8DEF', bar: '2%' },
  { label: 'Tools', value: '~10.6K', color: '#3ECF8E', bar: '5.3%' },
  { label: 'Conversation', value: '~29.0K', color: '#F5A623', bar: '14.5%' },
  { label: 'MCP', value: '~77', color: '#7B61FF', bar: '0.4%' },
  { label: 'Skills', value: '~1.4K', color: '#F06785', bar: '0.7%' },
]

export function ComposerTokenUsage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="上下文用量"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[#B4B3AD] hover:bg-[rgba(44,44,40,0.045)] ${
          open ? 'bg-[rgba(44,44,40,0.045)]' : ''
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" className="-rotate-90" aria-hidden>
          <circle cx="10" cy="10" r="7.2" fill="none" stroke="#E6E6E1" strokeWidth="2.2" />
          <circle
            cx="10"
            cy="10"
            r="7.2"
            fill="none"
            stroke="#C8C7C1"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE * USED_RATIO} ${CIRCUMFERENCE}`}
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 bottom-[calc(100%+10px)] z-[42] w-[320px] rounded-[18px] border border-[rgba(44,44,40,0.08)] bg-white px-[18px] pb-4 pt-[18px] shadow-[0_12px_36px_rgba(44,44,40,0.12)]">
          <div className="mb-3.5 flex items-center justify-between">
            <h3 className="m-0 text-[14px] font-medium text-[#2C2C28]">上下文用量</h3>
            <button
              type="button"
              aria-label="关闭"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#B4B3AD] hover:bg-[#F5F5F2] hover:text-[#5C5B56]"
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
          <div className="mb-2.5 flex items-baseline gap-2">
            <span className="text-[22px] font-bold tracking-[-0.03em] text-[#111111]">22.6%</span>
            <span className="text-[13px] text-[#8C8B85]">已使用 45.1K/200.0K</span>
          </div>
          <div className="mb-4 flex h-1.5 overflow-hidden rounded-full bg-[#F0F0EC]" aria-hidden>
            {ITEMS.map((item) => (
              <span key={item.label} className="block h-full" style={{ width: item.bar, background: item.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {ITEMS.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-[13px]">
                <span className="inline-flex items-center gap-2 text-[#3A3A36]">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
                  {item.label}
                </span>
                <span className="text-[#8C8B85]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
