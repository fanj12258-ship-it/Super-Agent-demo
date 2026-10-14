import { ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { DocNode } from './docExplorerData'

/** LOCKED · Cursor-style file tree (AgentOS light)
 *  Indent / row / type / select / expand — see workbench/tokens/agentos-ui.md § File tree
 *  Locked: 2026-10-10
 */
function collectDefaultOpenIds(nodes: DocNode[]): Set<string> {
  const ids = new Set<string>()
  function walk(list: DocNode[]) {
    for (const node of list) {
      if (node.type === 'folder' && node.defaultOpen) ids.add(node.id)
      if (node.children) walk(node.children)
    }
  }
  walk(nodes)
  return ids
}

function extOf(name: string): string {
  const base = name.split('/').pop() || name
  if (/^readme(\.|$)/i.test(base)) return 'readme'
  const i = base.lastIndexOf('.')
  return i >= 0 ? base.slice(i + 1).toLowerCase() : ''
}

function FileTypeIcon({ name, variant }: { name: string; variant: 'doc' | 'scene' }) {
  if (variant === 'scene') {
    return (
      <span className="ft-ico ft-ico-scene" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2.5 4.5h11v8.2H2.5z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 4.5V3.2h6v1.3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </span>
    )
  }

  const ext = extOf(name)

  if (ext === 'js' || ext === 'mjs' || ext === 'cjs') {
    return (
      <span className="ft-ico ft-ico-js" aria-hidden>
        JS
      </span>
    )
  }
  if (ext === 'ts' || ext === 'tsx') {
    return (
      <span className="ft-ico ft-ico-ts" aria-hidden>
        TS
      </span>
    )
  }
  if (ext === 'html' || ext === 'htm') {
    return (
      <span className="ft-ico ft-ico-html" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 3.2 1.8 6 4 8.8M8 3.2 10.2 6 8 8.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (ext === 'py') {
    return (
      <span className="ft-ico ft-ico-py" aria-hidden>
        PY
      </span>
    )
  }
  if (ext === 'csv' || ext === 'xlsx') {
    return (
      <span className="ft-ico ft-ico-csv" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1.5" y="2" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 5h9M1.5 8h9M5 2v8" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </span>
    )
  }
  if (ext === 'readme') {
    return (
      <span className="ft-ico ft-ico-readme" aria-hidden>
        i
      </span>
    )
  }
  if (ext === 'md' || ext === 'mdc' || ext === 'markdown') {
    return (
      <span className="ft-ico ft-ico-md" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.2 2.4h7.6v7.2H2.2z" stroke="currentColor" strokeWidth="1.15" />
          <path d="M4 7.4V4.6l1.4 1.6L6.8 4.6v2.8" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  }
  if (ext === 'json') {
    return (
      <span className="ft-ico ft-ico-json" aria-hidden>
        {'{}'}
      </span>
    )
  }
  if (ext === 'css') {
    return (
      <span className="ft-ico ft-ico-css" aria-hidden>
        #
      </span>
    )
  }

  return (
    <span className="ft-ico ft-ico-file" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 1.8h4.2L9 3.6v6.6H3V1.8Z" stroke="currentColor" strokeWidth="1.15" />
        <path d="M7.2 1.8V3.7H9" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    </span>
  )
}

export function ExplorerTree({
  tree,
  defaultSelectedId,
  variant = 'doc',
  rootLabel,
}: {
  tree: DocNode[]
  defaultSelectedId: string
  variant?: 'doc' | 'scene'
  /** Optional Cursor-style root row above the tree */
  rootLabel?: string
}) {
  const [openFolders, setOpenFolders] = useState(() => collectDefaultOpenIds(tree))
  const [selectedId, setSelectedId] = useState(defaultSelectedId)

  const rows = useMemo(() => {
    const result: { node: DocNode; depth: number }[] = []
    function walk(nodes: DocNode[], depth: number) {
      for (const node of nodes) {
        result.push({ node, depth })
        if (node.type === 'folder' && node.children && openFolders.has(node.id)) {
          walk(node.children, depth + 1)
        }
      }
    }
    walk(tree, 0)
    return result
  }, [tree, openFolders])

  function toggleFolder(id: string) {
    setOpenFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  let rootRow: ReactNode = null
  if (rootLabel) {
    rootRow = (
      <div className="ft-row ft-row-root" style={{ paddingLeft: 'var(--ft-pad-x)' }}>
        <span className="ft-chev is-open" aria-hidden>
          <ChevronRight size={14} strokeWidth={2} />
        </span>
        <span className="ft-label ft-label-root">{rootLabel}</span>
      </div>
    )
  }

  return (
    <div className="ft-tree" role="tree">
      {rootRow}
      {rows.map(({ node, depth }) => {
        const isFolder = node.type === 'folder'
        const isOpen = isFolder && openFolders.has(node.id)
        const isSelected = selectedId === node.id
        const pad = `calc(var(--ft-pad-x) + ${depth} * var(--ft-indent))`

        return (
          <button
            key={node.id}
            type="button"
            role="treeitem"
            aria-expanded={isFolder ? isOpen : undefined}
            aria-selected={isSelected}
            onClick={() => {
              if (isFolder) toggleFolder(node.id)
              setSelectedId(node.id)
            }}
            className={`ft-row${isSelected ? ' is-selected' : ''}${isFolder ? ' is-folder' : ' is-file'}`}
            style={{ paddingLeft: pad }}
          >
            <span className={`ft-chev${isFolder ? '' : ' is-leaf'}${isOpen ? ' is-open' : ''}`} aria-hidden>
              {isFolder ? <ChevronRight size={14} strokeWidth={2} /> : null}
            </span>
            {!isFolder ? <FileTypeIcon name={node.name} variant={variant} /> : null}
            <span className="ft-label">{node.name}</span>
          </button>
        )
      })}
    </div>
  )
}
