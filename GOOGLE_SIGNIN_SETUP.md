# Google Sign-In Setup Guide

This guide will help you enable Google OAuth authentication for your LocalBiz Connect platform.

## Prerequisites

- Supabase project already set up
- Google Cloud Project (or create one)
- Administrative access to your Supabase dashboard

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown and select **NEW PROJECT**
3. Enter project name: `LocalBiz Connect` (or your preferred name)
4. Click **CREATE**
5. Wait for the project to be created (may take a minute)
6. Select your new project from the dropdown

---

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for `Google+ API`
3. Click on **Google+ API** in the results
4. Click the **ENABLE** button
5. Wait for it to enable (you should see a checkmark)

---

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** button at the top
3. Select **OAuth client ID**
4. If prompted, click **CONFIGURE CONSENT SCREEN** first
   - Choose **External** user type
   - Fill in the app information:
     - **App name**: LocalBiz Connect
     - **User support email**: your-email@example.com
     - **Developer contact information**: your-email@example.com
   - Click **SAVE AND CONTINUE** through the remaining screens
   - Return to **Credentials** after setup

5. Back on the **Create OAuth client ID** page:
   - **Application type**: Web application
   - **Name**: `LocalBiz Connect Web Client`
   - Under **Authorized redirect URIs**, add:
     ```
     https://dyrplbjiuuqpptjcenaf.supabase.co/auth/v1/callback
     ```
   - Click **CREATE**

6. Copy the following from the popup:
   - **Client ID** (looks like: `xxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`)
   - **Client Secret** (keep this secure!)

---

## Step 4: Configure Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `local-biz-platform`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click the toggle to **ENABLE**
5. Paste your credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Click **SAVE**

---

## Step 5: Update Redirect URL in Google Cloud Console

⚠️ **Important**: You need to add your production domain to Google OAuth later.

For now, if testing locally:

- Local testing URL: `http://localhost:8080/auth/v1/callback`

To add more URLs later:

1. Return to Google Cloud Console → **Credentials**
2. Click your OAuth 2.0 Web Client ID
3. Add additional authorized redirect URIs:
   - `http://localhost:8080/auth/v1/callback` (for local development)
   - `https://yourdomain.com/auth/v1/callback` (for production)
4. Click **SAVE**

---

## Step 6: Test Google Sign-In

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:8080/auth`

3. Click **"Continue with Google"** button

4. You should be redirected to Google's login page

5. Sign in with your Google account

6. After successful authentication, you should be redirected back to the app and logged in

---

## Troubleshooting

### Error: "redirect_uri_mismatch"

- **Cause**: The redirect URL in your request doesn't match any authorized URLs in Google Cloud Console
- **Solution**:
  1. Check the exact URL format in the error message
  2. Add it to Google Cloud Console → Credentials → Your OAuth Client ID
  3. Make sure there are no extra spaces or typos

### Error: "The OAuth client was not found"

- **Cause**: Client ID is incorrect or not properly configured in Supabase
- **Solution**:
  1. Double-check the Client ID copied from Google Cloud Console
  2. Verify it's saved correctly in Supabase Authentication → Providers

### Blank page after clicking "Continue with Google"

- **Cause**: Usually a redirect URL issue
- **Solution**:
  1. Open browser DevTools (F12)
  2. Check the Console tab for error messages
  3. Check the Network tab to see where the request is going
  4. Verify the Supabase URL matches your project URL

### "Invalid Client" Error

- **Cause**: Client Secret is incorrect or expired
- **Solution**:
  1. Go to Google Cloud Console → Credentials
  2. Delete the old OAuth Client ID
  3. Create a new one
  4. Update credentials in Supabase

---

## Your Current Setup Info

Your Supabase Project:

- **Project ID**: dyrplbjiuuqpptjcenaf
- **Supabase URL**: https://dyrplbjiuuqpptjcenaf.supabase.co
- **Redirect URI**: https://dyrplbjiuuqpptjcenaf.supabase.co/auth/v1/callback

---

## Security Best Practices

1. ✅ Never commit your Client Secret to version control
2. ✅ Use environment variables for sensitive data (already done in `.env`)
3. ✅ Restrict Google OAuth credentials to your domain only
4. ✅ Regularly rotate credentials if compromised
5. ✅ Monitor authentication logs in Supabase

---

## Next Steps After Setup

Once Google Sign-In is working:

1. **Test Account Creation**: Users can sign up with Google and create an account
2. **Profile Sync**: User's Google profile info (name, avatar) can be synced to your profiles table
3. **Additional OAuth Providers**: Set up GitHub, Twitter, etc. using the same process

---

## Need Help?

- Supabase Google OAuth Docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Google OAuth 2.0 Docs: https://developers.google.com/identity/protocols/oauth2
- Check Supabase logs: Authentication → Logs (to see failed attempts)
