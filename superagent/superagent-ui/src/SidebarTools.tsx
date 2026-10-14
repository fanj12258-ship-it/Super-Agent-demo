type SidebarToolsProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

function IconPanel() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="3" y="4" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4V14" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 5h14l-5.2 6.4V17l-3.6 2v-7.6L5 5z" />
    </svg>
  )
}

export function SidebarTools({ sidebarOpen, onToggleSidebar }: SidebarToolsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label={sidebarOpen ? '收起侧边栏' : '展开侧边栏'}
        aria-pressed={sidebarOpen}
        onClick={onToggleSidebar}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555555] hover:bg-[rgba(35,32,28,0.045)] hover:text-[#3A3A36]"
      >
        <IconPanel />
      </button>
      {sidebarOpen ? (
        <>
          <button
            type="button"
            aria-label="搜索"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555555] hover:bg-[rgba(35,32,28,0.045)] hover:text-[#3A3A36]"
          >
            <IconSearch />
          </button>
          <button
            type="button"
            aria-label="筛选"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#555555] hover:bg-[rgba(35,32,28,0.045)] hover:text-[#3A3A36]"
          >
            <IconFilter />
          </button>
        </>
      ) : null}
    </div>
  )
}
