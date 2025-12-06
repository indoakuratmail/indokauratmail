# Implementation Plan - IndoAkurat

## Overview

This implementation plan breaks down the development of IndoAkurat into discrete, manageable tasks. Each task builds incrementally on previous work, ensuring a systematic approach to building the complete application. The plan follows a logical sequence: infrastructure setup → backend email handling → frontend core features → UI enhancements → custom domain support → monetization → optimization → deployment.

**Estimated Timeline:** 6-8 weeks (1.5-2 months)

**Tech Stack:**
- Frontend: Vue 3 + TypeScript + Vite + Tailwind CSS + Font Awesome 6
- Backend: Supabase (PostgreSQL + Real-time + Storage)
- Email Handler: Cloudflare Email Workers
- Hosting: Vercel + Supabase Cloud + Cloudflare

---

## Tasks

- [x] 1. Setup project infrastructure and development environment



  - Initialize Git repository and create project structure
  - Setup Supabase project and obtain API credentials (URL, anon key, service role key)
  - Configure Cloudflare account and add domains for email routing
  - Create Vue 3 project with Vite and TypeScript
  - Install and configure Tailwind CSS, Font Awesome 6, and core dependencies
  - Setup environment variables for all services
  - Create initial README with setup instructions
  - _Requirements: All requirements (foundation for entire system)_

- [ ] 2. Create database schema and configure Supabase
  - [ ] 2.1 Create emails table with proper columns and indexes
    - Write SQL migration for emails table (id, recipient, sender, subject, body_html, body_text, created_at, expires_at, is_read, is_custom_domain)
    - Add indexes on recipient, created_at, expires_at for query performance
    - Apply migration to Supabase database
    - _Requirements: 6, 7, 9, 26, 28_
  
  - [ ] 2.2 Create attachments table with foreign key relationship
    - Write SQL migration for attachments table (id, email_id, filename, file_url, file_size, mime_type, created_at)
    - Add foreign key constraint to emails table with CASCADE delete
    - Add index on email_id for efficient queries
    - Apply migration to Supabase database
    - _Requirements: 10, 27_
  
  - [ ] 2.3 Create custom_domains_usage table for analytics
    - Write SQL migration for custom_domains_usage table (id, domain, first_seen, last_used, total_emails_received, total_sessions)
    - Add unique constraint on domain column
    - Add indexes for querying and analytics
    - Apply migration to Supabase database
    - _Requirements: 38_
  
  - [ ] 2.4 Configure Row Level Security (RLS) policies
    - Enable RLS on all tables
    - Create policy for public read access on emails and attachments
    - Create policy for service role insert access (Email Worker)
    - Create policy for public update (is_read field only)
    - Create policy for public delete access
    - Test policies with different access scenarios
    - _Requirements: 21, 25_
  
  - [ ] 2.5 Create and configure Storage bucket for attachments
    - Create "email-attachments" bucket in Supabase Storage
    - Configure bucket as public for download access
    - Set file size limit (10MB per file)
    - Configure allowed MIME types (images, PDFs, documents, archives)
    - Create storage policies for public read and service role write
    - _Requirements: 10, 27_


- [ ] 3. Implement Cloudflare Email Worker for incoming email processing
  - [ ] 3.1 Setup Cloudflare Worker project structure
    - Initialize Wrangler project for Email Worker
    - Configure wrangler.toml with environment variables
    - Setup TypeScript configuration for Worker
    - Create basic email handler skeleton
    - _Requirements: 26_
  
  - [ ] 3.2 Implement email parsing logic
    - Parse email headers (from, to, subject, date)
    - Extract HTML body content
    - Extract plain text body content
    - Handle missing or malformed email parts gracefully
    - _Requirements: 26_
  
  - [ ] 3.3 Implement attachment extraction and upload
    - Extract attachments from email message
    - Convert attachments to binary data
    - Generate unique filenames using email_id and original filename
    - Upload attachments to Supabase Storage using service role key
    - Store attachment metadata (filename, size, mime_type, public URL)
    - Handle upload errors and continue processing without attachments if needed
    - _Requirements: 27_
  
  - [ ] 3.4 Implement database insertion logic
    - Insert email record to Supabase emails table
    - Set expires_at to 30 minutes from current time
    - Set is_custom_domain flag based on recipient domain
    - Insert attachment records to attachments table if attachments exist
    - Implement retry logic with exponential backoff (3 retries)
    - _Requirements: 28_
  
  - [ ] 3.5 Add error handling and logging
    - Wrap all operations in try-catch blocks
    - Log errors with context (recipient, sender, error message)
    - Return appropriate HTTP status codes
    - Implement timeout (30 seconds) to prevent hanging
    - Add rate limiting using Cloudflare KV (100 emails per hour per recipient)
    - _Requirements: 29_
  
  - [ ] 3.6 Deploy Email Worker and configure routing
    - Deploy Worker to Cloudflare using Wrangler
    - Set Worker secrets (SUPABASE_SERVICE_ROLE_KEY)
    - Configure Email Routing in Cloudflare Dashboard
    - Setup catch-all routing to forward all emails to Worker
    - Add MX records for default domains (tempmail-id.com, quickmail-id.net)
    - Test email reception with real email from Gmail/Outlook
    - _Requirements: 26, 37_

