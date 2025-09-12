# Overview

PromptMaster is a web-based prompt engineering learning platform that teaches users how to craft effective AI prompts through interactive modules and real-time feedback. The application features a structured curriculum covering basic prompting, prompt structure, advanced techniques, refinement strategies, and practical applications. Users can practice writing prompts, receive AI-powered assessments with detailed feedback, and track their progress through the learning modules.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with a simple switch-based approach
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Component Structure**: Modular components including Navigation, ModuleCard, PromptEditor, FeedbackPanel, and ProgressTracker

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for modules, progress tracking, and prompt assessment
- **Session Management**: Express sessions with PostgreSQL session storage using connect-pg-simple
- **Request Logging**: Custom middleware for API request/response logging with performance metrics
- **Error Handling**: Centralized error handling middleware with structured error responses

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Schema Management**: Shared schema definitions between client and server using Drizzle and Zod
- **Tables**: Users, modules, user progress, and prompt attempts with proper relationships
- **Data Validation**: Zod schemas for runtime type validation and API contract enforcement

## Development Architecture
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories
- **Build System**: Vite for frontend bundling and esbuild for server bundling
- **Type Safety**: Full TypeScript coverage with shared types between frontend and backend
- **Path Aliases**: Configured path mappings for clean imports (`@/`, `@shared/`)

## Module System
- **Content Structure**: JSON-based module content with sections, exercises, and metadata
- **Progress Tracking**: Individual user progress per module with completion status and scoring
- **Assessment System**: AI-powered prompt evaluation with multiple scoring criteria
- **Learning Path**: Sequential module unlocking based on completion status

# External Dependencies

## Core Infrastructure
- **Database**: PostgreSQL (configured via Drizzle with Neon serverless adapter)
- **Session Store**: PostgreSQL-backed session storage for user state persistence

## AI Services
- **OpenAI API**: GPT-5 model for prompt assessment and feedback generation
- **Assessment Features**: Real-time prompt evaluation with detailed scoring across multiple criteria
- **Feedback Generation**: AI-generated suggestions for prompt improvement

## UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Design System**: shadcn/ui for pre-styled component variants
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)

## Development Tools
- **Build Tools**: Vite with React plugin and runtime error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Experience**: Replit-specific plugins for enhanced development workflow
- **Asset Management**: Vite-based asset resolution with configurable aliases