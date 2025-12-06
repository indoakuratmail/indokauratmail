# Design Document - IndoAkurat

## Overview

IndoAkurat adalah aplikasi web temporary email yang dibangun dengan arsitektur modern serverless menggunakan Vue 3 untuk frontend, Supabase sebagai backend platform (database, storage, real-time), dan Cloudflare Email Workers untuk menangani incoming emails. Aplikasi ini mendukung multiple domain (default domain pool dan custom user domains) dengan real-time inbox updates, monetisasi melalui Google AdSense, dan multi-language support (Indonesia & English).

**Tech Stack:**
- **Frontend:** Vue 3 + TypeScript + Vite + Tailwind CSS + Font Awesome 6
- **Backend:** Supabase (PostgreSQL + Real-time + Storage + Edge Functions)
- **Email Handler:** Cloudflare Email Routing + Workers
- **Hosting:** Vercel (frontend), Supabase Cloud, Cloudflare
- **CI/CD:** GitHub + Vercel Auto-deploy
- **Cron Jobs:** GitHub Actions atau Cloudflare Workers Cron
- **DNS Validation:** Google Public DNS API
- **Analytics:** Google Analytics (optional), Supabase Dashboard
- **Error Tracking:** Sentry (optional)

**Key Features:**
- Generate temporary email dengan custom username
- Random email generation
- Real-time inbox updates via WebSocket
- Email reading dengan HTML rendering (sanitized)
- Attachment viewing & download
- Dark mode & multi-language (ID/EN)
- Google AdSense integration
- Custom domain support (tanpa login)
- Responsive design (mobile, tablet, desktop)

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet Email Sender                    │
│                  (Gmail, Outlook, etc.)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ SMTP
                           │ (Email sent to user@domain.com)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Email Routing                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  MX Records Configuration:                            │  │
│  │  - tempmail-id.com → route.mx.cloudflare.net         │  │
│  │  - quickmail-id.net → route.mx.cloudflare.net        │  │
│  │  - *.custom-domains.com → route.mx.cloudflare.net    │  │
│  │                                                       │  │
│  │  Catch-all routing → Forward to Email Worker         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Forward Email
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Email Worker                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Processing Steps:                                    │  │
│  │  1. Receive email event                              │  │
│  │  2. Parse headers (from, to, subject, date)          │  │
│  │  3. Parse body (HTML & plain text)                   │  │
│  │  4. Extract attachments (if any)                     │  │
│  │  5. Upload attachments to Supabase Storage           │  │
│  │  6. Insert email data to Supabase Database           │  │
│  │  7. Return success/error response                    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS API Call
                           │ (Supabase Service Role Key)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Tables:                                        │  │  │
│  │  │  - emails (id, recipient, sender, subject,     │  │  │
│  │  │            body_html, body_text, created_at,   │  │  │
│  │  │            expires_at, is_read, is_custom)     │  │  │
│  │  │  - attachments (id, email_id, filename,        │  │  │
│  │  │                 file_url, file_size, mime)     │  │  │
│  │  │  - custom_domains_usage (id, domain,           │  │  │
│  │  │                          first_seen, stats)    │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Storage Buckets                                      │  │
│  │  - email-attachments/ (public access)                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Real-time Subscriptions (WebSocket)                  │  │
│  │  - Channel: emails:recipient=user@domain.com         │  │
│  │  - Events: INSERT, UPDATE, DELETE                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Edge Functions                                       │  │
│  │  - cleanup-expired-emails (triggered by cron)        │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ WebSocket + REST API
                           │ (Supabase Anon Key)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Vue 3 Frontend Application                     │
│              (Hosted on Vercel)                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages/Routes:                                        │  │
│  │  - / (Home - Default email generator)                │  │
│  │  - /:customDomain (Custom domain email generator)    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Core Components:                                     │  │
│  │  - AppHeader (logo, dark mode, language)             │  │
│  │  - EmailGenerator (username input, domain select)    │  │
│  │  - ActiveEmail (display, copy, timer)                │  │
│  │  - InboxList (real-time email list)                  │  │
│  │  - EmailDetail (read email, attachments)             │  │
│  │  - AdPlacements (AdSense integration)                │  │
│  │  - CustomDomainInstructions (MX setup guide)         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  State Management (Pinia):                           │  │
│  │  - emailStore (emails, active email, inbox)          │  │
│  │  - uiStore (dark mode, language, loading states)     │  │
│  │  - customDomainStore (domain validation, session)    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services:                                            │  │
│  │  - supabaseClient (database, storage, real-time)     │  │
│  │  - dnsValidator (check MX records)                   │  │
│  │  - sessionManager (localStorage persistence)         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      End User                               │
│          (Browser: Chrome, Firefox, Safari, etc.)           │
│          (Devices: Desktop, Tablet, Mobile)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              External Services (Cron & Validation)          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  GitHub Actions (Cron Job)                           │  │
│  │  - Schedule: Every 5 minutes                         │  │
│  │  - Action: Call Supabase Edge Function               │  │
│  │  - Function: cleanup-expired-emails                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Google Public DNS API                               │  │
│  │  - Endpoint: dns.google/resolve                      │  │
│  │  - Purpose: Validate custom domain MX records        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Google AdSense                                       │  │
│  │  - Ad Units: Header, Sidebar, In-feed, Footer       │  │
│  │  - Loading: Async/Lazy                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Flow 1: Email Generation (Default Domain)
```
1. User opens indoakurat.com
2. User inputs username (e.g., "john123")
3. User selects domain from dropdown (e.g., "tempmail-id.com")
4. User clicks "Generate" button
5. Frontend validates username format
6. Frontend creates session object:
   {
     email: "john123@tempmail-id.com",
     createdAt: timestamp,
     expiresAt: timestamp + 30 minutes,
     isCustomDomain: false
   }
7. Frontend saves session to localStorage
8. Frontend displays active email with copy button & timer
9. Frontend subscribes to Supabase real-time:
   channel: "emails:recipient=eq.john123@tempmail-id.com"
10. User can now receive emails at this address
```

