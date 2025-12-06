# Setup Guide - IndoAkurat Temporary Email

## Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (already created)
- Cloudflare account (for email routing)
- Domain with DNS access

## Current Setup Status

✅ **Completed:**
- Git repository initialized
- Vue 3 + Vite + TypeScript project structure created
- Tailwind CSS configured
- Font Awesome 6 integrated
- Supabase client configured
- Environment variables setup (.env file created)
- Database migration SQL prepared
- Cloudflare Email Worker code prepared
- GitHub Actions workflow for cleanup cron job
- Project dependencies installed

## Supabase Configuration

**Project Details:**
- Project URL: `https://uzkjizzjbvgmwduiiqyk.supabase.co`
- Project ID: `uzkjizzjbvgmwduiiqyk`
- Anon Key: Already configured in `.env`
- Service Role Key: Stored securely (needed for backend operations)

### Next Steps for Supabase:

1. **Run Database Migrations:**
   ```bash
   # Option 1: Via Supabase Dashboard
   # Go to SQL Editor and run the content of:
   # supabase/migrations/001_create_tables.sql
   
   # Option 2: Via Supabase CLI (if installed)
   supabase db push
   ```

2. **Create Storage Bucket:**
   - Go to Supabase Dashboard → Storage
   - Click "New Bucket"
   - Name: `email-attachments`
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: All

3. **Deploy Edge Function:**
   ```bash
   # Install Supabase CLI if not installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link project
   supabase link --project-ref uzkjizzjbvgmwduiiqyk
   
   # Deploy cleanup function
   supabase functions deploy cleanup-expired-emails
   ```

4. **Setup GitHub Secret for Cron Job:**
   - Go to GitHub Repository → Settings → Secrets and variables → Actions
   - Add new secret:
     - Name: `SUPABASE_SERVICE_ROLE_KEY`
     - Value: Your Supabase service role key

## Cloudflare Setup

### 1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

### 2. Login to Cloudflare:
```bash
wrangler login
```

### 3. Set Worker Secret:
```bash
cd cloudflare-worker
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste your Supabase service role key when prompted
```

### 4. Deploy Email Worker:
```bash
wrangler deploy
```

### 5. Configure Email Routing:
- Go to Cloudflare Dashboard
- Select your domain
- Go to Email → Email Routing
- Click "Enable Email Routing"
- Add catch-all route pointing to your worker

### 6. Configure MX Records:
Add these MX records to your domains:
- Priority: 10
- Value: `mail.indoakurat.com` (or your Cloudflare email routing endpoint)

**Domains to configure:**
- `tempmail-id.com`
- `quickmail-id.net`
- Any other domains you want to use

## Frontend Development

### Run Development Server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

## Deployment

### Frontend (Vercel):

1. **Connect GitHub Repository:**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables:**
   Go to Project Settings → Environment Variables and add:
   ```
   VITE_SUPABASE_URL=https://uzkjizzjbvgmwduiiqyk.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_APP_NAME=IndoAkurat
   VITE_APP_TAGLINE=Indonesia's Fast & Accurate Temporary Email
   VITE_AVAILABLE_DOMAINS=tempmail-id.com,quickmail-id.net
   VITE_EMAIL_EXPIRY_MINUTES=30
   VITE_ENABLE_CUSTOM_DOMAIN=true
   VITE_ENABLE_SOUND_NOTIFICATION=false
   ```

4. **Configure Custom Domain:**
   - Go to Project Settings → Domains
   - Add `indoakurat.com`
   - Follow DNS configuration instructions

5. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

## DNS Configuration

### For Main Domain (indoakurat.com):
```
Type: A
Name: @
Value: <Vercel IP address>

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### For Email Domains:
```
Type: MX
Name: @
Priority: 10
Value: <Cloudflare email routing endpoint>

Type: TXT
Name: @
Value: v=spf1 include:_spf.mx.cloudflare.net ~all
```

## Testing

### Test Email Reception:
1. Generate an email address in the app
2. Send a test email from Gmail/Outlook to that address
3. Verify email appears in inbox within seconds
4. Test real-time updates
5. Test attachments download
6. Test mark as read/delete

### Test Custom Domain:
1. Setup MX record for test domain
2. Navigate to `indoakurat.com/yourdomain.com`
3. Validate domain
4. Generate email with custom domain
5. Send test email
6. Verify reception

## Monitoring

### Supabase Dashboard:
- Monitor database size and connections
- Check storage usage
- View API request logs
- Monitor real-time connections

### Cloudflare Dashboard:
- Email Routing statistics
- Worker invocations and errors
- DNS query statistics

### Vercel Dashboard:
- Deployment status
- Build logs
- Bandwidth usage
- Function invocations

## Troubleshooting

### Email Not Received:
1. Check MX records are correctly configured
2. Verify DNS propagation (can take up to 24 hours)
3. Check Cloudflare Email Worker logs
4. Verify Supabase database connection

### Real-time Not Working:
1. Check Supabase real-time is enabled
2. Verify WebSocket connection in browser console
3. Check RLS policies are correctly set

### Build Errors:
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check TypeScript errors: `npm run build`

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git (already in .gitignore)
- Keep service role key secret
- Only use anon key in frontend
- Service role key should only be in:
  - Cloudflare Worker (as secret)
  - GitHub Actions (as secret)
  - Supabase Edge Functions (automatic)

## Next Steps

After completing this setup:
1. Test the complete email flow
2. Apply for Google AdSense
3. Setup analytics (Google Analytics, Sentry)
4. Optimize performance (Lighthouse audit)
5. Start implementing remaining features from tasks.md

## Support

For issues or questions:
- Check GitHub Issues
- Review Supabase documentation
- Check Cloudflare Workers documentation
- Review Vercel deployment docs
