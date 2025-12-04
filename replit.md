# Overview

This is a Turkish-language landing page and lead generation application for Flow Coaching & Leadership Institute's ICF-certified coaching education program. The application features an AI-powered chatbot that engages visitors, collects lead information, and provides information about the coaching certification program. It includes both traditional form-based and conversational AI interfaces for lead capture, with admin capabilities for lead management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon recommended) with `sslmode=require`. |
| `SESSION_SECRET` | ✅ | Secret used by Express session cookies. Generate a long random string. |
| `RESEND_API_KEY` | ✅ | API key for Resend transactional emails. |
| `RESEND_FROM_EMAIL` | ⚠️ | Verified sender identity for Resend (e.g., `Flow Coaching <no-reply@example.com>`). Defaults to `bilgi@in-flowtr.com` if omitted. |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | ⚠️ | OpenAI-compatible API key for the chatbot flow. |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | ⚠️ | Custom OpenAI base URL (optional, defaults to official API). |
| `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | ⚠️ | Enable Google reCAPTCHA v3 validation on lead forms when both are set. |

> ℹ️ Vercel deployments must configure these variables in the Project Settings → Environment Variables panel.

## Frontend Architecture

**Framework & Build Tools:**
- React with TypeScript using Vite as the build tool
- Client-side routing via Wouter (lightweight React router)
- shadcn/ui component library with Radix UI primitives
- TailwindCSS v4 for styling with custom design tokens
- Framer Motion for animations

**State Management:**
- TanStack Query (React Query) for server state and API communication
- React Hook Form with Zod validation for form handling

**Key Design Decisions:**
- Component-based architecture with reusable UI primitives in `client/src/components/ui/`
- Page components located in `client/src/pages/` (home, home2, contact, admin)
- Two landing page variants: one with traditional lead form (`/`), one with AI chat (`/home2`)
- TypeScript path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

## Backend Architecture

**Framework:**
- Express.js server with TypeScript
- ESM modules throughout the codebase
- HTTP server with development hot-reload via Vite middleware

**API Design:**
- RESTful endpoints under `/api` prefix
- `/api/leads` - POST for lead creation, GET for admin lead retrieval (protected)
- `/api/chat` - POST for AI chatbot interactions
- `/api/settings/notification-emails` - GET/PUT for email notification configuration (protected)
- `/api/auth/*` - Authentication routes (login, logout, me, setup, setup-status)
- `/api/admin/users` - Admin user management (protected)

**Key Features:**
- Request logging middleware with timing metrics
- Static file serving for production builds
- reCAPTCHA v3 integration for form spam protection (enforced when secret key is set)
- Lead data extraction from AI conversations using pattern matching
- Admin authentication with bcrypt password hashing
- Session management with PostgreSQL store for production

## Data Layer

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database operations
- Schema defined in `shared/schema.ts` with Zod validation

**Tables:**
- `leads` - Stores contact information (fullName, email, phone, consent, timestamps)
- `settings` - Key-value store for application configuration
- `admin_users` - Admin user accounts with hashed passwords (email, password, name, timestamps)
- `session` - PostgreSQL session store (auto-created by connect-pg-simple)

**Design Patterns:**
- Repository pattern via `DBStorage` class in `server/storage.ts`
- Shared schema between frontend and backend for validation consistency
- Database migrations managed through Drizzle Kit

## External Dependencies

**AI Integration:**
- OpenAI Chat Completions API for conversational AI chatbot
- Custom system prompt defining AI behavior as educational consultant and sales representative
- Structured data extraction from conversations using bracketed JSON format
- API credentials configured via environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

**Email Service:**
- Resend API for transactional email notifications (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- Notification recipient list stored in the database (`notification_emails` setting) and managed from the admin panel
- Emails are sent immediately after each lead submission (standard form or AI chat)

**Security & Analytics:**
- Google reCAPTCHA v3 for bot protection on form submissions
- Score-based validation (threshold: 0.5)
- Google Ads conversion tracking (gtag.js)

**Development Tools (Replit-specific):**
- Vite plugins for runtime error overlay and development banner
- Cartographer plugin for code navigation
- Custom meta images plugin for OpenGraph image URL generation

**Session Management:**
- PostgreSQL session store via `connect-pg-simple`
- Configured for production deployment tracking

**Build Process:**
- Custom esbuild configuration for server bundling
- Selective dependency bundling to optimize cold start times
- Vite for client-side bundling with asset optimization