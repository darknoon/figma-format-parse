import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card } from "./components/ui/card"
import { NodeTypeIcon, nodeIconTypes } from "./parser/node-type-icon"
import { TypePill } from "./parser/type-pill"

function iconLabel(type: string) {
  return type === "SYMBOL" ? "Component" : type === "UNKNOWN" ? "Fallback" : type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")
}

export default function DesignSystem() {
  const types = [...nodeIconTypes, "UNKNOWN"]
  return (
    <main className="min-h-screen bg-background px-6 py-10 font-sans text-foreground sm:px-10">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="flex items-baseline justify-between border-b pb-6">
          <h1 className="text-2xl font-medium tracking-tight">Design system</h1>
          <span className="text-xs text-muted-foreground">Figma Format Parse</span>
        </header>
        <section aria-labelledby="icons-heading" className="space-y-5">
          <div className="flex items-baseline justify-between"><h2 id="icons-heading" className="text-sm font-medium">Layer icons</h2><span className="text-xs text-muted-foreground">16 × 16</span></div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4 lg:grid-cols-5">
            {types.map(type => (
              <div key={type} title={type} className="flex min-h-28 flex-col items-center justify-center gap-4 bg-background px-2 py-5 text-center text-xs text-muted-foreground [&>span:first-child]:mr-0">
                <NodeTypeIcon type={type} />
                <span>{iconLabel(type)}</span>
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="components-heading" className="space-y-6 border-t pt-8">
          <h2 id="components-heading" className="text-sm font-medium">Components</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <Input aria-label="Example input" placeholder="Input…" />
              <Input aria-label="Disabled input" placeholder="Disabled input" disabled />
              <div className="flex items-center gap-2"><TypePill type="PATH" /><TypePill type="NET" /><TypePill type="GLYPH" /></div>
            </div>
            <Card className="p-4 text-sm">
              <p className="mb-4 font-medium">Card</p>
              <dl className="space-y-2">
                <div className="flex justify-between"><dt className="text-muted-foreground">Fill</dt><dd className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-black" />#000000</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Opacity</dt><dd>100%</dd></div>
              </dl>
              <details className="mt-4 border-t pt-3"><summary className="cursor-pointer">Details</summary><p className="pt-3 text-muted-foreground">Disclosure content.</p></details>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
