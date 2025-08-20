# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TestBook Clone** planning repository containing comprehensive analysis and implementation documentation for building an educational platform similar to TestBook. The repository currently contains planning documents and will be used to implement a full-featured e-learning platform.

## Project Architecture

### Technology Stack (Planned)
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, Next.js API routes
- **Database**: PostgreSQL (main), MongoDB (content), Redis (caching)
- **Authentication**: NextAuth.js with JWT
- **Payment**: Razorpay/Stripe integration
- **Live Streaming**: WebRTC/Agora for live classes
- **AI Integration**: OpenAI API for doubt resolution
- **State Management**: Redux Toolkit
- **Testing**: Jest, React Testing Library, Playwright

### Project Structure (When Implemented)
```
testbook-clone/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (courses)/         # Course routes
│   ├── (tests)/           # Test routes
│   ├── (live)/            # Live class routes
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── server/                # Backend server
├── database/              # Database files
├── services/              # External integrations
└── types/                 # TypeScript type definitions
```

## Key Features to Implement

### Core Platform Features
- **User Management**: Multi-tier authentication (Email, Phone, Social Login)
- **Course Management**: 500+ courses with video lectures, PDFs, progress tracking
- **Assessment System**: 60,000+ questions, 52+ test series, previous year papers
- **Live Classes**: 25+ concurrent classes with interactive features
- **AI Features**: 24/7 doubt resolution, personalized learning paths
- **Payment System**: Multiple subscription tiers, trial periods (₹5 for 5 days)

### Scale Considerations
- Handle **81+ exam categories** in grid layout
- Support **500+ courses** with advanced filtering
- Manage **60,000+ questions** efficiently
- Support **21,000+ previous year papers**
- Enable **25+ concurrent live classes**

## Common Development Commands

### Project Setup (When Implementing)
```bash
# Initialize Next.js project
npx create-next-app@latest testbook-clone --typescript --tailwind --eslint --app

# Install additional dependencies
npm install @next-auth/prisma-adapter prisma @prisma/client redis ioredis
npm install @reduxjs/toolkit react-redux socket.io-client framer-motion
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Development dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### Development Workflow
```bash
# Start development server
npm run dev

# Run tests
npm test
npm run test:e2e

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Implementation Phases

The project is structured in **8 phases with 100+ micro-tasks**:

1. **Foundation (Tasks 1-15)**: Project setup, database, authentication, UI components
2. **Authentication & User Management (Tasks 16-25)**: Registration, login, profiles, RBAC
3. **Course & Content Management (Tasks 26-40)**: Course catalog, video player, progress tracking
4. **Assessment System (Tasks 41-55)**: Test engine, question bank, results, rankings
5. **Live Classes & Streaming (Tasks 56-70)**: Live streaming, chat, recordings, Q&A
6. **Payment & Subscriptions (Tasks 71-80)**: Payment gateway, subscriptions, invoicing
7. **AI & Analytics (Tasks 81-90)**: AI doubt resolution, learning analytics, recommendations
8. **Mobile & PWA (Tasks 91-100)**: Mobile optimization, offline support, push notifications

## Development Guidelines

### Code Quality Standards
- Use **TypeScript strict mode** for all files
- Follow **mobile-first responsive design**
- Implement **comprehensive error handling**
- Ensure **WCAG 2.1 AA accessibility compliance**
- Maintain **Core Web Vitals performance standards**

### Security Requirements
- Implement **JWT-based authentication** with refresh tokens
- Use **rate limiting** on API endpoints
- Validate **all user inputs** with Zod schemas
- Implement **CSRF protection**
- Follow **secure file upload** practices
- Never expose **API keys or secrets** in client code

### Testing Strategy
- **Unit tests** for utilities and hooks using Jest
- **Component tests** with React Testing Library
- **Integration tests** for API endpoints
- **E2E tests** for critical user journeys with Playwright
- **Performance testing** for large datasets
- **Security testing** for authentication flows

