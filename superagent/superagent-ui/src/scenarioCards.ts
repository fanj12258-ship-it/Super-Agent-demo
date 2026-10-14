export type BusinessScene = {
  name: string
  desc: string
  priority: string
}

export type ScenarioItem = {
  id: string
  title: string
  desc: string
  status: string
  appName: string
  appDesc: string
  businesses: BusinessScene[]
}

export function createScenario(input?: {
  title?: string
  desc?: string
  appName?: string
  appDesc?: string
  businesses?: BusinessScene[]
}): ScenarioItem {
  const appName = input?.appName?.trim() || input?.title?.trim() || '新场景'
  const appDesc = input?.appDesc?.trim() || input?.desc?.trim() || ''
  return {
    id: `sc-${Date.now()}`,
    title: appName,
    desc: appDesc || '补充场景目标与交付物',
    status: '已上线',
    appName,
    appDesc,
    businesses: (input?.businesses || []).filter((item) => item.name.trim() || item.desc.trim()),
  }
}

export const DEFAULT_SCENARIOS: ScenarioItem[] = []
