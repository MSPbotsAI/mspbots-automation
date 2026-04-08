# MSPBots React Template

This is a full-stack React template for the MSPBots platform.


It includes:

- Frontend: React + TypeScript + Tailwind CSS + `@mspbots/ui`
- Backend: Deno runtime (`service/`) + REST APIs
- Platform integration: routing, layout, auth redirect, micro-frontend bridge

This document is an operator manual for LLMs working inside a project created from this template.

## Golden Rules (for LLMs)

1. Always follow the target package's README before using its API.
2. Do not invent APIs, props, config fields, or file locations.
3. **All UI must be built with `@mspbots/ui` components.** Do not use raw HTML elements (`<button>`, `<input>`, `<select>`, `<table>`, `<dialog>`, etc.) when an equivalent exists in `@mspbots/ui`. Import from `@mspbots/ui` — never recreate or duplicate component functionality.
4. **Build complex UI by composing existing components.** Refer to `@mspbots/ui` README (`node_modules/@mspbots/ui/README.md`) for the full component catalog. Combine `Card`, `Table`, `Tabs`, `Dialog`, `Form`, `Field`, `InputGroup`, etc. to build pages — do not build from scratch.
5. Frontend API calls must use `$fetch` / `@mspbots/fetch` (no raw `fetch()` unless a package README requires it).
6. Never log or expose the token string. Use `window.useAccess()` only for roles/payload debugging.
7. Route/menu permissions should be implemented with page `meta` (`menu` / `route`) first, and only then with element-level gating (`<Permission />`).
8. All scrollable areas must use `ScrollArea` from `@mspbots/ui` (avoid `overflow-*-auto/scroll`). Run `pnpm -s check:scroll` to enforce.
9. Icons must come from `lucide-react`. Do not install other icon libraries.
10. Use `cn()` from `@mspbots/ui` for conditional class merging. Do not use manual string concatenation or install `clsx`/`classnames` separately.

## Project Structure

```
.
├── pages/                 Frontend pages (EDITABLE)
├── service/               Backend directory (EDITABLE)
│   ├── deno.json          Backend imports & permissions
│   └── server.ts          API routes
├── mspbot.config.ts       App/system config
└── package.json           Frontend dependencies & scripts
```

## Quick Start

Install dependencies:

- `pnpm install`

Frontend:

- Edit `pages/Home.tsx` as a reference.
- Add new pages under `pages/` (routing is automatic).

Backend:

- Add API routes in `service/server.ts`.
- Add backend dependencies with Deno:
  - `cd service && deno add npm:<package>`

Development:

- `pnpm dev`
- `pnpm build`

Notes:

- `pnpm dev` will also run `predev` (`cd service && deno install`) to prepare the backend runtime.
- Frontend can read app id via `import.meta.env.APP_ID` or `__APP_ID__` (shown in `pages/Home.tsx`).

## Frontend: Routing, Menus, Permissions

### 1) File-based routing (`pages/`)

Routing is generated from file paths:

- `pages/Home.tsx` → `/`
- `pages/User/List.tsx` → `/user/list`
- `pages/User/[id].tsx` → `/user/:id`

### 2) Page meta (the primary API) (frontend-only permissions)

Each page can export a `meta` object to control label/icon/order, menu visibility, and route access:

```tsx
export const meta = {
  label: 'Admin',
  icon: 'Settings',
  order: 10,
  menu: ['admin'],   // show in menu only if role matches
  route: ['admin'],  // allow visiting only if role matches
}
```

- `menu`: controls whether the page appears in navigation
- `route`: controls whether the route is accessible (otherwise redirects to `/403`)

Frontend-only note: This controls navigation visibility and route accessibility for UX. It does not replace server-side authorization. For sensitive data or protected operations, enforce checks in `service/server.ts`.

### 3) Element-level gating with `<Permission />` (frontend-only permissions)

For smaller UI fragments inside a page, use `Permission` from `@mspbots/ui`:

```tsx
import { Button, Permission } from '@mspbots/ui'

<Permission roles={['admin']} fallback={null}>
  <Button>Admin Action</Button>
</Permission>
```