### Database Design
- Use **PostgreSQL** for relational data (users, courses, progress)
- Use **MongoDB** for content storage (questions, materials)
- Implement **proper indexing** for performance
- Use **connection pooling** for scalability
- Implement **read replicas** for scaling

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/testbook
MONGODB_URL=mongodb://localhost:27017/testbook
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key

# Cloud Storage (File Upload System)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# Live Streaming
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
```

## Mobile & Responsive Design

### Mobile-First Approach
- Start with **320px mobile viewport**
- Use **progressive enhancement** for larger screens
- Implement **touch-friendly interfaces** (44px minimum touch targets)
- Optimize for **various screen sizes** and orientations

### Performance Optimization
- Implement **lazy loading** for images and components
- Use **code splitting** for route-based chunks
- Implement **service worker** for caching
- Optimize **bundle sizes** and loading times

## API Design Patterns

### RESTful Endpoints
```
/api/auth/*           # Authentication endpoints
/api/users/*          # User management
/api/courses/*        # Course operations
/api/tests/*          # Assessment system
/api/live-classes/*   # Live streaming
/api/payments/*       # Payment processing
/api/analytics/*      # Analytics data
```

### Error Handling
- Use consistent **HTTP status codes**
- Return **structured error responses**
- Implement **global error boundary**
- Log errors for **debugging and monitoring**

## Deployment Considerations

### Production Setup
- Use **Docker containers** for consistent environments
- Implement **horizontal scaling** with load balancers
- Use **CDN** for static assets and media files
- Set up **automated CI/CD** pipelines
- Implement **monitoring and alerting**

### Performance Monitoring
- Track **Core Web Vitals**
- Monitor **API response times**
- Track **database query performance**
- Implement **user analytics**
- Set up **error tracking** with services like Sentry

## Important Implementation Notes

1. **Content-First Design**: Follow TestBook's proven pattern of immediate access to exam categories instead of traditional hero sections
2. **Free Content Prominence**: Highlight free content to build trust before monetization
3. **Massive Scale Handling**: Design for 500+ courses, 60K+ questions, and concurrent users
4. **Multi-language Support**: Start with English/Hindi, design for expansion
5. **Mobile Optimization**: Ensure excellent mobile experience without aggressive app promotion

## Documentation References

- **Analysis Document**: `testbook-analysis-implementation-plan.md` - Comprehensive TestBook analysis with real browser testing results
- **Task Breakdown**: `testbook-implementation-tasks.md` - 100 micro-tasks for systematic implementation
- **Technology Decisions**: Based on scalability requirements and proven patterns

This repository serves as the foundation for building a comprehensive educational platform matching TestBook's scale and functionality.

## 🚨 CRITICAL GIT WORKFLOW REQUIREMENTS 🚨

**MANDATORY WORKFLOW - NO EXCEPTIONS:**

### 🔒 Main Branch Protection Rules:
- **NEVER work directly on `main` branch**
- **ALWAYS create a separate feature branch** for each task
- **Complete all development work** in the feature branch only
- **Perform end-to-end testing** before requesting merge
- **ASK USER PERMISSION** before merging any feature branch to main
- **Main branch is SACRED** - no direct commits allowed

### 🌿 Feature Branch Workflow:
```bash
# 1. Always start with a feature branch
git checkout -b feature/task-[number]-[description]

# 2. Do ALL development work in feature branch
# 3. Test everything thoroughly 
# 4. Commit changes with descriptive messages

# 5. ALWAYS ASK: "Task completed and tested. Can I merge feature/[name] to main?"
# 6. Only merge after explicit user approval
```

### 📝 Branch Naming Convention:
- `feature/task-[number]-[description]` (e.g., `feature/task-3-database-schema`)
- `feature/[component-name]` (e.g., `feature/authentication-system`) 
- `feature/[functionality]` (e.g., `feature/payment-integration`)

**This workflow is MANDATORY and must be followed for every single task.**

## Git Guidelines

- DO NOT mention Claude or AI assistance in commit messages
- Keep commit messages descriptive of the actual changes made
- Always work in feature branches, never directly on main

## ⚠️ CRITICAL DEVELOPMENT CONSTRAINTS ⚠️