# GitHub Workflow Setup

## Status
⚠️ Workflow file (`.github/workflows/cleanup-cron.yml`) belum di-push ke GitHub karena Personal Access Token tidak punya scope `workflow`.

## Cara Menambahkan Workflow:

### Opsi 1: Buat Token Baru dengan Workflow Scope
1. Buka: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Pilih scope:
   - ✅ `repo` (full control)
   - ✅ `workflow` (update GitHub Action workflows)
4. Generate dan copy token
5. Update remote URL:
   ```bash
   git remote set-url origin https://NEW_TOKEN@github.com/indoakuratmail/indokauratmail.git
   git add .github/workflows/cleanup-cron.yml
   git commit -m "Add GitHub Actions workflow for cleanup cron job"
   git push
   ```

### Opsi 2: Upload Manual via GitHub Web
1. Buka: https://github.com/indoakuratmail/indokauratmail
2. Click "Add file" → "Create new file"
3. Nama file: `.github/workflows/cleanup-cron.yml`
4. Copy paste isi dari file lokal `.github/workflows/cleanup-cron.yml`
5. Commit

### Opsi 3: Gunakan GitHub CLI
```bash
gh auth login
git push
```

## Setelah Workflow Terupload:

Jangan lupa setup GitHub Secret:
1. Go to: https://github.com/indoakuratmail/indokauratmail/settings/secrets/actions
2. Click "New repository secret"
3. Name: `SUPABASE_SERVICE_ROLE_KEY`
4. Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a2ppenpqYnZnbXdkdWlpcXlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNTU3NCwiZXhwIjoyMDgwNTgxNTc0fQ.IMhylNBQSsz1wGipgsXPLKTU7Tv8ct2vChUsRT4pZ0k`
5. Click "Add secret"

Workflow akan otomatis run setiap 5 menit untuk cleanup expired emails.
