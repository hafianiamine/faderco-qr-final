# FADERCO QR Platform

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/amines-projects-c50dd6a9/v0-faderco-qr-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/Y04b5lOl4vQ)

## Overview

A powerful QR code generation and management platform with advanced customization features, analytics, and admin controls.

### Features

- 🎨 **Custom QR Codes**: Change colors and add logos to your QR codes
- 📊 **Analytics Dashboard**: Track scans, locations, devices, and more
- 👥 **User Management**: Admin dashboard for managing users and QR codes
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🔒 **Secure Authentication**: Built with Supabase Auth
- 📥 **Multiple Export Formats**: Download as PNG, SVG, or AI (vector)

## Deployment

Your project is live at:

**[https://vercel.com/amines-projects-c50dd6a9/v0-faderco-qr-platform](https://vercel.com/amines-projects-c50dd6a9/v0-faderco-qr-platform)**

## Environment Variables

### Required Environment Variables

#### `NEXT_PUBLIC_APP_URL`

**Important**: This variable must be set to your deployed application URL, not `localhost`.

\`\`\`bash
# ❌ Wrong (causes Supabase redirect issues)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ✅ Correct
NEXT_PUBLIC_APP_URL=https://fadercoqr.com
\`\`\`

**Why this matters:**
- Supabase uses this URL as the base for email verification links
- If set to `localhost`, users will be redirected to `http://localhost:3000` after email verification
- This breaks the authentication flow in production

**How to set it:**
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add `NEXT_PUBLIC_APP_URL` with your production URL
4. Redeploy your application

### Other Environment Variables

The following are automatically configured when you connect Supabase:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (for development only)

## Admin Account

To access the admin dashboard, sign up with the following credentials:

- **Email**: `admin@fadercoqr.com`
- **Password**: `Admin@1234`

The system will automatically grant admin privileges to this email address.

## Database Setup

Run the following SQL scripts in order:

1. `scripts/001_create_tables.sql` - Creates core tables
2. `scripts/002_create_profile_trigger.sql` - Sets up profile automation
3. `scripts/003_add_profile_fields.sql` - Adds profile fields
4. `scripts/004_update_profile_trigger.sql` - Updates profile trigger
5. `scripts/005_add_qr_customization.sql` - Adds QR customization columns
6. `scripts/006_create_admin_account.sql` - Sets up admin account automation

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/Y04b5lOl4vQ](https://v0.app/chat/projects/Y04b5lOl4vQ)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **QR Generation**: qrcode library
- **Deployment**: Vercel

## License

MIT
