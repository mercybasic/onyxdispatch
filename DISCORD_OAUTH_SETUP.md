# Discord OAuth Setup with Supabase

This guide will help you configure Discord OAuth authentication using Supabase Auth.

## Prerequisites

- A Supabase project (see SUPABASE_SETUP.md)
- A Discord application (from Discord Developer Portal)
- Access to your Discord server

## Step 1: Get Discord Application Credentials

1. **Go to Discord Developer Portal**: https://discord.com/developers/applications

2. **Create or select your application**:
   - Click "New Application" if you don't have one
   - Give it a name (e.g., "Onyx Dispatch")
   - Click "Create"

3. **Get your Client ID**:
   - You should see it on the "General Information" page
   - Copy this value - you'll need it for Supabase
   - Example: `1437207064173744319`

4. **Get your Client Secret**:
   - On the same page, find "CLIENT SECRET"
   - Click "Reset Secret" if needed (WARNING: This will invalidate the old secret)
   - Copy the secret immediately (you can't view it again)
   - Keep this secret safe!

## Step 2: Configure Discord OAuth Redirect URLs

1. **In Discord Developer Portal**, go to **OAuth2** section (left sidebar)

2. **Add Redirect URLs**:
   - Click "Add Redirect" under "Redirects"
   - Add your Supabase callback URL:
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
     (e.g., `https://spswzhwasnouxaaagtyw.supabase.co/auth/v1/callback`)

   - For local development, also add:
     ```
     http://localhost:54321/auth/v1/callback
     ```

3. **Save Changes**

## Step 3: Enable Discord Provider in Supabase

1. **Go to your Supabase Dashboard**: https://app.supabase.com

2. **Navigate to Authentication**:
   - Click on your project
   - Go to **Authentication** → **Providers** (in the left sidebar)

3. **Enable Discord**:
   - Scroll down to find "Discord" in the provider list
   - Toggle it to **Enabled**

4. **Configure Discord Provider**:
   - **Discord Client ID**: Paste your Discord Client ID from Step 1
   - **Discord Client Secret**: Paste your Discord Client Secret from Step 1
   - Click **Save**

## Step 4: Configure Discord Scopes (Optional)

The app requests these scopes by default:
- `identify` - Basic user information (username, avatar)
- `guilds` - List of servers the user is in
- `guilds.members.read` - Read user's roles in servers

These are configured in the code and don't need to be set in Supabase.

## Step 5: Update Site URL in Supabase

1. **In Supabase Dashboard**, go to **Authentication** → **URL Configuration**

2. **Set your Site URL**:
   - For local development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://yourdomain.com`)

3. **Add Redirect URLs** (if not already added):
   - Add your production domain
   - Add `http://localhost:3000` for development

4. **Save Changes**

## Step 6: Test the Authentication Flow

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Click "Sign in with Discord"** on the login page

3. **You should be redirected to Discord** to authorize the app

4. **After authorizing**, you'll be redirected back to your app and logged in

## Deployment to Production

When deploying to Bolt.new or any hosting platform:

1. **No environment variables needed!**
   - Supabase handles everything server-side
   - Your Discord credentials are stored securely in Supabase

2. **Update Discord OAuth Redirects**:
   - Add your production URL to Discord's Redirect URLs
   - Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

3. **Update Supabase Site URL**:
   - Set it to your production domain in Supabase Dashboard

4. **Deploy your code** and test the login flow

## Troubleshooting

### "Invalid OAuth state" or "OAuth failed"

**Solution**:
- Check that your Supabase callback URL is correctly configured in Discord
- Make sure the Discord Client ID and Secret in Supabase match your Discord app
- Clear your browser cache and cookies

### "Redirect URI mismatch"

**Solution**:
- Verify the redirect URL in Discord Developer Portal matches exactly:
  `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- Check for typos or missing trailing slashes

### Login works locally but not in production

**Solution**:
- Add your production domain to Supabase's allowed redirect URLs
- Update the Site URL in Supabase to your production domain
- Make sure you added the production callback URL to Discord

### User data not showing correctly

**Solution**:
- Check the browser console for errors
- Verify the user metadata mapping in `src/hooks/useDiscordAuth.js`
- Discord user data is in `session.user.user_metadata`

## Security Notes

- ✅ Client Secret is stored securely in Supabase (never exposed to frontend)
- ✅ OAuth flow is handled server-side by Supabase
- ✅ No need to manage environment variables in your deployment platform
- ✅ Tokens are automatically refreshed by Supabase
- ✅ Session is persisted securely in browser storage

## Next Steps

1. Configure Discord server and role validation (see `src/config/discord.js`)
2. Set up Row Level Security policies in Supabase for role-based access
3. Customize user role assignment based on Discord roles

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Discord OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-discord)
- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
