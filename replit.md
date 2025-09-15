# Overview

PromptMaster is a comprehensive AI Learning Management System (LMS) with multilingual support (Khmer/English) that provides education across the full spectrum of artificial intelligence applications. The platform has expanded from a single prompt engineering course to include 11 comprehensive AI courses covering AI fundamentals, productivity improvement, critical thinking, creative applications, strategic planning, innovation, coaching, business development, research, and data analysis. Users can practice AI skills through interactive modules, receive AI-powered assessments with detailed feedback, track their progress, set learning goals, earn certificates, and access courses in both English and Khmer languages. 

The platform now features an advanced **AI Playground** that enables users to test prompts across multiple AI models (GPT-4, Claude-3.5-Sonnet, Gemini-1.5-Pro) simultaneously using OpenRouter API, compare results side-by-side, build personal prompt libraries with versioning and export capabilities, and track comprehensive usage analytics with cost monitoring. The Playground seamlessly integrates with existing course modules and practice exercises, providing a natural progression from guided learning to open experimentation.

The system includes a module locking mechanism where Modules 3, 4, and 5 are locked until previous modules are completed sequentially.

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
- **Tables**: Users, modules, user progress, prompt attempts, playground prompts, playground tests, and playground usage tracking with proper relationships
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
- **OpenAI API**: GPT-5 model for prompt assessment and feedback generation in learning modules
- **OpenRouter API**: Multi-model access for AI Playground with GPT-4, Claude-3.5-Sonnet, and Gemini-1.5-Pro support
- **Assessment Features**: Real-time prompt evaluation with detailed scoring across multiple criteria
- **Feedback Generation**: AI-generated suggestions for prompt improvement
- **Multi-Model Testing**: Concurrent prompt testing across multiple AI models with cost tracking and performance analytics

## UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Design System**: shadcn/ui for pre-styled component variants
- **Icons**: Lucide React for consistent iconography
- **Data Visualization**: Recharts library for analytics charts and usage tracking in AI Playground
- **Fonts**: Google Fonts integration for typography (Architects Daughter, DM Sans, Fira Code, Geist Mono)

## Development Tools
- **Build Tools**: Vite with React plugin and runtime error overlay
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Development Experience**: Replit-specific plugins for enhanced development workflow
- **Asset Management**: Vite-based asset resolution with configurable aliases