`Permission` reads roles from `window.useAccess?.()` (injected by `@mspbots/system`).

Frontend-only note: This provides element-level visibility only and is not a data security boundary. Access to backend resources must be authorized on the server.

## Auth Redirect (no/invalid token → login)

This template can redirect to a login page when the token is missing or invalid:

- Config: `system.auth.enabled = true` and `system.auth.loginPath = '/apps/mb-platform-user/login'`
- Behavior: `window.location.href = loginPath`
- Loop prevention:
  - If already on `loginPath` (or its sub-path), it will not redirect again
  - Uses `sessionStorage['__mspbots_auth_redirect__']` to avoid repeating the same redirect within a session

## Backend: Adding APIs

Add new REST endpoints in `service/server.ts`. Keep handlers small, type-safe, and return stable JSON.

For frontend requests, see [`@mspbots/fetch` README](node_modules/@mspbots/fetch/README.md).

### Server Authorization (backend)
 
Install and utilize `@tools/auth` to enforce unified permission checks. Server-side authorization serves as the ultimate security boundary for data and operations, safeguarding API resources and data integrity.

### Local Development & Proxy

When running locally (`pnpm dev`), the development server automatically proxies specific paths to the backend Deno process. To ensure your APIs work correctly in local development, please follow these path conventions:

| Path Prefix | Usage | Description |
| :--- | :--- | :--- |
| `/api/*` | REST APIs | Standard HTTP requests (GET, POST, etc.) |
| `/sse/*` | SSE | Server-Sent Events streams |
| `/ws/*` | WebSocket | Real-time WebSocket connections |

> **Note:** These proxies are configured automatically by the CLI. Using other prefixes for backend routes may result in 404 errors during local development unless you manually configure additional proxies in `mspbot.config.ts`.

## Permission Selection Guide (frontend vs backend)

- Frontend permissions (page `meta` / `Permission` component): navigation and element visibility; keywords: frontend permissions, route guard, visibility, UX.
- Backend authorization (`server.ts` / `@tools/auth`): API access control and data security; keywords: server-side authorization, permission check, API protection, roles/scopes.
- Use both for sensitive pages/operations: frontend for UX, backend for security.

## Core Packages You Must Read (before coding)

This template relies on several core packages. Always read their README before using them.

Docs location in a generated project:

- Frontend packages: `node_modules/<pkg>/README.md`
- Backend (Deno) packages: `service/node_modules/<pkg>/README.md` (after `pnpm dev` / `deno install`)

| Package | Scope | When to use it | Readme path |
| :--- | :--- | :--- | :--- |
| `@mspbots/routes` | Frontend (build) | When you add/rename pages under `pages/`, want menus, or need page-level role gating via `meta.menu` / `meta.route`. | `node_modules/@mspbots/routes/README.md` |
| `@mspbots/system` | Build + runtime inject | When you need system-level behavior: app title/icon, theme/layout, 403 handling, global `$fetch`, `window.useAccess()`, or auth redirect (`system.auth`). | `node_modules/@mspbots/system/README.md` |
| `@mspbots/react` | Build | When you need to change the build pipeline for the template. In most cases, you only configure it in `mspbot.config.ts` and let it aggregate everything. | `node_modules/@mspbots/react/README.md` |
| `@mspbots/ui` | Frontend | When you build UI pages: buttons/forms/dialogs/tables, and element-level permission gating with `<Permission />`. | `node_modules/@mspbots/ui/README.md` |

### `@mspbots/ui` Component Quick Reference

All UI must be imported from `@mspbots/ui`. Below is the full catalog (56 components):

**Layout & Structure:** `Card` (CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction) · `Separator` · `AspectRatio` · `ResizablePanelGroup` (ResizablePanel, ResizableHandle) · `ScrollArea` (ScrollBar) · `Collapsible` (CollapsibleTrigger, CollapsibleContent) · `Accordion` (AccordionItem, AccordionTrigger, AccordionContent)

