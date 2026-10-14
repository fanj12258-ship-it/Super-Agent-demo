export type ScenarioAgentHighlight = {
  tone: 'orange' | 'red' | 'yellow'
  label: string
  text: string
}

export type ScenarioAgentItem = {
  id: string
  title: string
  tags: { label: string; variant: 'muted' | 'strategy' }[]
  highlights: ScenarioAgentHighlight[]
}

export type EnterpriseScenarioShowcase = {
  title: string
  statusTags: { label: string; variant: 'app' | 'muted' }[]
  summary: string
  agents: ScenarioAgentItem[]
}

export const ENTERPRISE_SCENARIO_SHOWCASE: EnterpriseScenarioShowcase = {
  title: 'T4 用户反馈智能分类器',
  statusTags: [
    { label: '应用', variant: 'app' },
    { label: '规划中', variant: 'muted' },
  ],
  summary:
    '当前企业用户反馈量已达 230,000+ / 月，人工分类和 SLA 压力持续上升。目标是通过 Agent 链路自动完成多渠道反馈聚合、意图识别与路由，减少一线重复分拣并缩短响应周期。',
  agents: [
    {
      id: 'agent-sync',
      title: '员工信息同步与异常检测Agent',
      tags: [
        { label: '业务', variant: 'muted' },
        { label: '战略', variant: 'strategy' },
        { label: '规划中', variant: 'muted' },
      ],
      highlights: [
        {
          tone: 'orange',
          label: '高频错误',
          text: '多渠道信息聚合，格式不统一导致同步遗漏；事后修正耗时且影响员工信任',
        },
      ],
    },
    {
      id: 'agent-payroll',
      title: '多国薪酬计算与校验Agent',
      tags: [
        { label: '业务', variant: 'muted' },
        { label: '战略', variant: 'strategy' },
        { label: '规划中', variant: 'muted' },
      ],
      highlights: [
        {
          tone: 'red',
          label: '高耗时',
          text: '72,000+ 月薪资条的规则校验纯靠人工；',
        },
        {
          tone: 'yellow',
          label: '高经验',
          text: '资深薪酬专员对 3–5 个市场熟练，新市场需每次查询核对',
        },
      ],
    },
  ],
}
