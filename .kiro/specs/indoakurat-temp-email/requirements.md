# Requirements Document - IndoAkurat

## Introduction

IndoAkurat adalah aplikasi web temporary email yang memungkinkan pengguna untuk membuat alamat email sementara dengan cepat untuk keperluan verifikasi online. Aplikasi ini menggunakan multiple domain milik sendiri, memberikan pengalaman real-time untuk menerima email, dan dimonetisasi melalui Google AdSense. Sistem dibangun dengan arsitektur modern menggunakan Vue 3 untuk frontend, Supabase sebagai backend database dan real-time engine, serta Cloudflare Email Workers untuk menangani incoming emails.

**Tagline:** Indonesia's Fast & Accurate Temporary Email for Online Verification

**Target Users:** 
- Pengguna internet Indonesia yang membutuhkan email temporary untuk registrasi website
- Pengguna yang ingin melindungi privasi email utama mereka
- Pengguna yang membutuhkan email sekali pakai untuk verifikasi

**Business Goals:**
- Menyediakan layanan temporary email yang cepat dan reliable
- Monetisasi melalui Google AdSense dengan user experience yang tetap baik
- Menjangkau user Indonesia dan internasional melalui multi-language support

## Glossary

- **System**: IndoAkurat Web Application
- **User**: Pengunjung website yang menggunakan layanan temporary email
- **Temporary Email**: Alamat email sementara yang dibuat oleh User dan akan expired setelah waktu tertentu
- **Inbox**: Daftar email yang diterima oleh Temporary Email
- **Email Worker**: Cloudflare Worker yang menangani incoming email
- **Real-time Update**: Pembaruan data secara otomatis tanpa refresh halaman
- **Session**: Periode aktif dari sebuah Temporary Email
- **Supabase**: Backend-as-a-Service platform yang menyediakan database, storage, dan real-time capabilities
- **AdSense**: Platform monetisasi iklan dari Google
- **Expired Email**: Email yang sudah melewati batas waktu aktif dan akan dihapus
- **Attachment**: File yang dilampirkan dalam email
- **Domain Pool**: Kumpulan domain yang tersedia untuk membuat temporary email
- **Dark Mode**: Tema tampilan gelap untuk mengurangi kelelahan mata
- **Sanitization**: Proses membersihkan HTML content untuk mencegah XSS attacks

## Requirements

### Requirement 1: Email Address Generation

**User Story:** Sebagai User, saya ingin dapat membuat alamat email temporary dengan username pilihan saya dan memilih dari domain yang tersedia, sehingga saya dapat menggunakan email tersebut untuk verifikasi online.

#### Acceptance Criteria

1. WHEN User mengakses halaman utama, THE System SHALL menampilkan form untuk membuat email address dengan input field untuk username dan dropdown selector untuk domain
2. WHEN User memasukkan username, THE System SHALL memvalidasi bahwa username hanya mengandung karakter alphanumeric, dash, underscore, dan dot dengan panjang minimal 3 karakter dan maksimal 30 karakter
3. WHEN User memilih domain dari dropdown, THE System SHALL menampilkan preview email address lengkap dalam format username@domain
4. WHEN User menekan tombol generate, THE System SHALL membuat session baru dengan email address tersebut dan menyimpannya di localStorage
5. WHEN email address berhasil dibuat, THE System SHALL menampilkan email address aktif dengan tombol copy dan countdown timer untuk expiry

### Requirement 2: Random Email Generation

**User Story:** Sebagai User, saya ingin dapat membuat email address random secara otomatis, sehingga saya tidak perlu memikirkan username sendiri.

#### Acceptance Criteria

1. WHEN User menekan tombol "Random", THE System SHALL generate username random yang terdiri dari 8-12 karakter alphanumeric
2. WHEN username random di-generate, THE System SHALL secara otomatis memilih domain secara random dari domain pool
3. WHEN random email berhasil dibuat, THE System SHALL menampilkan email address tersebut dan membuat session baru
4. THE System SHALL memastikan bahwa random username yang di-generate adalah unique dan belum digunakan dalam session aktif

### Requirement 3: Email Address Validation

**User Story:** Sebagai User, saya ingin mendapat feedback langsung jika username yang saya masukkan tidak valid, sehingga saya dapat memperbaikinya sebelum generate email.