- [ ] 4. Build frontend core structure and routing
  - [ ] 4.1 Setup Vue Router with routes
    - Install and configure Vue Router
    - Create HomeView component for default domain (route: /)
    - Create AddDomainView component for custom domain instructions (route: /add-domain)
    - Create CustomDomainView component for custom domains (route: /:customDomain)
    - Implement route guards for custom domain validation
    - Configure router history mode
    - _Requirements: 31, 33, 35_
  
  - [ ] 4.2 Create Pinia stores for state management
    - Install and configure Pinia
    - Create emailStore with state (activeEmail, expiresAt, inbox, selectedEmail)
    - Create uiStore with state (isDarkMode, language, toasts, isLoading)
    - Create customDomainStore with state (domain, isValidated, validationError)
    - Implement store actions and getters
    - _Requirements: 1, 15, 16, 31_
  
  - [ ] 4.3 Initialize Supabase client
    - Install @supabase/supabase-js
    - Create supabase.ts service with client initialization
    - Configure Supabase URL and anon key from environment variables
    - Export typed Supabase client for use across application
    - _Requirements: All (foundation for data access)_
  
  - [ ] 4.4 Create base layout components
    - Create AppHeader component with logo, dark mode toggle, language switcher
    - Create AppFooter component with links and copyright
    - Create AppSidebar component for desktop ads placement
    - Implement responsive layout structure (mobile, tablet, desktop)
    - _Requirements: 14, 15, 16_

- [ ] 5. Implement email generation functionality
  - [ ] 5.1 Create EmailGenerator component
    - Create form with username input field
    - Create domain selector dropdown with available domains from env
    - Add "Generate" button and "Random" button
    - Implement form validation UI (real-time feedback)
    - Style component with Tailwind CSS and Font Awesome icons
    - _Requirements: 1, 2, 13_
  
  - [ ] 5.2 Implement username validation logic
    - Create validation utility function
    - Validate username length (3-30 characters)
    - Validate allowed characters (alphanumeric, dash, underscore, dot)
    - Check for consecutive dots and leading/trailing dots
    - Display validation errors in real-time
    - Disable generate button when validation fails
    - _Requirements: 3_
  
  - [ ] 5.3 Implement email generation action
    - Create generateEmail action in emailStore
    - Combine username and selected domain
    - Set expiresAt to current time + 30 minutes
    - Save session to localStorage
    - Update store state with active email
    - Emit success event and show toast notification
    - _Requirements: 1, 20_
  
  - [ ] 5.4 Implement random email generation
    - Create generateRandomEmail action in emailStore
    - Generate random alphanumeric string (8-12 characters)
    - Randomly select domain from available domains
    - Call generateEmail action with random values
    - _Requirements: 2_
  
  - [ ] 5.5 Create ActiveEmail component
    - Display active email address prominently
    - Add copy to clipboard button with icon
    - Implement copy functionality using Clipboard API
    - Show success toast when copied
    - Add "Generate New" button to create new email
    - Style with Tailwind CSS for clean modern look
    - _Requirements: 4_
  
  - [ ] 5.6 Implement countdown timer
    - Create CountdownTimer component
    - Calculate remaining time from expiresAt
    - Update countdown every second
    - Change color to orange when < 5 minutes remaining
    - Change color to red when < 1 minute remaining
    - Show "Email expired" message when timer reaches 00:00
    - Clear session when expired
    - _Requirements: 5_


