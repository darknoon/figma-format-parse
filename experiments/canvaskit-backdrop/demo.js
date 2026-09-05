/* global CanvasKitInit, document, window, requestAnimationFrame, cancelAnimationFrame, console */
const $ = (id) => document.getElementById(id)
const W = 520,
  H = 360,
  SCALE = 2
let running = false,
  phase = 0,
  raf = 0

try {
  const CK = await CanvasKitInit({ locateFile: (file) => `/${file}` })
  const targets = [
    { name: "GPU", surface: CK.MakeWebGLCanvasSurface($("gpu")) },
    { name: "CPU", surface: CK.MakeSWCanvasSurface($("cpu")) },
  ]
  for (const target of targets) {
    if (!target.surface)
      throw new Error(`${target.name} surface creation failed`)
    const isGPU = target.surface.reportBackendTypeIsGPU()
    $(target.name.toLowerCase() + "-status").textContent = isGPU
      ? "GPU backend confirmed"
      : "CPU backend confirmed"
    if (isGPU !== (target.name === "GPU"))
      throw new Error(
        `${target.name} unexpectedly fell back to a different backend`
      )
  }
  const paint = new CK.Paint()
  paint.setAntiAlias(true)
  const rect = CK.XYWHRect(110, 70, 300, 220)
  const rounded = CK.RRectXY(rect, 32, 32)
  const color = (r, g, b, a = 1) => paint.setColor(CK.Color(r, g, b, a))
  const drawRect = (canvas, x, y, w, h) =>
    canvas.drawRect(CK.XYWHRect(x, y, w, h), paint)

  function background(canvas, offset) {
    canvas.clear(CK.Color(25, 35, 52, 1))
    for (let y = 0; y < H; y += 16) {
      for (let x = -32; x < W + 32; x += 16) {
        const light = ((x / 16 + y / 16) & 1) === 0
        color(...(light ? [190, 210, 231] : [40, 66, 99]))
        drawRect(canvas, x + offset, y, 16, 16)
      }
    }
    color(238, 102, 110)
    canvas.drawCircle(160 + offset, 140, 64, paint)
    color(112, 156, 247)
    canvas.drawCircle(340 + offset, 230, 90, paint)
    color(243, 206, 97)
    drawRect(canvas, 255 + offset, 0, 22, H)
  }

  function render(target, sigma, offset = 0, foreground = true) {
    const canvas = target.surface.getCanvas()
    canvas.save()
    canvas.scale(SCALE, SCALE)
    background(canvas, offset)
    if (sigma > 0) {
      const blur = CK.ImageFilter.MakeBlur(
        sigma,
        sigma,
        CK.TileMode.Clamp,
        null
      )
      canvas.save()
      canvas.clipRRect(rounded, CK.ClipOp.Intersect, true)
      // The third argument filters pixels already drawn behind this layer.
      // A Paint image filter alone would instead blur this layer's own content.
      canvas.saveLayer(undefined, null, blur)
      canvas.restore()
      canvas.restore()
      blur.delete()
    }
    if (foreground) {
      color(255, 255, 255)
      drawRect(canvas, 148, 119, 132, 8)
      drawRect(canvas, 148, 140, 86, 8)
      drawRect(canvas, 148, 247, 72, 8)
      paint.setStyle(CK.PaintStyle.Stroke)
      paint.setStrokeWidth(1)
      color(255, 255, 255, 0.7)
      canvas.drawRRect(rounded, paint)
      paint.setStyle(CK.PaintStyle.Fill)
    }
    canvas.restore()
    target.surface.flush()
  }

  function pixels(target) {
    const result = target.surface.getCanvas().readPixels(0, 0, {
      width: W * SCALE,
      height: H * SCALE,
      colorType: CK.ColorType.RGBA_8888,
      alphaType: CK.AlphaType.Unpremul,
      colorSpace: CK.ColorSpace.SRGB,
    })
    if (!result) throw new Error(`${target.name}: pixel readback failed`)
    return new Uint8Array(result)
  }

  function difference(a, b, region) {
    let sum = 0,
      max = 0,
      count = 0
    const [x, y, w, h] = region.map((n) => n * SCALE)
    for (let row = y; row < y + h; row++)
      for (let col = x; col < x + w; col++) {
        const start = (row * W * SCALE + col) * 4
        for (let ch = 0; ch < 4; ch++) {
          const d = Math.abs(a[start + ch] - b[start + ch])
          sum += d
          max = Math.max(max, d)
          count++
        }
      }
    return { mean: sum / count, max }
  }

  function verify() {
    running = false
    cancelAnimationFrame(raf)
    $("toggle").textContent = "Animate background"
    const lines = [],
      report = []
    for (const target of targets) {
      render(target, 0)
      const original = pixels(target)
      render(target, 12)
      const blurred = pixels(target)
      const inside = difference(original, blurred, [150, 175, 60, 45])
      const outside = difference(original, blurred, [20, 100, 55, 140])
      const corner = difference(original, blurred, [111, 71, 6, 6])
      const front = difference(original, blurred, [149, 120, 130, 6])
      render(target, 12, 7)
      const moved = difference(blurred, pixels(target), [240, 180, 50, 45])
      render(target, 0)
      const reset = difference(original, pixels(target), [0, 0, W, H])
      const checks = [
        [
          "Backdrop changes inside the panel",
          inside.mean > 5,
          `mean Δ ${inside.mean.toFixed(2)}/255`,
        ],
        [
          "Outside pixels stay unchanged",
          outside.max === 0,
          `max Δ ${outside.max}`,
        ],
        [
          "Rounded corner excludes the backdrop",
          corner.max === 0,
          `max Δ ${corner.max}`,
        ],
        ["Foreground stays sharp", front.max === 0, `max Δ ${front.max}`],
        [
          "Blur updates with a moving background",
          moved.mean > 1,
          `mean Δ ${moved.mean.toFixed(2)}/255`,
        ],
        [
          "Zero blur restores the original",
          reset.max === 0,
          `max Δ ${reset.max}`,
        ],
      ]
      report.push({ backend: target.name, checks })
      lines.push(
        target.name +
          ": " +
          checks.filter(([, pass]) => pass).length +
          "/" +
          checks.length +
          " passed"
      )
      for (const [name, pass, detail] of checks)
        lines.push(`  ${pass ? "PASS" : "FAIL"}  ${name} (${detail})`)
      lines.push("")
    }
    window.blurReport = report
    $("results").textContent = lines.join("\n")
    $("status").textContent = report.every((r) =>
      r.checks.every(([, pass]) => pass)
    )
      ? "All 12 pixel checks passed"
      : "Some checks failed"
    draw()
  }

  function draw() {
    const sigma = Number($("sigma").value)
    $("amount").textContent = `${sigma} px`
    for (const target of targets) render(target, sigma, phase)
  }
  function animate(time) {
    if (!running) return
    phase = (time / 80) % 32
    draw()
    raf = requestAnimationFrame(animate)
  }
  $("sigma").addEventListener("input", draw)
  $("toggle").disabled = false
  $("verify").disabled = false
  $("verify").addEventListener("click", verify)
  $("toggle").addEventListener("click", () => {
    running = !running
    $("toggle").textContent = running
      ? "Pause background"
      : "Animate background"
    if (running) raf = requestAnimationFrame(animate)
    else cancelAnimationFrame(raf)
  })
  window.addEventListener(
    "pagehide",
    () => {
      running = false
      cancelAnimationFrame(raf)
      for (const target of targets) target.surface.delete()
      paint.delete()
    },
    { once: true }
  )
  verify()
} catch (error) {
  $("status").textContent = "Experiment failed"
  $("results").textContent = error.stack ?? String(error)
  console.error(error)
}