#### Acceptance Criteria

1. WHILE User mengetik username, THE System SHALL menampilkan validasi real-time dengan indikator visual (checkmark atau error icon)
2. IF username mengandung karakter yang tidak diperbolehkan, THEN THE System SHALL menampilkan pesan error yang spesifik menjelaskan karakter apa yang tidak valid
3. IF username kurang dari 3 karakter, THEN THE System SHALL menampilkan pesan "Username minimal 3 karakter"
4. IF username lebih dari 30 karakter, THEN THE System SHALL menampilkan pesan "Username maksimal 30 karakter"
5. WHEN username valid, THE System SHALL menampilkan indikator success dan mengaktifkan tombol generate

### Requirement 4: Copy Email Address

**User Story:** Sebagai User, saya ingin dapat menyalin email address ke clipboard dengan satu klik, sehingga saya dapat dengan mudah paste ke form registrasi website lain.

#### Acceptance Criteria

1. WHEN User menekan tombol copy, THE System SHALL menyalin email address lengkap ke clipboard
2. WHEN copy berhasil, THE System SHALL menampilkan toast notification "Email copied!" dengan icon checkmark selama 2 detik
3. WHEN copy berhasil, THE System SHALL mengubah icon tombol copy menjadi checkmark selama 2 detik kemudian kembali ke icon copy
4. IF copy gagal karena browser tidak support clipboard API, THEN THE System SHALL menampilkan fallback dengan select text otomatis

### Requirement 5: Email Expiry Timer

**User Story:** Sebagai User, saya ingin melihat berapa lama lagi email saya akan expired, sehingga saya tahu kapan harus membuat email baru.

#### Acceptance Criteria

1. WHEN email address dibuat, THE System SHALL menampilkan countdown timer dalam format MM:SS yang menunjukkan sisa waktu sebelum expired
2. WHILE timer berjalan, THE System SHALL update countdown setiap detik
3. WHEN timer mencapai 5 menit tersisa, THE System SHALL mengubah warna timer menjadi orange sebagai warning
4. WHEN timer mencapai 1 menit tersisa, THE System SHALL mengubah warna timer menjadi merah dan menampilkan notifikasi warning
5. WHEN timer mencapai 00:00, THE System SHALL menampilkan pesan "Email expired" dan menyembunyikan email address aktif

### Requirement 6: Inbox Display

**User Story:** Sebagai User, saya ingin melihat daftar email yang masuk ke temporary email saya secara real-time, sehingga saya dapat segera membaca email verifikasi yang saya tunggu.

#### Acceptance Criteria

1. WHEN email address aktif, THE System SHALL menampilkan inbox section dengan header "Inbox" dan counter jumlah email
2. WHEN email baru masuk, THE System SHALL secara otomatis menambahkan email tersebut ke list inbox tanpa refresh halaman
3. WHEN email baru masuk, THE System SHALL menampilkan toast notification dengan subject email dan play sound notification (optional)
4. THE System SHALL menampilkan setiap email item dengan informasi sender email, subject, dan timestamp relative (contoh: "2 mins ago")
5. WHEN inbox kosong, THE System SHALL menampilkan empty state dengan icon inbox dan text "No emails yet - Waiting for incoming messages"

### Requirement 7: Real-time Email Updates

**User Story:** Sebagai User, saya ingin inbox saya update secara otomatis saat ada email baru masuk, sehingga saya tidak perlu refresh halaman berkali-kali.

#### Acceptance Criteria

1. WHEN User membuat email address, THE System SHALL subscribe ke Supabase real-time channel untuk recipient email tersebut
2. WHEN email baru di-insert ke database oleh Email Worker, THE System SHALL menerima event real-time dan update inbox list
3. WHEN koneksi real-time terputus, THE System SHALL mencoba reconnect secara otomatis setiap 5 detik
4. WHEN koneksi real-time berhasil reconnect, THE System SHALL fetch ulang inbox untuk memastikan tidak ada email yang terlewat
5. THE System SHALL menampilkan indikator status koneksi (connected/disconnected) di header inbox

### Requirement 8: Manual Inbox Refresh

**User Story:** Sebagai User, saya ingin dapat refresh inbox secara manual, sehingga saya dapat memastikan tidak ada email yang terlewat jika koneksi real-time bermasalah.

#### Acceptance Criteria

