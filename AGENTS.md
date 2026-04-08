# AI Agent Instructions — MSPBots React Project

> This file is auto-managed by `mspack update`. Do not modify manually.

## Core Principle

**All UI must be built with `@mspbots/ui` components.** This project ships a complete component library — use it.

## Mandatory Rules

1. **Import UI from `@mspbots/ui` only.** Never use raw HTML (`<button>`, `<input>`, `<select>`, `<table>`, `<dialog>`, `<textarea>`) when a component exists.
2. **Compose, don't create.** Build complex UI by combining existing components. Do not build from scratch.
3. **Read `@mspbots/ui` README** (`node_modules/@mspbots/ui/README.md`) for the full component catalog and usage rules.
4. **API calls use `$fetch` / `$sse` / `$ws`** from `@mspbots/fetch`. Never use raw `fetch()`.
5. **Icons from `lucide-react` only.** Do not install other icon libraries.
6. **Class merging with `cn()`** from `@mspbots/ui`. Do not use manual string concat or install clsx/classnames.
7. **Scrollable areas use `ScrollArea`** from `@mspbots/ui`. Avoid `overflow-auto`/`overflow-scroll`.
8. **Read the target package README** (`node_modules/<pkg>/README.md`) before using any API.

## Component-to-HTML Mapping (never use left column)

| Instead of raw HTML | Use from `@mspbots/ui` |
|---|---|
| `<button>` | `Button` (variants: default/secondary/outline/ghost/link/destructive) |
| `<input>` | `Input`, or `InputGroup` with `InputGroupInput` for addons |
| `<textarea>` | `Textarea`, or `InputGroup` with `InputGroupTextarea` |
| `<select>` / `<option>` | `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` |
| `<input type="checkbox">` | `Checkbox` |
| `<input type="radio">` | `RadioGroup` + `RadioGroupItem` |
| `<table>` | `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableHead` + `TableCell` |
| `<dialog>` | `Dialog` or `AlertDialog` or `Sheet` or `Drawer` |
| `<label>` | `Label` |
| `<progress>` | `Progress` |
| `<details>/<summary>` | `Collapsible` or `Accordion` |
| `<nav>` breadcrumbs | `Breadcrumb` + sub-components |
| `<div role="alert">` | `Alert` + `AlertTitle` + `AlertDescription` |
| `<div role="tooltip">` | `Tooltip` + `TooltipTrigger` + `TooltipContent` |
| `<div>` dropdown menu | `DropdownMenu` + sub-components |
| `<div>` right-click menu | `ContextMenu` + sub-components |
| `<div>` card | `Card` + `CardHeader` + `CardContent` + `CardFooter` |
| `<div>` tabs | `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` |
| `<div>` separator/divider | `Separator` |
| `<div>` loading spinner | `Spinner` |
| `<div>` skeleton placeholder | `Skeleton` |
| `<div>` empty state | `Empty` + `EmptyHeader` + `EmptyTitle` + `EmptyDescription` |
| `<kbd>` | `Kbd`, `KbdGroup` |
| `<div>` avatar | `Avatar` + `AvatarImage` + `AvatarFallback` |
| custom scrollbar / `overflow-auto` | `ScrollArea` |

## Common Composition Patterns

### Form with validation
```tsx
import { Card, CardHeader, CardTitle, CardContent, Button, Field, FieldLabel, FieldContent, FieldDescription, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@mspbots/ui'

<Card>
  <CardHeader><CardTitle>Create Item</CardTitle></CardHeader>
  <CardContent className="space-y-4">
    <Field>
      <FieldLabel>Name</FieldLabel>
      <FieldContent><Input placeholder="Enter name" /></FieldContent>
      <FieldDescription>Required field</FieldDescription>
    </Field>
    <Field>
      <FieldLabel>Category</FieldLabel>
      <FieldContent>
        <Select><SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
          <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
        </Select>
      </FieldContent>
    </Field>
    <Button>Submit</Button>
  </CardContent>
</Card>
```

### Data list with actions
```tsx
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@mspbots/ui'
import { MoreHorizontal } from 'lucide-react'

<Card>
  <CardHeader><CardTitle>Users</CardTitle></CardHeader>
  <CardContent className="p-0">
    <Table>
      <TableHeader><TableRow>
        <TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead />
      </TableRow></TableHeader>
      <TableBody>{users.map(u => (
        <TableRow key={u.id}>
          <TableCell>{u.name}</TableCell>
          <TableCell><Badge variant={u.active ? 'default' : 'secondary'}>{u.status}</Badge></TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  </CardContent>
</Card>
```

### Settings page
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Field, FieldLabel, FieldDescription, FieldContent, Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Separator, Button } from '@mspbots/ui'

<Card>
  <CardHeader>
    <CardTitle>Settings</CardTitle>
    <CardDescription>Manage your preferences</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <Field><FieldLabel>Notifications</FieldLabel><FieldContent><Switch /></FieldContent><FieldDescription>Receive email alerts</FieldDescription></Field>
    <Separator />
    <Field><FieldLabel>Language</FieldLabel><FieldContent>
      <Select><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
        <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="zh">中文</SelectItem></SelectContent>
      </Select>
    </FieldContent></Field>
    <Button>Save</Button>
  </CardContent>
</Card>
```

### Confirmation dialog
```tsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, Button } from '@mspbots/ui'

<AlertDialog>
  <AlertDialogTrigger asChild><Button variant="destructive">Delete</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Global APIs (no import needed)

| API | Usage |
|---|---|
| `$fetch(url, options)` | HTTP requests (auto basePath + auth headers) |
| `$sse(url)` | Server-Sent Events |
| `$ws(url)` | WebSocket |
| `useAccess()` | Returns `{ user, roles, tokenPayload }` |
| `usePages()` | Returns page tree for navigation |
| `usePageMeta()` | Returns current page meta |

## File Conventions

| Path | Purpose |
|---|---|
| `pages/*.tsx` | Auto-routed pages (export `meta` + default component) |
| `service/server.ts` | Backend API routes (Deno) |
| `mspbot.config.ts` | App/system configuration |