#### Flow 2: Email Reception & Processing
```
1. Someone sends email to john123@tempmail-id.com
2. Email arrives at Cloudflare Email Routing (MX record)
3. Cloudflare forwards email to Email Worker
4. Email Worker receives email event
5. Worker parses email:
   - Extract: from, to, subject, date
   - Parse HTML body & plain text body
   - Extract attachments (if any)
6. If attachments exist:
   - Upload each file to Supabase Storage bucket "email-attachments"
   - Generate public URL for each file
   - Store metadata (filename, size, mime_type, url)
7. Worker inserts email record to Supabase database:
   INSERT INTO emails (recipient, sender, subject, body_html, 
                       body_text, expires_at, is_custom_domain)
   VALUES (...)
8. If attachments exist:
   INSERT INTO attachments (email_id, filename, file_url, ...)
   VALUES (...)
9. Supabase real-time triggers INSERT event
10. Frontend receives real-time event via WebSocket
11. Frontend adds new email to inbox list
12. Frontend shows toast notification: "New email from {sender}"
13. Frontend plays notification sound (optional)
```


#### Flow 3: Email Reading
```
1. User clicks email item in inbox
2. Frontend navigates to email detail view (or opens modal)
3. Frontend fetches full email data:
   SELECT * FROM emails WHERE id = {emailId}
   SELECT * FROM attachments WHERE email_id = {emailId}
4. Frontend sanitizes HTML body using DOMPurify
5. Frontend renders email:
   - Header: From, To, Subject, Date
   - Body: Sanitized HTML or plain text
   - Attachments: List with download buttons
6. Frontend marks email as read:
   UPDATE emails SET is_read = true WHERE id = {emailId}
7. User can download attachments by clicking download button
8. User can delete email by clicking delete button
```

#### Flow 4: Custom Domain Setup & Usage
```
1. User owns domain: mydomain.com
2. User opens indoakurat.com
3. User clicks "Use Your Own Domain" section
4. User reads instructions:
   - Add MX record: mail.indoakurat.com (priority 10)
   - Wait for DNS propagation (up to 24 hours)
5. User adds MX record at their domain registrar
6. User inputs "mydomain.com" in custom domain field
7. User clicks "Go" button
8. Frontend redirects to: indoakurat.com/mydomain.com
9. Frontend extracts domain from URL path
10. Frontend validates domain format (regex)
11. Frontend calls DNS validation API:
    GET https://dns.google/resolve?name=mydomain.com&type=MX
12. API returns MX records
13. Frontend checks if MX points to mail.indoakurat.com
14. If valid:
    - Generate unique session token
    - Redirect to: indoakurat.com/mydomain.com?session={token}
    - Show email generator with domain pre-filled
    - User can generate email: user@mydomain.com
15. If invalid:
    - Show error message with troubleshooting tips
    - Provide "Retry" button
16. When email generated with custom domain:
    - Save session with custom domain flag
    - Subscribe to real-time for this custom domain
    - Track domain usage in custom_domains_usage table
```

#### Flow 5: Auto-Cleanup Expired Emails
```
1. GitHub Actions cron triggers every 5 minutes
2. Action calls Supabase Edge Function:
   POST https://{project}.supabase.co/functions/v1/cleanup-expired-emails
3. Edge Function queries expired emails:
   SELECT * FROM emails WHERE expires_at < NOW()
4. For each expired email:
   a. Query attachments:
      SELECT * FROM attachments WHERE email_id = {emailId}
   b. Delete each attachment file from Storage:
      DELETE FROM storage.objects 
      WHERE bucket_id = 'email-attachments' 
      AND name = {filename}
   c. Delete attachment records:
      DELETE FROM attachments WHERE email_id = {emailId}
   d. Delete email record:
      DELETE FROM emails WHERE id = {emailId}
5. Edge Function logs cleanup stats:
   - Total emails deleted
   - Total attachments deleted
   - Execution time
6. Return success response
```

