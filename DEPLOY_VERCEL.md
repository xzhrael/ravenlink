# 🚀 Panduan Lengkap Deploy Ravenlink: Vercel + TiDB Serverless + Cloudflare

Dokumen ini adalah panduan langkah demi langkah untuk men-deploy **Ravenlink** ke arsitektur *cloud* modern yang **100% GRATIS**, memiliki **performa global kelas dunia (<1 detik)**, dan **kebal terhadap serangan bot/DDoS**.

---

## 🏛️ Arsitektur Sistem (Stack 100% Gratis)

```text
[ Pengunjung / Bot ]
        │
        ▼
┌────────────────────────────────────────────────────────┐
│ 🛡️ CLOUDFLARE (Free Plan)                              │
│ • Filter Serangan DDoS & Bot Fight Mode                │
│ • DNS Global Ultra Cepat & SSL/TLS Otomatis            │
│ • Caching Konten Statis (Hemat Bandwidth Vercel)       │
└───────────────────────┬────────────────────────────────┘
                        │ (Trafik Bersih & Aman)
                        ▼
┌────────────────────────────────────────────────────────┐
│ ⚡ VERCEL (Hobby Plan - Free)                           │
│ • Host Frontend & Backend API Next.js 16 (App Router)  │
│ • Global Edge Network (Zero Cold Start / Tanpa Sleep)  │
│ • Sistem Hard Cap ($0 Tagihan Siluman)                 │
└───────────────────────┬────────────────────────────────┘
                        │ (Koneksi Database SSL)
                        ▼
┌────────────────────────────────────────────────────────┐
│ 🗄️ TiDB SERVERLESS (Free Forever - PingCAP)            │
│ • Basis Data MySQL Cloud (Kapasitas 5 GB Gratis)       │
│ • Aktif 24/7 (Tanpa Sleep / Tanpa Pause)               │
│ • Latensi Sangat Cepat (Region Singapore / Tokyo)      │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Daftar Akun yang Dibutuhkan (Semua Gratis Tanpa Kartu Kredit)

1. Akun **[GitHub](https://github.com/)** (untuk menyimpan repositori kode).
2. Akun **[TiDB Cloud](https://tidbcloud.com/)** (untuk database MySQL gratis 5 GB).
3. Akun **[Vercel](https://vercel.com/)** (untuk server aplikasi Next.js gratis).
4. Akun **[Cloudflare](https://www.cloudflare.com/)** (opsional tapi sangat disarankan jika punya domain sendiri untuk perlindungan anti-DDoS).
5. Akun **[Google Cloud Console](https://console.cloud.google.com/)** (untuk fitur login Google).

---

## 🛠️ Langkah Demi Langkah (Step-by-Step)

---

### LANGKAH 1: Buat Database MySQL Gratis di TiDB Serverless

1. Buka **[TiDB Cloud](https://tidbcloud.com/)** dan daftar menggunakan akun Google atau GitHub Anda.
2. Pada halaman pemilihan cluster, pilih opsi **Serverless (Free)**.
3. Beri nama cluster, misalnya: `ravenlink-db`.
4. Pilih **Region** yang paling dekat dengan Indonesia untuk kecepatan akses maksimal:
   * **AWS / Singapore (ap-southeast-1)** *(Paling Direkomendasikan)*
5. Klik **Create**. Tunggu beberapa detik hingga database selesai dibuat.
6. Klik tombol **Connect**:
   * Pilih koneksi menggunakan **Prisma** atau **General**.
   * Buat password database (simpan password ini baik-baik).
   * Salin string koneksi **DATABASE_URL** yang dihasilkan. Formatnya akan seperti:
     ```text
     mysql://[USER]:[PASSWORD]@gateway01.[REGION].prod.aws.tidbcloud.com:4000/[DATABASE_NAME]?sslaccept=strict
     ```

---

### LANGKAH 2: Hubungkan Prisma ke TiDB & Sinkronisasi Tabel

1. Buka file [`prisma/schema.prisma`](prisma/schema.prisma) di proyek Anda.
2. Ubah baris `provider = "sqlite"` menjadi `provider = "mysql"`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Buka file `.env` di lokal Anda, masukkan URL dari TiDB Langkah 1:
   ```env
   DATABASE_URL="mysql://username:password@gateway01.region.prod.aws.tidbcloud.com:4000/ravenlink-db?sslaccept=strict"
   ```
4. Jalankan perintah migrasi skema di terminal komputer Anda:
   ```bash
   npx prisma db push
   ```
   *Sistem akan otomatis membuat seluruh tabel (`User`, `Link`, `Account`, `Session`, `ClickAnalytics`) di database cloud TiDB.*

---

### LANGKAH 3: Push Kode ke GitHub

1. Pastikan Anda sudah membuat repositori baru di GitHub (bisa *Private* atau *Public*).
2. Di terminal lokal, lakukan commit dan push:
   ```bash
   git add .
   git commit -m "feat: setup for vercel deployment"
   git push origin main
   ```

---

### LANGKAH 4: Deploy Proyek ke Vercel (Hobby Free)

1. Buka **[Vercel Dashboard](https://vercel.com/dashboard)** dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** > **Project**.
3. Cari repositori **Ravenlink** Anda dari daftar GitHub, lalu klik **Import**.
4. Pada bagian **Configure Project**:
   * **Framework Preset**: Biarkan otomatis `Next.js`.
   * **Root Directory**: `./` (default).
   * **Build Command**: Biarkan `next build` (default).
5. Buka tab **Environment Variables**, lalu tambahkan variabel-variabel penting berikut:

| Nama Variabel | Nilai / Deskripsi | Contoh |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL koneksi TiDB dari Langkah 1 | `mysql://user:pass@host:4000/db?sslaccept=strict` |
| `AUTH_SECRET` | Kunci acak minimal 32 karakter | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Kunci acak (sama dengan `AUTH_SECRET`) | `(sama dengan AUTH_SECRET)` |
| `NEXTAUTH_URL` | Domain web Anda (gunakan HTTPS) | `https://ravenlink.vercel.app` atau `https://domainanda.com` |
| `NEXT_PUBLIC_APP_URL` | Domain web Anda | `https://ravenlink.vercel.app` atau `https://domainanda.com` |
| `AUTH_GOOGLE_ID` | Client ID dari Google Cloud Console | `123456-xxx.apps.googleusercontent.com` |
| `AUTH_GOOGLE_SECRET`| Client Secret dari Google Cloud | `GOCSPX-xxxxxxx` |
| `SUPER_ADMIN_EMAIL` | Email Anda untuk hak Super Admin | `emailanda@gmail.com` |
| `NODE_ENV` | Mode lingkungan | `production` |

