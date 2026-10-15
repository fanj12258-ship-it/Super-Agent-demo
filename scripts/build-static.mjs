import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'dist')
const pages = [
  'workbench/agentos-workbench.html',
  'superagent/superagent-fast.html',
  'superagent/superagent.html',
]

// Check each page's local scripts, stylesheets, and images before publishing.
for (const page of pages) {
  const source = await readFile(resolve(root, page), 'utf8')
  for (const match of source.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi)) {
    const url = match[1].split(/[?#]/)[0]
    if (!url || /^(?:[a-z]+:|\/\/)/i.test(url)) continue
    const target = url.startsWith('/')
      ? resolve(root, `.${url}`)
      : resolve(root, dirname(page), url)
    if (!(await stat(target)).isFile()) throw new Error(`Missing asset: ${page} -> ${url}`)
  }
}

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
for (const path of [
  'index.html',
  ...pages,
  'workbench/css', 'workbench/js', 'workbench/assets',
  'superagent/css', 'superagent/js', 'superagent/assets',
]) {
  const target = resolve(output, path)
  await mkdir(dirname(target), { recursive: true })
  await cp(resolve(root, path), target, { recursive: true })
}
console.log('Built HTML app in dist; all page asset references exist.')
