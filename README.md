# TestBook Clone

A comprehensive online learning platform for competitive exam preparation built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎓 **500+ Courses** - Comprehensive course library covering all major competitive exams
- ❓ **60,000+ Questions** - Extensive question bank with detailed solutions
- 📺 **Live Classes** - Interactive live classes with expert instructors
- 🧠 **AI-Powered** - Smart doubt resolution and personalized learning paths
- 📱 **Mobile-First** - Responsive design optimized for all devices
- 🔒 **Secure** - Enterprise-grade security and authentication

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (planned)
- **Database**: PostgreSQL + MongoDB (planned)
- **Payment**: Razorpay/Stripe (planned)
- **Live Streaming**: WebRTC/Agora (planned)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testbook-clone
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── types/               # TypeScript type definitions
├── public/              # Static assets
└── docs/                # Documentation files
```

## Development Guidelines

- Use TypeScript strict mode for all files
- Follow the established component structure
- Write responsive and accessible components
- Use proper TypeScript types and interfaces
- Follow the existing code style and formatting

## Contributing

1. Follow the established coding standards
2. Write meaningful commit messages
3. Add proper TypeScript types
4. Ensure responsive design
5. Test your changes thoroughly

## License

MIT License - see LICENSE file for details.