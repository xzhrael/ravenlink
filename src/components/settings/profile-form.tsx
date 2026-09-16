"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfileAction, updateUsernameAction, checkUsernameAction } from "@/app/actions/user";
import { sanitizeUsername } from "@/lib/username";
import { useI18n } from "@/lib/i18n/context";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    username: string | null;
    bio: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { t } = useI18n();
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [image, setImage] = useState(user.image || "");
  const [username, setUsername] = useState(user.username || "");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Format file tidak didukung. Harap pilih gambar (JPG, PNG, atau WebP).");
      return;
    }

    setIsProcessingImage(true);
    setImageError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetSize = 320;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setImageError("Gagal memproses gambar.");
          setIsProcessingImage(false);
          return;
        }

        // Center crop to 1:1 square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

        // Export as lightweight WebP data URL
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.85);
        setImage(compressedDataUrl);
        setIsProcessingImage(false);
      };

      img.onerror = () => {
        setImageError("File gambar tidak dapat dibaca.");
        setIsProcessingImage(false);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setImageError("Gagal membaca file gambar.");
      setIsProcessingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (val: string) => {
    const clean = sanitizeUsername(val);
    setUsername(clean);

    if (clean === user.username) {
      setUsernameError(null);
      return;
    }

    if (clean.length < 3) {
      setUsernameError(t.settings.minCharError);
      return;
    }

    setIsCheckingUsername(true);
    const res = await checkUsernameAction(clean);
    setIsCheckingUsername(false);

    if (!res.available) {
      setUsernameError(res.error || "Username tidak tersedia.");
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError || isSaving) return;

    setIsSaving(true);
    setSaveMessage(null);

    // 1. Update Profile info
    const profileRes = await updateUserProfileAction({ name, bio, image });

    // 2. If username changed, update username
    let usernameRes = { success: true, error: "" };
    if (username !== user.username) {
      const uRes = await updateUsernameAction(username);
      if (!uRes.success) {
        usernameRes = { success: false, error: uRes.error || "Gagal memperbarui username." };
      }
    }

    setIsSaving(false);

    if (!profileRes.success || !usernameRes.success) {
      setSaveMessage(`Error: ${profileRes.error || usernameRes.error}`);
    } else {
      // Sinkronkan cookie sesi NextAuth sisi klien dan segarkan RSC server tree
      await updateSession({
        user: {
          username,
          name,
          image,
        },
      });
      router.refresh();

      setSaveMessage(t.settings.saved);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6">
        <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-2xl">manage_accounts</span>
          <span>{t.settings.headerTitle}</span>
        </h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          {t.settings.headerSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-black uppercase flex items-center gap-2 border-b-2 border-black dark:border-white pb-3">
            <span className="material-symbols-outlined text-xl">account_circle</span>
            <span>{t.settings.title}</span>
          </h2>

          {/* Public URL Field */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">
              {t.settings.claimUrl}
            </label>
            <div className="flex items-stretch brutal-border-sm bg-[#FFF2CE] dark:bg-[#1A1A1A]">
              <span className="px-3 py-2 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 border-r-2 border-black dark:border-white flex items-center">
                ravenlink.app/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                required
                className="flex-1 px-3 py-2 text-sm font-mono font-bold bg-white dark:bg-[#1C1B1A] text-black dark:text-white focus:outline-none"
              />
            </div>
            <div className="mt-1 text-xs font-mono">
              {isCheckingUsername && (
                <span className="text-neutral-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                  {t.settings.checkingAvailability}
                </span>
              )}
              {usernameError && (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">cancel</span>
                  {usernameError}
                </span>
              )}
            </div>
          </div>

        {/* Name */}
        <Input
          label={t.settings.fullName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Bio */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase mb-1">
            {t.settings.bioText}
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Deskripsikan diri atau brand Anda secara ringkas..."
            className="w-full px-3.5 py-2.5 text-sm font-medium bg-white dark:bg-[#1C1B1A] text-black dark:text-white brutal-border-sm focus:outline-none"
          />
        </div>

        {/* Avatar Upload (User-Friendly for Non-Technical Users) */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase mb-2">
            Foto Profil
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 brutal-border-sm bg-[#FFF8E7] dark:bg-[#141414]">
            {/* Live Avatar Preview */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-black dark:border-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#FFF] bg-neutral-200 dark:bg-neutral-800 shrink-0 flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt="Pratinjau Foto Profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-4xl text-neutral-400 select-none">
                  person
                </span>
              )}
              {isProcessingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl animate-spin">
                    progress_activity
                  </span>
                </div>
              )}
            </div>

            {/* Upload Buttons & Description */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="px-3.5 py-2 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-mono font-bold text-xs uppercase inline-flex items-center gap-1.5 cursor-pointer select-none active:translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-base leading-none">
                    upload
                  </span>
                  <span>{image ? "Ganti Foto Profil" : "Pilih Foto dari Galeri / File"}</span>
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="px-3 py-2 bg-white dark:bg-[#1C1B1A] text-rose-600 dark:text-rose-400 brutal-border-sm font-mono font-bold text-xs uppercase inline-flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer select-none"
                  >
                    <span className="material-symbols-outlined text-base leading-none">
                      delete
                    </span>
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                Pilih foto dari HP atau komputer Anda (JPG, PNG, atau WebP). Foto otomatis disesuaikan secara pas.
              </p>

              {imageError && (
                <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  {imageError}
                </p>
              )}

              {/* Advanced URL Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-mono font-bold underline text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer select-none inline-flex items-center gap-0.5"
                >
                  <span>{showUrlInput ? "▲ Sembunyikan opsi URL manual" : "▼ Atau tempel tautan URL gambar"}</span>
                </button>
                {showUrlInput && (
                  <div className="mt-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://... (URL foto profil)"
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] text-black dark:text-white brutal-border-sm focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save action button inside card */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t-2 border-black/10 dark:border-white/10">
          {saveMessage ? (
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {saveMessage}
            </span>
          ) : (
            <span />
          )}

          <Button
            type="submit"
            variant="accent"
            isLoading={isSaving}
            disabled={!!usernameError}
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{isSaving ? t.settings.saving : t.settings.save}</span>
          </Button>
        </div>
      </div>
    </form>
  </div>
  );
}