**Forms & Input:** `Button` (variants: default/secondary/outline/ghost/link/destructive; sizes: default/sm/lg/icon/icon-sm/icon-lg) · `ButtonGroup` · `Input` · `Textarea` · `InputGroup` (InputGroupInput, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea) · `InputOTP` (InputOTPGroup, InputOTPSlot, InputOTPSeparator) · `Select` (SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel) · `Checkbox` · `RadioGroup` (RadioGroupItem) · `Switch` · `Slider` · `Toggle` (variants: default/outline) · `ToggleGroup` (ToggleGroupItem) · `Calendar` · `Label` · `Form` (FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage) · `Field` (FieldLabel, FieldDescription, FieldError, FieldContent, FieldGroup, FieldSet, FieldTitle, FieldLegend, FieldSeparator) · `Combobox` (ComboboxMultiple, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxValue)

**Data Display:** `Table` (TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption) · `Badge` (variants: default/secondary/destructive/outline/ghost/link) · `Avatar` (AvatarImage, AvatarFallback) · `Progress` · `Skeleton` · `Spinner` · `Kbd` (KbdGroup) · `Item` (ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemHeader, ItemFooter, ItemActions, ItemSeparator) · `Empty` (EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia)

**Navigation:** `Tabs` (TabsList, TabsTrigger, TabsContent) · `Breadcrumb` (BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis) · `Pagination` (PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis) · `NavigationMenu` (NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink) · `Menubar` (MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarShortcut) · `Sidebar` (framework-managed)

**Overlays & Feedback:** `Dialog` (DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose) · `AlertDialog` (AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel) · `Sheet` (SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose) · `Drawer` (DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose) · `DropdownMenu` (DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuShortcut) · `ContextMenu` (same sub-component pattern as DropdownMenu) · `Popover` (PopoverTrigger, PopoverContent, PopoverAnchor) · `HoverCard` (HoverCardTrigger, HoverCardContent) · `Tooltip` (TooltipProvider, TooltipTrigger, TooltipContent) · `Alert` (AlertTitle, AlertDescription; variants: default/destructive) · `Toaster` (from sonner) · `Command` (CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, CommandDialog)

**Access Control:** `Permission` (roles-based element visibility)

**Utilities:** `cn()` (class merging), `useIsMobile()` (responsive hook), `VisuallyHidden`
| `@mspbots/fetch` | Frontend | HTTP requests (`$fetch`), Server-Sent Events (`$sse`), WebSocket (`$ws`). Provides automatic basePath normalization and auth headers injection. | `node_modules/@mspbots/fetch/README.md` |
| `@mspbots/layout` | Frontend | When you customize the app shell (sidebar/header), navigation rendering, or layout behavior beyond `system.layout` config. | `node_modules/@mspbots/layout/README.md` |
| `@mspbots/bridge` | Frontend | When integrating micro-frontends: token/context sync, events, or host/sub-app communication. | `node_modules/@mspbots/bridge/README.md` |
| `@mspbots/type` | Frontend/shared | When you need shared types (page nodes, handler params, platform types) across UI and server logic. | `node_modules/@mspbots/type/README.md` |

## Optional Tools (examples)

These are optional backend-side tools. Only install them when the feature is required, and always follow each package README after installing.

| Package | When to use it (backend) |
| :--- | :--- |
| `@tools/langchain-sdk` | When you need LLM calls, agents, tool execution, prompt pipelines, or RAG workflows. |
| `@tools/database` | When you need persistent storage (e.g., Postgres/MySQL) instead of in-memory data. |
| `@tools/common` | When you need shared utilities/resources or MSPBots common integrations provided by the platform. |
| `@tools/auth` | Server-side authorization & access control for `service/server.ts`: validate user/roles/scopes to protect API resources. Use when endpoints require authenticated/authorized access. |
| `@tools/applogs-sdk` | When you need application logs storage and search/retrieval. |


Install with Deno when needed:

- `cd service && deno add npm:@tools/langchain-sdk`
- `cd service && deno add npm:@tools/database`
- `cd service && deno add npm:@tools/common`
- `cd service && deno add npm:@tools/auth`
- `cd service && deno add npm:@tools/applogs-sdk`

---

## License

MIT
