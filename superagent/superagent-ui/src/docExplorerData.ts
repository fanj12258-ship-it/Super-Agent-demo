export type DocNode = {
  id: string
  name: string
  type: 'folder' | 'file'
  defaultOpen?: boolean
  children?: DocNode[]
}

export const WORKSPACE_NAME = 'executive-agent-analysis'

export const DEFAULT_DOC_TREE: DocNode[] = [
  {
    id: 'folder-sales-allocation',
    name: '销售门店分货 Agent MVP',
    type: 'folder',
    defaultOpen: true,
    children: [
      { id: 'file-sales-readme', name: 'README.md', type: 'file' },
      { id: 'folder-sales-examples', name: 'examples', type: 'folder' },
      { id: 'folder-sales-results', name: 'results', type: 'folder' },
      { id: 'folder-sales-src', name: 'src', type: 'folder' },
      { id: 'folder-sales-templates', name: 'templates', type: 'folder' },
    ],
  },
  {
    id: 'folder-root',
    name: '高管 Agent 分析',
    type: 'folder',
    defaultOpen: true,
    children: [
      { id: 'file-bg', name: '00-背景与待澄清.md', type: 'file' },
      { id: 'file-ambig', name: '01-歧义拆解.md', type: 'file' },
      { id: 'file-questions', name: '02-六问老板清单.md', type: 'file' },
      {
        id: 'folder-four',
        name: '03-四步法',
        type: 'folder',
        defaultOpen: true,
        children: [
          { id: 'file-s1', name: '步骤1-澄清对象.md', type: 'file' },
          { id: 'file-s2', name: '步骤2-对齐目的.md', type: 'file' },
          { id: 'file-s3', name: '步骤3-定义交付.md', type: 'file' },
          { id: 'file-s4', name: '步骤4-推进闭环.md', type: 'file' },
        ],
      },
      {
        id: 'folder-deliver',
        name: '交付模板',
        type: 'folder',
        defaultOpen: false,
        children: [
          { id: 'file-onepager', name: '一页结论.md', type: 'file' },
          { id: 'file-cap', name: '能力拆解表.md', type: 'file' },
          { id: 'file-skill', name: 'Skill-映射草案.md', type: 'file' },
        ],
      },
    ],
  },
]

export const DEFAULT_SELECTED_DOC_ID = 'file-bg'

export const PERSONAL_DOC_TREE: DocNode[] = [
  {
    id: 'personal-notes',
    name: '我的笔记',
    type: 'folder',
    defaultOpen: true,
    children: [
      { id: 'personal-inbox', name: '待整理.md', type: 'file' },
      { id: 'personal-meeting', name: '会议纪要.md', type: 'file' },
      { id: 'personal-todo', name: '本周待办.md', type: 'file' },
    ],
  },
  {
    id: 'personal-drafts',
    name: '草稿',
    type: 'folder',
    defaultOpen: false,
    children: [
      { id: 'personal-skill', name: 'skill-idea.md', type: 'file' },
      { id: 'personal-prompt', name: 'prompt-片段.md', type: 'file' },
    ],
  },
]

export const DEFAULT_PERSONAL_SELECTED_DOC_ID = 'personal-inbox'
