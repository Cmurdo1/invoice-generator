# 🚀 GitHub Actions Auto-Deploy Setup

## Step 1: Get Cloudflare API Token

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/profile/api-tokens
2. **Click "Create Token"**
3. **Use "Custom token" template**
4. **Set permissions**:
   - Account: `Cloudflare Pages:Edit`
   - Zone: `Zone:Read` (if using custom domain)
5. **Account Resources**: Include your account
6. **Zone Resources**: Include your domain (if applicable)
7. **Click "Continue to summary"** → **"Create Token"**
8. **Copy the token** (you'll need it for GitHub secrets)

## Step 2: Get Cloudflare Account ID

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Select your account**
3. **Look for "Account ID"** in the right sidebar
4. **Copy the Account ID**

## Step 3: Add GitHub Secrets

1. **Go to your GitHub repository**: https://github.com/Cmurdo1/invoice-generator
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"** and add these secrets:

### Required Secrets:
```
CLOUDFLARE_API_TOKEN = [Your Cloudflare API Token from Step 1]
CLOUDFLARE_ACCOUNT_ID = [Your Account ID from Step 2]
```

### Optional Environment Variables:
```
VITE_FIREBASE_API_KEY = [Your Firebase API Key]
VITE_FIREBASE_AUTH_DOMAIN = [Your Firebase Auth Domain]
VITE_FIREBASE_PROJECT_ID = [Your Firebase Project ID]
VITE_FIREBASE_STORAGE_BUCKET = [Your Firebase Storage Bucket]
VITE_FIREBASE_MESSAGING_SENDER_ID = [Your Firebase Messaging Sender ID]
VITE_FIREBASE_APP_ID = [Your Firebase App ID]
VITE_STRIPE_PRO_LINK = [Your Stripe Pro Payment Link]
VITE_STRIPE_BUSINESS_LINK = [Your Stripe Business Payment Link]
```

## Step 4: Test Auto-Deploy

1. **Push any change** to the main branch
2. **Go to Actions tab** in your GitHub repository
3. **Watch the deployment** run automatically
4. **Check the deployment URL** in the action logs

## What This Sets Up

✅ **Automatic deployments** on every push to main
✅ **Preview deployments** for pull requests  
✅ **Environment variable management** through GitHub secrets
✅ **Build optimization** with npm ci and caching
✅ **Cloudflare Pages integration** with proper API tokens

## Workflow Features

### Main Branch (Production):
- Deploys to your main Cloudflare Pages domain
- Uses production environment variables
- Runs on every push to main

### Pull Requests (Preview):
- Creates preview deployments for testing
- Uses test mode by default
- Allows testing before merging

## Benefits

🚀 **Zero-downtime deployments**
🔄 **Automatic builds** on code changes
🧪 **Preview environments** for testing
🔒 **Secure secret management**
📊 **Build status tracking**
🎯 **Consistent deployment process**

## Next Steps

1. Set up the secrets in GitHub
2. Push a test change to trigger deployment
3. Monitor the Actions tab for deployment status
4. Configure custom domain in Cloudflare Pages (optional)

Your app will now automatically deploy whenever you push changes to GitHub! 🎉