6. Klik tombol **Deploy**.
7. Tunggu proses build 1–2 menit hingga muncul kembang api tanda deploy berhasil! Anda akan langsung mendapatkan subdomain gratis seperti `https://ravenlink-xxx.vercel.app`.

---

### LANGKAH 5: Setup Cloudflare (Perisai Anti-DDoS & Custom Domain)

Jika Anda memiliki domain pribadi (misal: `domainanda.com` atau `link.domainanda.com`), hubungkan melalui Cloudflare untuk proteksi maksimal:

1. **Tambahkan Domain ke Cloudflare**:
   * Masuk ke **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
   * Klik **Add a site**, masukkan domain Anda, lalu pilih paket **Free ($0)**.
   * Ganti *Nameserver* domain Anda di registrar (tempat beli domain) sesuai alamat *Nameserver* yang diberikan Cloudflare.
2. **Atur DNS Record ke Vercel**:
   * Buka menu **DNS > Records** di Cloudflare.
   * Tambahkan CNAME Record:
     * **Type**: `CNAME`
     * **Name**: `@` (untuk domain utama) atau `link` (untuk subdomain).
     * **Target**: `cname.vercel-dns.com`
     * **Proxy status**: Pastikan **Proxied (Awan Oranye)** AKTIF.
3. **Atur Mode SSL/TLS di Cloudflare**:
   * Buka menu **SSL/TLS > Overview**.
   * Pilih mode **Full (strict)**.
   * *(Penting: Jangan gunakan mode 'Flexible' agar tidak terjadi redirect loop).*
4. **Aktifkan Fitur Keamanan Anti-Bot & Serangan**:
   * Buka menu **Security > Bots**.
   * Aktifkan tombol **Bot Fight Mode** *(Gratis - Otomatis memblokir bot liar, scraper, dan serangan DDoS sebelum sempat menyentuh Vercel)*.
5. **Tambahkan Domain di Dashboard Vercel**:
   * Buka proyek Anda di Vercel > **Settings > Domains**.
   * Masukkan domain Anda (misal: `domainanda.com` atau `link.domainanda.com`).
   * Vercel akan otomatis mendeteksi koneksi Cloudflare dan statusnya akan menjadi centang hijau (*Valid Configuration*).

---

### LANGKAH 6: Sesuaikan Google Cloud OAuth untuk Domain Baru

1. Buka **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)**.
2. Klik kredensial **OAuth 2.0 Client IDs** milik Ravenlink.
3. Perbarui daftar URL berikut:
   * **Authorized JavaScript origins**:
     ```text
     https://ravenlink-xxx.vercel.app
     https://domainanda.com
     ```
   * **Authorized redirect URIs**:
     ```text
     https://ravenlink-xxx.vercel.app/api/auth/callback/google
     https://domainanda.com/api/auth/callback/google
     ```
4. Klik **Save**.

---

## 🛡️ Jaminan Keamanan Biaya ($0 Bebas Tagihan)

Mengapa kombinasi ini dijamin **aman 100% dari tagihan tiba-tiba**?

1. **Vercel Hobby**:
   * Tidak memiliki input kartu kredit.
   * Menggunakan aturan **Hard Cap**: jika kuota gratis bulanan terlampaui karena lonjakan trafik luar biasa, layanan hanya akan dihentikan sementara (*pause*). Tidak ada tagihan uang.
2. **Cloudflare Free**:
   * Memfilter 70% hingga 90% trafik sampah/bot jahat di *Edge*, sehingga trafik yang masuk ke Vercel hanyalah pengunjung manusia asli. Kuota Vercel Anda menjadi sangat hemat.
3. **TiDB Serverless**:
   * Kuota gratis 5 GB berlaku permanen dan tidak memerlukan kartu kredit di awal pembuatan cluster.
