import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { createServer as createHttpServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createServer as createNetServer } from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.cwd()
const scriptPath = fileURLToPath(import.meta.url)
const distRoot = path.join(root, 'dist')
const hostingConfigPath = path.join(root, 'vercel.json')
const source = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8')
const hostingConfig = JSON.parse(readFileSync(hostingConfigPath, 'utf8'))
const spaRewrite = hostingConfig.rewrites?.[0]
const spaRewritePattern = spaRewrite?.source ? new RegExp(`^${spaRewrite.source}$`) : null
const customerSourcePaths = [
  'src/main.jsx',
  'src/components/research/ResearchHeader.jsx',
  'src/v2/PremiumV2Router.jsx',
  'src/v2/PremiumAssetPageV2.jsx',
  'src/v2/PremiumDiscoverV2.jsx',
  'src/v2/v2RouteConfig.js',
  'src/v2/shell/PremiumV2AppShell.jsx',
  'src/v2/shell/V2RouteContext.jsx',
]

const contentTypes = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
})

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase()
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': extension === '.html' ? 'no-store' : 'public, max-age=60',
  })
  response.end(readFileSync(filePath))
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname)
  const relative = decoded.replace(/^\/+/, '')
  const target = path.resolve(distRoot, relative)
  return target.startsWith(path.resolve(distRoot)) ? target : null
}

function runStaticSimulationServer(port) {
  const server = createHttpServer((request, response) => {
    const requestUrl = new URL(request.url || '/', `http://127.0.0.1:${port}`)
    let staticPath = null
    try {
      staticPath = safeStaticPath(requestUrl.pathname)
    } catch {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Invalid request path')
      return
    }
    if (staticPath && existsSync(staticPath) && statSync(staticPath).isFile()) {
      sendFile(response, staticPath)
      return
    }
    if (spaRewritePattern?.test(requestUrl.pathname)) {
      sendFile(response, path.join(distRoot, spaRewrite.destination.replace(/^\/+/, '')))
      return
    }
    response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: 'frontend_route_not_found' }))
  })
  server.listen(port, '127.0.0.1', () => {
    process.stdout.write(`READY ${port}\n`)
  })
  const shutdown = () => server.close(() => process.exit(0))
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

function findOpenPort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close(() => resolve(address.port))
    })
  })
}

async function waitForReadiness(baseUrl, child, timeoutMs = 30_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) throw new Error(`Static simulation exited early with code ${child.exitCode}`)
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return Date.now() - startedAt
    } catch {
      // Bounded polling continues until the explicit deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 120))
  }
  throw new Error(`Static simulation did not become ready within ${timeoutMs}ms`)
}

async function terminateProcessTree(child) {
  if (!child || child.exitCode !== null) return
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
  await Promise.race([
    once(child, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ])
  if (child.exitCode === null) {
    child.kill('SIGKILL')
    await Promise.race([
      once(child, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 1_000)),
    ])
  }
  child.stdout?.destroy()
  child.stderr?.destroy()
}

async function assertDocument(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' })
  const body = await response.text()
  assert.equal(response.status, 200, `${route} must return the application document`)
  assert.match(response.headers.get('content-type') || '', /^text\/html/i)
  assert.match(body, /<div id="root"><\/div>/)
  assert.doesNotMatch(body, /404:\s*NOT_FOUND|DEPLOYMENT_NOT_FOUND|The page could not be found on Vercel/i)
  return { route, status: response.status, contentType: response.headers.get('content-type') }
}

async function assertStaticAsset(baseUrl, assetPath, expectedType) {
  const response = await fetch(`${baseUrl}${assetPath}`)
  const body = await response.text()
  assert.equal(response.status, 200, `${assetPath} must resolve as a real static file`)
  assert.match(response.headers.get('content-type') || '', expectedType)
  assert.doesNotMatch(body, /<div id="root"><\/div>/, `${assetPath} must not return index.html`)
  return { path: assetPath, status: response.status, contentType: response.headers.get('content-type') }
}