- [ ] 6. Build inbox functionality with real-time updates
  - [ ] 6.1 Create InboxList component structure
    - Create component with header showing "Inbox" and email count
    - Add refresh button with icon
    - Create empty state component for when no emails exist
    - Add loading skeleton for initial load
    - Style with Tailwind CSS for modern card-based layout
    - _Requirements: 6, 8_
  
  - [ ] 6.2 Implement inbox data fetching
    - Create fetchInbox action in emailStore
    - Query Supabase emails table filtered by recipient
    - Order by created_at descending (newest first)
    - Limit to 50 emails for performance
    - Handle errors and show error toast
    - Update store state with fetched emails
    - _Requirements: 6_
  
  - [ ] 6.3 Create InboxItem component
    - Display sender email address
    - Display email subject (truncate if too long)
    - Display relative timestamp (e.g., "2 mins ago")
    - Show unread indicator (badge or bold text)
    - Add click handler to open email detail
    - Style with hover effects and transitions
    - _Requirements: 6, 12_
  
  - [ ] 6.4 Implement real-time subscription
    - Create useRealtime composable
    - Subscribe to Supabase real-time channel for specific recipient
    - Listen for INSERT events on emails table
    - Add new email to inbox list when received
    - Show toast notification with sender and subject
    - Play notification sound (optional, can be disabled)
    - Handle connection errors and implement reconnection logic
    - _Requirements: 7_
  
  - [ ] 6.5 Implement manual refresh functionality
    - Add refresh button click handler
    - Show loading spinner on button during refresh
    - Call fetchInbox action to reload emails
    - Implement rate limiting (max 1 refresh per 3 seconds)
    - Show success toast after refresh completes
    - _Requirements: 8_
  
  - [ ] 6.6 Implement unread email indicator
    - Display unread badge or styling on InboxItem
    - Show unread count in inbox header
    - Update UI when email is marked as read
    - _Requirements: 12_

- [ ] 7. Implement email reading and detail view
  - [ ] 7.1 Create EmailDetail component structure
    - Create modal or separate view for email detail
    - Add back button to return to inbox
    - Create header section for email metadata (from, to, subject, date)
    - Create body section for email content
    - Create attachments section
    - Add delete button with icon
    - Style with Tailwind CSS for clean reading experience
    - _Requirements: 9, 10, 11_
  
  - [ ] 7.2 Implement email detail fetching
    - Create fetchEmailDetail action in emailStore
    - Query email by ID with attachments using join
    - Handle not found errors
    - Update store state with selected email
    - _Requirements: 9_
  
  - [ ] 7.3 Implement HTML email rendering with sanitization
    - Install DOMPurify library
    - Create emailSanitizer service
    - Sanitize HTML body to prevent XSS attacks
    - Configure allowed tags and attributes
    - Render sanitized HTML in email body section
    - Fallback to plain text if HTML not available
    - Preserve formatting for plain text (line breaks, spacing)
    - _Requirements: 9, 25_
  
  - [ ] 7.4 Create AttachmentList component
    - Display list of attachments with icons based on MIME type
    - Show filename and file size for each attachment
    - Add download button for each attachment
    - Implement download functionality (link to Supabase Storage URL)
    - Show thumbnail preview for image attachments
    - Style with Tailwind CSS for clean list layout
    - _Requirements: 10_
  
  - [ ] 7.5 Implement mark as read functionality
    - Create markAsRead action in emailStore
    - Update is_read field in database when email is opened
    - Update local state to reflect read status
    - Update InboxItem styling to remove unread indicator
    - _Requirements: 9, 12_
  
  - [ ] 7.6 Implement email deletion
    - Create deleteEmail action in emailStore
    - Show confirmation dialog before deleting
    - Delete email record from database (CASCADE will delete attachments)
    - Delete attachment files from Supabase Storage
    - Remove email from inbox list in store
    - Show success toast after deletion
    - Navigate back to inbox after deletion
    - _Requirements: 11_

- [ ] 8. Implement session management and persistence
  - [ ] 8.1 Create sessionManager service
    - Create functions to save session to localStorage
    - Create functions to load session from localStorage
    - Create functions to clear session
    - Handle JSON serialization and deserialization
    - _Requirements: 20_
  
  - [ ] 8.2 Implement session save on email generation
    - Save email address, expiresAt, isCustomDomain, customDomain, sessionToken to localStorage
    - Save immediately after email generation
    - _Requirements: 20_
  
  - [ ] 8.3 Implement session restore on page load
    - Check localStorage for existing session on app mount
    - Validate that session has not expired
    - Restore email address and countdown timer if valid
    - Subscribe to real-time for restored email
    - Fetch inbox for restored email
    - Clear localStorage and show generator if expired
    - _Requirements: 20_
  
  - [ ] 8.4 Implement session clear on expiry
    - Clear localStorage when countdown reaches 00:00
    - Clear localStorage when user generates new email
    - Clear localStorage when user manually clears session
    - _Requirements: 20_