1. THE System SHALL menampilkan tombol refresh dengan icon rotate di header inbox
2. WHEN User menekan tombol refresh, THE System SHALL fetch ulang semua email dari database untuk recipient tersebut
3. WHILE refresh sedang berjalan, THE System SHALL menampilkan loading spinner pada tombol refresh dan disable tombol tersebut
4. WHEN refresh selesai, THE System SHALL update inbox list dengan data terbaru dan menampilkan toast "Inbox refreshed"
5. THE System SHALL implement rate limiting untuk refresh maksimal 1 kali per 3 detik untuk mencegah spam

### Requirement 9: Email Reading

**User Story:** Sebagai User, saya ingin dapat membuka dan membaca email lengkap dengan format yang rapi, sehingga saya dapat melihat isi email verifikasi dengan jelas.

#### Acceptance Criteria

1. WHEN User mengklik email item di inbox, THE System SHALL menampilkan detail email dalam view terpisah atau modal
2. THE System SHALL menampilkan email header lengkap dengan informasi From, To, Subject, dan Date dalam format yang mudah dibaca
3. THE System SHALL render HTML email body dengan styling yang aman (sanitized untuk mencegah XSS)
4. IF email memiliki plain text body dan tidak ada HTML body, THEN THE System SHALL menampilkan plain text dengan formatting yang preserved (line breaks, spacing)
5. WHEN email detail dibuka, THE System SHALL mark email tersebut sebagai read dan update status di database

### Requirement 10: Email Attachment Handling

**User Story:** Sebagai User, saya ingin dapat melihat dan download attachment yang ada di email, sehingga saya dapat mengakses file yang dikirim melalui email temporary.

#### Acceptance Criteria

1. WHEN email memiliki attachment, THE System SHALL menampilkan section "Attachments" dengan list semua file
2. THE System SHALL menampilkan setiap attachment dengan icon sesuai file type, filename, dan file size
3. WHEN User mengklik attachment, THE System SHALL download file tersebut dari Supabase Storage
4. THE System SHALL menampilkan icon yang berbeda untuk file type yang berbeda (PDF, image, document, zip, dll)
5. IF attachment adalah image, THEN THE System SHALL menampilkan thumbnail preview di attachment list

### Requirement 11: Email Deletion

**User Story:** Sebagai User, saya ingin dapat menghapus email yang sudah tidak saya perlukan, sehingga inbox saya tetap bersih dan hanya berisi email yang relevan.

#### Acceptance Criteria

1. WHEN User membuka email detail, THE System SHALL menampilkan tombol "Delete" dengan icon trash
2. WHEN User menekan tombol delete, THE System SHALL menampilkan confirmation dialog "Are you sure you want to delete this email?"
3. WHEN User confirm delete, THE System SHALL menghapus email dari database dan kembali ke inbox list
4. WHEN email dihapus, THE System SHALL juga menghapus semua attachment terkait dari Supabase Storage
5. WHEN delete berhasil, THE System SHALL menampilkan toast notification "Email deleted" dan update counter inbox

### Requirement 12: Unread Email Indicator

**User Story:** Sebagai User, saya ingin dapat membedakan email yang sudah dibaca dan belum dibaca, sehingga saya tahu email mana yang perlu saya buka.

#### Acceptance Criteria

1. THE System SHALL menampilkan email yang belum dibaca dengan background color yang berbeda atau bold text
2. THE System SHALL menampilkan badge atau dot indicator pada email yang belum dibaca
3. WHEN User membuka email, THE System SHALL update status is_read menjadi true di database
4. WHEN status is_read berubah, THE System SHALL update tampilan email item di inbox untuk menghilangkan unread indicator
5. THE System SHALL menampilkan counter "Unread (X)" di header inbox jika ada email yang belum dibaca

### Requirement 13: Multiple Domain Support

**User Story:** Sebagai User, saya ingin dapat memilih dari beberapa domain yang tersedia, sehingga saya memiliki opsi jika satu domain di-block oleh website tertentu.

#### Acceptance Criteria

