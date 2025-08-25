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
- Always include: project-planner, core-developer, qa-engineer, technical-writer
- Include if detected:
  - database-designer (if database files/configs found)
  - ui-ux-engineer (if frontend framework detected)
  - api-designer (if API routes/schemas found)
  - devops-engineer (if Docker/K8s/CI files found)
  - security-analyst (for production projects)
- Prefer comprehensive coverage; include all relevant roles for the project

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

TEMPLATES (generic role-based agents that adapt to any tech stack)
<<<TEMPLATES
{
  "project-planner": {
    "name": "project-planner",
    "description": "Senior planning expert who creates feature plans, technical roadmaps, and project breakdowns for any technology stack.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "violet"
  },
  "core-developer": {
    "name": "core-developer",
    "description": "Implementation expert specializing in writing production-quality code, following best practices and project standards across any programming language and framework.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "blue"
  },
  "database-designer": {
    "name": "database-designer",
    "description": "Data architecture expert for any database system: schema design, query optimization, data integrity, migrations, and performance tuning.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "pink"
  },
  "ui-ux-engineer": {
    "name": "ui-ux-engineer",
    "description": "Frontend and user interface expert for any UI framework: component architecture, user experience, accessibility, and responsive design.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "cyan"
  },
  "api-designer": {
    "name": "api-designer",
    "description": "API architecture expert for any protocol: REST, GraphQL, gRPC design, integration patterns, documentation, and versioning strategies.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "teal"
  },
  "devops-engineer": {
    "name": "devops-engineer",
    "description": "Infrastructure and deployment expert: containerization, CI/CD, cloud platforms, monitoring, scaling, and automation for any technology stack.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "amber"
  },
  "security-analyst": {
    "name": "security-analyst",
    "description": "Security expert for any technology: vulnerability assessment, secure coding practices, authentication, authorization, and compliance standards.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "red"
  },
  "qa-engineer": {
    "name": "qa-engineer",
    "description": "Quality assurance expert for any technology: test planning, automation strategies, coverage analysis, and quality standards implementation.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "green"
  },
  "technical-writer": {
    "name": "technical-writer",
    "description": "Documentation expert for any project: technical documentation, API docs, architecture overviews, user guides, and knowledge management.",
    "tools": ["Read","Write","Edit","MultiEdit","Glob","Grep","LS","Bash"],
    "color": "orange"
  }
}
TEMPLATES>>>

YAML RENDERING
For each selected template:
- Compose a Markdown file with YAML frontmatter:
---
name: ${prefix ? prefix + name : name}
description: <description>
examples: |
  <example>
  Context: Detected stack: ${DETECTED_STACK}
  user: "Design a plan for <topic> in this repo."
  assistant: "I'll use the ${prefix ? prefix + name : name} sub-agent to research and propose a plan..."
  <commentary>
  The ${prefix ? prefix + name : name} agent focuses on planning/research and writes results to doccloud/tasks/.
  </commentary>
  </example>
tools: <comma-separated tool list>
model: <modelName>
color: <color>
---
Then body text:
- "You are an elite [ROLE] expert specializing in [DETECTED_TECHNOLOGIES]..."
- Include "## Detected Tech Stack" section with languages, frameworks, tools
- Define role-specific deliverables and responsibilities
- Include file-based context steps (1–4)
- Adapt guidance based on detected technology stack
- Rule: "Do NOT implement; plan/research only unless parent explicitly asks."

STEPS
1) Parse args.
2) Detect stack via LS/Glob/Grep on the repo.
3) Decide agent keys with rules:
   - Always include: "project-planner", "core-developer", "qa-engineer", "technical-writer"
   - If database files/configs → "database-designer"
   - If frontend framework → "ui-ux-engineer"
   - If API routes/schemas → "api-designer"
   - If Docker/K8s/CI → "devops-engineer"
   - If production project → "security-analyst"
   Apply --include/--exclude.
4) Ensure `.claude/agents/` exists; create files (skip or overwrite with --force).
5) Create/append `.claude/cloud.md` sections:
   - "## Agents (generated on <ISO>)"
   - "## Context rules"
6) Generate workflow orchestrator command:
   - Create `.claude/commands/workflow.md`
   - Include references to all generated agents
   - Set up workflow type routing (document, test, plan, implement, deploy, debug)
   - Configure multi-agent coordination through project-planner
7) Print a summary like:
   - "Created: .claude/agents/<name>.md …"
   - "Created: .claude/commands/workflow.md"
   - "Skipped (exists): …"
   - "Next: Try 'claude /workflow plan' or 'claude /workflow implement'"

WORKFLOW COMMAND GENERATION

After creating all agents, generate a workflow orchestrator command at `.claude/commands/workflow.md`:

```markdown
# /workflow

You are the **Development Workflow Orchestrator** for this project. You coordinate specialized agents to handle different development workflows efficiently.

## Project Context
Read `.claude/CLAUDE.md` first to understand the current project state, architecture, and requirements.

## Available Agents
${GENERATED_AGENTS_LIST}

## Workflow Types (from $ARGUMENTS)

Parse the first argument to determine workflow type:

### 1. "document" - Documentation Workflow
- **Single Agent**: Use technical-writer agent
- **Purpose**: Create/update documentation, API docs, architecture overviews
- **Example**: "/workflow document API endpoints"

### 2. "test" - Testing Workflow  
- **Single Agent**: Use qa-engineer agent
- **Purpose**: Test planning, automation, coverage analysis
- **Example**: "/workflow test user authentication"

### 3. "plan" - Planning Workflow
- **Single Agent**: Use project-planner agent  
- **Purpose**: Feature planning, technical roadmaps, project breakdowns
- **Example**: "/workflow plan payment integration"

### 4. "implement" - Implementation Workflow
- **Multi-Agent Coordination**: Use project-planner to coordinate relevant specialists
- **Agents**: core-developer + context-specific agents (database-designer, api-designer, etc.)
- **Purpose**: Code implementation, feature development
- **Example**: "/workflow implement user dashboard"

### 5. "deploy" - Deployment Workflow
- **Conditional Agent**: Use devops-engineer (if available), fallback to core-developer
- **Purpose**: Deployment planning, CI/CD, infrastructure
- **Example**: "/workflow deploy staging environment"

### 6. "debug" - Debugging Workflow
- **Multi-Agent Coordination**: Use project-planner to coordinate core-developer + qa-engineer
- **Purpose**: Issue investigation, bug fixing, performance optimization
- **Example**: "/workflow debug performance issues"

## Execution Logic

1. **Context Loading**: Always read `.claude/CLAUDE.md` for project context
2. **Agent Selection**: Based on workflow type, select appropriate agent(s)
3. **Task Delegation**:
   - **Single agent tasks**: "Use the [agent-name] agent to [task]..."
   - **Multi-agent tasks**: "Use the project-planner agent to coordinate [relevant-agents] for [task]..."
4. **Fallback**: If specific agents don't exist, use available alternatives

## Agent Availability Check
Before delegation, verify agents exist in `.claude/agents/` directory. Adapt instructions based on actually available agents.

## Usage Examples
- \`claude /workflow plan "add user authentication"\`
- \`claude /workflow implement "payment processing system"\`
- \`claude /workflow test "API endpoints"\`
- \`claude /workflow debug "slow database queries"\`
```

Replace ${GENERATED_AGENTS_LIST} with actual generated agent names and roles.

Now execute the workflow.