## Components and Interfaces

### Frontend Component Structure

```
src/
├── main.ts                          # App entry point
├── App.vue                          # Root component
├── router/
│   └── index.ts                     # Vue Router configuration
├── stores/
│   ├── emailStore.ts                # Email state management
│   ├── uiStore.ts                   # UI state (dark mode, language)
│   └── customDomainStore.ts         # Custom domain state
├── services/
│   ├── supabase.ts                  # Supabase client initialization
│   ├── dnsValidator.ts              # DNS MX record validation
│   ├── sessionManager.ts            # localStorage session management
│   └── emailSanitizer.ts            # HTML sanitization (DOMPurify)
├── composables/
│   ├── useRealtime.ts               # Real-time subscription logic
│   ├── useEmailGenerator.ts         # Email generation logic
│   ├── useCountdown.ts              # Countdown timer logic
│   └── useClipboard.ts              # Copy to clipboard logic
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue            # Header with logo, dark mode, language
│   │   ├── AppFooter.vue            # Footer with links
│   │   └── AppSidebar.vue           # Sidebar for ads (desktop)
│   ├── email/
│   │   ├── EmailGenerator.vue       # Email generation form
│   │   ├── ActiveEmail.vue          # Display active email with actions
│   │   ├── InboxList.vue            # List of received emails
│   │   ├── InboxItem.vue            # Single email item in list
│   │   ├── EmailDetail.vue          # Full email view
│   │   ├── EmailBody.vue            # Sanitized email body renderer
│   │   └── AttachmentList.vue       # List of attachments
│   ├── customDomain/
│   │   ├── CustomDomainInstructions.vue  # MX setup guide
│   │   ├── CustomDomainInput.vue         # Domain input form
│   │   └── DomainValidationStatus.vue    # Validation status display
│   ├── ads/
│   │   ├── AdBanner.vue             # Banner ad component
│   │   ├── AdSidebar.vue            # Sidebar ad component
│   │   └── AdInFeed.vue             # In-feed ad component
│   ├── ui/
│   │   ├── Button.vue               # Reusable button component
│   │   ├── Input.vue                # Reusable input component
│   │   ├── Select.vue               # Reusable select component
│   │   ├── Toast.vue                # Toast notification component
│   │   ├── Modal.vue                # Modal dialog component
│   │   ├── LoadingSkeleton.vue      # Loading skeleton component
│   │   ├── EmptyState.vue           # Empty state component
│   │   └── Icon.vue                 # Font Awesome icon wrapper
│   └── common/
│       ├── DarkModeToggle.vue       # Dark mode switch
│       ├── LanguageSwitcher.vue     # Language selector
│       └── CountdownTimer.vue       # Countdown timer display
├── views/
│   ├── HomeView.vue                 # Home page (default domain)
│   └── CustomDomainView.vue         # Custom domain page
├── locales/
│   ├── id.json                      # Indonesian translations
│   └── en.json                      # English translations
├── assets/
│   ├── styles/
│   │   └── main.css                 # Global styles + Tailwind
│   └── images/
│       └── logo.svg                 # IndoAkurat logo
└── types/
    ├── email.ts                     # Email type definitions
    ├── attachment.ts                # Attachment type definitions
    └── session.ts                   # Session type definitions
```

### Key Component Interfaces

#### EmailGenerator.vue
```typescript
interface Props {
  customDomain?: string;  // Pre-filled domain for custom domain page
}

interface Emits {
  (e: 'emailGenerated', email: string): void;
}

interface State {
  username: string;
  selectedDomain: string;
  isGenerating: boolean;
  validationError: string | null;
}
```

#### InboxList.vue
```typescript
interface Props {
  recipient: string;  // Email address to filter inbox
}

interface State {
  emails: Email[];
  isLoading: boolean;
  isRefreshing: boolean;
  realtimeSubscription: RealtimeChannel | null;
}

interface Email {
  id: string;
  recipient: string;
  sender: string;
  subject: string;
  body_html: string;
  body_text: string;
  created_at: string;
  expires_at: string;
  is_read: boolean;
  is_custom_domain: boolean;
}
```

#### EmailDetail.vue
```typescript
interface Props {
  emailId: string;
}

interface State {
  email: Email | null;
  attachments: Attachment[];
  isLoading: boolean;
  sanitizedHtml: string;
}

interface Attachment {
  id: string;
  email_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}
```

### Pinia Store Interfaces

#### emailStore.ts
```typescript
interface EmailState {
  activeEmail: string | null;
  expiresAt: Date | null;
  inbox: Email[];
  selectedEmail: Email | null;
  isCustomDomain: boolean;
  customDomain: string | null;
  sessionToken: string | null;
}

interface EmailActions {
  generateEmail(username: string, domain: string): Promise<void>;
  generateRandomEmail(): Promise<void>;
  fetchInbox(recipient: string): Promise<void>;
  fetchEmailDetail(emailId: string): Promise<Email>;
  markAsRead(emailId: string): Promise<void>;
  deleteEmail(emailId: string): Promise<void>;
  subscribeToRealtime(recipient: string): void;
  unsubscribeFromRealtime(): void;
  clearSession(): void;
  restoreSession(): void;
}
```