1. THE System SHALL menyediakan minimal 2 domain dalam domain pool untuk dipilih User
2. THE System SHALL menampilkan domain selector dalam bentuk dropdown dengan list semua available domains
3. WHEN User membuka dropdown, THE System SHALL menampilkan semua domain dengan format yang jelas (contoh: @tempmail-id.com)
4. THE System SHALL menyimpan list available domains di environment variable untuk mudah di-update
5. WHEN domain baru ditambahkan ke environment variable, THE System SHALL secara otomatis menampilkan domain tersebut di dropdown tanpa perlu code change

### Requirement 14: Responsive Design

**User Story:** Sebagai User, saya ingin dapat menggunakan IndoAkurat di berbagai device (desktop, tablet, mobile), sehingga saya dapat akses temporary email dari device apapun.

#### Acceptance Criteria

1. THE System SHALL menampilkan layout yang optimal untuk screen size desktop (>1024px) dengan sidebar untuk ads
2. THE System SHALL menampilkan layout yang optimal untuk screen size tablet (768px-1024px) dengan ads di top dan bottom
3. THE System SHALL menampilkan layout yang optimal untuk screen size mobile (<768px) dengan single column layout
4. WHEN di mobile, THE System SHALL menyembunyikan sidebar ads dan hanya menampilkan ads di strategic positions
5. THE System SHALL memastikan semua interactive elements (buttons, inputs) memiliki minimum touch target size 44x44px untuk mobile

### Requirement 15: Dark Mode

**User Story:** Sebagai User, saya ingin dapat mengaktifkan dark mode, sehingga saya dapat menggunakan aplikasi dengan nyaman di malam hari atau di lingkungan gelap.

#### Acceptance Criteria

1. THE System SHALL menampilkan toggle button untuk dark mode di header dengan icon moon/sun
2. WHEN User mengaktifkan dark mode, THE System SHALL mengubah semua color scheme menjadi dark theme dengan contrast yang baik
3. WHEN dark mode diaktifkan, THE System SHALL menyimpan preference di localStorage
4. WHEN User kembali ke website, THE System SHALL load dark mode preference dari localStorage dan apply theme tersebut
5. THE System SHALL implement smooth transition animation (200-300ms) saat switch antara light dan dark mode

### Requirement 16: Multi-language Support

**User Story:** Sebagai User, saya ingin dapat mengubah bahasa interface antara Indonesia dan English, sehingga saya dapat menggunakan aplikasi dalam bahasa yang saya pahami.

#### Acceptance Criteria

1. THE System SHALL menampilkan language switcher di header dengan flag icon atau text "ID/EN"
2. WHEN User memilih bahasa, THE System SHALL mengubah semua text di interface ke bahasa yang dipilih
3. THE System SHALL menyimpan language preference di localStorage
4. WHEN User kembali ke website, THE System SHALL load language preference dan apply bahasa tersebut
5. THE System SHALL menerjemahkan semua UI text, error messages, notifications, dan static content ke bahasa Indonesia dan English

### Requirement 17: Google AdSense Integration

**User Story:** Sebagai Website Owner, saya ingin mengintegrasikan Google AdSense untuk monetisasi, sehingga website dapat menghasilkan revenue dari traffic.

#### Acceptance Criteria

1. THE System SHALL menampilkan ad banner di header section dengan size 728x90 untuk desktop atau 320x50 untuk mobile
2. THE System SHALL menampilkan ad unit di sidebar dengan size 300x250 atau 300x600 yang sticky saat scroll (desktop only)
3. THE System SHALL menampilkan in-feed ads di antara email items di inbox setiap 5 email
4. THE System SHALL menampilkan ad banner di footer section dengan size 728x90 untuk desktop atau 320x50 untuk mobile
5. THE System SHALL implement lazy loading untuk ads agar tidak memperlambat initial page load

### Requirement 18: Ad Placement Balance

**User Story:** Sebagai User, saya ingin ads tidak mengganggu penggunaan aplikasi, sehingga saya tetap dapat menggunakan fitur utama dengan nyaman.

#### Acceptance Criteria

1. THE System SHALL memastikan ads tidak menutupi atau overlap dengan functional elements (buttons, inputs, email content)
2. THE System SHALL memastikan ads tidak muncul saat User sedang membaca email detail
3. THE System SHALL implement minimum spacing 20px antara ads dan content
4. THE System SHALL memastikan total ads tidak lebih dari 30% dari viewport height
5. WHEN ads gagal load, THE System SHALL collapse ad container agar tidak ada empty space yang besar

