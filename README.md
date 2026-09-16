# ⚡ RAVENLINK - Neo-Brutalist Bio-Link Platform

> Platform bio-link *full-stack* modern berkinerja tinggi yang dibangun dengan gaya desain **Neo-Brutalism Netral**, dilengkapi sistem otentikasi Google OAuth, **Content Puzzle Builder** drag-and-drop 2-kolom, kustomisasi tema live, pelacak analitik klik, dan arsitektur *standalone* siap deploy di shared hosting cPanel + LiteSpeed (AnymHost.id).

---

## 🛠️ Tech Stack & Arsitektur

- **Framework**: Next.js (App Router) — Build Mode `output: "standalone"`
- **Database**: MySQL / MariaDB (Native cPanel compatible)
- **ORM**: Prisma ORM (Client singleton + automated migration scripts)
- **Autentikasi**: Auth.js / NextAuth (Google OAuth 2.0 Provider + Demo Provider untuk evaluasi cepat)
- **Drag & Drop Engine**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (bebas dari deprecated react-beautiful-dnd)
- **Styling & Desain**: Neo-Brutalism Netral (Palet krem `#FDFBF7`, warm sand `#F4F0EA`, hitam `#121212`, aksen bumi/mustard `#8A865D` & `#C2A649`, border tebal 3-4px solid, bayangan *hard-edge* tanpa blur, dan efek fisik *tactile press*)
- **Icon**: Google Material Symbols Outlined (*searchable catalog*)
- **Multi-Bahasa**: Sistem i18n instan (Bahasa Indonesia `ID` & English `EN`)
- **Mode Gelap/Terang**: Dark mode & Light mode dengan deteksi *system preference* dan persistensi `localStorage`.

---

## 🌟 Fitur Utama

### 1. Autentikasi & URL Publik Unik
- Login / Register 1-klik menggunakan akun **Google (OAuth2)**.
- Opsi **Uji Coba Cepat (Demo)** lokal tanpa perlu konfigurasi Google Cloud Console terlebih dahulu.
- Alamat bio publik personal: `domainanda.com/[username]`.
- Alur *Onboarding* klaim username dengan pengecekan ketersediaan unik *real-time* dan proteksi kata kunci sistem yang dicadangkan.

### 2. Neo-Brutalist Theme Studio
- Kustomisasi warna background halaman, kartu/tombol, warna teks tombol, dan warna aksen secara bebas via color picker.
- 5 preset tema terkurasi: *Warm Paper & Olive*, *Vintage Sand & Mustard*, *Mono Classic Brutal*, *Dark Obsidian & Gold*, *Concrete & Clay*.
- Pilihan tipografi: **Space Grotesk** (Sans) dan **JetBrains Mono** (Code).
- Gaya bayangan kartu: *Hard Shadow (4px)*, *Outline Only*, atau *Solid Flat*.
- **Live Mobile Simulator Preview**: Tinjau hasil perubahan tema secara instan di simulator smartphone sisi kanan.

### 3. CRUD Link Lengkap & Manajemen Konten
- **Judul Link** (wajib).
- **URL Tujuan** (wajib, validasi format URL).
- **Pemilih Icon Material Symbols** (*searchable* dengan filter kategori: Sosial, Media, Toko, Karya, Kontak, Umum).
- **Deskripsi / Subtitle** singkat (opsional).
- **Thumbnail / Gambar Kustom** (opsional, fallback ke icon jika kosong).
- **Toggle Aktif/Nonaktif** (tampil atau sembunyikan dari halaman publik).
- **Jadwal Tayang Otomatis** (*Start Date* & *End Date* datetime picker).
- **Kategori Link** (`SOCIAL`, `PRODUCT`, `CUSTOM`, `CONTACT`).
- **Counter Klik Real-Time**: Otomatis bertambah saat link dibuka melalui shortlink `/r/[id]`.

### 4. Drag & Drop Content Puzzle Builder
- **Layout 2-Kolom**:
  - **KIRI (Bank Konten)**: Seluruh kartu link milik user yang belum terpasang/nonaktif.
  - **KANAN (Puzzle Slots Vertikal)**: Slot kotak-kotak terurut dengan penomoran `#1`, `#2`, `#3` menyerupai kepingan puzzle yang menentukan urutan tampil di halaman publik.
- Drag dari bank kiri ke slot kanan: Otomatis mengaktifkan link (`isActive: true`).
- Drag antar slot: Mengubah prioritas urutan tampil dengan animasi halus.
- Drag keluar dari slot / klik "Keluarkan": Otomatis menonaktifkan link kembali ke bank kiri.
- **Real-Time Live Mini Preview** di sisi samping yang merender hasil bio link secara live saat drag berlangsung.

---

## 🚀 Panduan Menjalankan di Lokal (Development)

### 1. Kloning dan Instalasi Dependensi
```bash
git clone <repository-url>
cd Ravenlink
npm install
```

### 2. Siapkan File Environment
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Sesuaikan variabel `DATABASE_URL` ke database MySQL lokal Anda:
```env
DATABASE_URL="mysql://root:password@localhost:3306/ravenlink_db"
AUTH_SECRET="kunci-rahasia-minimal-32-karakter-acak"
NEXTAUTH_SECRET="kunci-rahasia-minimal-32-karakter-acak"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Sinkronisasi Database MySQL
Jalankan perintah Prisma untuk membuat tabel secara otomatis:
```bash
npm run db:push
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000`.

> 💡 *Uji Coba Cepat Tanpa Akun Google:* Klik tombol **Masuk Akun > Uji Coba Cepat (Demo)** di halaman login untuk langsung masuk dan mengeksplorasi seluruh fitur builder dan tema!

---

## 📦 Panduan Pengemasan & Deploy ke cPanel (AnymHost.id)

Proyek ini telah dilengkapi skrip otomasi pengemasan untuk hosting cPanel:

```bash
npm run build:cpanel
```

Perintah ini akan menghasilkan folder **`cpanel-bundle/`** yang berisi:
- `server.js` (Startup file untuk cPanel Setup Node.js App)
- `.next/` (berisi server bundles dan `static/` assets)
- `public/` (berkas gambar publik)
- `prisma/` (skema database)
- `package.json` dan `node_modules/` (runtime production)

👉 **Panduan deploy langkah demi langkah ke cPanel tersedia lengkap di [DEPLOY_CPANEL.md](DEPLOY_CPANEL.md)**.
