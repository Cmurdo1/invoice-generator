# 🚀 Supabase Setup Guide

## Step 1: Set Up Database Tables

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → SQL Editor
3. **Run the SQL script**: Copy and paste the contents of `supabase-schema.sql` and execute it

This will create:
- `profiles` table (user profiles)
- `clients` table (client management)
- `invoices` table (invoice data)
- `products` table (product catalog)
- Row Level Security (RLS) policies
- Automatic profile creation trigger

## Step 2: Verify Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://jdwawncmybyjthqovftk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Test the Setup

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   ```bash
   npx wrangler pages deploy dist --project-name invoice-generator
   ```

## Step 4: Add Environment Variables to Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages → invoice-generator → Settings → Environment variables
2. Add the same environment variables from your `.env` file

## What's Changed

✅ **Removed synthetic/demo data** from dashboard
✅ **Connected to Supabase** for real data storage
✅ **Updated dashboard** to fetch real invoice and client data
✅ **Updated clients page** to use Supabase
✅ **Added proper error handling** with fallback to empty data

## Features Now Working with Real Data

- **Dashboard**: Shows real statistics from your Supabase data
- **Clients**: Fetches real clients from Supabase
- **User Authentication**: Uses Supabase Auth
- **Data Persistence**: All data stored in Supabase

## Next Steps

1. **Run the SQL script** in Supabase
2. **Test locally** with `npm run dev`
3. **Deploy** when ready
4. **Add your Stripe payment links** to environment variables

Your app will now show real data instead of synthetic demo data!