- [ ] 9. Implement dark mode functionality
  - [ ] 9.1 Create DarkModeToggle component
    - Create toggle button with sun/moon icon
    - Add click handler to toggle dark mode
    - Style button with smooth transitions
    - _Requirements: 15_
  
  - [ ] 9.2 Implement dark mode state management
    - Add isDarkMode state to uiStore
    - Create toggleDarkMode action
    - Save dark mode preference to localStorage
    - Load dark mode preference on app mount
    - _Requirements: 15_
  
  - [ ] 9.3 Apply dark mode styles
    - Add dark mode classes to Tailwind config
    - Apply dark: variants to all components
    - Ensure proper contrast in dark mode
    - Test all components in both light and dark mode
    - Implement smooth transition animation (200-300ms)
    - _Requirements: 15_

- [ ] 10. Implement multi-language support (i18n)
  - [ ] 10.1 Setup vue-i18n
    - Install vue-i18n library
    - Configure i18n plugin in main.ts
    - Create locales directory structure
    - _Requirements: 16_
  
  - [ ] 10.2 Create translation files
    - Create id.json for Indonesian translations
    - Create en.json for English translations
    - Translate all UI text, labels, buttons, messages
    - Translate error messages and notifications
    - Translate email generator instructions
    - Translate custom domain setup instructions
    - _Requirements: 16_
  
  - [ ] 10.3 Create LanguageSwitcher component
    - Create dropdown or toggle for language selection
    - Show current language (ID/EN or flags)
    - Add click handler to change language
    - Style with Tailwind CSS
    - _Requirements: 16_
  
  - [ ] 10.4 Implement language switching logic
    - Add language state to uiStore
    - Create setLanguage action
    - Save language preference to localStorage
    - Load language preference on app mount
    - Update i18n locale when language changes
    - _Requirements: 16_
  
  - [ ] 10.5 Apply translations throughout application
    - Replace all hardcoded text with $t() function calls
    - Test all pages and components in both languages
    - Ensure proper text formatting and grammar in both languages
    - _Requirements: 16_


- [ ] 11. Implement custom domain support
  - [ ] 11.1 Create dedicated Add Domain page (AddDomainView)
    - Create full page layout for custom domain instructions at route /add-domain
    - Add hero section with title "Use Your Own Domain" and description
    - Create tabbed interface for Method 1 (Self-Service) and Method 2 (Manual Setup)
    - Add prominent "Get Started" button that scrolls to instructions
    - Style with Tailwind CSS for professional, clean look
    - Make page accessible from homepage via "Add Domain" button in header or hero section
    - _Requirements: 35, 36_
  
  - [ ] 11.2 Create Method 1 (Self-Service) instructions section
    - Write clear step-by-step instructions for adding MX record
    - Step 1: Find domain registrar (provide link to ICANN registrars list)
    - Step 2: Access DNS settings at registrar
    - Step 3: Add MX record with copyable values
    - Create copyable code blocks for MX record configuration:
      * Name/Host: @ (or leave blank)
      * Type: MX
      * Priority: 10
      * Value: mail.indoakurat.com.
      * TTL: 86400 (or default)
    - Step 4: Wait for DNS propagation (1 minute to 24 hours)
    - Step 5: Use domain by accessing indoakurat.com/yourdomain.com
    - Add visual examples or screenshots for popular registrars (Namecheap, GoDaddy, Cloudflare)
    - Include troubleshooting section with common issues and solutions
    - _Requirements: 35_
  
  - [ ] 11.3 Create Method 2 (Manual Setup) instructions section
    - Write instructions for users who need help with setup
    - Explain that admin can setup MX record for them
    - Provide email template or contact form
    - List required information:
      * Domain registrar name (e.g., GoDaddy, Namecheap)
      * Registrar login username or email
      * Registrar login password
      * Domain name to configure
    - Add security disclaimer about sharing credentials
    - Provide admin contact email: admin@indoakurat.com
    - Mention estimated setup time (usually within 24 hours)
    - _Requirements: 36_
  
  - [ ] 11.4 Create domain input and validation form on Add Domain page
    - Add section "Test Your Domain" at bottom of page
    - Create input field for domain name with placeholder "yourdomain.com"
    - Add "Validate Domain" button
    - Implement domain format validation (regex)
    - Call DNS validation service when button clicked
    - Show validation results:
      * Success: "Domain verified! Click below to start using it"
      * Error: Show specific error message with troubleshooting tips
    - Add "Use This Domain" button that navigates to /:customDomain
    - Show loading state during validation
    - _Requirements: 32, 39_
  
  - [ ] 11.5 Add "Add Domain" link/button to homepage
    - Add prominent "Use Your Own Domain" button or link in homepage hero section
    - Add "Add Domain" link in header navigation
    - Both should navigate to /add-domain page
    - Style with Tailwind CSS to make it noticeable but not intrusive
    - _Requirements: 31, 35_
  
  - [ ] 11.6 Implement DNS validation service
    - Create dnsValidator service
    - Implement MX record lookup using Google Public DNS API
    - Parse DNS response to extract MX records
    - Check if MX record points to mail.indoakurat.com or indoakurat.com
    - Return validation result with error messages
    - Handle DNS lookup errors and timeouts
    - _Requirements: 32, 39_
  
  - [ ] 11.7 Implement custom domain routing
    - Extract domain from URL path in CustomDomainView
    - Validate domain format on route entry
    - Call DNS validation service to check MX records
    - Show error message with instructions if validation fails
    - Show email generator if validation succeeds
    - Provide "Retry Verification" button for failed validations
    - _Requirements: 31, 32_
  
  - [ ] 11.8 Implement custom domain email generation
    - Pre-fill domain field with custom domain in EmailGenerator
    - Disable domain selector for custom domain pages
    - Generate unique session token for custom domain sessions
    - Append session token to URL (?session=TOKEN)
    - Save custom domain session to localStorage with token
    - _Requirements: 33, 34_
  
  - [ ] 11.9 Implement custom domain session privacy
    - Validate session token from URL on custom domain page load
    - Compare URL token with localStorage token
    - Show email generator (not inbox) if tokens don't match
    - Allow access to inbox only with valid session token
    - _Requirements: 34_
  
  - [ ] 11.10 Implement custom domain usage tracking
    - Create trackDomainUsage action in customDomainStore
    - Insert or update custom_domains_usage table when custom domain is used
    - Track first_seen, last_used, total_emails_received, total_sessions
    - Call tracking when custom domain email is generated
    - Call tracking when email is received for custom domain
    - _Requirements: 38_
  
  - [ ] 11.11 Update Email Worker for custom domain handling
    - Modify Worker to accept emails from any domain
    - Set is_custom_domain flag based on recipient domain
    - Check if domain is in default domain pool or custom
    - Process custom domain emails with same logic as default domains
    - _Requirements: 37_

