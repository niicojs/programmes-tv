# AGENTS.md - AI Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

**Programme TV** is a French TV schedule website that displays prime-time programs (20h-23h) for major French TNT channels. The site is **statically generated nightly** using Astro.

### How It Works

1. **Data Source**: TV schedule data is fetched from `https://xmltvfr.fr/xmltv/xmltv_tnt.xml.gz`
2. **Build Process**: A nightly job downloads the XMLTV data and triggers Astro build
3. **Output**: Static HTML pages showing tonight's programs for main French channels
4. **Time Window**: Programs airing between 20:00 and 23:00 (prime time / soirée)

### XMLTV Data Format

The data source uses XMLTV format (gzipped XML):

- `<channel>` elements define TV channels (id, display-name, icon)
- `<programme>` elements contain show details (start, stop, channel, title, desc, category)
- Times are in format `YYYYMMDDHHmmss +0100` (French timezone)

### Technology Stack

| Technology   | Version       | Purpose                         |
| ------------ | ------------- | ------------------------------- |
| Astro        | ^6.0.0-beta.3 | Web framework / static site gen |
| Tailwind CSS | ^4.1          | Utility-first CSS framework     |
| TypeScript   | ^5.9          | Type checking (strict mode)     |
| pnpm         | -             | Package manager                 |
| oxfmt        | ^0.26.0       | Code formatter                  |
| Node.js      | ES Modules    | Runtime (`"type": "module"`)    |

---

## Build / Dev / Test Commands

All commands are run from the project root using `pnpm`:

| Command            | Description                               |
| ------------------ | ----------------------------------------- |
| `pnpm install`     | Install dependencies                      |
| `pnpm dev`         | Start dev server at http://localhost:4321 |
| `pnpm build`       | Build production site to `./dist/`        |
| `pnpm preview`     | Preview production build locally          |
| `pnpm format`      | Format code using oxfmt                   |
| `pnpm astro check` | Run Astro's type checking                 |

### Type Checking

```bash
pnpm astro check
```

This runs Astro's built-in TypeScript checking with the strict configuration.

### Testing

**No test framework is currently configured.** If tests are added, they should:

- Use Vitest (recommended for Astro projects)
- Follow the pattern: `*.test.ts` or `*.spec.ts`
- Be placed alongside source files or in a `__tests__/` directory

To run a single test (once Vitest is configured):

```bash
pnpm test -- path/to/file.test.ts
# or
pnpm vitest run path/to/file.test.ts
```

### Linting

**No linter is currently configured.** If ESLint is added:

```bash
pnpm lint           # Run linter
pnpm lint --fix     # Auto-fix issues
```

---

## Project Structure

```
/
├── public/                  # Static assets (favicon, images)
├── src/
│   ├── components/          # Astro components
│   │   ├── Layout.astro     # Main HTML layout
│   │   ├── Header.astro     # Page header with date
│   │   ├── Footer.astro     # Page footer
│   │   ├── ChannelRow.astro # Channel with programmes
│   │   └── ProgramCard.astro# Single program card
│   ├── lib/                 # TypeScript utilities
│   │   ├── types.ts         # Type definitions
│   │   ├── utils.ts         # Date formatting, helpers
│   │   └── xmltv.ts         # XMLTV parser
│   ├── pages/
│   │   └── index.astro      # Homepage
│   └── styles/
│       └── global.css       # Tailwind imports
├── .github/workflows/
│   └── nightly-build.yml    # GitHub Actions cron job
├── astro.config.mjs         # Astro + Tailwind config
├── tsconfig.json            # TypeScript (strict)
└── package.json
```

---

## Code Style Guidelines

### Styling (Tailwind CSS)

- Use **Tailwind utility classes** directly in components
- Custom theme colors defined in `src/styles/global.css`
- Prefer Tailwind classes over custom CSS
- Use responsive prefixes: `md:`, `lg:`, etc.

```astro
<!-- Good: Tailwind classes -->
<div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all">
  <h2 class="text-xl font-bold text-slate-900">Title</h2>
</div>
```

### Formatting (oxfmt)

Configuration in `.oxfmtrc.json`:

```json
{
  "singleQuote": true,
  "printWidth": 120
}
```

- **Single quotes** for strings
- **120 character** line width
- Run `pnpm format` before committing

### Indentation

- **Tabs** for Astro files (`.astro`)
- **2 spaces** for JS/TS files (standard)

### Imports

```typescript
// CSS import in Layout.astro
import '../styles/global.css';

// Use ES module imports (not CommonJS)
import { something } from 'package'; // Named imports
import DefaultExport from 'package'; // Default imports
import type { SomeType } from 'package'; // Type-only imports
```

**Import Order** (recommended):

1. CSS imports
2. Node.js built-ins
3. External packages
4. Internal aliases/paths
5. Relative imports
6. Type imports (with `type` keyword)

### TypeScript

- **Strict mode enabled** via `astro/tsconfigs/strict`
- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and aliases
- Always use type-only imports when importing only types

```typescript
// Preferred
interface Channel {
  id: string;
  name: string;
  icon?: string;
}

// For unions/aliases
type Status = 'pending' | 'active' | 'completed';

// Type-only import
import type { Channel } from './types';
```

### Naming Conventions

| Element          | Convention  | Example                 |
| ---------------- | ----------- | ----------------------- |
| Files            | kebab-case  | `my-component.astro`    |
| Directories      | kebab-case  | `src/components/`       |
| Components       | PascalCase  | `<MyComponent />`       |
| Functions        | camelCase   | `fetchPrograms()`       |
| Constants        | UPPER_SNAKE | `API_BASE_URL`          |
| Variables        | camelCase   | `programList`           |
| Types/Interfaces | PascalCase  | `interface ProgramData` |

### Astro Components

```astro
---
// Component script (frontmatter) - runs at build time
import '../styles/global.css';
import type { Props } from './types';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Default' } = Astro.props;
---

<!-- Use Tailwind classes for styling -->
<div class="bg-white rounded-lg p-4 shadow-md">
  <h1 class="text-2xl font-bold text-slate-900">{title}</h1>
  <p class="text-gray-600">{description}</p>
</div>
```

### Error Handling

```typescript
// Use try-catch for async operations
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Handle gracefully
}

// Type-safe error handling
if (error instanceof Error) {
  console.error(error.message);
}

// For API responses, check status
const response = await fetch(url);
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
```

---

## Git Workflow

- Write clear, concise commit messages
- Use conventional commits when applicable: `feat:`, `fix:`, `docs:`, `refactor:`
- Run `pnpm format` before committing
- Run `pnpm astro check` to verify types before pushing
