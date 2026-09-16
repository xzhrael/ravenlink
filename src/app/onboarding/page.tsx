"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkUsernameAction, updateUsernameAction } from "@/app/actions/user";
import { sanitizeUsername } from "@/lib/username";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await checkUsernameAction(username);
      setIsChecking(false);
      setIsAvailable(res.available);
      if (!res.available) {
        setErrorMessage(res.error || "Username tidak tersedia.");
      } else {
        setErrorMessage(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = sanitizeUsername(e.target.value);
    setUsername(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable || isSubmitting) return;

    setIsSubmitting(true);
    const res = await updateUsernameAction(username);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/dashboard");
    } else {
      setErrorMessage(res.error || "Gagal menyimpan username.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
      <div className="w-full max-w-lg bg-white dark:bg-[#1C1B1A] brutal-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-3xl">badge</span>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Klaim Link Bio Anda
          </h1>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
          Tentukan alamat URL publik untuk halaman bio-link pribadi Anda. Alamat ini akan dapat diakses oleh semua pengunjung.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-2">
              Alamat URL Publik
            </label>
            <div className="flex items-stretch brutal-border-sm bg-[#F4F0EA] dark:bg-[#2A2928]">
              <span className="px-3 py-2.5 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 border-r-2 border-black dark:border-[#E2DFD8] flex items-center select-none">
                ravenlink.app/
              </span>
              <input
                type="text"
                value={username}
                onChange={handleInputChange}
                placeholder="nama-anda"
                required
                className="flex-1 px-3 py-2.5 text-base font-mono font-bold bg-white dark:bg-[#1C1B1A] text-black dark:text-white focus:outline-none"
              />
            </div>

            {/* Status indicator */}
            <div className="mt-2 text-xs font-mono">
              {isChecking && (
                <span className="text-neutral-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Memeriksa ketersediaan...
                </span>
              )}
              {!isChecking && isAvailable === true && (
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  URL ravenlink.app/{username} tersedia!
                </span>
              )}
              {!isChecking && errorMessage && (
                <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  {errorMessage}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t-2 border-neutral-200 dark:border-neutral-800 flex gap-3">
            <button
              type="submit"
              disabled={!isAvailable || isSubmitting}
              className="flex-1 px-4 py-3 bg-black text-white dark:bg-white dark:text-black brutal-btn font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>Konfirmasi & Buka Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-3 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white brutal-border-sm font-bold text-sm cursor-pointer"
            >
              Lewati Dulu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
