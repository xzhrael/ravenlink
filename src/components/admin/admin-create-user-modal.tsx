"use client";

import React, { useState, useEffect } from "react";
import { adminCreateUserAction } from "@/app/actions/admin";
import { checkUsernameAction } from "@/app/actions/user";
import { sanitizeUsername } from "@/lib/username";
import { AdminUserListItem } from "@/types/admin";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser: AdminUserListItem) => void;
}

export function AdminCreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminCreateUserModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"USER" | "SUPER_ADMIN">("USER");
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">("ACTIVE");
  const [bio, setBio] = useState("");

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setUsername("");
      setPassword("");
      setRole("USER");
      setStatus("ACTIVE");
      setBio("");
      setUsernameError(null);
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleUsernameChange = async (val: string) => {
    const clean = sanitizeUsername(val);
    setUsername(clean);

    if (!clean) {
      setUsernameError(null);
      return;
    }

    if (clean.length < 3) {
      setUsernameError("Username minimal 3 karakter.");
      return;
    }

    setIsCheckingUsername(true);
    const res = await checkUsernameAction(clean);
    setIsCheckingUsername(false);

    if (!res.available) {
      setUsernameError(res.error || "Username sudah digunakan.");
    } else {
      setUsernameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameError || isSubmitting) return;

    if (!name.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Alamat email tidak valid.");
      return;
    }

    if (!username.trim() || username.length < 3) {
      setErrorMessage("Username minimal 3 karakter.");
      return;
    }

    if (password && password.length < 6) {
      setErrorMessage("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await adminCreateUserAction({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password: password ? password.trim() : undefined,
      role,
      status,
      bio: bio.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMessage(res.error || "Gagal membuat pengguna baru.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFF8E7] dark:bg-[#141414] brutal-card w-full max-w-lg my-8 overflow-hidden flex flex-col border-4 border-black dark:border-white shadow-[8px_8px_0px_#000]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1C1B1A] border-b-3 border-black dark:border-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-2xl p-1 bg-[#FFDE59] text-black border border-black shrink-0">
              person_add
            </span>
            <div>
              <h2 className="font-black text-base uppercase tracking-tight text-[#0D0D0D] dark:text-[#FFF8E7]">
                Tambah Pengguna Baru
              </h2>
              <p className="text-[11px] font-mono text-neutral-500 font-medium">
                Buat akun pengguna atau admin baru langsung ke database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 px-2 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm font-mono font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-[#FFE8A3]"
            aria-label={t.common.close}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-4 p-3 bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-600 text-rose-900 dark:text-rose-200 text-xs font-mono font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-rose-600 shrink-0">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Alex Morgan"
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Alamat Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Username & Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Username / URL Bio *
              </label>
              <div className="flex items-stretch brutal-border-sm bg-[#FFF2CE] dark:bg-[#252422]">
                <span className="px-2 py-2 text-[11px] font-mono font-bold text-neutral-500 border-r border-black select-none flex items-center">
                  /
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="alex-morgan"
                  className="flex-1 px-2.5 py-2 text-xs font-mono font-bold bg-white dark:bg-[#1C1B1A] text-black dark:text-white focus:outline-none"
                />
              </div>
              <div className="mt-1 text-[11px] font-mono">
                {isCheckingUsername && (
                  <span className="text-neutral-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    Memeriksa...
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

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Password (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none p-0.5 flex items-center justify-center"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  <span className="material-symbols-outlined text-base leading-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Role & Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1.5">
                Peran Pengguna (Role)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold uppercase brutal-border-sm transition-all cursor-pointer ${
                    role === "USER"
                      ? "bg-[#FFDE59] text-[#0D0D0D] font-black shadow-[2px_2px_0px_#000]"
                      : "bg-white dark:bg-[#1C1B1A] opacity-70"
                  }`}
                >
                  USER
                </button>
                <button
                  type="button"
                  onClick={() => setRole("SUPER_ADMIN")}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold uppercase brutal-border-sm transition-all cursor-pointer ${
                    role === "SUPER_ADMIN"
                      ? "bg-black text-white dark:bg-white dark:text-black font-black shadow-[2px_2px_0px_#000]"
                      : "bg-white dark:bg-[#1C1B1A] opacity-70"
                  }`}
                >
                  SUPER ADMIN
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1.5">
                Status Akun
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("ACTIVE")}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold uppercase brutal-border-sm transition-all cursor-pointer ${
                    status === "ACTIVE"
                      ? "bg-[#06D6A0] text-[#0D0D0D] font-black shadow-[2px_2px_0px_#000]"
                      : "bg-white dark:bg-[#1C1B1A] opacity-70"
                  }`}
                >
                  ACTIVE
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("SUSPENDED")}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold uppercase brutal-border-sm transition-all cursor-pointer ${
                    status === "SUSPENDED"
                      ? "bg-rose-500 text-white font-black shadow-[2px_2px_0px_#000]"
                      : "bg-white dark:bg-[#1C1B1A] opacity-70"
                  }`}
                >
                  SUSPENDED
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">
              Bio Singkat (Opsional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Deskripsi singkat profil kreator..."
              className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t-2 border-black dark:border-white flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-[#1C1B1A] brutal-border-sm text-xs font-mono font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Batal
            </button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              disabled={!!usernameError}
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Buat Akun Pengguna</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
