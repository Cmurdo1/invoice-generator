# Agent Guidelines for Invoice Generator

## Commands
- **Dev**: `pnpm dev` - Start development server with Vite
- **Build**: `pnpm build` - TypeScript compilation + Vite build  
- **Lint**: `pnpm lint` - Run ESLint
- **Preview**: `pnpm preview` - Preview production build
- **Deploy**: `pnpm deploy:dev` (main), `pnpm deploy:invoice` (worker)

## Architecture
React + TypeScript + Vite SPA with Cloudflare Workers backend. Uses Supabase for auth/database, Radix UI components, Tailwind CSS. Two main projects: frontend (invoice-generator) and worker backend (my-worker).

## Code Style
- **Imports**: Use `@/` alias for src paths, group external → internal → relative
- **Components**: Functional components with TypeScript, use shadcn/ui patterns
- **Heroicons**: Import from `@heroicons/react/outline` (not `/24/outline`)
- **Styling**: Tailwind CSS with dark mode variants, cn() utility for merging classes
- **Forms**: React Hook Form + Zod validation
- **State**: Context for auth/notifications, React hooks for local state
- **Error handling**: Try/catch with toast notifications
- **Naming**: camelCase for variables/functions, PascalCase for components