#### uiStore.ts
```typescript
interface UIState {
  isDarkMode: boolean;
  language: 'id' | 'en';
  toasts: Toast[];
  isLoading: boolean;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface UIActions {
  toggleDarkMode(): void;
  setLanguage(lang: 'id' | 'en'): void;
  showToast(message: string, type: Toast['type'], duration?: number): void;
  removeToast(id: string): void;
  setLoading(isLoading: boolean): void;
}
```

#### customDomainStore.ts
```typescript
interface CustomDomainState {
  domain: string | null;
  isValidated: boolean;
  validationError: string | null;
  isValidating: boolean;
  mxRecords: MXRecord[];
}

interface MXRecord {
  name: string;
  type: string;
  TTL: number;
  data: string;
}

interface CustomDomainActions {
  validateDomain(domain: string): Promise<boolean>;
  checkMXRecords(domain: string): Promise<MXRecord[]>;
  trackDomainUsage(domain: string): Promise<void>;
  clearDomain(): void;
}
```

## Data Models

### Database Schema (PostgreSQL)

#### Table: emails
```sql
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(255) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_custom_domain BOOLEAN DEFAULT FALSE,
  
  -- Indexes for performance
  INDEX idx_recipient (recipient),
  INDEX idx_created_at (created_at),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_custom_domain (is_custom_domain)
);

-- Row Level Security (RLS) Policies
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no authentication required)
CREATE POLICY "Allow public read access" ON emails
  FOR SELECT USING (true);

-- Allow Email Worker to insert (using service role key)
CREATE POLICY "Allow service role insert" ON emails
  FOR INSERT WITH CHECK (true);

-- Allow public update for marking as read
CREATE POLICY "Allow public update is_read" ON emails
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Allow public delete
CREATE POLICY "Allow public delete" ON emails
  FOR DELETE USING (true);
```


#### Table: attachments
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for querying attachments by email
  INDEX idx_email_id (email_id)
);

-- Row Level Security
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON attachments
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert" ON attachments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete" ON attachments
  FOR DELETE USING (true);
```

#### Table: custom_domains_usage
```sql
CREATE TABLE custom_domains_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) UNIQUE NOT NULL,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  total_emails_received INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  
  -- Index for querying by domain
  INDEX idx_domain (domain),
  INDEX idx_last_used (last_used)
);

-- Row Level Security
ALTER TABLE custom_domains_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON custom_domains_usage
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert/update" ON custom_domains_usage
  FOR ALL USING (true)
  WITH CHECK (true);
