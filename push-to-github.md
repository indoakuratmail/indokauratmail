# Cara Push ke GitHub

## Setelah mendapat Personal Access Token dari GitHub:

1. Jalankan command ini (ganti YOUR_TOKEN dengan token Anda):

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/indoakuratmail/indoakuratmail.git
git push -u origin main
```

## Atau gunakan GitHub CLI (gh):

```bash
# Install GitHub CLI dari: https://cli.github.com/
gh auth login
git push -u origin main
```

## Atau gunakan SSH:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "dev@indoakurat.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add ke GitHub: https://github.com/settings/keys
# Kemudian:
git remote set-url origin git@github.com:indoakuratmail/indoakuratmail.git
git push -u origin main
```

## Troubleshooting:

Jika repository tidak ditemukan, pastikan:
1. Repository sudah dibuat di GitHub
2. Username/organization name benar: `indoakuratmail`
3. Repository name benar: `indoakuratmail`
4. Anda punya akses ke repository tersebut
