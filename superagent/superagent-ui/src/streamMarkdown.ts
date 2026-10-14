/** Split markdown into stream-friendly blocks (keeps tables intact). */
export function splitMarkdownBlocks(md: string): string[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[] = []
  let buf: string[] = []
  let inTable = false

  function flush() {
    const text = buf.join('\n').trim()
    if (text) blocks.push(text)
    buf = []
  }

  let inFence = false

  for (const line of lines) {
    const trimmed = line.trim()
    const isFence = trimmed.startsWith('```')
    const isTableLine = !inFence && trimmed.startsWith('|')

    if (isFence) {
      if (inTable) {
        flush()
        inTable = false
      }
      buf.push(line)
      if (inFence) {
        flush()
        inFence = false
      } else {
        inFence = true
      }
      continue
    }

    if (inFence) {
      buf.push(line)
      continue
    }

    if (isTableLine) {
      inTable = true
      buf.push(line)
      continue
    }

    if (inTable) {
      flush()
      inTable = false
    }

    if (!trimmed) {
      flush()
      continue
    }

    buf.push(line)
  }

  flush()
  return blocks
}

export function splitPlainChunks(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}
