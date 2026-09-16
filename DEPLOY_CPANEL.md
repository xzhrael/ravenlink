# 🚀 Panduan Lengkap Deploy Ravenlink ke cPanel (AnymHost.id / LiteSpeed)

Dokumen ini memandu Anda melakukan proses *deployment* website bio-link **Ravenlink** dari komputer lokal hingga berjalan *live* dan stabil di layanan *shared hosting* cPanel yang didukung oleh LiteSpeed Web Server (seperti **AnymHost.id**).

---

## 📋 Prasyarat Sebelum Memulai

1. Akun cPanel aktif dengan fitur **Setup Node.js App** (Node.js Selector).
2. Domain atau Subdomain yang sudah terpasang sertifikat **SSL (HTTPS)** aktif (AutoSSL / Let's Encrypt).
   > ⚠️ **PENTING**: Google OAuth **WAJIB** menggunakan protokol `https://`. Pengujian login Google pada domain tanpa SSL akan ditolak oleh sistem keamanan Google Cloud.
3. Kredensial OAuth 2.0 dari [Google Cloud Console](https://console.cloud.google.com/).

---

## 📁 Struktur Berkas Hasil Pengemasan (*Deployment Artifact*)

Proyek Ravenlink menggunakan mode `output: 'standalone'` Next.js. Semua berkas yang dibutuhkan untuk cPanel telah dikemas otomatis ke dalam direktori `cpanel-bundle/` (atau `.next/standalone`):

```text
Application Root (di cPanel)
├── .next/
│   ├── server/           <-- Kompilasi logika App Router & API Handlers
│   └── static/           <-- Berkas CSS, font, & JavaScript client
├── node_modules/         <-- Modul runtime terisolasi
├── public/               <-- Berkas aset gambar, favicon, dan media
├── prisma/
│   └── schema.prisma     <-- Skema database MySQL
├── server.js             <-- STARTUP FILE (Entry point Node.js)
├── package.json
└── .env                  <-- Environment variables (berisi kredensial rahasia)
```

---

## 🛠️ Langkah Demi Langkah (Step-by-Step)

### LANGKAH 1: Build & Otomasi Pengemasan di Lokal

Jalankan perintah pengemasan khusus cPanel di terminal komputer lokal Anda:

```bash
# 1. Pastikan dependensi terpasang lengkap
npm install

# 2. Build proyek dan siapkan paket cPanel
npm run build:cpanel
```

*Perintah ini secara otomatis:*
- Menjalankan `next build` dengan mode standalone.
- Menyalin aset penting (`.next/static`, `public/`, dan `prisma/`) ke dalam folder `cpanel-bundle/`.
- Menyiapkan `server.js` sebagai berkas *startup*.

---

### LANGKAH 2: Buat Database MySQL & User di cPanel

1. Buka akun **cPanel** Anda.
2. Cari dan klik menu **MySQL® Databases** (atau **MySQL Database Wizard**).
3. **Buat Database Baru**, contoh: `cpaneluser_ravenlink`.
4. **Buat Pengguna MySQL Baru**, contoh: `cpaneluser_dbuser` dengan password kuat (catat password ini).
5. **Tambahkan Pengguna ke Database** dan centang **ALL PRIVILEGES** (Semua Hak Akses), lalu klik *Make Changes*.
6. Buka komputer lokal Anda, sesuaikan koneksi database di file `.env` lokal:
   ```env
   DATABASE_URL="mysql://cpaneluser_dbuser:PasswordKuatAnda@IP_HOST_ATAU_DOMAIN:3306/cpaneluser_ravenlink"
   ```
7. Jalankan sinkronisasi tabel database ke cPanel dari komputer lokal Anda:
   ```bash
   npx prisma db push
   ```
   *(Semua tabel `User`, `Account`, `Session`, `Link`, dan `ClickAnalytics` akan langsung dibuat di MySQL cPanel tanpa perlu ketik SQL manual).*

> 💡 *Catatan:* Jika MySQL hosting melarang akses remote (*Remote MySQL*), Anda bisa mengekspor skema via phpMyAdmin atau menjalankan `npx prisma db push` langsung melalui terminal cPanel (SSH).

---

### LANGKAH 3: Upload Berkas ke cPanel

1. Di komputer lokal, kompres seluruh isi folder **`cpanel-bundle`** menjadi satu file ZIP, misalnya `ravenlink-deploy.zip`.
2. Di cPanel, buka **File Manager**.
3. Buat folder baru di luar `public_html` untuk menjaga keamanan file aplikasi, misalnya:
   `/home/username/ravenlink-app/`
4. Upload file `ravenlink-deploy.zip` ke dalam folder `/home/username/ravenlink-app/`.
5. Klik kanan file ZIP tersebut lalu pilih **Extract** (Ekstrak di tempat).

---

### LANGKAH 4: Konfigurasi "Setup Node.js App" di cPanel

1. Kembali ke Beranda cPanel, klik menu **Setup Node.js App** (di bagian *Software*).
2. Klik tombol **Create Application**.
3. Isi parameter konfigurasi berikut:
   - **Node.js version**: Pilih versi **20.x**, **22.x**, atau yang paling mendekati versi lingkungan kerja.
   - **Application mode**: Pilih **Production**.
   - **Application root**: Masukkan path folder upload Anda, contoh: `ravenlink-app` (sesuai folder di Langkah 3).
   - **Application URL**: Pilih domain atau subdomain Anda (contoh: `link.domainanda.com` atau `domainanda.com`).
   - **Application startup file**: Masukkan: **`server.js`**
4. Pada bagian **Environment variables**, klik **Add Variable** dan masukkan variabel-variabel berikut:
   - `DATABASE_URL`: `mysql://cpaneluser_dbuser:PasswordAnda@localhost:3306/cpaneluser_ravenlink`
   - `AUTH_SECRET`: `(string acak 32 karakter rahasia)`
   - `NEXTAUTH_SECRET`: `(string acak 32 karakter rahasia, sama dengan AUTH_SECRET)`
   - `NEXTAUTH_URL`: `https://link.domainanda.com` *(WAJIB pakai HTTPS)*
   - `NEXT_PUBLIC_APP_URL`: `https://link.domainanda.com`
   - `AUTH_GOOGLE_ID`: `(Google Client ID dari Google Cloud Console)`
   - `AUTH_GOOGLE_SECRET`: `(Google Client Secret dari Google Cloud Console)`
   - `NODE_ENV`: `production`
   - `PORT`: `3000` *(atau biarkan Passenger cPanel mengaturnya secara dinamis)*
5. Klik tombol **Create** di kanan atas.

---

### LANGKAH 5: Jalankan NPM Install & Start Aplikasi

1. Setelah aplikasi terbuat, klik tombol **Run NPM Install** (jika tombol tersedia).
2. Jika paket dependensi sudah lengkap dari zip `cpanel-bundle`, cukup klik tombol **Restart** atau **Start App**.
3. Status aplikasi di cPanel akan berubah menjadi warna hijau: **App is running**.

---

### LANGKAH 6: Pengaturan Domain / Subdomain

1. Pastikan subdomain atau domain yang dipilih pada *Application URL* telah memiliki DNS A-Record yang mengarah ke IP server hosting AnymHost Anda.
2. Jika menggunakan subdomain terpisah (contoh: `link.domainanda.com`), pastikan Document Root di cPanel Subdomains otomatis terkelola oleh Node.js Passenger.

---

### LANGKAH 7: Konfigurasi Google Cloud Console OAuth 2.0

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Pilih project Anda atau buat project baru.
3. Buka menu **APIs & Services > Credentials**.
4. Edit kredensial **OAuth 2.0 Client IDs** jenis *Web application*.
5. Tambahkan pada **Authorized JavaScript origins**:
   ```text
   https://domainanda.com
   https://link.domainanda.com
   ```
6. Tambahkan pada **Authorized redirect URIs**:
   ```text
   https://domainanda.com/api/auth/callback/google
   https://link.domainanda.com/api/auth/callback/google
   ```
7. Klik **Save**. Perubahan biasanya aktif dalam beberapa menit.

---

## 🧪 Verifikasi & Pengujian Setelah Deploy

1. Akses `https://domainanda.com/` melalui browser:
   - Halaman beranda Neo-Brutalism harus tampil sempurna dengan font dan icon Material Symbols.
2. Klik **Masuk Akun**:
   - Klik **Masuk via Google** dan lakukan otorisasi akun Google Anda.
   - Pastikan Anda diarahkan ke `/onboarding` atau langsung ke `/dashboard`.
3. Di Dashboard:
   - Coba buat link baru di tab **Daftar Link**.
   - Buka menu **Builder** dan coba drag & drop link dari kiri ke slot puzzle kanan.
   - Klik tombol **Simpan Urutan**.
   - Buka menu **Tema** dan ubah warna palet netral brutalist.
4. Akses halaman publik Anda di `https://domainanda.com/[username]`:
   - Pastikan link-link aktif tampil dengan susunan yang sesuai.
   - Klik salah satu link dan pastikan diarahkan ke URL tujuan via shortlink `/r/[id]`.
   - Cek kembali di dashboard bahwa counter klik link tersebut bertambah secara *real-time*.

---

## 🔧 Panduan Troubleshooting Masalah Umum

- **Error: 500 Internal Server Error saat dibuka pertama kali**:
  - Periksa file `error_log` atau log di cPanel Node.js App. Sering kali disebabkan oleh salah penulisan `DATABASE_URL` atau database belum di-push tabelnya.
- **Gambar profil Google tidak muncul**:
  - Pastikan domain `lh3.googleusercontent.com` terdaftar di `next.config.ts` (sudah dikonfigurasi default dengan `remotePatterns: [{ hostname: "**" }]`).
- **Google OAuth Error: redirect_uri_mismatch**:
  - Pastikan URL di Google Cloud Console persis sama dengan `https://domainanda.com/api/auth/callback/google` (perhatikan trailing slash dan protokol `https`).
