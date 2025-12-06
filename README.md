# IndoAkurat - Temporary Email Service

Indonesia's Fast & Accurate Temporary Email for Online Verification

## Features

- 🚀 Fast email generation with custom or random usernames
- 📧 Real-time email reception and notifications
- 🌐 Multiple domain support
- 🎨 Dark mode support
- 🌍 Bilingual (Indonesian & English)
- 📱 Fully responsive design
- 🔒 Privacy-focused (no user accounts required)
- ⚡ Custom domain support with MX record validation

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Backend**: Supabase (Database, Storage, Real-time)
- **Email**: Cloudflare Email Routing + Workers
- **Hosting**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cloudflare account
- Domain with DNS access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/indoakuratmail/indoakuratmail.git
cd indoakuratmail
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=IndoAkurat
VITE_AVAILABLE_DOMAINS=tempmail-id.com,quickmail-id.net
VITE_EMAIL_EXPIRY_MINUTES=30
```

5. Run development server:
```bash
npm run dev
```

### Database Setup

1. Go to Supabase Dashboard
2. Run the SQL migrations from `supabase/migrations/` folder
3. Create storage bucket named `email-attachments`
4. Deploy Edge Functions from `supabase/functions/`

### Cloudflare Email Worker Setup

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Deploy Email Worker:
```bash
cd cloudflare-worker
wrangler deploy
```

3. Configure Email Routing in Cloudflare Dashboard
4. Add MX records to your domains

## Project Structure

```
indoakuratmail/
├── src/                    # Vue 3 frontend source
│   ├── components/         # Vue components
│   ├── views/             # Page views
│   ├── stores/            # Pinia stores
│   ├── services/          # API services
│   ├── composables/       # Vue composables
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── functions/         # Edge Functions
├── cloudflare-worker/     # Email Worker
├── public/                # Public static files
└── .kiro/                 # Kiro specs and config
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint and fix code

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Backend (Supabase)
- Database and storage are automatically managed
- Deploy Edge Functions via Supabase CLI

### Email Worker (Cloudflare)
- Deploy via Wrangler CLI
- Configure Email Routing in dashboard

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## Support

For issues and questions, please open an issue on GitHub.
