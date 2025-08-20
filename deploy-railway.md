# 🚀 Railway Deployment Guide for Job Board

## Prerequisites
1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: Ready to configure

## Step 1: Create Railway Project

### Option A: Deploy from GitHub (Recommended)
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `Jobs-Board` repository
5. Railway will automatically detect it's a Next.js app

### Option B: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to your GitHub repo
railway link
```

## Step 2: Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service"
3. Select "Database" → "PostgreSQL"
4. Railway will automatically create a database and provide connection details

## Step 3: Configure Environment Variables
In Railway dashboard, go to your app service → Variables tab and add:

### Required Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://your-app-name.railway.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
ADMIN_SECRET=your-admin-secret-key
ADMIN_EMAIL=admin@yourdomain.com
PINATA_API_Key=your-pinata-api-key
PINATA_API_Secret=your-pinata-api-secret
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud
PINATA_JWT=your-pinata-jwt-token
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### Important Notes:
- **DATABASE_URL**: Railway will provide this automatically when you add PostgreSQL
- **NEXTAUTH_URL**: Replace with your actual Railway app URL
- **NEXTAUTH_SECRET**: Generate a secure random string
- Copy other values from your local `.env` file

## Step 4: Database Migration
After deployment, run database migrations:

### Option A: Railway Dashboard
1. Go to your app service
2. Click "Deploy" tab
3. Add a deploy command: `npm run db:migrate && npm run db:seed`

### Option B: Railway CLI
```bash
# Connect to your Railway project
railway link

# Run migrations
railway run npm run db:migrate

# Seed the database (creates admin user)
railway run npm run db:seed
```

## Step 5: Custom Domain (Optional)
1. In Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable with your custom domain

## Step 6: Verify Deployment
1. Visit your Railway app URL
2. Test login functionality:
   - Job seeker login at `/login`
   - Company login at `/login/company`
   - Admin login at `/login` (with admin credentials)
3. Check admin dashboard at `/admin`

## Troubleshooting

### Common Issues:
1. **Database Connection**: Ensure DATABASE_URL is correctly set
2. **Build Failures**: Check build logs in Railway dashboard
3. **Environment Variables**: Verify all required variables are set
4. **Prisma Issues**: Ensure `prisma generate` runs during build

### Build Commands:
- **Build**: `prisma generate && next build`
- **Start**: `next start`
- **Post Install**: `prisma generate`

### Useful Railway CLI Commands:
```bash
# View logs
railway logs

# Check status
railway status

# Open app in browser
railway open

# Connect to database
railway connect postgres
```

## Security Checklist
- [ ] All environment variables are set
- [ ] NEXTAUTH_SECRET is secure and unique
- [ ] Database credentials are secure
- [ ] Admin credentials are changed from defaults
- [ ] Google OAuth is properly configured
- [ ] Email service (Resend) is configured

## Post-Deployment
1. Test all user roles (admin, company, job seeker)
2. Verify email notifications work
3. Test file uploads (Pinata integration)
4. Check database seeding worked (admin user exists)
5. Monitor application logs for any issues

Your Job Board is now live on Railway! 🎉
