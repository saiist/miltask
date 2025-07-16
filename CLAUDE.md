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
  - `/src/components/ui/` - shadcn/ui components (button, card, switch, checkbox, select, etc.)
  - `/src/components/` - Application-specific components (Layout, auth-form, theme-provider, NotificationCenter)
  - `/src/components/modals/` - Feature-specific modal components (add-task, add-anime, add-game)
  - `/src/pages/` - Route components (Dashboard, NotificationSettings)
  - `/src/hooks/` - Custom React hooks (use-auth, use-tasks, use-toast)
  - `/src/lib/utils.ts` - Utility functions including className merging
- **Configuration**:
  - `components.json` - shadcn/ui configuration
  - `tailwind.config.ts` - Tailwind with design tokens and Japanese color scheme
  - `vite.config.ts` - Vite config with API proxy to port 8787
  - `vitest.config.ts` - Test configuration (setup pending)

## Core Entities and Database Implementation

The application manages these main entities with full database implementation:

### Database Schema (`packages/database/src/schema/`)
- **users** - Authentication and user profiles (`users.ts`)
- **sessions** - Lucia Auth session management (`users.ts`)
- **tasks** - Core task management system (`tasks.ts`)
  - Types: 'anime', 'game-daily', 'book-release'
  - Priorities: 'high', 'medium', 'low'
  - Sources: 'manual', 'recurring', 'external'
- **recurring_tasks** - Template system for daily task generation (`recurring-tasks.ts`)
- **game_masters** - Game catalog with daily task definitions (`game-masters.ts`)
- **user_games** - User-specific game settings and enabled tasks (`user-games.ts`)

### Entity Relationships
- Users have many Tasks and RecurringTasks
- UserGames links Users to GameMasters with custom settings
- RecurringTasks generate Tasks based on schedule
- Tasks can be manually created or auto-generated from RecurringTasks

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

### Frontend Implementation (`apps/web`)
- **React Router v7** with standard routing (not file-based routing)
- **Complete Authentication System** with API integration
  - Login/signup/password reset forms with Zod validation and react-hook-form
  - `useAuth` hook with TanStack Query for state management
  - Private/public route protection with automatic redirects
  - HTTPOnly cookie-based session management
- **Dashboard Implementation** with glassmorphism design
  - Statistics cards, floating star animations, beautiful UI
  - Modal components for adding tasks, anime, and games
  - Filter functionality for tasks, anime, and games with status-based filtering
  - Tabbed interface for different content types (overview, tasks, anime, games)
  - Full integration with authentication system and real-time API data
- **Notification System** with comprehensive functionality
  - **Notification Center**: Sheet-based sliding panel with real-time notifications
    - Date-grouped notification display (今日/昨日/specific dates)
    - 5 notification types: reminders, new anime, achievements, books, game resets
    - Interactive features: mark as read, delete, unread count badges
    - Integrated into dashboard header with Bell icon trigger
  - **Notification Settings Page**: Comprehensive preferences management
    - Browser notification permission handling and status display
    - Granular notification preferences (anime, games, tasks, book releases)
    - Reminder timing configuration (1h, 3h, 1 day before)
    - Daily task notification time selection
    - Consistent glassmorphism design matching dashboard
- **Component Library** complete shadcn/ui integration with Japanese language support
- **API Client** package with full service layer integration

### Current Routes
- `/` - Redirects to dashboard (protected)
- `/login` - Authentication form (public route)
- `/dashboard` - Main dashboard with task/anime/game management and notification center (protected)
- `/notifications` - Notification settings page (protected)

### Authentication Flow Implementation
- **Frontend**: Complete auth forms with validation, error handling, toast notifications
- **API Integration**: Full service layer with proper error handling and state management
- **Session Management**: HTTPOnly cookies with automatic session validation
- **Route Protection**: Private routes automatically redirect to login when unauthenticated
- **State Management**: TanStack Query with optimized caching and refetch strategies

## API Implementation Status

### Completed Backend Implementation (`apps/api/src/`)
- **Authentication System**: Complete Lucia Auth v3 integration
  - Routes: `/auth/signup`, `/auth/login`, `/auth/logout`, `/auth/me`
  - Middleware: Session validation and authentication
  - Security: Scrypt password hashing, HTTPOnly cookies
  