```

### Storage Buckets

#### Bucket: email-attachments
```javascript
// Bucket configuration
{
  name: 'email-attachments',
  public: true,  // Allow public access for downloads
  fileSizeLimit: 10485760,  // 10MB max per file
  allowedMimeTypes: [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.*',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
}

// File path structure
// email-attachments/{email_id}/{filename}
// Example: email-attachments/abc-123-def/document.pdf
```

### TypeScript Type Definitions

#### types/email.ts
```typescript
export interface Email {
  id: string;
  recipient: string;
  sender: string;
  subject: string;
  body_html: string;
  body_text: string;
  created_at: string;
  expires_at: string;
  is_read: boolean;
  is_custom_domain: boolean;
}

export interface EmailWithAttachments extends Email {
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  email_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface EmailListItem {
  id: string;
  sender: string;
  subject: string;
  created_at: string;
  is_read: boolean;
  has_attachments: boolean;
}
```

#### types/session.ts
```typescript
export interface EmailSession {
  email: string;
  createdAt: string;
  expiresAt: string;
  isCustomDomain: boolean;
  customDomain?: string;
  sessionToken?: string;
}

export interface CustomDomainSession extends EmailSession {
  isCustomDomain: true;
  customDomain: string;
  sessionToken: string;
}
```

## Error Handling

### Frontend Error Handling Strategy

#### Network Errors
```typescript
// services/supabase.ts
export async function handleSupabaseError<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Error) {
      // Network error
      if (error.message.includes('fetch')) {
        throw new Error('Connection error. Please check your internet.');
      }
      // Supabase API error
      if (error.message.includes('JWT')) {
        throw new Error('Session expired. Please refresh the page.');
      }
      // Generic error
      throw new Error('Something went wrong. Please try again.');
    }
    throw error;
  }
}
```

#### Real-time Connection Errors
```typescript
// composables/useRealtime.ts
export function useRealtime(recipient: string) {
  const channel = supabase
    .channel(`emails:${recipient}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'emails' },
      handleNewEmail
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Real-time connected');
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Real-time connection error');
        showToast('Real-time updates disabled. Click refresh to check new emails.', 'warning');
        // Attempt reconnect after 5 seconds
        setTimeout(() => channel.subscribe(), 5000);
      }
      if (status === 'TIMED_OUT') {
        console.error('Real-time connection timed out');
        // Attempt reconnect
        channel.subscribe();
      }
    });
  
  return { channel };
}
```

#### DNS Validation Errors
```typescript
// services/dnsValidator.ts
export async function validateMXRecords(domain: string): Promise<{
  isValid: boolean;
  error?: string;
  records?: MXRecord[];
}> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=MX`
    );
    
    if (!response.ok) {
      return {
        isValid: false,
        error: 'Unable to verify domain. Please try again later.'
      };
    }
    
    const data = await response.json();
    
    if (!data.Answer || data.Answer.length === 0) {
      return {
        isValid: false,
        error: 'MX record not found. Please add MX record and wait for DNS propagation.'
      };
    }
    
    const mxRecords = data.Answer.filter((r: any) => r.type === 15);
    const hasValidMX = mxRecords.some((r: any) => 
      r.data.includes('mail.indoakurat.com') || 
      r.data.includes('indoakurat.com')
    );
    
    if (!hasValidMX) {
      return {
        isValid: false,
        error: 'MX record found but pointing to wrong server. Please update to: mail.indoakurat.com',
        records: mxRecords
      };
    }
    
    return {
      isValid: true,
      records: mxRecords
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'DNS lookup failed. Please check your internet connection.'
    };
  }
}
```

### Backend Error Handling (Cloudflare Worker)

```javascript
// cloudflare-worker/email-handler.js
export default {
  async email(message, env, ctx) {
    try {
      // Parse email
      const emailData = await parseEmail(message);
      
      // Upload attachments
      let attachments = [];
      if (emailData.attachments.length > 0) {
        try {
          attachments = await uploadAttachments(
            emailData.attachments, 
            env.SUPABASE_URL, 
            env.SUPABASE_SERVICE_ROLE_KEY
          );
        } catch (error) {
          console.error('Attachment upload failed:', error);
          // Continue without attachments
        }
      }
      
      // Insert to database with retry
      let retries = 3;
      while (retries > 0) {
        try {
          await insertEmailToDatabase(emailData, attachments, env);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw error;
          }
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, (3 - retries) * 1000)
          );
        }
      }
      
      return new Response('Email processed successfully');
      
    } catch (error) {
      console.error('Email processing error:', error);
      
      // Send alert to admin (optional)
      await sendErrorAlert(error, env);
      
      // Return error response
      return new Response('Email processing failed', { status: 500 });
    }
  }
};

async function sendErrorAlert(error, env) {
  // Could send to Sentry, email, or logging service
  console.error('ALERT:', error);
}
```

### Error Logging & Monitoring

#### Frontend Error Tracking (Sentry - Optional)
```typescript
// main.ts
import * as Sentry from "@sentry/vue";

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

## Testing Strategy

### Unit Testing

#### Frontend Unit Tests (Vitest)
```typescript
// tests/unit/emailStore.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEmailStore } from '@/stores/emailStore';

describe('Email Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('should generate email with valid username and domain', () => {
    const store = useEmailStore();
    store.generateEmail('testuser', 'tempmail-id.com');
    
    expect(store.activeEmail).toBe('testuser@tempmail-id.com');
    expect(store.expiresAt).toBeDefined();
  });
  
  it('should validate username format', () => {
    const store = useEmailStore();
    
    expect(() => store.generateEmail('ab', 'tempmail-id.com'))
      .toThrow('Username minimal 3 karakter');
    
    expect(() => store.generateEmail('user@name', 'tempmail-id.com'))
      .toThrow('Username hanya boleh mengandung alphanumeric');
  });
  
  it('should generate random email', () => {
    const store = useEmailStore();
    store.generateRandomEmail();
    
    expect(store.activeEmail).toMatch(/^[a-z0-9]{8,12}@.+$/);
  });
});
```

#### Component Tests
```typescript
// tests/unit/EmailGenerator.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EmailGenerator from '@/components/email/EmailGenerator.vue';

describe('EmailGenerator', () => {
  it('should render username input and domain selector', () => {
    const wrapper = mount(EmailGenerator);
    
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find('select').exists()).toBe(true);
  });
  
  it('should emit emailGenerated event when form submitted', async () => {
    const wrapper = mount(EmailGenerator);
    
    await wrapper.find('input').setValue('testuser');
    await wrapper.find('select').setValue('tempmail-id.com');
    await wrapper.find('button').trigger('click');
    
    expect(wrapper.emitted('emailGenerated')).toBeTruthy();
    expect(wrapper.emitted('emailGenerated')[0]).toEqual(['testuser@tempmail-id.com']);
  });
});
```

### Integration Testing

