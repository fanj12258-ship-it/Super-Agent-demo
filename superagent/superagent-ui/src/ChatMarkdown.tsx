import { markdownToHtml } from './demoAgentReply'

export function ChatMarkdown({
  content,
  onOpenDocument,
}: {
  content: string
  onOpenDocument?: (path: string, label: string) => void
}) {
  return (
    <div
      className="chat-md chat-prose text-[12px] leading-[1.68] text-[#303030]"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a.chat-cite')
        if (!anchor || !onOpenDocument) return
        event.preventDefault()
        onOpenDocument(anchor.getAttribute('href') || '', anchor.textContent?.trim() || '文档')
      }}
    />
  )
}
