/**
 * Script untuk menyiapkan artefak standalone Next.js yang siap di-upload ke cPanel.
 * Menyalin folder public/ dan .next/static ke dalam .next/standalone.
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");
const staticDir = path.join(rootDir, ".next", "static");
const publicDir = path.join(rootDir, "public");
const prismaDir = path.join(rootDir, "prisma");

console.log("=================================================");
console.log(" Menyiapkan artefak standalone untuk cPanel...");
console.log("=================================================");

if (!fs.existsSync(standaloneDir)) {
  console.error("Error: Folder .next/standalone tidak ditemukan. Jalankan 'npm run build' terlebih dahulu.");
  process.exit(1);
}

// 1. Salin .next/static ke .next/standalone/.next/static
const targetStatic = path.join(standaloneDir, ".next", "static");
console.log(`> Menyalin .next/static -> ${targetStatic}`);
if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, targetStatic, { recursive: true, force: true });
}

// 2. Salin public/ ke .next/standalone/public
const targetPublic = path.join(standaloneDir, "public");
console.log(`> Menyalin public/ -> ${targetPublic}`);
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, targetPublic, { recursive: true, force: true });
}

// 3. Salin prisma/ ke .next/standalone/prisma
const targetPrisma = path.join(standaloneDir, "prisma");
console.log(`> Menyalin prisma/ -> ${targetPrisma}`);
if (fs.existsSync(prismaDir)) {
  fs.cpSync(prismaDir, targetPrisma, { recursive: true, force: true });
}

// 4. Salin .env.example sebagai referensi
const targetEnvExample = path.join(standaloneDir, ".env.example");
fs.copyFileSync(path.join(rootDir, ".env.example"), targetEnvExample);

// 5. Buat direktori bundel cpanel-bundle
const deployBundleDir = path.join(rootDir, "cpanel-bundle");
console.log(`> Menyiapkan folder siap upload di: ${deployBundleDir}`);
if (fs.existsSync(deployBundleDir)) {
  fs.rmSync(deployBundleDir, { recursive: true, force: true });
}
fs.cpSync(standaloneDir, deployBundleDir, { recursive: true, force: true });

console.log("\n✔ Berhasil! Seluruh file di folder 'cpanel-bundle/' siap di-upload ke cPanel!");
console.log("Struktur folder cpanel-bundle/:");
console.log("├── .next/");
console.log("│   ├── server/");
console.log("│   └── static/    <-- Aset CSS/JS hasil compile");
console.log("├── node_modules/  <-- Modul minimal production");
console.log("├── public/        <-- Aset publik gambar/favicon");
console.log("├── prisma/        <-- Skema database MySQL");
console.log("├── server.js      <-- Startup File untuk Setup Node.js App di cPanel");
console.log("└── package.json");
console.log("=================================================");
