"use client";

import React, { useState, useMemo } from "react";

export interface IconItem {
  name: string;
  label: string;
  category: "social" | "media" | "commerce" | "work" | "contact" | "general";
}

export const MATERIAL_ICONS: IconItem[] = [
  // Social & Web
  { name: "link", label: "Link / URL", category: "social" },
  { name: "language", label: "Website / Web", category: "social" },
  { name: "share", label: "Bagikan / Share", category: "social" },
  { name: "alternate_email", label: "Mention / Handle", category: "social" },
  { name: "mail", label: "Email", category: "social" },
  { name: "chat", label: "Pesan / Chat", category: "social" },
  { name: "forum", label: "Forum / Komunitas", category: "social" },
  { name: "send", label: "Telegram / Kirim", category: "social" },
  { name: "rss_feed", label: "Feed / Blog", category: "social" },
  { name: "public", label: "Publik / Global", category: "social" },

  // Media & Content
  { name: "smart_display", label: "YouTube / Video", category: "media" },
  { name: "play_circle", label: "Play / Putar", category: "media" },
  { name: "music_note", label: "Musik / Spotify", category: "media" },
  { name: "headphones", label: "Podcast / Audio", category: "media" },
  { name: "photo_camera", label: "Instagram / Foto", category: "media" },
  { name: "mic", label: "Podcast / Mic", category: "media" },
  { name: "videocam", label: "Video Call / TikTok", category: "media" },
  { name: "movie", label: "Film / Bioskop", category: "media" },
  { name: "image", label: "Galeri Gambar", category: "media" },
  { name: "album", label: "Album Musik", category: "media" },

  // Commerce & Products
  { name: "shopping_bag", label: "Toko / Belanja", category: "commerce" },
  { name: "shopping_cart", label: "Keranjang Belanja", category: "commerce" },
  { name: "storefront", label: "Etalase Toko", category: "commerce" },
  { name: "payments", label: "Pembayaran / Donasi", category: "commerce" },
  { name: "sell", label: "Promo / Diskon", category: "commerce" },
  { name: "credit_card", label: "Kartu / Checkout", category: "commerce" },
  { name: "receipt_long", label: "Katalog / Menu", category: "commerce" },
  { name: "local_mall", label: "Mall / Retail", category: "commerce" },
  { name: "attach_money", label: "Investasi / Finansial", category: "commerce" },
  { name: "currency_exchange", label: "Kripto / Kurs", category: "commerce" },

  // Work & Portfolio
  { name: "work", label: "Portofolio / Karir", category: "work" },
  { name: "business_center", label: "Bisnis / Proyek", category: "work" },
  { name: "palette", label: "Desain / Kreatif", category: "work" },
  { name: "code", label: "GitHub / Developer", category: "work" },
  { name: "terminal", label: "CLI / Software", category: "work" },
  { name: "draw", label: "Ilustrasi / Seni", category: "work" },
  { name: "folder", label: "Dokumen / Arsip", category: "work" },
  { name: "feed", label: "Artikel / Medium", category: "work" },
  { name: "description", label: "Resume / CV", category: "work" },
  { name: "school", label: "Edukasi / Kursus", category: "work" },

  // Contact & Personal
  { name: "person", label: "Profil Pribadi", category: "contact" },
  { name: "badge", label: "Kartu Nama", category: "contact" },
  { name: "call", label: "Telepon / WhatsApp", category: "contact" },
  { name: "location_on", label: "Lokasi / Alamat", category: "contact" },
  { name: "map", label: "Google Maps", category: "contact" },
  { name: "favorite", label: "Wishlist / Favorit", category: "contact" },
  { name: "star", label: "Review / Bintang", category: "contact" },
  { name: "handshake", label: "Kerjasama / Partnership", category: "contact" },

  // General & Utility
  { name: "download", label: "Unduh File / Download", category: "general" },
  { name: "bolt", label: "Flash Sale / Penting", category: "general" },
  { name: "help", label: "Bantuan / FAQ", category: "general" },
  { name: "info", label: "Informasi Penting", category: "general" },
  { name: "qr_code", label: "Scan QR Code", category: "general" },
  { name: "smartphone", label: "Aplikasi Mobile", category: "general" },
  { name: "campaign", label: "Pengumuman", category: "general" },
  { name: "event", label: "Tiket Event / Jadwal", category: "general" },
];

interface MaterialIconPickerProps {
  value?: string | null;
  onChange: (iconName: string) => void;
}

export function MaterialIconPicker({
  value,
  onChange,
}: MaterialIconPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filteredIcons = useMemo(() => {
    return MATERIAL_ICONS.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.label.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        selectedCat === "all" || item.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [search, selectedCat]);

  return (
    <div className="space-y-3">
      {/* Current Selection & Clear */}
      <div className="flex items-center justify-between p-2.5 bg-[#F4F0EA] dark:bg-[#252422] brutal-border-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400">
            Icon Terpilih:
          </span>
          {value ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white dark:bg-[#1C1B1A] border-2 border-black dark:border-white text-xs font-mono font-bold">
              <span className="material-symbols-outlined text-base">
                {value}
              </span>
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-xs font-mono italic text-neutral-500">
              (Belum ada icon terpilih)
            </span>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-mono font-bold text-rose-600 hover:underline cursor-pointer"
          >
            Hapus Icon
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-2.5 top-2.5 material-symbols-outlined text-lg text-neutral-500">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari icon (cth: video, toko, chat, musik, code)..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1 text-[10px] font-mono font-bold uppercase">
          {[
            { id: "all", label: "Semua" },
            { id: "social", label: "Sosial" },
            { id: "media", label: "Media" },
            { id: "commerce", label: "Toko" },
            { id: "work", label: "Karya" },
            { id: "contact", label: "Kontak" },
            { id: "general", label: "Umum" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`px-2 py-0.5 brutal-border-sm cursor-pointer ${
                selectedCat === cat.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-[#252422] hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Icons */}
      <div className="max-h-48 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2 p-1 border-2 border-dashed border-neutral-300 dark:border-neutral-700">
        {filteredIcons.map((item) => {
          const isSelected = value === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onChange(item.name)}
              title={item.label}
              className={`p-2 flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_#000]"
                  : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1C1B1A] hover:border-black dark:hover:border-white"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {item.name}
              </span>
              <span className="text-[9px] font-mono truncate max-w-full text-center">
                {item.name}
              </span>
            </button>
          );
        })}

        {filteredIcons.length === 0 && (
          <div className="col-span-full py-6 text-center text-xs font-mono text-neutral-500">
            Tidak ada icon yang cocok dengan &quot;{search}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
