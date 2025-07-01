# HonestInvoice - Professional Invoice Generator

A modern, full-featured invoice generator built with React, TypeScript, and Supabase.

## Features

- 🔐 **Secure Authentication** - Powered by Supabase Auth
- 📊 **Dashboard** - Overview of invoices, clients, and revenue
- 📄 **Invoice Management** - Create, edit, send, and track invoices
- 👥 **Client Management** - Organize and manage client information
- 💳 **Payment Tracking** - Monitor payment status and history
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, professional interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd honest-invoice
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env`
   - Run the SQL migration in `supabase/migrations/001_initial_schema.sql`

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses three main entities:

### Profiles
- User profile information
- Company details
- Subscription status

### Clients
- Client contact information
- Company details
- Billing addresses

### Invoices
- Invoice details and line items
- Payment tracking
- Status management (draft, sent, paid, overdue)

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PRO_LINK=your_stripe_pro_payment_link (optional)
VITE_STRIPE_BUSINESS_LINK=your_stripe_business_payment_link (optional)
```

## Deployment

The application can be deployed to any static hosting provider:

- **Netlify**: Connect your repository and deploy automatically
- **Vercel**: Import your project and deploy with zero configuration
- **Cloudflare Pages**: Connect your repository for automatic deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.