#### Email Worker Integration Test
```javascript
// tests/integration/email-worker.test.js
import { describe, it, expect } from 'vitest';

describe('Email Worker Integration', () => {
  it('should process email and insert to database', async () => {
    const mockEmail = {
      from: 'sender@example.com',
      to: 'testuser@tempmail-id.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
      text: 'Test content'
    };
    
    // Simulate email worker processing
    const response = await fetch('https://worker.dev/email', {
      method: 'POST',
      body: JSON.stringify(mockEmail)
    });
    
    expect(response.status).toBe(200);
    
    // Verify email in database
    const { data } = await supabase
      .from('emails')
      .select('*')
      .eq('recipient', 'testuser@tempmail-id.com')
      .single();
    
    expect(data).toBeDefined();
    expect(data.sender).toBe('sender@example.com');
  });
});
```

### End-to-End Testing (Playwright - Optional)

```typescript
// tests/e2e/email-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete email generation and reception flow', async ({ page }) => {
  // Navigate to home page
  await page.goto('https://indoakurat.com');
  
  // Generate email
  await page.fill('input[name="username"]', 'e2etest');
  await page.selectOption('select[name="domain"]', 'tempmail-id.com');
  await page.click('button:has-text("Generate")');
  
  // Verify active email displayed
  await expect(page.locator('.active-email')).toContainText('e2etest@tempmail-id.com');
  
  // Verify copy button works
  await page.click('button:has-text("Copy")');
  await expect(page.locator('.toast')).toContainText('Email copied!');
  
  // Wait for inbox to load
  await expect(page.locator('.inbox-list')).toBeVisible();
  
  // Simulate email arrival (would need test email sender)
  // ...
  
  // Verify email appears in inbox
  await expect(page.locator('.inbox-item')).toHaveCount(1);
});
```

### Manual Testing Checklist

```markdown
## Pre-Launch Testing Checklist

### Email Generation
- [ ] Generate email with custom username
- [ ] Generate random email
- [ ] Validate username format (too short, too long, invalid chars)
- [ ] Copy email to clipboard
- [ ] Countdown timer works correctly
- [ ] Session persists on refresh

### Email Reception
- [ ] Send test email from Gmail
- [ ] Send test email from Outlook
- [ ] Send email with attachments
- [ ] Send email with HTML content
- [ ] Send email with plain text only
- [ ] Verify real-time inbox update
- [ ] Verify toast notification appears

### Email Reading
- [ ] Open email detail
- [ ] HTML email renders correctly
- [ ] Plain text email displays properly
- [ ] Attachments list shows correctly
- [ ] Download attachment works
- [ ] Mark as read works
- [ ] Delete email works

### Custom Domain
- [ ] Add MX record to test domain
- [ ] Validate domain with correct MX
- [ ] Validate domain with wrong MX
- [ ] Validate domain without MX
- [ ] Generate email with custom domain
- [ ] Receive email to custom domain
- [ ] Session token privacy works

### UI/UX
- [ ] Dark mode toggle works
- [ ] Language switcher works (ID/EN)
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1920px)
- [ ] All icons display correctly
- [ ] Loading states show properly
- [ ] Empty states display correctly

### Ads
- [ ] Header banner displays
- [ ] Sidebar ads display (desktop)
- [ ] In-feed ads display
- [ ] Footer banner displays
- [ ] Ads don't overlap content
- [ ] Ads lazy load properly

### Performance
- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] No memory leaks
- [ ] Real-time connection stable

### Cross-browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
```


## Security Considerations

### Frontend Security

#### XSS Prevention
```typescript
// services/emailSanitizer.ts
import DOMPurify from 'dompurify';

export function sanitizeEmailHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'style', 'target'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true
  });
}
```

#### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https: blob:;
        font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
        connect-src 'self' https://*.supabase.co wss://*.supabase.co https://dns.google;
        frame-src https://googleads.g.doubleclick.net;
      ">
```

#### Input Validation
```typescript
// utils/validation.ts
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  // Length check
  if (username.length < 3) {
    return { isValid: false, error: 'Username minimal 3 karakter' };
  }
  if (username.length > 30) {
    return { isValid: false, error: 'Username maksimal 30 karakter' };
  }
  
  // Character check (alphanumeric, dash, underscore, dot only)
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(username)) {
    return { 
      isValid: false, 
      error: 'Username hanya boleh mengandung huruf, angka, titik, dash, dan underscore' 
    };
  }
  
  // No consecutive dots
  if (username.includes('..')) {
    return { isValid: false, error: 'Username tidak boleh mengandung titik berturut-turut' };
  }
  
  // Cannot start or end with dot
  if (username.startsWith('.') || username.endsWith('.')) {
    return { isValid: false, error: 'Username tidak boleh diawali atau diakhiri dengan titik' };
  }
  
  return { isValid: true };
}

export function validateDomain(domain: string): boolean {
  const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainPattern.test(domain);
}
```

### Backend Security

#### Supabase Row Level Security (RLS)
```sql
-- Emails table policies
-- Allow anyone to read emails (public temporary email service)
CREATE POLICY "Public read access" ON emails
  FOR SELECT USING (true);

-- Only service role can insert (Email Worker)
CREATE POLICY "Service role insert only" ON emails
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );

