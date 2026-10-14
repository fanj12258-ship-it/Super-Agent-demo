import { useState } from 'react'
import {
  DEFAULT_DOC_TREE,
  DEFAULT_PERSONAL_SELECTED_DOC_ID,
  DEFAULT_SELECTED_DOC_ID,
  PERSONAL_DOC_TREE,
  WORKSPACE_NAME,
  type DocNode,
} from './docExplorerData'
import { ExplorerTree } from './ExplorerTree'

type DocScope = 'personal' | 'space'

const SALES_ALLOCATION_TREE: DocNode[] = [
  {
    id: 'sa-outputs',
    name: 'outputs',
    type: 'folder',
    defaultOpen: true,
    children: [
      {
        id: 'sa-agent',
        name: 'sales_allocation_agent',
        type: 'folder',
        defaultOpen: true,
        children: [
          {
            id: 'sa-runs',
            name: 'agent_runs',
            type: 'folder',
            defaultOpen: true,
            children: [
              {
                id: 'sa-latest',
                name: 'latest',
                type: 'folder',
                defaultOpen: true,
                children: [
                  { id: 'sa-alerts-latest', name: 'allocation_alerts.csv', type: 'file' },
                  { id: 'sa-result-latest', name: 'allocation_result.csv', type: 'file' },
                ],
              },
            ],
          },
          { id: 'sa-examples', name: 'examples', type: 'folder', defaultOpen: false, children: [] },
          {
            id: 'sa-results',
            name: 'results',
            type: 'folder',
            defaultOpen: true,
            children: [
              { id: 'sa-alerts', name: 'allocation_alerts.csv', type: 'file' },
              { id: 'sa-result', name: 'allocation_result.csv', type: 'file' },
            ],
          },
          {
            id: 'sa-src',
            name: 'src',
            type: 'folder',
            defaultOpen: true,
            children: [
              { id: 'sa-agent-py', name: 'agent.py', type: 'file' },
              { id: 'sa-allocate-py', name: 'allocate.py', type: 'file' },
            ],
          },
          { id: 'sa-templates', name: 'templates', type: 'folder', defaultOpen: false, children: [] },
          { id: 'sa-spec', name: 'AGENT_SPEC.md', type: 'file' },
          { id: 'sa-readme', name: 'README.md', type: 'file' },
        ],
      },
    ],
  },
  {
    id: 'sa-work',
    name: 'work',
    type: 'folder',
    defaultOpen: false,
    children: [],
  },
]

function SalesAllocationTree() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-[var(--border-soft)] px-3.5 py-2">
        <p className="m-0 truncate text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)]">wo-xi</p>
      </div>
      <ExplorerTree tree={SALES_ALLOCATION_TREE} defaultSelectedId="sa-readme" variant="doc" />
    </div>
  )
}

export function DocsPanel({ selectedDocId }: { selectedDocId?: string }) {
  const [scope, setScope] = useState<DocScope>('space')

  if (selectedDocId === 'file-sales-readme') {
    return <SalesAllocationTree />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="doc-subtabs flex shrink-0 gap-1 border-b border-[var(--border-soft)] px-2.5 py-2"
        role="tablist"
        aria-label="文档范围"
      >
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'personal'}
          className={`doc-subtab flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
            scope === 'personal'
              ? 'bg-[var(--selected)] text-[var(--text-primary)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text)]'
          }`}
          onClick={() => setScope('personal')}
        >
          个人
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={scope === 'space'}
          className={`doc-subtab flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
            scope === 'space'
              ? 'bg-[var(--selected)] text-[var(--text-primary)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover)] hover:text-[var(--text)]'
          }`}
          onClick={() => setScope('space')}
        >
          空间
        </button>
      </div>
      {scope === 'personal' ? (
        <>
          <div className="shrink-0 border-b border-[var(--border-soft)] px-3.5 py-2">
            <p className="m-0 text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)]">个人文档</p>
          </div>
          <ExplorerTree
            tree={PERSONAL_DOC_TREE}
            defaultSelectedId={DEFAULT_PERSONAL_SELECTED_DOC_ID}
            variant="doc"
          />
        </>
      ) : (
        <>
          <div className="shrink-0 border-b border-[var(--border-soft)] px-3.5 py-2">
            <p className="m-0 truncate text-[11px] font-medium tracking-[0.04em] text-[var(--text-secondary)]" title={WORKSPACE_NAME}>
              {WORKSPACE_NAME}
            </p>
          </div>
          <ExplorerTree
            tree={DEFAULT_DOC_TREE}
            defaultSelectedId={selectedDocId || DEFAULT_SELECTED_DOC_ID}
            variant="doc"
            rootLabel="SUPER AGENT"
          />
        </>
      )}
    </div>
  )
}
