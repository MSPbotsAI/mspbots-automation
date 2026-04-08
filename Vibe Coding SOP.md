# MSPbots App Development SOP

> **For everyone** — marketing, PMs, back office, and engineers.
> Just copy-paste the prompts into Antigravity. It handles the rest.
>
> **Last updated by:** Daniel Wang | **Date:** 2026-03-17

---

## 🧭 Before You Start — A Note for Rookie Vibe Coders

If you're a product manager, marketer, or back-office team member about to do "vibe coding" on the MSPBots platform for the first time — welcome! Here's what you need to know:

### What You DON'T Need to Learn
- ❌ You don't need to learn programming languages (TypeScript, React, etc.)
- ❌ You don't need to understand databases, APIs, or servers
- ❌ You don't need to memorize commands — this SOP has copy-paste prompts for everything

### What You SHOULD Understand
- ✅ **What your app does** — who uses it, what problem it solves, what the screens look like
- ✅ **How to describe what you want** — the better you describe a feature, the better Antigravity builds it
- ✅ **The workflow** — develop locally → test → publish → assign to tenants (this SOP covers it)
- ✅ **One golden rule** — if it works on your laptop, it will work in production, *as long as you follow this SOP*

### The Mental Model

```
You describe WHAT you want → Antigravity writes the code → You test it in the browser → You publish
```

Think of yourself as the **architect** and Antigravity as the **builder**. You decide what to build. Antigravity handles the how. This SOP is your construction manual.

### Suggested Learning Path

1. **Day 1:** Follow the 🚀 Quick Start below (install tools, skills, workspace)
2. **Day 1:** Create your first project and run it locally
3. **Day 2:** Use the 📝 PM Briefing prompt to define your product
4. **Day 2:** Use the 🏗️ Architecture prompt to set up the project structure
5. **Day 3+:** Start building features with the 🛠️ Build a Feature prompt
6. **When ready:** Test, polish, and publish using the playbook prompts

> 💡 **Tip:** When talking to Antigravity, be specific. Instead of *"Make a page"*, say *"Make a dashboard page that shows a table of customer tickets with columns for ticket ID, subject, status, and created date."* More detail = better results.

### 📚 Recommended Learning Resources

**Start here (essential):**