- [ ] 12. Integrate Google AdSense for monetization
  - [ ] 12.1 Apply for Google AdSense account
    - Create Google AdSense account
    - Submit application with website URL
    - Wait for approval (1-2 weeks typically)
    - Obtain AdSense Publisher ID (ca-pub-xxxxx)
    - _Requirements: 17_
  
  - [ ] 12.2 Create ad placement components
    - Create AdBanner component for header and footer ads
    - Create AdSidebar component for sidebar ads (desktop only)
    - Create AdInFeed component for in-feed ads in inbox
    - Implement lazy loading for all ad components
    - Use Intersection Observer to load ads only when visible
    - _Requirements: 17, 18_
  
  - [ ] 12.3 Integrate AdSense script
    - Add AdSense script tag to index.html
    - Configure async loading
    - Add data-ad-client attribute with Publisher ID
    - _Requirements: 17_
  
  - [ ] 12.4 Implement ad placements in layout
    - Add header banner ad (728x90 desktop, 320x50 mobile)
    - Add sidebar ads (300x250, 300x600) with sticky positioning for desktop
    - Add in-feed ads in InboxList (every 5 email items)
    - Add footer banner ad (728x90 desktop, 320x50 mobile)
    - Ensure ads don't overlap or cover functional elements
    - Implement minimum 20px spacing between ads and content
    - _Requirements: 17, 18_
  
  - [ ] 12.5 Test ad display and responsiveness
    - Test ads on desktop (various screen sizes)
    - Test ads on tablet
    - Test ads on mobile
    - Verify ads load correctly
    - Verify ads don't break layout
    - Verify ads collapse gracefully if they fail to load
    - _Requirements: 17, 18_

- [ ] 13. Implement UI components and enhancements
  - [ ] 13.1 Create reusable UI components
    - Create Button component with variants (primary, secondary, danger)
    - Create Input component with validation states
    - Create Select component with custom styling
    - Create Modal component for dialogs
    - Create LoadingSkeleton component for loading states
    - Create EmptyState component for empty data scenarios
    - Create Icon component as Font Awesome wrapper
    - Style all components with Tailwind CSS for consistency
    - _Requirements: 22_
  
  - [ ] 13.2 Implement toast notification system
    - Create Toast component with types (success, error, warning, info)
    - Create toast container to stack multiple toasts
    - Implement showToast action in uiStore
    - Add auto-dismiss after specified duration
    - Position toasts in top-right corner
    - Add slide-in animation for new toasts
    - Implement manual dismiss button
    - _Requirements: 30_
  
  - [ ] 13.3 Implement loading states
    - Add loading spinners to all async actions
    - Show skeleton loading for inbox while fetching
    - Show skeleton loading for email detail while fetching
    - Disable buttons during async operations
    - Show loading indicator on refresh button
    - Implement timeout for loading states (10 seconds max)
    - _Requirements: 22_
  
  - [ ] 13.4 Add micro-interactions and animations
    - Add hover effects to buttons (scale, color change)
    - Add click animations to buttons
    - Implement copy button → checkmark animation
    - Add slide-in animation for new inbox items
    - Add fade-in animation for email detail
    - Add pulse effect for new email badge
    - Implement smooth transitions (200-300ms) for all state changes
    - _Requirements: 14_
  
  - [ ] 13.5 Implement responsive design
    - Test and adjust layout for mobile (320px - 767px)
    - Test and adjust layout for tablet (768px - 1023px)
    - Test and adjust layout for desktop (1024px+)
    - Ensure touch targets are minimum 44x44px on mobile
    - Implement hamburger menu for mobile navigation if needed
    - Hide sidebar on mobile and tablet
    - Adjust ad placements for different screen sizes
    - _Requirements: 14_

