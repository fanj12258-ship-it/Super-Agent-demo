import { ChevronLeft } from 'lucide-react'
import { getScenarioDetailMock } from './scenarioDetailMock'
import type { ScenarioItem } from './scenarioCards'

const STATUS_CLASS: Record<string, string> = {
  amber: 'bg-[#FFF4E0] text-[#9A6B00]',
  green: 'bg-[#E8F7EF] text-[#1F7A4D]',
  gray: 'bg-[#F0F0F0] text-[#666666]',
}

export function ScenarioDetailView({
  scenario,
  onBack,
}: {
  scenario: ScenarioItem
  onBack: () => void
}) {
  const detail = getScenarioDetailMock(scenario)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-[#EBEBEB] px-2 py-2">
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left text-[12px] font-medium text-[#666666] hover:bg-[#F0F0F0] hover:text-[#333333]"
        >
          <ChevronLeft size={14} strokeWidth={2} aria-hidden />
          全部场景
        </button>
      </div>
      <div className="scene-detail-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="m-0 text-[15px] font-semibold leading-snug text-[#1A1A1A]">{scenario.title}</h2>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[detail.statusTone]}`}
            >
              {detail.status}
            </span>
          </div>
          <p className="m-0 mt-2 text-[12px] leading-relaxed text-[#777777]">{scenario.desc}</p>
        </div>

        <section className="scene-detail-section">
          <h3 className="scene-detail-label">场景目标</h3>
          <p className="scene-detail-text">{detail.goal}</p>
        </section>

        <section className="scene-detail-section">
          <h3 className="scene-detail-label">当前阶段</h3>
          <p className="m-0 text-[13px] font-medium text-[#333333]">{detail.stageLabel}</p>
          <p className="scene-detail-text mt-1">{detail.stageDesc}</p>
        </section>

        <section className="scene-detail-section">
          <h3 className="scene-detail-label">关键待办</h3>
          <ul className="m-0 list-none p-0">
            {detail.todos.map((todo) => (
              <li key={todo.text} className="flex gap-2 py-1 text-[12px] leading-snug text-[#555555]">
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] ${
                    todo.done ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white' : 'border-[#D0D0D0] bg-white'
                  }`}
                  aria-hidden
                >
                  {todo.done ? '✓' : ''}
                </span>
                <span className={todo.done ? 'text-[#999999] line-through' : ''}>{todo.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {detail.docs.length > 0 ? (
          <section className="scene-detail-section">
            <h3 className="scene-detail-label">关联文档</h3>
            <ul className="m-0 list-none space-y-1 p-0">
              {detail.docs.map((doc) => (
                <li key={doc}>
                  <button
                    type="button"
                    className="w-full truncate rounded-md px-2 py-1.5 text-left text-[12px] text-[#444444] hover:bg-[#F0F0F0]"
                  >
                    {doc}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="scene-detail-section pb-2">
          <h3 className="scene-detail-label">最近动态</h3>
          <ul className="m-0 list-none space-y-2 p-0">
            {detail.activity.map((item) => (
              <li key={item.time + item.text} className="text-[12px] leading-snug">
                <span className="text-[#AAAAAA]">{item.time}</span>
                <p className="m-0 mt-0.5 text-[#555555]">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