### Requirement 19: Email Expiry and Auto-cleanup

**User Story:** Sebagai System Administrator, saya ingin email yang sudah expired otomatis dihapus dari database, sehingga storage tidak penuh dan performa tetap optimal.

#### Acceptance Criteria

1. WHEN email dibuat, THE System SHALL set expires_at timestamp menjadi 30 menit dari created_at
2. THE System SHALL menjalankan cleanup function setiap 5 menit untuk check expired emails
3. WHEN cleanup function berjalan, THE System SHALL query semua email WHERE expires_at kurang dari current timestamp
4. WHEN expired email ditemukan, THE System SHALL delete email record dari database dan semua attachment terkait dari Storage
5. THE System SHALL log jumlah email yang di-cleanup untuk monitoring purposes

### Requirement 20: Session Management

**User Story:** Sebagai User, saya ingin session email saya tersimpan saat saya refresh halaman, sehingga saya tidak perlu generate email baru setiap kali refresh.

#### Acceptance Criteria

1. WHEN User generate email, THE System SHALL menyimpan email address dan expires_at timestamp di localStorage
2. WHEN User refresh halaman, THE System SHALL check localStorage untuk active session
3. IF active session ditemukan dan belum expired, THEN THE System SHALL restore email address dan continue countdown timer
4. IF active session ditemukan tapi sudah expired, THEN THE System SHALL clear localStorage dan menampilkan form generate email baru
5. WHEN User generate email baru, THE System SHALL replace session lama dengan session baru di localStorage

### Requirement 21: Error Handling

**User Story:** Sebagai User, saya ingin mendapat informasi yang jelas jika terjadi error, sehingga saya tahu apa yang salah dan apa yang harus saya lakukan.

#### Acceptance Criteria

1. WHEN terjadi network error, THE System SHALL menampilkan toast notification dengan pesan "Connection error. Please check your internet."
2. WHEN Supabase API error, THE System SHALL menampilkan pesan error yang user-friendly tanpa expose technical details
3. WHEN real-time connection gagal, THE System SHALL menampilkan warning banner "Real-time updates disabled. Click refresh to check new emails."
4. WHEN email generation gagal, THE System SHALL menampilkan error message yang spesifik (contoh: "Username already taken" atau "Invalid format")
5. THE System SHALL log semua errors ke console untuk debugging purposes tanpa menampilkan technical details ke User

### Requirement 22: Loading States

**User Story:** Sebagai User, saya ingin melihat loading indicator saat aplikasi sedang memproses sesuatu, sehingga saya tahu aplikasi sedang bekerja dan tidak hang.

#### Acceptance Criteria

1. WHEN User generate email, THE System SHALL menampilkan loading spinner pada tombol generate dan disable tombol tersebut
2. WHEN inbox sedang fetch data, THE System SHALL menampilkan skeleton loading untuk email items
3. WHEN email detail sedang load, THE System SHALL menampilkan skeleton loading untuk email content
4. WHEN attachment sedang di-download, THE System SHALL menampilkan progress indicator atau loading spinner
5. THE System SHALL memastikan semua loading states memiliki timeout maksimal 10 detik, setelah itu menampilkan error message

### Requirement 23: SEO Optimization

**User Story:** Sebagai Website Owner, saya ingin website mudah ditemukan di search engine, sehingga dapat menarik organic traffic.

#### Acceptance Criteria

1. THE System SHALL include meta tags yang proper (title, description, keywords, og:tags) di HTML head
2. THE System SHALL implement semantic HTML dengan proper heading hierarchy (h1, h2, h3)
3. THE System SHALL generate sitemap.xml yang list semua public pages
4. THE System SHALL include robots.txt yang allow search engine crawlers
5. THE System SHALL implement structured data (JSON-LD) untuk WebApplication schema

### Requirement 24: Performance Optimization

**User Story:** Sebagai User, saya ingin website load dengan cepat, sehingga saya dapat segera menggunakan layanan tanpa menunggu lama.

#### Acceptance Criteria

1. THE System SHALL achieve First Contentful Paint (FCP) kurang dari 1.5 detik
2. THE System SHALL achieve Largest Contentful Paint (LCP) kurang dari 2.5 detik
3. THE System SHALL implement code splitting untuk load hanya code yang diperlukan per page
4. THE System SHALL implement lazy loading untuk images dan ads
5. THE System SHALL minify dan compress semua CSS dan JavaScript assets

