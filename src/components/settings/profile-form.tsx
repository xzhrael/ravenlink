"use client";

import React, { useState } from "react";
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

        {/* Avatar URL */}
        <Input
          label={t.settings.avatarUrl}
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://... (URL foto profil)"
          helperText={t.settings.avatarHelper}
        />
      </div>

      {/* Save action button */}
      <div className="flex items-center justify-between gap-4">
        {saveMessage && (
          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {saveMessage}
          </span>
        )}

        <div className="ml-auto">
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