- **Task Management API**: Full CRUD with advanced features
  - `GET /api/tasks/today` - Today's tasks with progress summary
  - `POST /api/tasks` - Create new tasks
  - `PUT /api/tasks/:id` - Update existing tasks
  - `DELETE /api/tasks/:id` - Delete tasks
  - `POST /api/tasks/:id/complete` - Mark task complete
  - `POST /api/tasks/bulk-complete` - Bulk complete multiple tasks

- **Game Integration API**: Game catalog and user settings
  - `GET /api/games` - Available games (public endpoint)
  - `GET /api/games/user` - User's game settings
  - `POST /api/games/user` - Add/update game settings
  - `DELETE /api/games/user/:gameId` - Remove game settings

- **Recurring Tasks API**: Template management for daily tasks
  - `GET /api/recurring-tasks` - User's recurring task templates
  - `POST /api/recurring-tasks` - Create recurring task template
  - `PUT /api/recurring-tasks/:id` - Update template
  - `DELETE /api/recurring-tasks/:id` - Delete template

### Database Implementation
- **Drizzle ORM**: Complete schema with indexes and foreign keys
- **Migrations**: Automated migration system with Drizzle Kit
- **Seed Data**: Pre-populated game masters (FGO, Genshin, Uma Musume, etc.)
- **D1 Integration**: Cloudflare D1 (SQLite) for production deployment

### Testing Suite (41 tests passing)
- **Route Tests**: Comprehensive API endpoint testing
- **Integration Tests**: End-to-end task management flows  
- **Unit Tests**: Validation and utility function testing
- **Mock Infrastructure**: Database and authentication mocking
- **Files**: `tests/routes/`, `tests/integration/`, `tests/unit/`

### Next Development Steps
- **Data Integration**: Connect dashboard modals to actual API endpoints
- **Real-time Updates**: Implement optimistic updates and loading states
- **Task Management**: Build task list views and filtering functionality
- **Media Tracking**: Implement anime and game progress tracking features

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

### API Development and Testing
1. **Test Architecture**: Uses Vitest with comprehensive mocking system
   - Mock Drizzle instance with sequence-based query simulation
   - Authentication middleware mocking for protected routes
   - Consistent test utilities in `tests/helpers/`
2. **Route Testing Pattern**: Each API endpoint has dedicated test file
   - Tests cover success cases, error handling, and edge cases
   - Mock data setup for realistic database interactions
3. **Database Schema Updates**: 
   - Use `pnpm db:generate` to create migrations from schema changes
   - Index optimization for common query patterns (user_id, date ranges)
4. **Game Masters Management**: Pre-seeded catalog of popular games
   - FGO (Fate/Grand Order), Genshin Impact, Uma Musume, etc.
   - Each game has defined daily task templates
5. **Task Generation Logic**: Recurring tasks automatically create daily tasks
   - Template-based system with user customization
   - Priority inheritance and metadata preservation

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

### Implementation Guidelines

#### Working with the API
1. **Development Server**: API runs on `localhost:8787`, web on `localhost:5173`
2. **Authentication Flow**: 
   - Use `/auth/signup`, `/auth/login` endpoints
   - Sessions are managed via HTTPOnly cookies
   - Protected routes require authentication middleware
3. **Task Management**:
   - Use `/api/tasks/today` for dashboard data
   - Implement optimistic updates for task completion
   - Handle bulk operations for better UX
4. **Game Integration**:
   - Fetch available games from `/api/games` (public)
   - Manage user settings via `/api/games/user` endpoints
   - Enable/disable specific daily tasks per game

#### Testing Strategy
1. **API Tests**: Run `pnpm test` in `apps/api` (41 tests implemented)
2. **Mock Patterns**: Use sequence-based mocking for complex API flows
3. **Integration Tests**: Test complete user workflows
4. **Frontend Tests**: Add Vitest tests for components and hooks

#### Integration Completed
The application now has comprehensive end-to-end integration:
1. ✅ API client services implemented in `packages/api-client`
2. ✅ Auth forms connected to backend endpoints with error handling
3. ✅ Dashboard UI with glassmorphism design, filtering, and modal components
4. ✅ Real-time state management with TanStack Query and authentication hooks
5. ✅ Notification settings page with browser notification API integration
6. ✅ Navigation flow using React Router v7 with proper redirects
7. ✅ Consistent shadcn/ui component usage across all pages (including Sheet-based notification center)
8. ✅ Task management with real API integration (create, complete, filter)
9. ✅ Notification center implementation with Sheet component and mock data system