- [ ] 14. Implement error handling and validation
  - [ ] 14.1 Create error handling utilities
    - Create handleSupabaseError utility function
    - Create error message mapping for common errors
    - Implement user-friendly error messages
    - _Requirements: 21_
  
  - [ ] 14.2 Implement network error handling
    - Catch and handle network errors in all API calls
    - Show appropriate error toasts for network failures
    - Provide retry options for failed operations
    - _Requirements: 21_
  
  - [ ] 14.3 Implement real-time connection error handling
    - Handle real-time connection failures
    - Show warning banner when real-time is disconnected
    - Implement automatic reconnection with exponential backoff
    - Provide manual reconnect option
    - _Requirements: 21_
  
  - [ ] 14.4 Implement form validation
    - Add validation to all input fields
    - Show validation errors inline
    - Prevent form submission when validation fails
    - Provide clear error messages
    - _Requirements: 3, 21_
  
  - [ ] 14.5 Add error logging
    - Log errors to console in development
    - Optionally integrate Sentry for production error tracking
    - Log error context (user action, timestamp, error details)
    - _Requirements: 21_

- [ ] 15. Implement auto-cleanup system for expired emails
  - [ ] 15.1 Create Supabase Edge Function for cleanup
    - Create cleanup-expired-emails Edge Function
    - Query emails where expires_at < NOW()
    - For each expired email, query and delete attachments from Storage
    - Delete attachment records from database
    - Delete email records from database
    - Log cleanup statistics (emails deleted, attachments deleted, execution time)
    - Return success response with stats
    - _Requirements: 19_
  
  - [ ] 15.2 Setup GitHub Actions cron job
    - Create .github/workflows/cleanup-cron.yml
    - Configure cron schedule (every 5 minutes: */5 * * * *)
    - Add workflow to call Supabase Edge Function
    - Set SUPABASE_SERVICE_ROLE_KEY as GitHub secret
    - Add workflow_dispatch for manual triggering
    - Test cron job execution
    - _Requirements: 19_
  
  - [ ] 15.3 Test cleanup functionality
    - Create test emails with short expiry times
    - Wait for expiry and trigger cleanup
    - Verify emails are deleted from database
    - Verify attachments are deleted from Storage
    - Verify cleanup logs are generated
    - _Requirements: 19_


- [ ] 16. Implement SEO optimization
  - [ ] 16.1 Add meta tags
    - Add title tag with app name and tagline
    - Add meta description tag
    - Add meta keywords tag
    - Add Open Graph tags (og:title, og:description, og:image, og:url)
    - Add Twitter Card tags
    - Add canonical URL
    - _Requirements: 23_
  
  - [ ] 16.2 Implement semantic HTML
    - Use proper heading hierarchy (h1, h2, h3)
    - Use semantic tags (header, main, section, article, footer)
    - Add ARIA labels for accessibility
    - Ensure proper document structure
    - _Requirements: 23_
  
  - [ ] 16.3 Create sitemap.xml
    - Generate sitemap.xml with all public pages
    - Include homepage and custom domain instructions page
    - Add lastmod and priority for each URL
    - Place sitemap.xml in public directory
    - _Requirements: 23_
  
  - [ ] 16.4 Create robots.txt
    - Create robots.txt to allow search engine crawlers
    - Specify sitemap location
    - Disallow crawling of dynamic custom domain pages
    - Place robots.txt in public directory
    - _Requirements: 23_
  
  - [ ] 16.5 Implement structured data
    - Add JSON-LD structured data for WebApplication
    - Include app name, description, URL, and features
    - Validate structured data with Google Rich Results Test
    - _Requirements: 23_

