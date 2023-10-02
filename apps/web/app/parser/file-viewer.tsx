'use client'
import * as React from 'react'

import { Schema, prettyPrintSchema } from 'kiwi-schema'
import {
  FigmaMeta,
  Message,
  ParsedFigmaArchive,
  ParsedFigmaHTML,
} from 'fig-kiwi'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GUID, NodeChange } from 'fig-kiwi/schema-defs'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TypePill } from './type-pill'
import { ScrollArea } from '@/components/ui/scroll-area'

type FileContents = ParsedFigmaArchive | ParsedFigmaHTML

type NavSelection =
  | { type: 'layer'; guid: GUID }
  | { type: 'meta' }
  | { type: 'schema' }

export function FigmaFile({ data }: { data: FileContents }) {
  const [navSelection, setNavSelection] = useState<NavSelection>({
    type: 'meta',
  })
  const node =
    navSelection.type == 'layer' && selectedNode(data.message, navSelection)
  return (
    <div className="flex flex-row h-full min-h-screen">
      <ScrollArea className="max-w-sm h-full min-h-screen border-r-gray-200 border-r p-2">
        <Sidebar
          message={data.message}
          navSelection={navSelection}
          setNavSelection={setNavSelection}
        />
      </ScrollArea>
      <ScrollArea className="flex-1 h-full p-8">
        {navSelection.type == 'meta' && 'meta' in data && (
          <FigmaMeta meta={data.meta} />
        )}
        {navSelection.type == 'schema' && <Schema schema={data.schema} />}
        {node && <Content node={node} />}
      </ScrollArea>
    </div>
  )
}

function FigmaMeta({ meta }: { meta: FigmaMeta }) {
  return (
    <Card>
      <CardHeader>
        <h2>Paste Info</h2>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="fileKey">File Key</Label>
          <Input id="fileKey" value={meta.fileKey} readOnly />
        </div>
        <div>
          <Label htmlFor="dataType">Data Type</Label>
          <Input id="dataType" value={meta.dataType} readOnly />
        </div>
      </CardContent>
    </Card>
  )
}

function selectedNode(message: Message, navSelection: NavSelection) {
  if (navSelection.type === 'layer') {
    return message.nodeChanges?.find(
      (n) =>
        n.guid &&
        navSelection.guid &&
        formatGUID(n.guid) === formatGUID(navSelection.guid)
    )
  }
}

function Sidebar({
  message,
  navSelection,
  setNavSelection,
}: {
  message: Message
  navSelection: NavSelection
  setNavSelection: (navSelection: NavSelection) => void
}) {
  return (
    <div className="min-h-screen">
      <h2>Metadata</h2>
      <ul>
        <SidebarItem
          onClick={() => setNavSelection({ type: 'meta' })}
          selected={navSelection.type === 'meta'}
        >
          Meta
        </SidebarItem>
        <SidebarItem
          onClick={() => setNavSelection({ type: 'schema' })}
          selected={navSelection.type === 'schema'}
        >
          Schema
        </SidebarItem>
      </ul>
      <h2>Nodes</h2>
      <ol className="flex flex-col space-y-1">
        {message.nodeChanges?.map((n) => {
          if (!n.guid) return null
          const { guid, name, type } = n
          return (
            <SidebarItem
              key={formatGUID(guid)}
              selected={
                navSelection.type === 'layer' &&
                formatGUID(navSelection.guid) === formatGUID(guid)
              }
              onClick={() => setNavSelection({ type: 'layer', guid })}
              className="flex flex-row space-x-2"
            >
              <TypePill type={type || '?'} />
              {name || 'no name'}
            </SidebarItem>
          )
        })}
      </ol>
    </div>
  )
}

const SidebarItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    selected: boolean
  }
>(({ className, selected, children, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(
        className,
        'rounded-sm p-1 pl-2 pr-3',
        'hover:bg-gray-200 dark:hover:bg-gray-800',
        selected &&
          'bg-gray-200 dark:bg-gray-800 text-black dark: text-grey-200'
      )}
      {...props}
    >
      {children}
    </li>
  )
})

SidebarItem.displayName = 'SidebarItem'

const CodeView = React.forwardRef<
  HTMLPreElement,
  React.HTMLAttributes<HTMLPreElement>
>(({ className, ...props }, ref) => (
  <pre
    ref={ref}
    className={cn(
      'text-xs bg-gray-100 dark:bg-gray-800 rounded-md p-2',
      className
    )}
    {...props}
  />
))
CodeView.displayName = 'CodeView'

function Schema({ schema }: { schema: Schema }) {
  return (
    <div>
      <CodeView>{prettyPrintSchema(schema)}</CodeView>
    </div>
  )
}

function formatGUID(guid: GUID) {
  return `${guid.localID}:${guid.sessionID}`
}

function Content({ node }: { node: NodeChange }) {
  return <CodeView>{JSON.stringify(node, null, 2)}</CodeView>
}
