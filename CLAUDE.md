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
```

### Build & Test
```bash
pnpm build                  # Build all packages and applications
pnpm test                   # Run tests across all packages
pnpm test --filter @otaku-secretary/ui    # Run tests for specific package
pnpm type-check             # Type check all packages
pnpm lint                   # Lint all packages
pnpm format                 # Format code with Prettier
```

### Database
```bash
pnpm db:migrate             # Run database migrations
pnpm db:seed                # Seed database with test data
```

### Deployment
```bash
pnpm deploy                 # Deploy applications
pnpm clean                  # Clean build artifacts and node_modules
```

## Architecture Overview

### Monorepo Structure
- **`apps/`** - Applications (web React app, API server, admin dashboard, landing page)
- **`packages/`** - Shared libraries (UI components, types, database schemas, utilities)
- **`docs/`** - Documentation including comprehensive product specification

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand
- **Backend**: Cloudflare Workers, Hono framework, Drizzle ORM, Cloudflare D1 (SQLite)
- **Authentication**: Lucia Auth v3 with Scrypt password hashing
- **Validation**: Zod schemas in `packages/shared`
- **Testing**: Vitest, Testing Library
- **Development**: Turborepo, pnpm workspaces, ESLint, Prettier, Storybook

### Key Packages
- **`@otaku-secretary/shared`** - Common types, Zod schemas, constants (exported from `src/index.ts`)
- **`@otaku-secretary/ui`** - Shared React components with Storybook (`pnpm storybook` to develop)
- **`@otaku-secretary/database`** - Drizzle ORM schemas and migrations
- **`@otaku-secretary/api-client`** - HTTP client utilities using Ky
- **`@otaku-secretary/config`** - Shared ESLint, TypeScript, Prettier configurations

## Authentication System

The application uses **Lucia Auth v3** with the following setup:

### Database Schema
- **users** - User accounts (id, email, username, hashed_password)
- **sessions** - User sessions with expiration
- **oauth_accounts** - Future OAuth integration support

### API Endpoints
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Authentication Flow
1. Passwords are hashed using **Scrypt** (not Argon2 due to Workers limitations)
2. Sessions are managed via **HTTPOnly cookies**
3. Session validation is handled by middleware
4. D1 database stores user and session data

## Development Patterns

### Type Safety
- All inter-package communication uses TypeScript types from `packages/shared`
- API contracts defined with Zod schemas for runtime validation
- Database schemas defined with Drizzle ORM for type-safe queries

### Package Dependencies
- Internal packages use `workspace:*` dependencies
- Shared types and schemas are consumed by all applications
- UI components are built in isolation with Storybook

### Feature Structure
- Frontend features organized by domain (`features/auth`, `features/tasks`, `features/anime`, etc.)
- Backend routes organized by entity (`routes/auth.ts`, `routes/tasks.ts`, etc.)
- Database schemas mirror the shared type definitions

## Core Entities

The application manages these main entities (see `packages/shared/src/types/models/`):
- **User** - Authentication and preferences
- **Task** - Todo items with categories and priorities
- **Anime** - Anime tracking with watch status
- **Game** - Game tracking with play status
- **Book** - Book tracking (planned)

## Configuration Notes

### Environment Setup
- Node.js 20+ (required)
- pnpm 8+ as package manager
- Cloudflare Workers for API deployment

### Key Configuration Files
- `turbo.json` - Build pipeline and caching
- `pnpm-workspace.yaml` - Workspace package definitions
- `apps/api/wrangler.toml` - Cloudflare Workers configuration
- `packages/config/eslint/base.js` - Shared ESLint rules

### Development Workflow
1. Make changes in relevant packages
2. Turborepo automatically handles build dependencies
3. Hot reload available in development mode
4. Type checking and linting run across all packages
5. Tests should be added for new features in respective packages

### Important Notes

#### Cloudflare Workers Limitations
- No Node.js APIs available
- Use Web APIs and Cloudflare-specific APIs
- Bundle size limitations apply
- Stateless execution environment

#### Authentication Security
- HTTPOnly cookies for session management
- Scrypt for password hashing (Workers-compatible)
- CORS configured for frontend domain
- Session expiration and cleanup

#### Monorepo Conventions
- All packages use TypeScript
- Shared configurations in `packages/config`
- Cross-package imports use workspace protocol
- Turborepo handles build dependencies

## Product Context

This is a Japanese-focused productivity application targeting otaku culture enthusiasts. The comprehensive product specification is available in `docs/otaku-secretary-docs.md` (in Japanese), covering user personas, technical requirements, and business model. The authentication system implementation guide is in `docs/auth-system-guide.md` (in Japanese). The project is currently in Phase 0 (infrastructure setup) with core features to be implemented.