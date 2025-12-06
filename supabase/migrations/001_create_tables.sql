-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient VARCHAR(255) NOT NULL,
  sender VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_custom_domain BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indexes for emails table
CREATE INDEX idx_recipient ON emails(recipient);
CREATE INDEX idx_created_at ON emails(created_at);
CREATE INDEX idx_expires_at ON emails(expires_at);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for attachments table
CREATE INDEX idx_email_id ON attachments(email_id);

-- Create custom_domains_usage table
CREATE TABLE IF NOT EXISTS custom_domains_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain VARCHAR(255) NOT NULL UNIQUE,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_emails_received INTEGER NOT NULL DEFAULT 0
);

-- Create index for custom_domains_usage table
CREATE INDEX idx_domain ON custom_domains_usage(domain);

-- Enable Row Level Security
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emails table
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
  FOR UPDATE USING (true);

-- Allow public to delete their own emails
CREATE POLICY "Public delete" ON emails
  FOR DELETE USING (true);

-- RLS Policies for attachments table
CREATE POLICY "Public read access" ON attachments
  FOR SELECT USING (true);

CREATE POLICY "Service role insert only" ON attachments
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
  );

CREATE POLICY "Public delete" ON attachments
  FOR DELETE USING (true);

-- RLS Policies for custom_domains_usage table
CREATE POLICY "Public read access" ON custom_domains_usage
  FOR SELECT USING (true);

CREATE POLICY "Service role write" ON custom_domains_usage
  FOR ALL USING (
    auth.role() = 'service_role'
  );