| Resource | Type | Why |
|----------|------|-----|
| [Vibe Coding: Building Production-Grade Software With GenAI](https://www.simonandschuster.com/books/Vibe-Coding/Gene-Kim/9781966280026) — Gene Kim & Steve Yegge | 📖 Book | The definitive book on vibe coding. Covers how to build real apps with AI, not just prototypes |
| [Google Prompting Essentials](https://www.coursera.org/specializations/prompting-essentials-google) — Coursera (by Google) | 🎓 Free course | Learn from Google experts how to talk to AI effectively. No technical background needed |
| [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Anthropic | 📄 Article | Why giving AI the right information matters more than just writing good prompts. The science behind our Architecture + docs-first approach |

**Level up (after you've built your first app):**

| Resource | Type | Why |
|----------|------|-----|
| [OpenAI's Guide to Building Agents](https://platform.openai.com/docs/guides/agents) | 📄 Article | Understand how AI agents work — makes you a better prompt writer |
| [Harness Engineering — Context, Constraints, Feedback](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) | 📄 Article | The philosophy behind our architecture setup. Why scaffolding matters for AI agents |
| [Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/) — OpenAI | 📄 Case Study | How OpenAI shipped 1M lines of code with zero human-written code. The origin story behind our docs-first, architecture-first approach |
| [Vibe Coding Bootcamp: Build Any App with AI](https://www.udemy.com/course/vibe-coding-bootcamp/) — Udemy | 🎓 Course | Comprehensive bootcamp covering full-stack development with AI |
| [Full Claude Skills Tutorial for Beginners in 2026](https://youtu.be/YkpEX_jlb04?si=gCEAoS-Bln9ckvqU) — AI Foundations | 🎥 Video | Complete walkthrough of Claude's features — prompting, projects, skills, connectors, and automations |

**YouTube channels to follow:**

| Channel | What You'll Learn |
|---------|-----------------|
| Search "vibe coding tutorial 2025" | How others build apps with AI — watch for inspiration and techniques |
| Search "prompt engineering tips" | Better prompting = better results from Antigravity |

> 💡 **You don't need to complete all of these before starting.** The SOP below is self-contained. These resources help you understand *why* things work the way they do, and make you faster over time.

---

## 🚀 Quick Start (First Time Ever)

Follow these 3 steps in order. You only do this **once on your computer**.

### Step 1 — Install the Tools

Open **PowerShell** (Windows) or **Terminal** (Mac) and paste this prompt into **Antigravity**:

> **Prompt:**
> Please check if I have all of the following installed, and install anything that's missing:
> - Node.js (LTS version)
> - pnpm (package manager)
> - Deno (backend runtime)
> - Git (version control)
> - ngrok (for webhook development — sign up at https://ngrok.com and install)
> - MSPBots CLI (`pnpm install -g mspbots-cli --registry=https://npm.mspbots.ai/`)
>
> After installing, verify each one works by running the version check commands.
> Also make sure I have a GitHub account configured with `git config --global user.name` and `git config --global user.email`.
> For ngrok, make sure the auth token is configured with `ngrok config add-authtoken <your-token>` (get it from https://dashboard.ngrok.com/get-started/your-authtoken).

### Step 2 — Install the AI Skills

Paste this into **Antigravity**:

> **Prompt:**
> Please install these 4 skills GLOBALLY for future projects:
> - https://github.com/phuryn/pm-skills
> - https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
> - https://github.com/obra/superpowers
> - https://github.com/MSPbotsAI/skill-test-qa

| Skill | What You Get |
|-------|-------------|
| **pm-skills** | Product strategy, market research, analytics, go-to-market |
| **ui-ux-pro-max-skill** | Professional UI/UX design assistance |
| **superpowers** | Dev workflows: planning, testing, debugging, code review |
| **skill-test-qa** | Automated QA testing and quality checks |

**When to use each skill during the SOP journey:**

| SOP Phase | Skill Package | Skills to Use | How to Invoke |
|-----------|--------------|---------------|---------------|
| **📝 PM Briefing** | pm-skills | `/product-vision`, `/user-personas`, `/user-segmentation` | Define who your users are and what they need |
| **📝 PM Briefing** | pm-skills | `/lean-canvas`, `/business-model`, `/value-proposition` | Clarify the business case |
| **📝 PM Briefing** | pm-skills | `/prioritize-features`, `/opportunity-solution-tree` | Decide what to build first |
| **🏗️ Architecture** | superpowers | `/writing-plans` | Create structured execution plans |
| **🏗️ Architecture** | superpowers | `/brainstorming` | Explore technical approaches |
| **🛠️ Build Features** | superpowers | `/executing-plans` | Follow the plan step by step |
| **🛠️ Build Features** | ui-ux-pro-max-skill | (auto-activated) | Get professional UI/UX design guidance |
| **🛠️ Build Features** | skill-test-qa | (auto-activated) | Perform automated QA on new features |
| **🛠️ Build Features** | superpowers | `/test-driven-development` | Write tests alongside features |
| **🐛 Debugging** | superpowers | `/systematic-debugging` | Methodically find and fix bugs |
| **✨ Polish UI** | ui-ux-pro-max-skill | (auto-activated) | Review layout, colors, spacing, accessibility |
| **📦 Pre-Publish** | skill-test-qa | (auto-activated) | Final quality sweep before shipping |
| **📦 Pre-Publish** | superpowers | `/verification-before-completion` | Final check before shipping |
| **📦 Pre-Publish** | superpowers | `/requesting-code-review` | Get AI code review |
| **📦 Post-Publish** | pm-skills | `/release-notes` | Write user-facing release notes |
| **📊 Growth** | pm-skills | `/gtm-strategy`, `/north-star-metric` | Plan go-to-market and measure success |
| **📊 Growth** | pm-skills | `/competitive-battlecard`, `/competitor-analysis` | Understand the competition |

### Step 3 — Create the Workspace Folder

Paste this into **Antigravity**:

> **Prompt:**
> Please create a folder called "MSPbots-Vibe-Coding" in my Documents folder if it doesn't already exist.

✅ **Done!** You're ready to create your first project.

---

## 📋 Prompt Playbook

Find your situation below, copy the prompt, paste into Antigravity.

---

### 🆕 Create a New Project

To start a new project, follow these two clear steps:

#### Step 1: GitHub Preparation

1. Go to GitHub and create a new repository under the **MSPbots** organization.
2. Name it `app-[project-name]`.
3. Select **"Start with a template: MSPbotsAI/app-template"**.

#### Step 2: Local Initialization

1. Open Antigravity (or VS Code).
2. Clone the repository `https://github.com/MSPbotsAI/app-[project-name].git` into the "MSPbots-Vibe-Coding" folder, then paste this prompt:

> **Prompt:**
> 1. npm install
> 2. Start the dev server with `mspbots dev`.

> 💡 **Tip:** Replace `[project-name]` with your actual project name in the URL.
---

### 💾 Save Your Work (Do This Often!)

> **Prompt:**
> Use the **skill-test-qa** skill to run automated tests on my current work. If everything passes, save my work to GitHub: commit all changes with a descriptive message and push to the main branch.

> 💡 **Tip:** Save after every feature or fix. If something breaks, you can always go back to a previous save. Always test before you save!

---

### 📥 Get a Teammate's Latest Changes

If someone else pushed changes to the same project:

> **Prompt:**
> Pull the latest changes from GitHub and make sure everything still works. If there are conflicts, help me resolve them.

---

### 🏗️ Set Up Project Architecture (After Creating a New Project)

Run this **once per project**, right after `mspbots init`. This sets up the Harness Engineering scaffolding — documentation, architecture rules, and quality enforcement — so AI agents produce consistent, high-quality code from day one.

> **Prompt:**
> You are setting up a new MSPBots project following Harness Engineering methodology. The goal is to create an environment where AI agents can do 90%+ of the coding reliably, without compounding technical debt.
>
> The project is: [PROJECT NAME]
> The primary user: [WHO USES IT AND WHAT THEY DO]
>
> Before writing any application code, create the full Harness Engineering scaffolding:
>
> **STEP 1 — Context Engineering (docs/ directory):**
> Create these files, each specific to this project (no generic placeholders):
> - `ARCHITECTURE.md` — layer model (Types → Domain → Handlers → Router → UI), domain table, dependency rules
> - `docs/data-model.md` — every DB table, columns, types, purpose
> - `docs/PRODUCT_SENSE.md` — what the product is, who uses it, core jobs-to-be-done, non-negotiables, what it is NOT
> - `docs/DESIGN.md` — visual language, layout principles, design anti-patterns
> - `docs/QUALITY_SCORE.md` — A–F grade per domain, known gaps
> - `docs/PLANS.md` — index of execution plans
> - `docs/SECURITY.md` — how secrets are stored, validation rules
> - `docs/api-contracts/` — one .md per API domain with all routes and request/response shapes
> - `docs/integrations/` — one .md per external service with auth strategy and rate limits
> - `docs/references/` — LLM-friendly quick-reference .txt files for key dependencies
>
> **STEP 2 — Layered Backend Structure:**
> Organize `service/` as:
> - `server.ts` — thin router only (import handlers, register routes, nothing else)
> - `db.ts` — database singleton (lazy init, single export: getDb())
> - `schema.ts` — Drizzle schema definitions
> - `domain/` — pure business logic (no HTTP, no direct DB)
> - `handlers/` — HTTP layer (one file per domain, validates inputs, delegates to domain)
>
> Handler rules: never import another handler, never contain business logic, return plain objects.
> Domain rules: never import from handlers, prefer pure functions.
>
> **DATA STORAGE RULE:** All client data MUST be stored in the database (`@tools/database`). Never use in-memory storage, local files, or the `storage/` folder for production data. In-memory data is lost on restart; file storage doesn't work in multi-tenant production.
>
> **STEP 3 — Mechanical Enforcement:**
> Create `scripts/lint-arch.ts` that checks:
> 1. No handler file imports another handler
> 2. No domain file imports from handlers/ or db.ts
> 3. server.ts doesn't import from domain/ or schema.ts directly
> 4. No raw fetch() calls in pages/
> 5. No raw HTML elements (button, input, select, table, dialog, textarea) in pages/
>
> **STEP 4 — Entropy Management:**
> Create `docs/ENTROPY_CHECK.md` with a periodic checklist for keeping the codebase clean.
>
> Generate all of the above. Be specific to this project. Start with ARCHITECTURE.md, then docs/, then the service/ structure, then scripts/lint-arch.ts. Do not write feature code until scaffolding is done.

**Fill in before pasting:**
- Replace `[PROJECT NAME]` with your app name
- Replace `[WHO USES IT AND WHAT THEY DO]` with a short description of your users

---

### 📝 PM Briefing (For Product Managers)

Before development begins, the PM must provide this information. **If the AI agent doesn't have this, it will make assumptions that are hard to undo later.**

> **Prompt:**
> I'm the PM for [PROJECT NAME]. Before coding starts, I need to provide the product context. Please ask me the following questions one at a time, then create the corresponding docs:
>
> 1. **Product Identity** → `docs/PRODUCT_SENSE.md`
>    - What does this product do in one sentence?
>    - Who is the primary user?
>    - What are the 3 core jobs-to-be-done?
>    - What are the non-negotiables?
>    - What is this product explicitly NOT?
>
> 2. **Feature List** → `docs/product-specs/`
>    - Every screen/feature for v1, ordered by priority
>    - Which features are launch vs post-launch?
>
> 3. **Onboarding Flow** → `docs/product-specs/new-user-onboarding.md`
>    - What does a new user do in their first 5 minutes?
>    - Minimum setup before the product is useful?
>
> 4. **External Integrations** → `docs/integrations/`
>    - What third-party services does this connect to?
>
> 5. **Design Language** → `docs/DESIGN.md`
>    - Dark/light mode? Brand colors? Reference apps?
>
> Please interview me step by step.

---

### 🔄 Start Working on an Existing Project

1. Open your **project folder** (e.g., `my-app`) in Antigravity
2. Paste this prompt:

> **Prompt:**
> Start the dev server with `mspbots dev`.

---

### 🛠️ Build a New Feature

> **Prompt:**
> Help me build [describe what you want] using @mspbots/ui components. Read the README.md and ARCHITECTURE.md first for the project rules. Follow the handler → domain → router layering in the backend. All data must be stored in the database — never use in-memory storage or local files.

**Examples:**
- *"Help me build a dashboard page that shows ticket counts by status using @mspbots/ui components"*
- *"Help me build a Settings page where users can enter their Halo API key, stored in the database"*
- *"Help me build a data table with search and filtering for customer list"*

---

### ✨ Polish the UI Before Publishing

> **Prompt:**
> Polish visually — do a browser QA pass. Open the app, check every page, fix any UI rough edges, alignment issues, or visual glitches.

---

### 🔍 Run Architecture Check

Run this to catch violations before they pile up:

> **Prompt:**
> Run the architecture linter: `deno run --allow-read scripts/lint-arch.ts`. Fix any violations found. Then update `docs/QUALITY_SCORE.md` with current grades.

---

### 🗄️ Set Up or Change the Database

> **Prompt:**
> I need to [describe your data needs]. Please set up the database schema in `service/drizzle-tables.ts`, install `@tools/database` if needed, run `mspbots migrate` to sync with the remote database, and update `docs/data-model.md` with the new tables.

**Examples:**
- *"I need to store customer feedback with fields: name, email, message, rating, created date"*
- *"I need to add a 'status' column to the existing tickets table"*

---

### 🔑 Add a New Vendor Integration (API Key Required)

> **Prompt:**
> I'm integrating [vendor name] which requires an API key. Please:
> 1. Add the key to `.env` for local testing
> 2. Build a Settings page where tenants can enter their own key
> 3. Update the backend to read the key from the Settings database first, falling back to `.env` for local dev
> 4. Make sure it works without any `.env` file (production mode)
> 5. Create `docs/integrations/[vendor].md` documenting the auth strategy, rate limits, and known risks

---

### 🔌 Add Real-Time Features (WebSocket / SSE)

Use this when your app needs live updates (chat, dashboards, notifications):

> **Prompt:**
> I need real-time [describe what] using WebSocket (or SSE). Please:
> 1. Set up a WebSocket (or SSE) endpoint in `service/server.ts`
> 2. On the frontend, use `$ws(url)` for WebSocket or `$sse(url)` for Server-Sent Events — never use raw `new WebSocket()` or `new EventSource()`
> 3. Handle connection errors, reconnection, and cleanup when the component unmounts
> 4. Store any data that needs to persist in the database, not in-memory
> 5. Create `docs/api-contracts/[feature]-realtime.md` documenting the message format

**Examples:**
- *"I need real-time ticket status updates — when a ticket changes in Halo, the dashboard should update without refreshing"*
- *"I need a live notification feed that shows new alerts as they arrive"*

> 💡 `$ws` and `$sse` (from `@mspbots/fetch`) auto-handle auth headers and base URLs, just like `$fetch`. They work the same in local dev and production.

---

### 🪝 Receive Webhooks from External Services

Use this when an external service (e.g., Halo, Stripe, GitHub) needs to **push data to your app** in real-time.

**The challenge:** In local dev, your laptop isn't reachable from the internet. External services can't send webhooks to `localhost`. You need a tunnel.

> **Prompt:**
> I need to receive webhooks from [service name]. Please:
> 1. Create a webhook handler in `service/handlers/[service]-webhook.handler.ts`
> 2. Register the route in `service/server.ts` (e.g., `POST /api/webhooks/[service]`)
> 3. Validate the webhook signature/secret for security
> 4. Store incoming data in the database, not in-memory
> 5. Set up ngrok (or cloudflared) to tunnel my local dev server so the external service can reach it:
>    - Install ngrok if not installed
>    - Run `ngrok http 5173` (or whatever port `mspbots dev` uses)
>    - Give me the public URL to register with [service name]
> 6. Create `docs/integrations/[service]-webhook.md` documenting:
>    - The webhook URL format (local vs production)
>    - Expected payload structure
>    - How to verify the signature
>    - Rate limits and retry behavior
> 7. Add the webhook secret to `.env` for local dev, and to the Settings UI for tenant self-service in production

**Local vs Production webhook URLs:**

| Environment | Webhook URL | How It's Set Up |
|-------------|------------|----------------|
| **Local dev** | `https://abc123.ngrok.io/api/webhooks/[service]` | You run ngrok and register this temp URL |
| **Production** | `https://[tenant].mspbots.ai/api/webhooks/[service]` | Platform provides the public URL automatically |

> ⚠️ **ngrok URLs change every time you restart it** (unless you have a paid plan). You'll need to re-register the webhook URL with the external service each time. In production, the URL is permanent.

> 💡 **Polling alternative:** If the external service doesn't support webhooks, ask Antigravity to set up periodic polling instead:
>
> **Prompt:**
> [Service name] doesn't support webhooks. Set up a polling job that checks for new data every [X minutes] using a background interval in the backend. Store the last-checked timestamp in the database so it survives restarts.

---

### 🧪 Test Fresh Onboarding (Clean-Slate Test)

Run this **before every publish** to make sure new tenants will have a good experience:

> **Prompt:**
> Run a clean-slate QA test. Please:
> 1. Stop the dev server
> 2. Delete the `storage/` folder and `.env` file
> 3. Reset the local database schema (drop and recreate)
> 4. Create a new minimal `.env` with just DB_HOST, DB_PORT, DB_NAME, APP_ID
> 5. Run `mspbots migrate` to create fresh tables
> 6. Start `mspbots dev`
> 7. Open the browser and test the full app from scratch — onboarding, settings, core features

---

### ⬆️ Update Everything (Framework, CLI, Skills)

Run this periodically, and **always before a major publish**:

> **Prompt:**
> Please update everything:
> 1. Update the MSPBots CLI: `pnpm install -g mspbots-cli --registry=https://npm.mspbots.ai/`
> 2. Update the framework: `mspbots update`
> 3. Update all globally installed skills to the latest version
> 4. Run `pnpm install` to sync dependencies

---

### 📦 Publish to Production

> **Prompt:**
> Prepare and publish a [patch/minor] release. Please:
> 1. Make sure `mspbots update` has been run
> 2. Run `mspbots migrate` to sync the database schema
> 3. Use the **skill-test-qa** skill to perform a final quality sweep and automated tests
> 4. Run the architecture linter: `deno run --allow-read scripts/lint-arch.ts`
> 5. Run `pnpm build` to verify the production build succeeds
> 6. Verify the project's Git remote URL contains `MSPbotsAI` (for example: `https://github.com/MSPbotsAI/app-[project-name].git`) before publishing
> 7. Publish with `mspbots publish --bump [patch/minor]`
> 8. **Reminder:** After publishing, you MUST go to [https://agent.mspbots.ai/](https://agent.mspbots.ai/) -> **Project** menu to publish the app to the App Market.

**When to use which:**

| Change Type | Use | Example |
|------------|-----|---------|
| Bug fix, typo, small tweak | `patch` | Fixed a button label |
| New feature, new page | `minor` | Added a Settings page |
| Testing before stable release | `alpha` or `beta` | Preview for review |

---

### 🐛 Something is Broken

> **Prompt:**
> The app is showing [describe the problem]. Please diagnose and fix it.

**Common problems and specific prompts:**

| Problem | Prompt |
|---------|--------|
| Dev server shows 404 | *"The dev server starts but shows 404. Check if `mspbot.config.ts` is loading correctly and fix it."* |
| API returns errors | *"The API at `/api/[route]` returns [error]. Check `service/server.ts` and fix it."* |
| Database connection failed | *"Database connection is failing. Check `.env` for correct DB credentials and `service/deno.json` for the `@tools/database` dependency."* |
| Published app is broken for tenants | *"The published app is broken. Check: Was `mspbots migrate` run before publish? Does the tenant have required vendor keys? Does `pnpm build` pass?"* |
| Architecture violations | *"Run `deno run --allow-read scripts/lint-arch.ts` and fix all violations."* |

---

### 🔁 Reset Local Database

> **Prompt:**
> Reset my local database. Drop the app's schema and run `mspbots migrate` to recreate all tables from scratch. Then update `docs/data-model.md` if the schema changed.

> ⚠️ This deletes all local data. Only use for testing.

---

### 📊 Update Quality Scores

Run this periodically to keep honest about the codebase health:

> **Prompt:**
> Review the codebase and update `docs/QUALITY_SCORE.md`:
> - Grade each domain A–F based on code quality, test coverage, and documentation
> - Update the known gaps table
> - Add any new items to `docs/exec-plans/tech-debt-tracker.md`

---

### 🔄 Entropy Check (Periodic Cleanup)

Run this weekly or before a major release:

> **Prompt:**
> Run the entropy check from `docs/ENTROPY_CHECK.md`:
> - Do routes in server.ts match handler exports? (no ghost routes)
> - Do DB tables in schema match docs/data-model.md?
> - Do all handler files have a corresponding api-contracts/ doc?
> - Is any handler or domain file over 300 lines? (break it up)
> - Does QUALITY_SCORE.md reflect current reality?
> Fix any issues found.

---

### 🛡️ AI/LLM Security Hardening

Run this when your project uses AI/LLM features (chatbots, agents, AI-powered tools):

> **Prompt:**
> Review the AI/LLM integration for security. Check for:
> 1. **Prompt injection** — Is user input sanitized before sending to the LLM? Are known injection patterns stripped?
> 2. **System prompt protection** — Does the system prompt include immutable safety rules that can't be overridden by user input?
> 3. **No hardcoded API keys** — Are all keys read from env vars or tenant settings? Zero keys in source code?
> 4. **Webhook authentication** — Are inbound webhooks validated (e.g., signature verification)?
> 5. **Rate limiting** — Are there per-session/per-user limits to prevent cost abuse?
> 6. **PII handling** — Is sensitive data (passwords, SSN, credit cards) never collected through AI conversations?
> Fix any gaps found.

---

## 📖 Reference Guide

*Everything below is for understanding what's happening behind the scenes. You don't need to read this to use the prompts above.*

---

### Project Structure

```
.
├── ARCHITECTURE.md        Layer model & dependency rules
├── docs/                  All project documentation
│   ├── PRODUCT_SENSE.md   What the product is and isn't
│   ├── DESIGN.md          Visual language & layout rules
│   ├── QUALITY_SCORE.md   Codebase health grades (A–F)
│   ├── PLANS.md           Execution plan index
│   ├── SECURITY.md        Secrets & validation rules
│   ├── ENTROPY_CHECK.md   Periodic cleanup checklist
│   ├── data-model.md      Database table documentation
│   ├── api-contracts/     One .md per API domain
│   ├── integrations/      One .md per external service
│   ├── references/        LLM-friendly quick refs (.txt)
│   ├── exec-plans/        Active & completed plans
│   └── product-specs/     Feature specs & onboarding
├── scripts/
│   └── lint-arch.ts       Architecture linter
├── pages/                 Frontend pages (what users see)
├── service/               Backend (layered architecture)
│   ├── server.ts          Thin router only
│   ├── db.ts              Database singleton
│   ├── schema.ts          Drizzle ORM definitions
│   ├── domain/            Pure business logic
│   └── handlers/          HTTP layer (one per domain)
├── mspbot.config.ts       App config (name, theme, layout)
├── package.json           Frontend deps + app manifest
├── .env                   Your local secrets (NOT committed)
└── .env.development       Shared dev defaults (committed)
```

### Backend Architecture — The Layer Model

```
UI (pages/) → Router (server.ts) → Handlers (handlers/) → Domain (domain/) → DB (db.ts)
```

| Layer | Can Import | Cannot Import | Purpose |
|-------|-----------|---------------|---------|
| `server.ts` | handlers/ | domain/, schema.ts | Route registration only |
| `handlers/` | domain/, db.ts | other handlers | Input validation, HTTP glue |
| `domain/` | (pure logic) | handlers/, db.ts | Business rules, algorithms |
| `pages/` | @mspbots/ui, $fetch | raw fetch(), raw HTML | User interface |

> 💡 **Why this matters:** This layering lets AI agents work in parallel without architectural drift. The linter catches violations automatically.

### Environment Files

| File | Committed to Git? | Purpose |
|------|-------------------|---------|
| `.env` | ❌ No | **Your local secrets** — DB creds, API keys |
| `.env.development` | ✅ Yes | **Shared defaults** — API URLs, debug flags |
| `mspbot.config.ts` | ✅ Yes | App config — **deployed exactly as committed** |
| `package.json` → `manifest` | ✅ Yes | App ID, permissions — **deployed exactly as committed** |

### Backend Dependencies (Deno Packages)

| Package | When to Use |
|---------|------------|
| `@tools/database` | Need to save/read data from a database |
| `@tools/auth` | Need to check who the user is and what they can do |
| `@tools/langchain-sdk` | Need AI/LLM capabilities |
| `@tools/common` | Need MSPBots platform utilities |
| `@tools/applogs-sdk` | Need application logging |

### Production Parity — "If Local Works, Remote Works"

| Layer | Local Dev | Production | How They Stay in Sync |
|-------|-----------|------------|----------------------|
| **Code** | `pages/` + `service/` | npm artifact | `mspbots publish` deploys exact same bundle |
| **Schema** | `drizzle-tables.ts` | Remote Postgres | `mspbots migrate` before publish |
| **Config** | `mspbot.config.ts` | Same file | Committed to git, deployed as-is |
| **Docs** | `docs/`, `ARCHITECTURE.md` | Same files | Committed to git |
| **Env vars** | `.env` (local) | Platform-injected | Platform auto-provides DB_HOST, etc. |
| **Vendor keys** | `.env` (local) | Tenant Settings UI → DB | Code reads from DB first, env fallback |
| **Framework** | `mspbots update` | Auto-updated | Keep up to date before publish |

### Critical Rules

1. **Never hardcode secrets** — use `.env` locally, tenant DB in production
2. **Schema before publish** — always `mspbots migrate` → then `mspbots publish`
3. **Clean-slate test before publish** — test the fresh user experience
4. **Vendor keys need a Settings page** — tenants self-serve, no dev team help needed
5. **Update before major publishes** — `mspbots update` ensures framework compatibility
6. **`.env` is personal** — never commit it, never rely on it in production
7. **All data in the database** — never use in-memory storage, local files, or `storage/` for client data. It won't survive restarts and doesn't work in multi-tenant production
8. **Always use `$fetch`, never raw `fetch()`** — `$fetch` from `@mspbots/fetch` auto-handles base URL and auth headers. Raw `fetch()` will break when the app moves from localhost to production
9. **Never hardcode URLs** — no `http://localhost:5173` or `http://localhost:8000` in code. Use relative paths (`/api/...`) and `$fetch` handles the rest
10. **Architecture linter before publish** — `deno run --allow-read scripts/lint-arch.ts` must pass
11. **Git remote check before publish** — the project's Git remote URL must contain `MSPbotsAI` so you're publishing from the official MSPBots organization repository
12. **Docs stay current** — if code changes, docs change too (data-model, api-contracts, QUALITY_SCORE)
13. **Plans before complex features** — create an exec plan in `docs/exec-plans/active/` first
14. **What the agent can't see doesn't exist** — all decisions must be in committed markdown, not in Slack or someone's head
15. **AI/LLM features require security hardening** — if your app uses AI (chat, voice, agents), sanitize user input before sending to the LLM, wrap system prompts with immutable safety rules, validate inbound webhooks, and enforce per-session rate limits
16. **Never use `USE_HARDCODED = true` for API keys** — always read keys from environment variables (`.env.local` or tenant settings). Hardcoded keys end up in git history and are impossible to rotate
17. **Marketplace Publication** — After successful `mspbots publish`, you MUST visit [https://agent.mspbots.ai/](https://agent.mspbots.ai/) -> **Project** to officially publish your app to the MSPbots App Market.

### What Happens When You Publish

1. `pnpm build` creates a production bundle
2. Version is bumped in `package.json`
3. Artifact is published to `https://npm.mspbots.ai/`
4. Production server pulls and deploys automatically

### What Happens When a Tenant Gets Your App

| Resource | How It's Provisioned |
|----------|---------------------|
| **Database** | Isolated schema per tenant (auto-created) |
| **DB credentials** | Auto-provisioned by the platform |
| **Environment vars** | Platform-injected (DB_HOST, etc.) |
| **App code** | Same published artifact for all tenants |
| **Vendor keys** | Tenant enters their own via Settings page |

---

## 🔧 Quick Command Reference

*For when you need to run a command directly:*

| I need to... | Command |
|-------------|---------|
| Create new project | `mspbots init` |
| Start dev server | `mspbots dev` |
| Update framework | `mspbots update` |
| Update CLI | `pnpm install -g mspbots-cli --registry=https://npm.mspbots.ai/` |
| Add backend package | `cd service && deno add npm:@tools/<package>` |
| Sync DB schema | `mspbots migrate` |
| Run arch linter | `deno run --allow-read scripts/lint-arch.ts` |
| Production build check | `pnpm build` |
| Publish patch | `mspbots publish --bump patch` |
| Publish minor | `mspbots publish --bump minor` |
| Publish alpha/beta | `mspbots publish --alpha` / `--beta` |