- [ ] 17. Implement performance optimizations
  - [ ] 17.1 Configure code splitting
    - Configure Vite to split code by routes
    - Create manual chunks for vendor libraries (vue, supabase)
    - Lazy load route components
    - _Requirements: 24_
  
  - [ ] 17.2 Optimize assets
    - Compress and optimize images (logo, icons)
    - Use WebP format for images where supported
    - Implement lazy loading for images
    - Minify CSS and JavaScript in production build
    - _Requirements: 24_
  
  - [ ] 17.3 Implement caching strategies
    - Configure service worker for offline support (optional)
    - Set appropriate cache headers for static assets
    - Implement localStorage caching for translations
    - _Requirements: 24_
  
  - [ ] 17.4 Optimize database queries
    - Ensure all queries use indexes
    - Limit query results to necessary data only
    - Use select with specific columns instead of select *
    - Implement pagination for large result sets
    - _Requirements: 24_
  
  - [ ] 17.5 Run performance audits
    - Run Lighthouse audit and aim for score > 90
    - Measure and optimize First Contentful Paint (< 1.5s)
    - Measure and optimize Largest Contentful Paint (< 2.5s)
    - Measure and optimize Time to Interactive
    - Fix any performance issues identified
    - _Requirements: 24_

- [ ] 18. Security hardening
  - [ ] 18.1 Implement Content Security Policy
    - Add CSP meta tag to index.html
    - Configure allowed sources for scripts, styles, images, fonts
    - Allow AdSense and analytics domains
    - Test CSP and fix any violations
    - _Requirements: 25_
  
  - [ ] 18.2 Implement HTML sanitization
    - Install DOMPurify library
    - Create sanitization service
    - Sanitize all email HTML content before rendering
    - Configure allowed tags and attributes
    - Test with malicious HTML samples
    - _Requirements: 25_
  
  - [ ] 18.3 Validate all user inputs
    - Implement validation for username input
    - Implement validation for domain input
    - Sanitize inputs before sending to backend
    - Prevent SQL injection and XSS attacks
    - _Requirements: 25_
  
  - [ ] 18.4 Secure API keys and secrets
    - Ensure no secrets in frontend code
    - Use environment variables for all sensitive data
    - Use service role key only in backend (Email Worker, Edge Functions)
    - Use anon key in frontend
    - _Requirements: 25_
  
  - [ ] 18.5 Implement HTTPS
    - Ensure all connections use HTTPS
    - Configure SSL certificates (automatic with Vercel)
    - Redirect HTTP to HTTPS
    - _Requirements: 25_

- [ ] 19. Testing and quality assurance
  - [ ] 19.1 Manual testing - Email generation flow
    - Test generating email with custom username
    - Test generating random email
    - Test username validation (too short, too long, invalid characters)
    - Test copy to clipboard functionality
    - Test countdown timer accuracy
    - Test session persistence on page refresh
    - _Requirements: 1, 2, 3, 4, 5, 20_
  
  - [ ] 19.2 Manual testing - Email reception and reading
    - Send test email from Gmail to generated address
    - Send test email from Outlook to generated address
    - Send email with HTML content
    - Send email with plain text only
    - Send email with attachments (PDF, image, document)
    - Verify real-time inbox update works
    - Verify toast notification appears
    - Test opening and reading email
    - Test downloading attachments
    - Test marking email as read
    - Test deleting email
    - _Requirements: 6, 7, 8, 9, 10, 11, 12_
  
  - [ ] 19.3 Manual testing - Custom domain
    - Setup test domain with MX record
    - Test domain validation with correct MX record
    - Test domain validation with incorrect MX record
    - Test domain validation with no MX record
    - Generate email with custom domain
    - Send email to custom domain address
    - Verify email is received
    - Test session token privacy (access without token)
    - _Requirements: 31, 32, 33, 34, 35, 36, 37, 38, 39, 40_
  
  - [ ] 19.4 Manual testing - UI/UX features
    - Test dark mode toggle
    - Test language switcher (ID/EN)
    - Test responsive design on mobile (375px, 414px)
    - Test responsive design on tablet (768px, 1024px)
    - Test responsive design on desktop (1920px, 2560px)
    - Verify all Font Awesome icons display correctly
    - Test all loading states
    - Test all empty states
    - Test all error states
    - _Requirements: 14, 15, 16, 22_
  
  - [ ] 19.5 Manual testing - Ads integration
    - Verify header banner ad displays
    - Verify sidebar ads display on desktop
    - Verify in-feed ads display in inbox
    - Verify footer banner ad displays
    - Test ads on mobile (correct sizes)
    - Verify ads don't overlap content
    - Verify ads collapse if they fail to load
    - _Requirements: 17, 18_
  
  - [ ] 19.6 Cross-browser testing
    - Test on Chrome (latest version)
    - Test on Firefox (latest version)
    - Test on Safari (latest version)
    - Test on Edge (latest version)
    - Test on Mobile Safari (iOS)
    - Test on Mobile Chrome (Android)
    - Fix any browser-specific issues
    - _Requirements: All_
  
  - [ ] 19.7 Performance testing
    - Run Lighthouse audit on homepage
    - Run Lighthouse audit on custom domain page
    - Verify page load time < 3 seconds
    - Verify no console errors in production
    - Test with slow 3G network simulation
    - Test real-time connection stability over time
    - _Requirements: 24_

