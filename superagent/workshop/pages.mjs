/**
 * Page deltas on top of workshop/shell.html
 * Shared chrome lives in shell.html — only put Fast / Returning differences here.
 */
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

export async function loadPages() {
  const fastRoute = await readFile(resolve(here, 'fragments/fast-route.html'), 'utf8')
  return [
    {
      id: 'fast',
      out: 'superagent/superagent-fast.html',
      title: 'AgentOS Chat · Fast POC',
      extraHead: '',
      composerRoute: fastRoute,
      scriptRoute: '  <script src="js/fast-route.js?v=20261022g"></script>\n',
      scriptEnd: '',
    },
    {
      id: 'returning',
      out: 'superagent/superagent.html',
      title: 'AgentOS Chat',
      extraHead: '  <link rel="stylesheet" href="css/returning.css" />\n',
      composerRoute: '',
      scriptRoute: '',
      scriptEnd: '  <script src="js/returning.js"></script>\n',
    },
  ]
}
