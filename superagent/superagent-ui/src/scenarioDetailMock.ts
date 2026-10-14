import type { ScenarioItem } from './scenarioCards'

export type ScenarioDetailMock = {
  status: string
  statusTone: 'amber' | 'green' | 'gray'
  goal: string
  stageLabel: string
  stageDesc: string
  todos: { done: boolean; text: string }[]
  docs: string[]
  activity: { time: string; text: string }[]
}

export function getScenarioDetailMock(item: ScenarioItem): ScenarioDetailMock {
  if (item.id === 'sc-executive') {
    return {
      status: '分析中',
      statusTone: 'amber',
      goal: '把「分析高管 agent」收成可拍板的对象、目的与交付物，并推进四步法。',
      stageLabel: '步骤 1 · 澄清对象',
      stageDesc: '先确认分析哪位高管、哪个 agent、有哪些材料。',
      todos: [
        { done: true, text: '整理口头需求与三层歧义' },
        { done: true, text: '输出六问老板清单' },
        { done: false, text: '向老板确认 agent 名称与样本' },
        { done: false, text: '对齐交付物：一页结论 vs 能力拆解' },
      ],
      docs: ['00-背景与待澄清.md', '02-六问老板清单.md', '步骤1-澄清对象.md'],
      activity: [
        { time: '今天 14:32', text: 'Agent 回复歧义拆解与四步法框架' },
        { time: '今天 11:05', text: '创建场景并关联 executive-agent-analysis' },
      ],
    }
  }

  if (item.id === 'sc-req') {
    return {
      status: '洞察中',
      statusTone: 'green',
      goal: '从业务诉求拆到可验证的需求假设与场景边界。',
      stageLabel: '需求澄清',
      stageDesc: '对齐干系人、成功标准与首期范围。',
      todos: [
        { done: true, text: '收集业务背景与约束' },
        { done: false, text: '输出需求分析 notes' },
        { done: false, text: '标记高风险假设' },
      ],
      docs: ['需求分析-notes.md'],
      activity: [{ time: '昨天 16:20', text: '从 Agentos 引用「需求分析」技能' }],
    }
  }

  if (item.id === 'sc-plan') {
    return {
      status: '草案',
      statusTone: 'gray',
      goal: '搭建全景规划 Agent 的能力地图与分期路线。',
      stageLabel: '场景打造 · 规划',
      stageDesc: '定义 Agent 边界、Skill 清单与首期 MVP。',
      todos: [
        { done: false, text: '竞品与内部能力对标' },
        { done: false, text: '全景规划提纲 v0.1' },
      ],
      docs: ['全景规划-提纲.md', 'Agent-能力规格.md'],
      activity: [{ time: '3 天前', text: '场景创建' }],
    }
  }

  return {
    status: '进行中',
    statusTone: 'amber',
    goal: item.desc || '补充场景目标、交付物与验收标准。',
    stageLabel: '初始化',
    stageDesc: '完善场景描述并选择打造路径。',
    todos: [
      { done: false, text: '填写场景目标' },
      { done: false, text: '关联文档或对话' },
    ],
    docs: [],
    activity: [{ time: '刚刚', text: '创建场景「' + item.title + '」' }],
  }
}
