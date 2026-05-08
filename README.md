# RateWise

<p align="center">
  <img src="./public/images/logo.svg" alt="RateWise Logo" width="120" />
</p>

<p align="center">
  <strong>AI-Powered Freelance Rate Calculator & Market Insights Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Overview

RateWise is a comprehensive platform designed to help freelancers and agencies determine optimal pricing for their services. By combining AI-powered analysis with real-time market data scraping, RateWise provides accurate, location-aware rate recommendations across multiple industries and skill categories.

## Features

### Core Features

- **Smart Rate Calculator**: AI-powered rate recommendations based on skills, experience, location, and market conditions
- **Real-Time Market Data**: Automated scraping from major freelance platforms (Upwork, Fiverr, Freelancer.com)
- **Rate Cards**: Save, organize, and share custom rate configurations
- **Market Insights**: Historical trends and demand analysis by skill category
- **Multi-Currency Support**: Automatic conversion with real-time exchange rates
- **Location Intelligence**: Geographic pricing adjustments based on cost of living

### Premium Features (Pro Plan)

- **AI Rate Assistant**: GPT-4 powered chat for personalized rate advice
- **Unlimited Rate Cards**: No limits on saved configurations
- **Advanced Analytics**: Detailed market reports and competitor analysis
- **Priority Data Updates**: Faster refresh of market rate data
- **API Access**: Programmatic access to rate calculations
- **Team Collaboration**: Share rate cards with team members

### Enterprise Features

- **Custom Integrations**: Connect with your existing tools
- **White-label Options**: Brand the platform as your own
- **Dedicated Support**: Priority customer service
- **Custom Reports**: Tailored market analysis reports
- **SLA Guarantees**: Uptime and performance commitments

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Hooks + Context
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Web Scraping**: Puppeteer

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Email**: Resend
- **Monitoring**: Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm 9.0.0 or later
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ratewise.git
   cd ratewise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual credentials.

4. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the database migrations:
     ```bash
     npx supabase login
     npx supabase link --project-ref your-project-ref
     npx supabase db push
     ```

5. **Set up Stripe**
   - Create an account at [stripe.com](https://stripe.com)
   - Add your webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Create pricing plans and copy the price IDs to your `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

See `.env.example` for a complete list of required environment variables.

## Project Structure

```
ratewise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, signup, etc.)
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── api/                # API routes
│   │   ├── calculator/         # Rate calculator page
│   │   ├── upgrade/            # Pricing/plans page
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication components
│   │   ├── calculator/         # Calculator components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── rate-cards/         # Rate card components
│   │   ├── layout/             # Layout components
│   │   └── marketing/          # Marketing page components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase client & utilities
│   │   ├── stripe/             # Stripe integration
│   │   ├── openai/             # OpenAI integration
│   │   ├── utils/              # General utilities
│   │   └── validations/        # Zod schemas
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Edge functions
├── public/                     # Static assets
│   ├── images/
│   └── fonts/
├── scripts/                    # Utility scripts
└── tests/                      # Test files
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Supabase types
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run format` - Format code with Prettier

## Documentation

- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api-reference.md)
- [Database Schema](./docs/database-schema.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

- 📧 Email: support@ratewise.app
- 💬 Discord: [Join our community](https://discord.gg/ratewise)
- 🐦 Twitter: [@RateWiseApp](https://twitter.com/RateWiseApp)

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting

---

<p align="center">
  Made with ❤️ by the RateWise Team
</p>
