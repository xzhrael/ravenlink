"use client";

import React from "react";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presetSwatches?: string[];
}

const DEFAULT_NEUTRAL_SWATCHES = [
  "#FFF8E7", // Latar (Background)
  "#FFDE59", // Utama (Primary Yellow)
  "#FF5CAA", // Sekunder (Pink / Magenta)
  "#3772FF", // Aksen Biru
  "#06D6A0", // Aksen Hijau
  "#0D0D0D", // Teks / Border (Pitch Black)
  "#FFFFFF", // Pure White
  "#FFF2CE", // Soft Warm Yellow
  "#1A1A1A", // Dark Charcoal
  "#E2DFD8", // Muted Sand
];

export function ColorPicker({
  label,
  value,
  onChange,
  presetSwatches = DEFAULT_NEUTRAL_SWATCHES,
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold uppercase tracking-wide">
          {label}
        </label>
        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 brutal-border-sm">
          {value.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Color preview & native input */}
        <div className="relative w-10 h-10 brutal-border-sm overflow-hidden flex-shrink-0 cursor-pointer">
          <input
            type="color"
            value={value.startsWith("#") ? value : "#FFFFFF"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            title="Klik untuk memilih warna"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Manual Hex Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
        />
      </div>

      {/* Preset Swatches */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {presetSwatches.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-6 h-6 border-2 transition-transform hover:scale-110 cursor-pointer ${
              value.toLowerCase() === color.toLowerCase()
                ? "border-black dark:border-white scale-110 shadow-sm ring-2 ring-black dark:ring-white"
                : "border-black/30 dark:border-white/30"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