### Requirement 25: Security

**User Story:** Sebagai User, saya ingin data saya aman dan tidak ada security vulnerability, sehingga saya dapat menggunakan layanan dengan tenang.

#### Acceptance Criteria

1. THE System SHALL sanitize semua HTML email content menggunakan DOMPurify untuk prevent XSS attacks
2. THE System SHALL implement Content Security Policy (CSP) headers untuk prevent injection attacks
3. THE System SHALL validate dan sanitize semua user input di frontend sebelum send ke backend
4. THE System SHALL use HTTPS untuk semua connections
5. THE System SHALL tidak expose sensitive credentials (API keys, service role keys) di frontend code

### Requirement 26: Cloudflare Email Worker Processing

**User Story:** Sebagai System, saya ingin dapat menerima dan memproses incoming email secara reliable, sehingga semua email yang dikirim ke domain temporary dapat masuk ke inbox User.

#### Acceptance Criteria

1. WHEN email masuk ke domain yang di-handle Cloudflare, THE Email Worker SHALL catch email tersebut via email routing
2. THE Email Worker SHALL parse email headers untuk extract sender email address, recipient email address, dan subject
3. THE Email Worker SHALL parse email body untuk extract HTML content dan plain text content
4. THE Email Worker SHALL extract semua attachments dari email dan convert ke binary data
5. WHEN parsing selesai, THE Email Worker SHALL proceed ke storage dan database insertion

### Requirement 27: Attachment Storage

**User Story:** Sebagai System, saya ingin menyimpan email attachments dengan aman dan efficient, sehingga User dapat download attachment kapanpun selama email belum expired.

#### Acceptance Criteria

1. WHEN Email Worker menemukan attachment, THE Email Worker SHALL upload file ke Supabase Storage bucket "email-attachments"
2. THE Email Worker SHALL generate unique filename menggunakan format: {email_id}/{original_filename}
3. THE Email Worker SHALL store file metadata (filename, size, mime_type, url) ke attachments table di database
4. THE Email Worker SHALL set file permission menjadi public untuk allow direct download
5. WHEN email di-delete, THE System SHALL delete semua attachment files dari Storage bucket

### Requirement 28: Database Insertion

**User Story:** Sebagai System, saya ingin menyimpan email data ke database dengan struktur yang proper, sehingga frontend dapat query dan display email dengan efficient.

#### Acceptance Criteria

1. WHEN Email Worker selesai parse email, THE Email Worker SHALL insert record baru ke emails table dengan semua field yang diperlukan
2. THE Email Worker SHALL set expires_at timestamp menjadi 30 menit dari current time
3. THE Email Worker SHALL set is_read menjadi false untuk email baru
4. IF attachment ada, THEN THE Email Worker SHALL insert records ke attachments table dengan reference ke email_id
5. WHEN database insertion berhasil, THE Email Worker SHALL return success response dan Supabase real-time akan trigger update ke frontend

### Requirement 29: Email Worker Error Handling

**User Story:** Sebagai System Administrator, saya ingin Email Worker dapat handle errors dengan graceful, sehingga satu email yang error tidak mempengaruhi processing email lainnya.

#### Acceptance Criteria

1. WHEN Email Worker gagal parse email, THE Email Worker SHALL log error details dan return error response tanpa crash
2. WHEN upload attachment gagal, THE Email Worker SHALL continue process email tanpa attachment dan log warning
3. WHEN database insertion gagal, THE Email Worker SHALL retry maksimal 3 kali dengan exponential backoff
4. IF semua retry gagal, THEN THE Email Worker SHALL log error dan send alert notification
5. THE Email Worker SHALL implement timeout 30 detik untuk prevent hanging pada email yang sangat besar

### Requirement 30: Toast Notifications

**User Story:** Sebagai User, saya ingin mendapat feedback visual untuk setiap action yang saya lakukan, sehingga saya tahu action tersebut berhasil atau gagal.

#### Acceptance Criteria