-- Allow public to update only is_read field
CREATE POLICY "Public update is_read" ON emails
  FOR UPDATE USING (true)
  WITH CHECK (
    -- Only allow updating is_read field
    (OLD.recipient = NEW.recipient) AND
    (OLD.sender = NEW.sender) AND
    (OLD.subject = NEW.subject) AND
    (OLD.body_html = NEW.body_html) AND
    (OLD.body_text = NEW.body_text)
  );

-- Allow public to delete their own emails
CREATE POLICY "Public delete" ON emails
  FOR DELETE USING (true);
```

#### Storage Security
```sql
-- Storage bucket policies for email-attachments
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'email-attachments');

CREATE POLICY "Service role insert only" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'email-attachments' AND
    auth.role() = 'service_role'
  );

CREATE POLICY "Public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'email-attachments');
```

#### Email Worker Security
```javascript
// cloudflare-worker/email-handler.js
export default {
  async email(message, env, ctx) {
    // Validate environment variables
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response('Configuration error', { status: 500 });
    }
    
    // Rate limiting (prevent abuse)
    const recipient = message.to;
    const rateLimitKey = `rate_limit:${recipient}`;
    const count = await env.KV.get(rateLimitKey);
    
    if (count && parseInt(count) > 100) {
      console.warn(`Rate limit exceeded for ${recipient}`);
      return new Response('Rate limit exceeded', { status: 429 });
    }
    
    await env.KV.put(rateLimitKey, (parseInt(count || '0') + 1).toString(), {
      expirationTtl: 3600 // 1 hour
    });
    
    // Process email...
  }
};
```

### Privacy Considerations

#### Session Token Privacy
```typescript
// For custom domains, generate unique session token
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate session token before showing inbox
export function validateSessionToken(
  storedToken: string, 
  urlToken: string
): boolean {
  return storedToken === urlToken;
}
```

#### Data Retention
```sql
-- Auto-delete emails after expiry
-- Handled by cleanup Edge Function
-- No permanent storage of email content
-- Attachments deleted with emails
```

#### No User Tracking
```typescript
// No cookies, no user accounts, no tracking
// Only localStorage for session persistence
// No analytics that track individual users (use privacy-friendly analytics)
```

## Performance Optimization

### Frontend Optimization

#### Code Splitting
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue') // Lazy load
    },
    {
      path: '/:customDomain',
      name: 'customDomain',
      component: () => import('@/views/CustomDomainView.vue') // Lazy load
    }
  ]
});
```

#### Image Optimization
```vue
<!-- Use lazy loading for images -->
<img 
  :src="logoUrl" 
  alt="IndoAkurat Logo" 
  loading="lazy"
  width="200"
  height="50"
/>
```

#### Asset Optimization
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['dompurify']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Remove console.logs in production
      }
    }
  }
});
```

#### Lazy Loading Ads
```vue
<!-- components/ads/AdBanner.vue -->
<template>
  <div v-if="isVisible" class="ad-container">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-xxxxx"
         data-ad-slot="xxxxx"
         data-ad-format="auto"></ins>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';

const adContainer = ref<HTMLElement>();
const isVisible = ref(false);

