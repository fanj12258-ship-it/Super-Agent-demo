import type { ReactNode } from 'react'
import type { TopTab } from './TopBar'

const CHIP_BASE =
  'h-7 border-[rgba(44,44,40,0.08)] bg-[#FAFAF8] text-[#5C5B56] hover:border-[rgba(44,44,40,0.14)] hover:bg-[#F3F3F0] hover:text-[#2C2C28] [&_svg]:text-[#8C8B85]'

const REF_TONE: Record<string, string> = {
  blue: 'border-[#D3DCE6] bg-[#EEF2F6] text-[#3D4A58] [&_.ref-icon]:text-[#5A7390]',
  violet: 'border-[#CFC2FF] bg-[#EEEAFF] [&_.ref-icon]:text-[#6B4FF0]',
  amber: 'border-[#F0D48A] bg-[#FFF3DC] [&_.ref-icon]:text-[#C88700]',
  teal: 'border-[#9DE5D8] bg-[#DFF7F2] [&_.ref-icon]:text-[#1FA892]',
  rose: 'border-[#F5B3C4] bg-[#FFE8EE] [&_.ref-icon]:text-[#E03D66]',
  slate: 'border-[#E3E8F0] bg-[#F7F9FC] [&_.ref-icon]:text-[#8A8A8A]',
}

export type FeatureItem = {
  label: string
  icon: ReactNode
  chipClassName: string
  refTone?: keyof typeof REF_TONE
}

const OFFICE_FEATURES: FeatureItem[] = [
  {
    label: '需求分析',
    chipClassName: CHIP_BASE,
    refTone: 'blue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M5.25 2.25H10.5L13.5 5.25V14.25C13.5 14.664 13.164 15 12.75 15H5.25C4.836 15 4.5 14.664 4.5 14.25V3C4.5 2.586 4.836 2.25 5.25 2.25Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7 8.25H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M7 10.75H9.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12.75" cy="11.25" r="2.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14.25 12.75L15.75 14.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: '打造skill',
    chipClassName: CHIP_BASE,
    refTone: 'violet',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M9 2.25L10.1 5.65L13.5 6.75L10.1 7.85L9 11.25L7.9 7.85L4.5 6.75L7.9 5.65L9 2.25Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M5.5 12.75L4 14.25M13.5 12.75L15 14.25M9 12V15.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: '场景研究',
    chipClassName: CHIP_BASE,
    refTone: 'teal',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M3.75 6.75L9 3.75L14.25 6.75V11.25L9 14.25L3.75 11.25V6.75Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M9 8.25V11.25" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="9" cy="7.125" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: '企业洞察',
    chipClassName: CHIP_BASE,
    refTone: 'amber',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M4.5 14.25V8.25L9 5.25L13.5 8.25V14.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M7.125 14.25V10.875H10.875V14.25" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M6 12.75L8.25 10.875L10.125 12L12.75 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const ENTERPRISE_FEATURES: FeatureItem[] = [
  {
    label: '快速POC',
    chipClassName:
      'h-7 border-[#D3DCE6] bg-[#EEF2F6] text-[#3D4A58] hover:border-[#C2CEDB] hover:bg-[#E6ECF3] hover:text-[#314050] [&_svg]:text-[#5A7390]',
    refTone: 'blue',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <circle cx="9" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 3.75V9L12.375 10.688" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: '需求整理',
    chipClassName: CHIP_BASE,
    refTone: 'violet',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M3.75 9C3.75 5.75 6.25 3.75 9 3.75C11.75 3.75 14.25 5.75 14.25 9C14.25 12.75 9 15.75 9 15.75C9 15.75 3.75 12.75 3.75 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: '知识梳理',
    chipClassName: CHIP_BASE,
    refTone: 'amber',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <path d="M4.5 6.75H13.5V13.5H4.5V6.75Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.125 9.375H10.875M7.125 11.25H10.125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: '场景本体',
    chipClassName: CHIP_BASE,
    refTone: 'teal',
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden className="text-[#B0B0B0]">
        <circle cx="5.25" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12.75" cy="5.25" r="2.25" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12.75" cy="12.75" r="2.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.125 8.063L10.875 6.188M7.125 9.938L10.875 11.813" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
]

export function getComposerRefClass(tone?: FeatureItem['refTone']) {
  return REF_TONE[tone ?? 'slate']
}

export function getFeaturesForTab(tab: TopTab): FeatureItem[] {
  return tab === 'enterprise' ? ENTERPRISE_FEATURES : OFFICE_FEATURES
}
