# Supabase Setup Guide

This guide will help you set up Supabase as the backend for Onyx Dispatch.

## Prerequisites

- A Supabase account (free tier is sufficient): https://supabase.com
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: `onyxdispatch` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Run Database Migration

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the left sidebar
3. Copy the following values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJI...` (long string)

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Add your Discord credentials (optional for now):

```env
VITE_DISCORD_CLIENT_ID=your_client_id_here
VITE_DISCORD_SERVER_ID=your_server_id_here
```

## Step 5: Verify the Setup

1. Start your development server:
```bash
npm run dev
```

2. Open your browser console (F12)
3. You should NOT see the warning: "Supabase credentials not found"

## Step 6: Test Database Connectivity

You can test that the database is working by:

1. Creating a service request from the landing page
2. Check the Supabase **Table Editor** to see if it was saved
3. Or run this query in the SQL Editor:

```sql
SELECT COUNT(*) FROM service_requests;
```

## Database Schema Overview

The migration creates the following tables:

- **users** - Discord-authenticated users (dispatchers, pilots, crew)
- **crews** - Emergency response crews with callsigns and capabilities
- **service_requests** - Service requests (SAR, refueling, medical, etc.)
- **crew_members** - Junction table linking users to crews
- **activity_log** - Activity history for the dashboard

## Row Level Security (RLS)

The database has RLS enabled with the following policies:

- **Read access**: All tables are readable by everyone
- **Write access**:
  - Anyone can create service requests
  - Only dispatchers can update requests and crews
  - Users can update their own profile

## Real-time Features

The API supports real-time subscriptions for:

- Service requests updates
- Crew status changes
- User online/offline status

These are automatically handled in the React components.

## Mock Data Fallback

If Supabase credentials are not configured, the app automatically falls back to using mock data from `/src/data/mockData.js`. This allows development without setting up Supabase.

## Common Issues

### "Supabase credentials not found" warning
- Make sure `.env.local` exists and has the correct variable names
- Restart your dev server after changing `.env.local`
- Verify variable names start with `VITE_`

### SQL migration fails
- Make sure you copied the entire SQL file
- Check for any syntax errors in the SQL editor
- Try running the migration in smaller sections

### Can't insert data
- Check RLS policies are correctly applied
- Verify your user is authenticated
- Check browser console for error messages

## Next Steps

1. Configure Discord OAuth (see README.md)
2. Customize the initial crews in the migration file
3. Deploy to production (see DEPLOYMENT.md)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
