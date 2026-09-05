import { useState } from "react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card } from "./components/ui/card"
import { NodeTypeIcon, nodeIconTypes } from "./parser/node-type-icon"
import { TypePill } from "./parser/type-pill"

function iconLabel(type: string) {
  return type === "SYMBOL" ? "Component" : type === "UNKNOWN" ? "Fallback" : type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ")
}

export default function DesignSystem() {
  const [query, setQuery] = useState("")
  const types = [...nodeIconTypes, "UNKNOWN"].filter(type => `${type} ${iconLabel(type)}`.toLowerCase().replace(/_/g, " ").includes(query.toLowerCase()))
  return (
    <main className="min-h-screen bg-background px-6 py-12 font-sans text-foreground sm:px-10">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-lg font-medium">Design system</h1>
          <Input aria-label="Filter icons" placeholder="Filter icons…" value={query} onChange={event => setQuery(event.target.value)} className="w-56" />
        </header>
        <section aria-labelledby="icons-heading" className="space-y-5">
          <h2 id="icons-heading" className="text-sm text-muted-foreground">Layer icons · 16 px</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
            {types.map(type => (
              <div key={type} title={type} className="flex min-h-12 items-center text-sm">
                <NodeTypeIcon type={type} />
                <span>{iconLabel(type)}</span>
              </div>
            ))}
          </div>
          {types.length === 0 && <p className="text-sm text-muted-foreground">No matching icons.</p>}
        </section>
        <section aria-labelledby="components-heading" className="space-y-6 border-t pt-8">
          <h2 id="components-heading" className="text-sm text-muted-foreground">Components</h2>
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
