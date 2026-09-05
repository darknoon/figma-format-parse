import { join } from "node:path"

const routes: Record<string, string> = {
  "/": "index.html",
  "/demo.js": "demo.js",
  "/canvaskit.js": "node_modules/canvaskit-wasm/bin/canvaskit.js",
  "/canvaskit.wasm": "node_modules/canvaskit-wasm/bin/canvaskit.wasm",
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.PORT ?? 4317),
  fetch(request) {
    const path = routes[new URL(request.url).pathname]
    if (!path) return new Response("Not found", { status: 404 })
    return new Response(Bun.file(join(import.meta.dir, path)))
  },
})
console.log(`Backdrop blur experiment: ${server.url}`)
