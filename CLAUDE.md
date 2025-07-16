# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Otaku Secretary** monorepo - a productivity application for otaku culture enthusiasts that combines task management with anime, game, and book tracking. The project uses pnpm workspaces with Turborepo for build orchestration and follows a modern TypeScript-first architecture.

## Key Commands

### Development
```bash
pnpm dev                    # Start all applications in development mode
pnpm dev --filter @otaku-secretary/web    # Start only web app
pnpm dev --filter @otaku-secretary/api    # Start only API server

# Run both API and web simultaneously (recommended for development)
# Terminal 1: pnpm dev --filter @otaku-secretary/api
# Terminal 2: pnpm dev --filter @otaku-secretary/web
```

### Build & Test
```bash
pnpm build                  # Build all packages and applications
pnpm test                   # Run tests across all packages
pnpm test --filter @otaku-secretary/api   # Run API tests (41 tests implemented)
pnpm test tests/routes/tasks.test.ts      # Run specific test file
pnpm type-check             # Type check all packages
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier
```

### Database
```bash
pnpm db:migrate             # Apply migrations to D1 database (all packages)
pnpm db:seed                # Seed database with game masters data

# API-specific database commands (from apps/api/)
cd apps/api
pnpm db:migrate:local       # Apply migrations to local D1 database
pnpm db:execute:local       # Execute raw SQL on local D1 database
pnpm db:seed                # Seed database with game masters data (via tsx)

# Drizzle Studio (visual database management)
pnpm drizzle:studio         # Open Drizzle Studio for database inspection
```

### Deployment
```bash
pnpm deploy                 # Deploy applications
pnpm clean                  # Clean build artifacts and node_modules
```

## Architecture Overview

### Monorepo Structure
- **`apps/`** - Applications
  - `web/` - Main React web application
  - `api/` - Cloudflare Workers API server
  - `admin/` - Admin dashboard (planned)
  - `landing/` - Landing page (planned)
- **`packages/`** - Shared libraries
  - `shared/` - Common types, Zod schemas, constants
  - `ui/` - Shared React components with Storybook
  - `database/` - Drizzle ORM schemas and migrations
  - `api-client/` - HTTP client utilities using Ky
  - `config/` - Shared ESLint, TypeScript, Prettier configurations
- **`docs/`** - Documentation including comprehensive product specification

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, Zustand
- **Backend**: Cloudflare Workers, Hono framework, Drizzle ORM, Cloudflare D1 (SQLite)
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Authentication**: Lucia Auth v3 with Scrypt password hashing
- **Validation**: Zod schemas in `packages/shared`
- **Testing**: Vitest, Testing Library
- **Development**: Turborepo, pnpm workspaces, ESLint, Prettier, Storybook

## Critical Development Patterns

### API Response Structure
All API endpoints return responses in this format:
```typescript
// Success response
{
  success: true,
  data: {
    // Response data
  }
}

// Error response
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Error message'
  }
}
```

### URL Patterns
**IMPORTANT**: All API endpoint URLs must start with `/`:
```typescript
// ✅ Correct
apiClient.get('/api/tasks')
apiClient.post('/auth/login')

// ❌ Wrong - will cause proxy errors
apiClient.get('api/tasks')
apiClient.post('auth/login')
```

### Authentication Flow
1. **Login/Signup**: Returns `{ success: true, data: { user: {...} } }`
2. **Session Check**: `/auth/me` returns user data or 401
3. **Cookie Management**: Sessions use HTTPOnly cookies
4. **React Query Integration**: `useAuth` hook manages auth state

### Test Patterns
The API uses sequence-based mocking for complex database queries:
```typescript
mockDrizzleInstance.setMockSequence([
  mockGame,     // 1st query result
  null,         // 2nd query result
  mockUserGame  // 3rd query result
]);
```

## Common Issues and Solutions

### Frontend Issues
1. **Proxy Errors (500)**: Ensure all API URLs start with `/`
2. **Auth Loops**: Check React Query retry settings in `useAuth`
3. **Type Errors**: Run `pnpm type-check` to catch issues early
4. **Build Errors**: Clear `.turbo` cache with `pnpm clean`

### Backend Issues
1. **Worker Errors**: Add `nodejs_compat` flag in `wrangler.toml`
2. **Database Errors**: Run migrations with `pnpm db:migrate:local`
3. **Test Failures**: Use sequence mocking for multi-query operations
4. **CORS Issues**: Check origin settings in Hono middleware

### Development Server Setup
1. Start API server: `pnpm dev --filter @otaku-secretary/api` (port 8787)
2. Start web app: `pnpm dev --filter @otaku-secretary/web` (port 5173)
3. API proxy is configured in `vite.config.ts`

## Database Schema Overview

### Core Tables
- **users**: Authentication (id, email, username, hashed_password)
- **sessions**: Lucia Auth sessions
- **tasks**: Main task records with type, priority, completion status
- **recurring_tasks**: Templates for auto-generated tasks
- **game_masters**: Pre-seeded game catalog
- **user_games**: User's game preferences and settings

### Task Types
- `anime`: Anime episode tracking
- `game-daily`: Daily game tasks (e.g., FGO daily quests)
- `book-release`: Book release reminders

## Current Implementation Status

### ✅ Completed Features
- Complete authentication system with Lucia Auth v3
- Dashboard with glassmorphism design
- Task management (CRUD, filtering, completion)
- Game integration with master catalog
- Notification center with Sheet UI
- Notification settings page
- Statistics dashboard
- API client with proper error handling
- 41 passing API tests

### 🔄 In Progress
- Real-time updates with optimistic UI
- Browser notification integration
- Anime tracking features
- Book release management

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run `pnpm test` and `pnpm type-check`
4. Create PR with description
5. Deploy after merge

## Important Configuration Files
- `wrangler.toml` - Cloudflare Workers config (requires `nodejs_compat`)
- `vite.config.ts` - Proxy settings for API calls
- `turbo.json` - Build pipeline configuration
- `components.json` - shadcn/ui component settings
- `tailwind.config.ts` - Design tokens and theme

## Product Context

This is a Japanese-focused productivity app for otaku culture enthusiasts. Key documents:
- `docs/otaku-secretary-docs.md` - Full product specification (Japanese)
- `docs/auth-system-guide.md` - Authentication implementation guide (Japanese)

The app targets users who want to efficiently manage their anime watching, game playing, and book reading activities alongside daily tasks.