1. WHEN User berhasil copy email, THE System SHALL menampilkan toast "Email copied!" dengan icon checkmark selama 2 detik
2. WHEN email baru masuk, THE System SHALL menampilkan toast dengan subject email dan sender selama 4 detik
3. WHEN User delete email, THE System SHALL menampilkan toast "Email deleted" dengan icon trash selama 2 detik
4. WHEN error terjadi, THE System SHALL menampilkan toast dengan error message dan icon error selama 5 detik
5. THE System SHALL position toast di top-right corner dan stack multiple toasts jika ada lebih dari satu

### Requirement 31: Custom Domain Support - Self Service

**User Story:** Sebagai User yang memiliki domain sendiri, saya ingin dapat menggunakan domain saya untuk membuat temporary email, sehingga saya dapat menggunakan email dengan branding domain saya sendiri.

#### Acceptance Criteria

1. THE System SHALL menampilkan section "Use Your Own Domain" di landing page dengan instructions untuk setup MX record
2. THE System SHALL menyediakan clear instructions yang menjelaskan cara add MX record dengan value mail.indoakurat.com dengan priority 10
3. THE System SHALL menyediakan input field untuk User memasukkan custom domain name mereka
4. WHEN User input custom domain dan klik "Go", THE System SHALL redirect ke URL path dengan format indoakurat.com/customdomain.com
5. THE System SHALL support URL routing dengan pattern /:customDomain untuk handle custom domain pages

### Requirement 32: Custom Domain Validation

**User Story:** Sebagai User dengan custom domain, saya ingin system memvalidasi bahwa domain saya sudah setup dengan benar, sehingga saya tahu email akan bisa masuk.

#### Acceptance Criteria

1. WHEN User mengakses URL dengan custom domain (contoh: indoakurat.com/mydomain.com), THE System SHALL extract domain name dari URL path
2. THE System SHALL validate format domain menggunakan regex untuk memastikan format valid
3. THE System SHALL perform DNS MX record lookup untuk check apakah domain memiliki MX record yang pointing ke mail.indoakurat.com atau indoakurat.com
4. IF MX record valid, THEN THE System SHALL menampilkan email generator interface untuk custom domain tersebut
5. IF MX record tidak valid atau tidak ditemukan, THEN THE System SHALL menampilkan error message dengan instructions untuk setup MX record

### Requirement 33: Custom Domain Email Generation

**User Story:** Sebagai User dengan custom domain yang sudah terverifikasi, saya ingin dapat generate email dengan domain saya sendiri, sehingga saya dapat menggunakan email temporary dengan branding saya.

#### Acceptance Criteria

1. WHEN User berada di custom domain page, THE System SHALL menampilkan email generator dengan domain field yang sudah pre-filled dengan custom domain mereka
2. THE System SHALL allow User untuk input username dan generate email dengan format username@customdomain.com
3. THE System SHALL validate bahwa username mengikuti rules yang sama dengan email generation normal
4. WHEN email berhasil di-generate, THE System SHALL create session dengan custom domain flag dan menyimpan di localStorage
5. THE System SHALL menampilkan active email address dengan custom domain dan semua features yang sama (copy, timer, inbox)

### Requirement 34: Custom Domain Inbox Isolation

**User Story:** Sebagai User dengan custom domain, saya ingin inbox saya private dan hanya bisa diakses oleh saya, sehingga orang lain tidak dapat melihat email yang masuk ke domain saya.

#### Acceptance Criteria

1. WHEN User pertama kali generate email dengan custom domain, THE System SHALL generate unique session token
2. THE System SHALL append session token ke URL dengan format indoakurat.com/customdomain.com?session=TOKEN
3. THE System SHALL menyimpan session token di localStorage untuk persistence
4. WHEN User atau orang lain mencoba akses custom domain page tanpa valid session token, THE System SHALL menampilkan landing page untuk generate email baru instead of showing existing inbox
5. THE System SHALL validate session token setiap kali fetch inbox untuk memastikan hanya pemilik session yang dapat melihat emails

### Requirement 35: Custom Domain Instructions Page

**User Story:** Sebagai User yang ingin setup custom domain, saya ingin melihat instructions yang jelas dan mudah diikuti, sehingga saya dapat setup MX record dengan benar tanpa technical knowledge yang mendalam.

#### Acceptance Criteria

