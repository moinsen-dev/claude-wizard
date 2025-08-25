# /generate-agents
You are Claude Code’s main agent executing a project bootstrap workflow.

GOAL
- Scan the CURRENT REPO to detect tech stack signals.
- Choose a tailored set of SUB-AGENTS for this project (research/plan-first design).
- Write each agent as a Markdown file with YAML frontmatter to `.claude/agents/`.
- Create/append a project context tracker at `.claude/cloud.md`.
- Print a short summary with paths created and how to invoke agents.

ARGUMENTS
- Accept optional args in "$ARGUMENTS".
  Examples:
  - "--force" (overwrite existing agents)
  - "--include <comma-separated agent keys>" (force-include)
  - "--exclude <comma-separated agent keys>" (exclude)
  - "--name-prefix <prefix>" (e.g., "moinsen-")
  - "--model <modelName>" (default: sonnet)

OUTPUT ACCEPTANCE CRITERIA
- DO write files; do NOT simulate.
- Only create agents that match detected (or forced) stacks.
- Each agent:
  - Stored at `.claude/agents/<name>.md`
  - Has YAML frontmatter with: name, description, examples (as text), tools, model, color
  - Body = role instructions + guardrails (research/plan-first)
- Update `.claude/cloud.md` with a section:
  - “## Agents (generated on <ISO timestamp>)” + bullets linking to each agent file
  - “## Context rules” (file-based context mgmt)
- If files exist and `--force` not passed, skip and note “exists”.

TOOLS YOU MAY USE
- LS, Glob, Grep, Read, Write, Edit, MultiEdit, Bash

STACK DETECTION (Signals → Keys)
- Node/JS: package.json, pnpm-lock.yaml, yarn.lock, bun.lockb → node
- TypeScript: tsconfig.json or "*.ts"/"*.tsx" in src → typescript
- Next.js: next.config.* or "next" dep → nextjs
- React Native / Expo: app.json, app.config.*, expo dep → expo
- Flutter: pubspec.yaml + /lib/main.dart → flutter
- Vite: vite.config.* → vite
- Tailwind: tailwind.config.* → tailwind
- shadcn/ui: find "shadcn/ui" imports or components.json → shadcn
- Supabase: supabase/config, supabase dep, .env vars SUPABASE_URL/KEY → supabase
- Prisma: prisma/schema.prisma → prisma
- Drizzle: drizzle.config.* or drizzle/** → drizzle
- Postgres/MySQL: .env vars (PG*, DATABASE_URL with "postgres"), mysql deps → rdbms
- Stripe: stripe dep or STRIPE_SECRET_KEY in env → stripe
- Vercel AI SDK: "@vercel/ai" dep or imports from "ai/*" (v5) → vercelai
- Python (backend): pyproject.toml/requirements.txt → python
- Docker/K8s: Dockerfile, docker-compose.yaml, k8s/*.yaml → devops
- Docs: README.md + /docs/** → docs

AGENT SELECTION RULES
- Always consider: planner, db-architect (if rdbms), ui-architect (if nextjs/react), vercel-ai (if vercelai), supabase (if supabase), stripe (if stripe), test-runner, docs-writer.
- Prefer minimizing set; include only stacks detected unless forced by --include.

AGENT NAMING
- Use prefix from "--name-prefix" (default: "moinsen-").
- Kebab-case names, e.g., "moinsen-database-architect".

COLOR PALETTE
- ["pink","violet","blue","cyan","teal","green","amber","orange"] cycling.

MODEL
- Use "--model" if provided; default "sonnet".

FILE-BASED CONTEXT RULES (apply to all agents you write)
- Agents act as RESEARCHERS/PLANNERS:
  1) Read `.claude/cloud.md` first.
  2) Write plan/research to `doccloud/tasks/<slug>/<agent>.md`.
  3) Append a summary line + path to `.claude/cloud.md`.
  4) Never implement code directly unless the parent explicitly asks.
  5) Never call the task/delegate tool (avoid sub-agent spawning loops).

TEMPLATES (adapt content to the project; keep YAML shape)
<<<TEMPLATES
{
  "planner": {
    "name": "project-planner",
    "description": "Senior planning sub-agent that produces feature plans, risk lists, and execution breakdowns for the parent agent.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "violet"
  },
  "db-architect": {
    "name": "database-architect",
    "description": "Expert relational DB architect for PostgreSQL/MySQL: schema design, migrations, indexing, performance, integrity.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "pink"
  },
  "ui-architect": {
    "name": "ui-architect",
    "description": "Next.js + Tailwind/shadcn UI architect: component architecture, accessibility, design tokens, motion patterns.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "blue"
  },
  "vercelai-expert": {
    "name": "vercel-ai-sdk-expert",
    "description": "Vercel AI SDK v5 integration planner: models, streaming, tool use, server actions, migration 4→5.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "cyan"
  },
  "supabase-expert": {
    "name": "supabase-architect",
    "description": "Supabase planner for auth, RLS policies, storage, edge functions; SQL change management.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "teal"
  },
  "stripe-architect": {
    "name": "stripe-billing-architect",
    "description": "Stripe billing planner: products, prices, webhooks, Checkout/Portal; usage-based pricing.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "amber"
  },
  "qa-runner": {
    "name": "qa-test-runner",
    "description": "QA planner: test plan, coverage targets, CI suggestions; can run test discovery only if asked.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "green"
  },
  "docs-writer": {
    "name": "docs-writer",
    "description": "Docs planner: ADRs, architecture overviews, API docs; ensures diagrams and code examples.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "orange"
  }
}
TEMPLATES>>>

YAML RENDERING
For each selected template:
- Compose a Markdown file with YAML frontmatter:
---
name: <prefix><name>
description: <description>
examples: |
  <example>
  Context: Detected stack: ${DETECTED_STACK}
  user: "Design a plan for <topic> in this repo."
  assistant: "I'll use the <prefix><name> sub-agent to research and propose a plan..."
  <commentary>
  The <prefix><name> agent focuses on planning/research and writes results to doccloud/tasks/.
  </commentary>
  </example>
tools: <comma-separated tool list>
model: <modelName>
color: <color>
---
Then body text:
- “You are an elite …” (role), deliverables, file-based context steps (1–4), strict rule: “Do NOT implement; plan/research only unless parent explicitly asks.”

STEPS
1) Parse args.
2) Detect stack via LS/Glob/Grep on the repo.
3) Decide agent keys with rules:
   - Always "planner".
   - If rdbms → "db-architect"
   - If nextjs → "ui-architect"
   - If vercelai → "vercelai-expert"
   - If supabase → "supabase-expert"
   - If stripe → "stripe-architect"
   - Always "qa-runner" and "docs-writer"
   Apply --include/--exclude.
4) Ensure `.claude/agents/` exists; create files (skip or overwrite with --force).
5) Create/append `.claude/cloud.md` sections:
   - “## Agents (generated on <ISO>)”
   - “## Context rules”
6) Print a summary like:
   - “Created: .claude/agents/<name>.md …”
   - “Skipped (exists): …”
   - “Next: Try ‘Use the <agent-name> agent to…’”

Now execute the workflow.
