/**
 * Build Fast + Returning HTML from one shared shell.
 *
 *   node scripts/build-workshop-pages.mjs          # write HTML
 *   node scripts/build-workshop-pages.mjs --check  # exit 1 if committed HTML is stale
 *
 * Demo entry URLs stay the same:
 *   workbench → superagent-fast.html / superagent.html
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPages } from '../superagent/workshop/pages.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')

const shellPath = resolve(root, 'superagent/workshop/shell.html')
const shell = await readFile(shellPath, 'utf8')
const pages = await loadPages()

function render(page) {
  return shell
    .replaceAll('{{TITLE}}', page.title)
    .replaceAll('{{EXTRA_HEAD}}', page.extraHead)
    .replaceAll('{{COMPOSER_ROUTE}}', page.composerRoute)
    .replaceAll('{{SCRIPT_ROUTE}}', page.scriptRoute)
    .replaceAll('{{SCRIPT_END}}', page.scriptEnd)
}

let stale = false
for (const page of pages) {
  const html = render(page)
  const outPath = resolve(root, page.out)
  if (check) {
    const current = await readFile(outPath, 'utf8')
    if (current !== html) {
      console.error(`stale: ${page.out} — run: npm run build:workshop`)
      stale = true
    } else {
      console.log(`ok: ${page.out}`)
    }
  } else {
    await writeFile(outPath, html)
    console.log(`wrote ${page.out} (${html.length} bytes)`)
  }
}

if (check && stale) process.exit(1)