// Load ad only when visible in viewport
useIntersectionObserver(
  adContainer,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value) {
      isVisible.value = true;
      // Load AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }
);
</script>
```

### Database Optimization

#### Indexes
```sql
-- Already defined in schema, but important to note:
CREATE INDEX idx_recipient ON emails(recipient);
CREATE INDEX idx_created_at ON emails(created_at);
CREATE INDEX idx_expires_at ON emails(expires_at);
CREATE INDEX idx_email_id ON attachments(email_id);
```

#### Query Optimization
```typescript
// Fetch inbox with limit and order
export async function fetchInbox(recipient: string, limit = 50) {
  const { data, error } = await supabase
    .from('emails')
    .select('id, sender, subject, created_at, is_read')
    .eq('recipient', recipient)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// Fetch email detail with attachments in single query
export async function fetchEmailDetail(emailId: string) {
  const { data, error } = await supabase
    .from('emails')
    .select(`
      *,
      attachments (*)
    `)
    .eq('id', emailId)
    .single();
  
  if (error) throw error;
  return data;
}
```

### Real-time Optimization

#### Selective Subscriptions
```typescript
// Only subscribe to specific recipient, not all emails
const channel = supabase
  .channel(`emails:${recipient}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'emails',
      filter: `recipient=eq.${recipient}` // Filter at database level
    },
    handleNewEmail
  )
  .subscribe();
```

#### Unsubscribe on Unmount
```typescript
// composables/useRealtime.ts
import { onUnmounted } from 'vue';

export function useRealtime(recipient: string) {
  const channel = supabase.channel(`emails:${recipient}`);
  
  // ... subscription logic
  
  // Clean up on component unmount
  onUnmounted(() => {
    channel.unsubscribe();
  });
  
  return { channel };
}
```

## Deployment Strategy

### Environment Variables

#### Frontend (.env)
```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_NAME=IndoAkurat
VITE_APP_TAGLINE=Indonesia's Fast & Accurate Temporary Email
VITE_AVAILABLE_DOMAINS=tempmail-id.com,quickmail-id.net
VITE_EMAIL_EXPIRY_MINUTES=30

# Google AdSense (after approval)
VITE_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxxx

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Feature Flags
VITE_ENABLE_CUSTOM_DOMAIN=true
VITE_ENABLE_SOUND_NOTIFICATION=false
```

#### Cloudflare Worker (wrangler.toml)
```toml
name = "indoakurat-email-worker"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://xxxxx.supabase.co"

[[kv_namespaces]]
binding = "KV"
id = "xxxxx"

[env.production]
name = "indoakurat-email-worker-prod"
route = "mail.indoakurat.com/*"

[env.production.vars]
SUPABASE_URL = "https://xxxxx.supabase.co"

# Secrets (set via wrangler secret put)
# SUPABASE_SERVICE_ROLE_KEY
```

### Deployment Steps

#### 1. Supabase Setup
```bash
# Create project at supabase.com
# Run SQL migrations
psql -h db.xxxxx.supabase.co -U postgres -d postgres -f migrations/001_create_tables.sql

# Create storage bucket
# Via Supabase Dashboard: Storage → New Bucket → "email-attachments"

# Deploy Edge Function
supabase functions deploy cleanup-expired-emails
```

#### 2. Cloudflare Setup
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy Email Worker
cd cloudflare-worker
wrangler deploy

# Set secrets
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Configure Email Routing
# Via Cloudflare Dashboard:
# Email → Email Routing → Enable
# Add domains and configure catch-all to worker
```

#### 3. Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Configure environment variables via Vercel Dashboard
# Settings → Environment Variables → Add all VITE_* variables

# Configure custom domain
# Settings → Domains → Add indoakurat.com
```

#### 4. GitHub Actions Setup
```yaml
# .github/workflows/cleanup-cron.yml
name: Cleanup Expired Emails

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://xxxxx.supabase.co/functions/v1/cleanup-expired-emails
```

### Post-Deployment Checklist

```markdown
## Post-Deployment Checklist

### DNS Configuration
- [ ] MX records configured for all domains
- [ ] SPF records added
- [ ] Domain verification completed
- [ ] SSL certificates active

### Supabase
- [ ] Database tables created
- [ ] RLS policies enabled
- [ ] Storage bucket created and configured
- [ ] Edge Function deployed
- [ ] API keys secured

### Cloudflare
- [ ] Email Worker deployed
- [ ] Email Routing enabled
- [ ] Catch-all routing configured
- [ ] Worker secrets set

### Frontend
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL active
- [ ] Build successful

### GitHub Actions
- [ ] Cleanup cron job configured
- [ ] Secrets added to repository
- [ ] First run successful

### Testing
- [ ] Send test email to default domain
- [ ] Send test email to custom domain
- [ ] Verify real-time updates work
- [ ] Test on mobile devices
- [ ] Verify ads display correctly

### Monitoring
- [ ] Google Analytics configured
- [ ] Sentry error tracking active
- [ ] Supabase dashboard monitoring
- [ ] Cloudflare analytics enabled

### Google AdSense
- [ ] Application submitted
- [ ] Ads.txt file added
- [ ] Ad units created
- [ ] Ads displaying correctly
```

## Maintenance and Monitoring

### Regular Maintenance Tasks

#### Daily
- Monitor error logs (Sentry, Supabase logs)
- Check email processing success rate
- Verify cleanup cron job running

#### Weekly
- Review database size and growth
- Check storage usage
- Review custom domain usage stats
- Monitor AdSense revenue

#### Monthly
- Database optimization (VACUUM, ANALYZE)
- Review and update dependencies
- Security audit
- Performance review (Lighthouse)

### Monitoring Dashboards

#### Supabase Dashboard
- Database size and connections
- Storage usage
- API request count
- Real-time connections
- Edge Function invocations

#### Cloudflare Dashboard
- Email Routing statistics
- Worker invocations and errors
- DNS query statistics
- Bandwidth usage

#### Vercel Dashboard
- Deployment status
- Build times
- Bandwidth usage
- Function invocations

### Scaling Considerations

#### When to Scale

**Database (Supabase):**
- Upgrade when > 400MB used (free tier: 500MB)
- Upgrade when > 1.5GB bandwidth/month (free tier: 2GB)
- Consider Pro plan ($25/month) for better performance

**Email Worker (Cloudflare):**
- Free tier: 100k requests/day (sufficient for most use cases)
- Upgrade to Paid plan if exceeding limits

**Frontend (Vercel):**
- Upgrade when > 80GB bandwidth/month (free tier: 100GB)
- Consider Pro plan ($20/month) for better performance

#### Optimization Before Scaling
1. Implement aggressive cleanup (reduce email retention)
2. Optimize images and assets
3. Implement CDN caching
4. Reduce database queries
5. Optimize real-time subscriptions