- [ ] 20. Deployment and launch preparation
  - [ ] 20.1 Configure production environment variables
    - Set all VITE_* environment variables in Vercel
    - Set SUPABASE_SERVICE_ROLE_KEY in Cloudflare Worker
    - Set SUPABASE_SERVICE_ROLE_KEY in GitHub Secrets
    - Verify all environment variables are correct
    - _Requirements: All_
  
  - [ ] 20.2 Deploy Supabase database and functions
    - Run all database migrations in production Supabase project
    - Create and configure Storage bucket
    - Deploy cleanup Edge Function
    - Test Edge Function manually
    - Verify RLS policies are enabled
    - _Requirements: 2, 15_
  
  - [ ] 20.3 Deploy Cloudflare Email Worker
    - Deploy Worker to production using Wrangler
    - Set Worker secrets
    - Configure Email Routing for all domains
    - Verify MX records are correctly configured
    - Test email reception in production
    - _Requirements: 3_
  
  - [ ] 20.4 Deploy frontend to Vercel
    - Connect GitHub repository to Vercel
    - Configure build settings (Vite build command)
    - Set environment variables
    - Deploy to production
    - Configure custom domain (indoakurat.com)
    - Verify SSL certificate is active
    - Test deployed application
    - _Requirements: All_
  
  - [ ] 20.5 Setup GitHub Actions cron job
    - Verify cleanup-cron.yml workflow is in repository
    - Verify SUPABASE_SERVICE_ROLE_KEY secret is set
    - Enable workflow in GitHub Actions
    - Test manual workflow dispatch
    - Wait for scheduled run and verify it executes
    - _Requirements: 15_
  
  - [ ] 20.6 Configure DNS and domain settings
    - Point indoakurat.com to Vercel
    - Configure MX records for all email domains
    - Add SPF records for email authentication
    - Verify DNS propagation
    - Test email delivery to all domains
    - _Requirements: 3, 11_
  
  - [ ] 20.7 Final production testing
    - Test complete email flow end-to-end in production
    - Test custom domain flow in production
    - Verify ads display correctly
    - Verify analytics tracking works
    - Test on multiple devices and browsers
    - Monitor error logs for any issues
    - _Requirements: All_

- [ ] 21. Post-launch monitoring and optimization
  - [ ] 21.1 Setup monitoring dashboards
    - Monitor Supabase dashboard (database size, API requests, storage usage)
    - Monitor Cloudflare dashboard (email routing stats, worker invocations)
    - Monitor Vercel dashboard (bandwidth, build status, function invocations)
    - Setup Google Analytics for traffic monitoring
    - Setup Sentry for error tracking (optional)
    - _Requirements: All_
  
  - [ ] 21.2 Monitor and optimize performance
    - Review Lighthouse scores weekly
    - Monitor page load times
    - Optimize slow queries if identified
    - Monitor real-time connection stability
    - _Requirements: 24_
  
  - [ ] 21.3 Monitor email delivery and processing
    - Check Email Worker logs for errors
    - Monitor email processing success rate
    - Verify cleanup cron job runs successfully
    - Monitor database growth and storage usage
    - _Requirements: 3, 15, 19_
  
  - [ ] 21.4 Gather user feedback and iterate
    - Monitor user behavior through analytics
    - Collect feedback through contact form or email
    - Identify pain points and areas for improvement
    - Plan and implement improvements based on feedback
    - _Requirements: All_

---

## Notes

- Tasks marked with sub-tasks should be completed in order, with all sub-tasks finished before marking the parent task complete
- Each task references specific requirements from the requirements document
- Testing should be performed continuously throughout development, not just in Phase 19
- The timeline is estimated at 6-8 weeks assuming full-time development
- Some tasks can be parallelized (e.g., frontend and backend work)
- Custom domain feature (Task 11) can be deprioritized if needed to launch MVP faster
- Google AdSense approval (Task 12.1) may take 1-2 weeks, so apply early in the development process