### Current Development Patterns

#### Navigation and Routing
- **Header-based Navigation**: 
  - Bell icon → Notification center (Sheet panel)
  - Settings (gear icon) → Notification settings page
- **Breadcrumb Navigation**: Back button on settings page → Dashboard
- **Route Protection**: All main pages require authentication
- **Redirect Strategy**: Root path (`/`) automatically redirects to `/dashboard`

#### State Management Patterns
```typescript
// Task management with real-time updates
const { data: todayTasksData, isLoading } = useTodayTasks()
const createTaskMutation = useCreateTask()
const completeTaskMutation = useCompleteTask()

// Filter state management (local state)
const [taskFilter, setTaskFilter] = useState<"all" | "completed" | "pending">("all")
const [animeFilter, setAnimeFilter] = useState<"all" | "watching" | "completed" | "planned">("all")

// Settings state (local state with localStorage persistence planned)
const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false)
```

#### UI Component Patterns
- **Glassmorphism Cards**: `backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl`
- **Interactive Elements**: Hover effects with `hover:translate-y-[-2px] transition-transform`
- **Consistent Icons**: Lucide React icons with 4-5px sizes and thematic colors
- **Filter Buttons**: Pill-shaped buttons with active state styling
- **Modal Components**: Centralized modal system with form validation
- **Sheet Components**: Side panels for notification center using Radix UI primitives
- **Notification UI**: Date-grouped lists with unread badges and interactive controls

The next phase involves expanding media tracking capabilities and implementing more advanced notification scheduling features.

## Product Context

This is a Japanese-focused productivity application targeting otaku culture enthusiasts. The comprehensive product specification is available in `docs/otaku-secretary-docs.md` (in Japanese), covering user personas, technical requirements, and business model. The authentication system implementation guide is in `docs/auth-system-guide.md` (in Japanese). 

### Current Implementation Status
The project has completed the core authentication, dashboard, and settings functionality:
- ✅ **Phase 0**: Authentication system, database schema, API foundation
- ✅ **Phase 1a**: Core task management API and database implementation  
- ✅ **Phase 1b**: Game integration system with popular titles (FGO, Genshin, etc.)
- ✅ **Phase 1c**: Recurring task templates and automation
- ✅ **Phase 2a**: Frontend authentication integration with complete API client
- ✅ **Phase 2b**: Dashboard UI implementation with glassmorphism design and filtering
- ✅ **Phase 2c**: Modal components for adding tasks, anime, and games
- ✅ **Phase 2d**: Notification settings page with browser notification API integration
- ✅ **Phase 2e**: Navigation flow between dashboard and settings with header-based routing
- ✅ **Phase 2f**: Notification center implementation with Sheet-based UI and mock data system
- 🔄 **Phase 3**: Enhanced data management, real-time functionality, and notification backend integration (next steps)

The application now provides a complete user experience with authentication, task management, filtering capabilities, user preferences management, and a modern notification center. The glassmorphism design is consistently applied across all pages and components.

## Notification Center Implementation

The notification center is implemented as a Sheet-based component that provides real-time notification management:

### Architecture
- **Component**: `NotificationCenter.tsx` using Radix UI Sheet primitives
- **Integration**: Embedded in dashboard header with Bell icon trigger
- **Data**: Currently uses mock data structure for development and testing

### Features
- **Date Grouping**: Notifications organized by "今日", "昨日", and specific dates
- **Type System**: 5 distinct notification types with appropriate icons and styling
- **Interactive Management**: Mark as read, delete individual notifications, batch operations
- **Visual Indicators**: Unread count badges with pulse animation, read/unread styling
- **Responsive Design**: Mobile-optimized Sheet panel with proper touch interactions

### Notification Types
```typescript
type NotificationType = "reminder" | "new-anime" | "daily-achievement" | "new-book" | "game-reset"
```

### Integration Points
- **Authentication**: Fully integrated with auth system and route protection
- **Settings**: Connected to notification settings page for preference management
- **State Management**: Uses React local state with plans for API integration
- **Design System**: Consistent with glassmorphism theme and shadcn/ui components

### Development Notes
- Mock data structure is ready for backend API integration
- Sheet component provides excellent UX for mobile and desktop
- Notification persistence and real-time updates are planned for Phase 3
- All Japanese language UI text is properly implemented and tested