async function runFiniteSimulation() {
  assert.equal(existsSync(hostingConfigPath), true, 'vercel.json must exist in the frontend project root')
  assert.equal(existsSync(path.join(distRoot, 'index.html')), true, 'Run the production build before deployment-route simulation')

  assert.equal(hostingConfig.$schema, 'https://openapi.vercel.sh/vercel.json')
  assert.equal(hostingConfig.rewrites?.length, 1)
  assert.deepEqual(hostingConfig.rewrites[0], {
    source: '/((?!api(?:/|$)).*)',
    destination: '/index.html',
  })
  assert.equal(hostingConfig.routes, undefined, 'No conflicting low-level route owner may be introduced')
  assert.equal(hostingConfig.redirects, undefined, 'No catch-all redirect or redirect loop may be introduced')

  const packageJson = JSON.parse(source('package.json'))
  assert.equal(packageJson.scripts.build, 'vite build')
  assert.equal(packageJson.scripts['test:premium-v2-deployment-routing'], 'node scripts/test-premium-v2-deployment-routing.mjs')

  const customerCorpus = customerSourcePaths.map(source).join('\n')
  assert.doesNotMatch(customerCorpus, /Open ThesisCore V2|Open V2 Terminal|V2 Preview|Launch V2/)
  assert.doesNotMatch(customerCorpus, /https?:\/\/[^'"\s]*vercel\.app/i)
  assert.doesNotMatch(customerCorpus, /HashRouter|\/#\/terminal-v2/)
  assert.match(source('src/components/research/ResearchHeader.jsx'), /href="\/terminal-v2"[\s\S]*Research Terminal/)
  assert.match(source('src/main.jsx'), /pathname === '\/' \? <App \/> : <GlobalRouteNotFound \/>/)
  assert.match(source('src/v2/PremiumV2Router.jsx'), /invalid_asset/)
  assert.match(source('src/v2/PremiumV2Router.jsx'), /invalid_universe/)
  assert.equal((source('src/v2/PremiumV2Router.jsx').match(/<PremiumV2AppShell>/g) || []).length, 1)
  assert.equal((customerCorpus.match(/function PremiumV2AppShell/g) || []).length, 1)
  assert.equal((customerCorpus.match(/export function resolveV2Route/g) || []).length, 1)
  assert.doesNotMatch(customerCorpus, /displayedScore\s*[+\-*/]|confidence\s*[+\-*/]|verdict\s*=/)

  const indexHtml = source('dist/index.html')
  const scriptMatch = indexHtml.match(/<script[^>]+src="([^"]+\.js)"/)
  const styleMatch = indexHtml.match(/<link[^>]+href="([^"]+\.css)"/)
  assert.ok(scriptMatch?.[1], 'Production index must reference a JavaScript asset')
  assert.ok(styleMatch?.[1], 'Production index must reference a CSS asset')

  const port = await findOpenPort()
  const baseUrl = `http://127.0.0.1:${port}`
  const child = spawn(process.execPath, [scriptPath, '--serve', String(port)], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  let stderr = ''
  child.stdout.on('data', () => {})
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  try {
    const readinessMs = await waitForReadiness(baseUrl, child)
    const documentRoutes = [
      '/',
      '/terminal-v2',
      '/terminal-v2/',
      '/terminal-v2?from=legacy',
      '/terminal-v2/discover',
      '/terminal-v2/discover/rwa-hybrid-finance',
      '/terminal-v2/discover/stablecoin-yield-yield-bearing-assets',
      '/terminal-v2/asset/ethereum',
      '/terminal-v2/asset/ondo-finance',
      '/terminal-v2/asset/usd-coin',
      '/terminal-v2/asset/render-token',
      '/terminal-v2/no-such-route',
      '/unknown-global-route',
    ]
    const directRouteResults = []
    for (const route of documentRoutes) directRouteResults.push(await assertDocument(baseUrl, route))

    const refreshRouteResults = [
      await assertDocument(baseUrl, '/terminal-v2'),
      await assertDocument(baseUrl, '/terminal-v2/asset/ethereum'),
    ]
    const staticAssetResults = [
      await assertStaticAsset(baseUrl, scriptMatch[1], /javascript/i),
      await assertStaticAsset(baseUrl, styleMatch[1], /text\/css/i),
    ]
    const apiResponse = await fetch(`${baseUrl}/api/health`)
    const apiBody = await apiResponse.text()
    assert.equal(apiResponse.status, 404)
    assert.match(apiResponse.headers.get('content-type') || '', /^application\/json/i)
    assert.doesNotMatch(apiBody, /<div id="root"><\/div>/)

    return {
      status: 'PASS',
      readinessMs,
      directRouteResults,
      refreshRouteResults,
      staticAssetResults,
      invalidRouteResult: directRouteResults.find((item) => item.route === '/terminal-v2/no-such-route'),
      legacyRouteResult: directRouteResults.find((item) => item.route === '/'),
      apiRewriteBoundary: {
        status: apiResponse.status,
        contentType: apiResponse.headers.get('content-type'),
        frontendHtmlReturned: false,
      },
      processTreeTerminatedInFinally: true,
      browserQaStatus: 'PENDING',
    }
  } finally {
    await terminateProcessTree(child)
    if (stderr.trim()) process.stderr.write(stderr)
  }
}

if (process.argv[2] === '--serve') {
  const port = Number(process.argv[3])
  assert.ok(Number.isInteger(port) && port > 0, 'A valid finite simulation port is required')
  runStaticSimulationServer(port)
} else {
  const result = await runFiniteSimulation()
  console.log(JSON.stringify(result, null, 2))
}
