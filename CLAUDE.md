# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                 # Start dev server with Turbopack
npm run build              # Production build
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run type-check         # TypeScript type checking
npm run format             # Format code with Prettier
npm run format:check       # Check code formatting

# Testing
npm run test               # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
npm run test:e2e           # Run Playwright e2e tests

# Database
npm run db:migrate         # Push database changes
npm run db:reset           # Reset local database
npm run db:seed            # Seed database with test data
npm run generate:types     # Generate TypeScript types from database schema

# Supabase
npm run supabase:start     # Start local Supabase stack
npm run supabase:stop      # Stop local Supabase stack
npm run supabase:status    # Check Supabase status
```

### Single Test Execution
```bash
# Run specific test file
npm run test -- path/to/test.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="should handle login"
```

## Architecture Overview

### Authentication Architecture
- **Multi-layered authentication**: Supabase Auth + Next.js middleware + Zustand state management
- **Dual Supabase clients**: 
  - `createSupabaseClient()` for client-side operations
  - `createSupabaseServerClient()` for server-side operations (handles cookies)
- **Role-based access control**: Middleware checks authentication, layouts verify specific roles
- **Protected routes**: `/admin/*`, `/profile/*`, `/orders/*` require authentication
- **Admin verification**: Database role check in `src/app/admin/layout.tsx:40-43`

### State Management
- **Zustand stores** with persistence and Redux DevTools integration
- **Auth store** (`src/store/auth.ts`): Manages user state, login/logout, profile updates
- **Cart store** (`src/store/cart.ts`): Hybrid approach - localStorage for guests, database sync for authenticated users
- **State migration**: Automatic guest cart → user cart conversion on login

### API Architecture
- **Consistent response format**: All APIs return `{ success, data, error, timestamp }`
- **Server-side Supabase client**: Every API route starts with user verification
- **Type transformations**: Database snake_case → Application camelCase
- **Error handling**: Standardized error codes and messages
- **Admin endpoints**: Require role verification (e.g., `/api/orders/[id]/status`)

### Database Integration
- **Supabase PostgreSQL** with Row Level Security (RLS)
- **Generated types**: `npm run generate:types` creates `src/types/database.ts`
- **Type safety**: Database types → Application types transformation
- **RLS policies**: Fine-grained access control at database level
- **Relationship loading**: Efficient nested selects for related data

### Component Architecture
- **Route groups**: `(auth)`, `(dashboard)` for layout organization
- **Layout hierarchy**: Root layout → Route group layouts → Page layouts
- **Smart/Dumb components**: Business logic in pages, UI logic in components
- **Headless UI**: Radix UI primitives with custom styling
- **Component categories**:
  - `/forms` - Form components with validation
  - `/layout` - Layout and navigation components
  - `/ui` - Reusable UI primitives
  - `/product` - Product-specific components
  - `/cart` - Shopping cart components
  - `/orders` - Order management components

### Security Patterns
- **Multi-level protection**:
  1. Middleware (`src/middleware.ts`) - Route-level authentication
  2. Layout components - Role verification
  3. API routes - User validation
  4. Database - RLS policies
- **Admin access**: Requires `user.role === 'admin'` in database
- **RBAC**: Customer/Admin/Moderator roles with different permissions

## Key Patterns

### Authentication Flow
1. User logs in → Supabase Auth creates session
2. Auth store updates with user data
3. Middleware protects routes on navigation
4. API routes verify user on each request
5. Database RLS policies enforce data access

### Cart Management
```typescript
// Guest user: localStorage only
// Authenticated user: localStorage + database sync
// Migration: Guest cart → User cart on login
```

### API Error Handling
```typescript
// Consistent error response format
return NextResponse.json(
  { success: false, error: { code: 'ERROR_CODE', message: 'Description' } },
  { status: 400 }
);
```

### Database Queries
```typescript
// Use select() to limit fields and improve performance
const { data } = await supabase
  .from('products')
  .select('id, name, price, images')
  .eq('is_active', true);
```

### Type Safety
- Database types generated from Supabase schema
- API responses use typed interfaces
- Component props strictly typed
- Form validation with Zod schemas

## Environment Setup

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth pages group
│   ├── (dashboard)/    # User dashboard group
│   ├── admin/          # Admin panel (role-protected)
│   └── api/            # API routes
├── components/         # React components
├── lib/               # Utilities and configurations
├── store/             # Zustand stores
└── types/             # TypeScript type definitions
```

## Database Schema

### Key Tables
- `user_profiles` - Extended user information with roles
- `products` - Product catalog with categories and brands
- `orders` - Order management with status tracking
- `cart_items` - Persistent cart for authenticated users
- `categories` - Hierarchical product categories

### User Roles
- `customer` - Default role for new users
- `admin` - Full access to admin panel
- `moderator` - Limited admin access (not implemented)

### Role Assignment
Currently requires manual database update:
```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'user_id';
```

## Development Notes

### Supabase Local Development
```bash
# Start local Supabase (includes database, auth, storage)
npm run supabase:start

# Access local services:
# - Database: http://localhost:54323
# - API: http://localhost:54321
# - Studio: http://localhost:54323
```

### Type Generation
After schema changes:
```bash
npm run generate:types
```

### Testing Strategy
- **Unit tests**: Components and utilities
- **Integration tests**: API routes and database operations
- **E2E tests**: Critical user flows with Playwright

### Code Quality
- ESLint with Next.js config
- Prettier with Tailwind CSS plugin
- TypeScript strict mode
- Husky pre-commit hooks (if configured)

## Common Issues

### Admin Access
- Check user role in database: `SELECT role FROM user_profiles WHERE id = 'user_id'`
- Admin pages require `role = 'admin'` in database

### Authentication Issues
- Verify environment variables are set
- Check Supabase project status
- Ensure auth callback URL is configured

### Build Issues
- Run `npm run type-check` for TypeScript errors
- Clear `.next` folder if needed
- Regenerate types after schema changes