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
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, Zustand
- **Backend**: Cloudflare Workers, Hono framework, Drizzle ORM, Cloudflare D1 (SQLite)
- **UI Components**: Radix UI primitives with shadcn/ui design system
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

### Web Application Structure (`apps/web`)
- **React Router v7** with standard routing approach (not file-based)
- **shadcn/ui** components library with Radix UI primitives
- **Tailwind CSS** for styling with design system tokens
- **Component Structure**:
  - `/src/components/ui/` - shadcn/ui components (accordion, button, card, etc.)
  - `/src/components/` - Application-specific components (Layout, auth-form, theme-provider)
  - `/src/lib/utils.ts` - Utility functions including className merging
  - `/src/hooks/` - Custom React hooks
- **Configuration**:
  - `components.json` - shadcn/ui configuration
  - `tailwind.config.ts` - Tailwind with design tokens and Japanese color scheme
  - `vite.config.ts` - Vite config with API proxy to port 8787
  - `vitest.config.ts` - Test configuration (setup pending)

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
- `apps/web/components.json` - shadcn/ui configuration with path aliases
- `apps/web/postcss.config.mjs` - PostCSS configuration for Tailwind

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

#### Web App Development Notes
- **React Router v7**: Uses traditional routing with `BrowserRouter`, not the new app directory structure
- **CSS Imports**: Use direct CSS imports, not `?url` suffix for stylesheets
- **Path Aliases**: `@/` resolves to `src/` directory for component imports
- **Tailwind Classes**: Custom classes like `bg-background` are defined in CSS variables, not TailwindCSS utilities
- **Component Library**: shadcn/ui components are installed and configured in `src/components/ui/`
- **Development Server**: Runs on port 5173 with API proxy to port 8787

## Current Development Status

### Frontend State (apps/web)
- **React Router v7** configured with standard routing (not file-based routing)
- **Authentication UI** implemented with comprehensive form validation
- **Component Library** set up with shadcn/ui and Radix UI primitives
- **Theme System** configured with dark/light mode support
- **Path Aliases** configured (`@/` -> `src/`) for clean imports
- **Development Tools** configured (Vitest, TypeScript, Tailwind)

### Current Routes
- `/` - Layout with nested routes
- `/login` - Authentication form (login/signup/password reset)

### Key Implementation Details
- **Routing**: Using React Router v7 with `BrowserRouter` and `Routes`/`Route` components
- **Authentication**: Frontend form with validation, not yet connected to backend API
- **UI Components**: Comprehensive shadcn/ui component library with Japanese language support
- **State Management**: Theme provider implemented, other state management (TanStack Query, Zustand) ready for integration
- **Testing**: Vitest configured but test suite not yet implemented

### Next Steps
- Connect authentication forms to backend API endpoints
- Implement protected routes and authentication state management
- Add dashboard and core application features
- Implement test suite with Vitest and Testing Library

### Missing Critical Components
- **API Client Package**: `packages/api-client` structure exists but implementation files are missing
  - Need to create service files: `services/auth.ts`, `services/tasks.ts`, etc.
  - Base HTTP client configuration using Ky library
  - Error handling utilities for consistent API responses
- **Authentication State Management**: Frontend needs TanStack Query or Zustand integration for auth state
- **Protected Route Component**: Route protection mechanism for authenticated-only pages
- **Testing Suite**: Comprehensive test coverage for authentication flow and UI components

## Common Development Issues and Solutions

### Frontend Development
1. **Path Alias Configuration**: The project uses `@/` aliases configured in `vite.config.ts` and `tsconfig.json`
2. **Component Import Issues**: Ensure shadcn/ui components are imported from `@/components/ui/`
3. **Tailwind CSS Classes**: Use the configured design tokens in `tailwind.config.ts` for consistent theming
4. **Theme Provider**: Dark/light mode is handled by ThemeProvider component with localStorage persistence

### API Integration
1. **CORS Configuration**: Backend is configured for `localhost:5173` in development
2. **Cookie-based Authentication**: HTTPOnly cookies require proper credentials handling
3. **Proxy Configuration**: Vite dev server proxies `/api` requests to `localhost:8787`
4. **Error Handling**: API errors should be handled consistently across all service calls

### Database and Authentication
1. **Session Management**: Lucia Auth v3 handles session validation with D1 database
2. **Password Hashing**: Uses Scrypt (not Argon2) due to Cloudflare Workers limitations
3. **Database Migrations**: Drizzle ORM manages schema changes and migrations
4. **User Registration**: Checks for existing email/username before creating accounts

## Web Application Implementation

The web application (`apps/web`) is built with React 19 and uses traditional React Router v7 setup (not the new app directory structure). Key implementation details:

### Current Structure
- **Entry Point**: `src/index.tsx` with React 19 concurrent features
- **Routing**: React Router v7 with `BrowserRouter` and traditional `Routes`/`Route` components
- **Authentication UI**: Comprehensive auth form with login/signup/password reset modes
- **Component Library**: Full shadcn/ui integration with Japanese language support
- **Theming**: Dark/light mode with CSS custom properties and Tailwind integration

### Authentication Form Features
- **Multi-mode Interface**: Login, signup, and password reset in single component
- **Real-time Validation**: Client-side validation with Zod-like patterns
- **Password Strength Indicator**: Visual feedback for password complexity
- **Accessibility**: ARIA labels, proper focus management, keyboard navigation
- **Japanese Language**: All UI text in Japanese with proper error messages

### Development Recommendations
1. **API Integration**: Connect the existing auth form to backend endpoints
2. **State Management**: Implement TanStack Query for server state and Zustand for client state
3. **Protected Routes**: Create a route wrapper component for authentication checks
4. **Error Boundaries**: Add React error boundaries for better error handling
5. **Testing**: Write unit tests for components and integration tests for auth flow

### UI Component Library
- **shadcn/ui**: Comprehensive component library with 25+ components
- **Radix UI**: Low-level primitives for accessibility and behavior
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants
- **Components**: Button, Card, Dialog, Form, Input, Select, Toast, etc.
- **Location**: `src/components/ui/` with TypeScript definitions

### Authentication Implementation Status
- **Backend**: Complete Lucia Auth v3 implementation with Hono routes
- **Frontend**: Authentication UI implemented but not connected to backend
- **Database**: User and session tables created with Drizzle ORM
- **Security**: Scrypt password hashing, HTTPOnly cookies, CORS configured
- **Validation**: Zod schemas for consistent validation on both frontend and backend

### Ready for Integration
The codebase is ready for connecting the frontend authentication form to the backend API. The main missing piece is the API client implementation in `packages/api-client` to bridge the frontend and backend.

## Product Context

This is a Japanese-focused productivity application targeting otaku culture enthusiasts. The comprehensive product specification is available in `docs/otaku-secretary-docs.md` (in Japanese), covering user personas, technical requirements, and business model. The authentication system implementation guide is in `docs/auth-system-guide.md` (in Japanese). The project is currently in Phase 0 (infrastructure setup) with core features to be implemented.


## Product Context

This is a Japanese-focused productivity application targeting otaku culture enthusiasts. The comprehensive product specification is available in `docs/otaku-secretary-docs.md` (in Japanese), covering user personas, technical requirements, and business model. The authentication system implementation guide is in `docs/auth-system-guide.md` (in Japanese). The project is currently in Phase 0 (infrastructure setup) with core features to be implemented.