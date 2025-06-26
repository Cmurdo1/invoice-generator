# 🔧 Quick Authentication Fix

## Issue: 405 Error and Authentication Problems

The errors you're seeing are due to Supabase authentication configuration issues. Here's how to fix them:

## Step 1: Disable Email Confirmation (Temporary Fix)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → Authentication → Settings
3. **Find "Email Confirmation"** and **DISABLE** it temporarily
4. **Save the settings**

## Step 2: Set Up Authentication Properly

1. **In Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://37cc17bf.invoice-generator-6pf.pages.dev`
   - **Redirect URLs**: Add your Cloudflare Pages URL

## Step 3: Run Database Setup

1. **Go to**: Supabase Dashboard → SQL Editor
2. **Run this SQL** to create the tables:

```sql
-- First, run the schema from supabase-schema.sql
-- Then add this simple test data:

-- Create a test user profile (replace with your actual user ID after signup)
INSERT INTO profiles (id, email, name, company, role, subscription, profile)
VALUES (
  'your-user-id-here',
  'test@invoicegen.com',
  'Test User',
  'Test Company',
  'user',
  '{"plan": "free", "status": "active"}'::jsonb,
  '{
    "phone": "",
    "address": "",
    "city": "",
    "state": "",
    "zip": "",
    "country": "",
    "logo": null,
    "invoice_settings": {
      "default_currency": "USD",
      "tax_rate": 0,
      "invoice_prefix": "INV",
      "next_invoice_number": 1
    }
  }'::jsonb
);
```

## Step 4: Test Authentication

1. **Try signing up** with a new email (like `test@invoicegen.com`)
2. **Password**: Use something simple like `testpassword123`
3. **Should work** without email confirmation

## Step 5: Rebuild and Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name invoice-generator
```

## Alternative: Use Existing Demo User

If you want to test immediately, you can use the existing demo user:
- **Email**: `demo@HonestInvoice.com`
- **Password**: `Demo123!@#$`

## What This Fixes

✅ **Removes 405 authentication errors**
✅ **Fixes "Not authenticated" dashboard errors**
✅ **Eliminates multiple Supabase client instances**
✅ **Enables proper session management**

After these changes, your app should authenticate properly and show real data (which will be empty initially until you create invoices/clients).
