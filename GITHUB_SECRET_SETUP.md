# Setup GitHub Secret untuk Workflow

## ✅ Workflow sudah terupload ke GitHub!

Sekarang tinggal setup secret agar workflow bisa jalan:

## Langkah-langkah:

1. **Buka halaman Secrets:**
   https://github.com/indoakuratmail/indokauratmail/settings/secrets/actions

2. **Click "New repository secret"**

3. **Isi form:**
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6a2ppenpqYnZnbXdkdWlpcXlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAwNTU3NCwiZXhwIjoyMDgwNTgxNTc0fQ.IMhylNBQSsz1wGipgsXPLKTU7Tv8ct2vChUsRT4pZ0k`

4. **Click "Add secret"**

## Verifikasi Workflow:

Setelah secret ditambahkan:

1. Buka: https://github.com/indoakuratmail/indokauratmail/actions
2. Anda akan lihat workflow "Cleanup Expired Emails"
3. Workflow akan otomatis run setiap 5 menit
4. Atau bisa manual trigger dengan click "Run workflow"

## Status:

✅ Git repository initialized
✅ Project structure created
✅ All files pushed to GitHub
✅ GitHub Actions workflow uploaded
⏳ GitHub Secret (waiting for manual setup)

Setelah secret ditambahkan, Task 1 akan 100% complete!