1. THE System SHALL menyediakan dedicated page atau modal dengan title "How to Use Your Own Domain"
2. THE System SHALL menampilkan step-by-step instructions dengan numbering yang jelas
3. THE System SHALL include visual examples atau screenshots untuk setiap step
4. THE System SHALL provide copyable values untuk MX record configuration (Name: @, Type: MX, Priority: 10, Value: mail.indoakurat.com.)
5. THE System SHALL include troubleshooting section dengan common issues dan solutions

### Requirement 36: Custom Domain Manual Setup Support

**User Story:** Sebagai User yang kesulitan setup MX record sendiri, saya ingin dapat request bantuan admin untuk setup domain saya, sehingga saya tetap dapat menggunakan custom domain feature.

#### Acceptance Criteria

1. THE System SHALL menampilkan alternative method "Need Help? We Can Set It Up For You" di instructions page
2. THE System SHALL provide email template atau form untuk User mengirim request ke admin
3. THE System SHALL list informasi yang dibutuhkan: domain registrar name, username, password, dan domain name
4. THE System SHALL include disclaimer tentang security dan bahwa User harus trust admin dengan credentials mereka
5. THE System SHALL provide estimated time untuk manual setup (contoh: "Usually completed within 24 hours")

### Requirement 37: Custom Domain Email Worker Handling

**User Story:** Sebagai System, saya ingin dapat menerima email dari any domain yang sudah setup MX record ke IndoAkurat, sehingga custom domain feature dapat berfungsi dengan baik.

#### Acceptance Criteria

1. THE Email Worker SHALL accept incoming email dari any domain tanpa restriction
2. THE Email Worker SHALL extract full recipient email address including domain
3. THE Email Worker SHALL store recipient dengan full domain information di database
4. THE Email Worker SHALL process custom domain emails dengan logic yang sama seperti default domain emails
5. THE Email Worker SHALL set flag is_custom_domain menjadi true untuk emails yang berasal dari domain selain domain pool IndoAkurat

### Requirement 38: Custom Domain Analytics Tracking

**User Story:** Sebagai Website Owner, saya ingin dapat track berapa banyak custom domain yang digunakan dan activity mereka, sehingga saya dapat understand adoption dari feature ini.

#### Acceptance Criteria

1. WHEN custom domain pertama kali diakses dan terverifikasi, THE System SHALL create record di custom_domains_usage table
2. THE System SHALL track first_seen timestamp saat domain pertama kali digunakan
3. THE System SHALL update last_used timestamp setiap kali ada activity di custom domain
4. THE System SHALL increment total_emails_received counter setiap kali email masuk ke custom domain
5. THE System SHALL provide admin dashboard atau query untuk view statistics tentang custom domain usage

### Requirement 39: Custom Domain Error Handling

**User Story:** Sebagai User dengan custom domain, saya ingin mendapat error message yang helpful jika ada masalah dengan domain setup saya, sehingga saya tahu apa yang harus diperbaiki.

#### Acceptance Criteria

1. IF MX record tidak ditemukan, THEN THE System SHALL menampilkan error "MX record not found. Please add MX record and wait for DNS propagation (up to 24 hours)"
2. IF MX record pointing ke server yang salah, THEN THE System SHALL menampilkan error "MX record found but pointing to wrong server. Please update to: mail.indoakurat.com"
3. IF domain format invalid, THEN THE System SHALL menampilkan error "Invalid domain format. Please enter a valid domain name (example: mydomain.com)"
4. IF DNS lookup timeout, THEN THE System SHALL menampilkan error "Unable to verify domain. Please try again later or check your DNS settings"
5. THE System SHALL provide "Retry Verification" button untuk User mencoba validate domain lagi setelah fix issues

### Requirement 40: Custom Domain Session Persistence

**User Story:** Sebagai User dengan custom domain, saya ingin session saya tersimpan saat refresh halaman, sehingga saya tidak perlu generate email baru setiap kali refresh.

#### Acceptance Criteria

1. WHEN User generate email dengan custom domain, THE System SHALL menyimpan custom domain name, email address, session token, dan expires_at di localStorage
2. WHEN User refresh halaman custom domain, THE System SHALL check localStorage untuk active custom domain session
3. IF valid session ditemukan dan belum expired, THEN THE System SHALL restore email address, inbox, dan continue countdown timer
4. IF session expired, THEN THE System SHALL clear localStorage dan menampilkan form untuk generate email baru
5. THE System SHALL maintain session token di URL untuk allow sharing atau bookmarking dengan proper access control

