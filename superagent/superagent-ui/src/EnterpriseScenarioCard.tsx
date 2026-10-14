import { MoreHorizontal } from 'lucide-react'
import type { EnterpriseScenarioShowcase, ScenarioAgentHighlight } from './enterpriseScenarioShowcase'

function StatusTag({ label, variant }: { label: string; variant: 'app' | 'muted' }) {
  const cls =
    variant === 'app'
      ? 'bg-[#EEF2F6] text-[#5A7390]'
      : 'bg-[rgba(35,32,28,0.045)] text-[#8B8A84]'
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none ${cls}`}>
      {label}
    </span>
  )
}

function AgentTag({ label, variant }: { label: string; variant: 'muted' | 'strategy' }) {
  const cls =
    variant === 'strategy'
      ? 'bg-[#FFF3DC] text-[#B8860B]'
      : 'bg-[#EFEFEF] text-[#777777]'
  return (
    <span className={`inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${cls}`}>
      {label}
    </span>
  )
}

function HighlightDot({ tone }: { tone: ScenarioAgentHighlight['tone'] }) {
  const color =
    tone === 'orange' ? 'bg-[#F5A623]' : tone === 'red' ? 'bg-[#E5484D]' : 'bg-[#E6C200]'
  return <span className={`mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full ${color}`} aria-hidden />
}

export function EnterpriseScenarioCard({ data }: { data: EnterpriseScenarioShowcase }) {
  return (
    <article className="scene-rich-card w-full rounded-xl border border-[rgba(35,32,28,0.07)] bg-white/40 p-3 text-left">
      <div className="flex items-start gap-2">
        <h3 className="m-0 min-w-0 flex-1 text-[13px] font-medium leading-snug tracking-[0.01em] text-[#3A3A36]">
          {data.title}
        </h3>
        <button
          type="button"
          aria-label="更多操作"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#999999] hover:bg-[#F5F5F5] hover:text-[#555555]"
        >
          <MoreHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {data.statusTags.map((tag) => (
          <StatusTag key={tag.label} label={tag.label} variant={tag.variant} />
        ))}
      </div>
      <p className="scene-rich-summary mt-2.5 m-0 text-[12px] leading-[1.55] text-[#666666]">
        {data.summary}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {data.agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-[10px] border border-[rgba(35,32,28,0.07)] bg-[rgba(35,32,28,0.045)] px-2.5 py-2.5"
          >
            <p className="m-0 text-[12px] font-medium leading-snug text-[#3A3A36]">{agent.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {agent.tags.map((tag) => (
                <AgentTag key={tag.label} label={tag.label} variant={tag.variant} />
              ))}
            </div>
            <ul className="mt-2 space-y-1.5">
              {agent.highlights.map((item) => (
                <li key={item.label + item.text} className="flex gap-2 text-[11px] leading-[1.5] text-[#555555]">
                  <HighlightDot tone={item.tone} />
                  <span>
                    <strong className="font-semibold text-[#333333]">{item.label}：</strong>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  )
}
