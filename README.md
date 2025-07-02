# HonestInvoice - Professional Invoice Generator

A modern, full-featured invoice generator built with React, TypeScript, Supabase, and Stripe.

## Features

- 🔐 **Secure Authentication** - Powered by Supabase Auth
- 📊 **Dashboard** - Overview of invoices, clients, and revenue
- 📄 **Invoice Management** - Create, edit, send, and track invoices
- 👥 **Client Management** - Organize and manage client information
- 💳 **Payment Processing** - Stripe integration for subscriptions and invoice payments
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, professional interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe (subscriptions + one-time payments)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

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

4. Configure your services:

   **Supabase Setup:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env`
   - Run the SQL migrations in the Supabase SQL editor:
     - `supabase/migrations/20250701235308_calm_coast.sql`
     - `supabase/migrations/20250702000000_add_stripe_tables.sql`

   **Stripe Setup:**
   - Create a Stripe account at [stripe.com](https://stripe.com)
   - Get your publishable and secret keys from the Stripe dashboard
   - Create subscription products and copy the price IDs
   - Add all Stripe configuration to `.env`

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses these main entities:

### Core Tables
- **Profiles** - User profile information and subscription status
- **Clients** - Client contact information and billing addresses
- **Invoices** - Invoice details, line items, and payment tracking

### Stripe Integration Tables
- **stripe_customers** - Links users to Stripe customer records
- **stripe_invoices** - Tracks Stripe payment data for invoices

## Stripe Integration

### Subscription Plans
- **Free**: 5 invoices/month, basic features
- **Pro**: Unlimited invoices, premium features ($19/month)
- **Business**: Everything in Pro + team features ($49/month)

### Payment Features
- Subscription management with Stripe Checkout
- Customer portal for billing management
- One-time invoice payments
- Automatic subscription status sync
- Usage tracking and limits enforcement

### Webhook Handling
Set up webhooks in your Stripe dashboard to handle:
- `customer.subscription.created`
- `customer.subscription.updated` 
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
VITE_STRIPE_BUSINESS_PRICE_ID=price_your_business_plan_price_id

# Stripe (Server-side - for API routes)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Deployment

The application can be deployed to any static hosting provider:

- **Netlify**: Connect your repository and deploy automatically
- **Vercel**: Import your project and deploy with zero configuration
- **Cloudflare Pages**: Connect your repository for automatic deployments

### Important Notes for Deployment:
1. Set up all environment variables in your hosting provider
2. Configure Stripe webhooks to point to your deployed API endpoints
3. Update CORS settings in Supabase for your production domain
4. Test payment flows in Stripe's test mode before going live

## API Routes (Required for Stripe)

You'll need to implement these API endpoints for full Stripe functionality:

- `POST /api/stripe/create-checkout-session` - Create subscription checkout
- `POST /api/stripe/create-portal-session` - Create customer portal session
- `POST /api/stripe/create-invoice-payment` - Create one-time payment for invoices
- `POST /api/stripe/webhooks` - Handle Stripe webhooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.