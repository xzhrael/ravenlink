"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserPasswordAction } from "@/app/actions/auth";
import { useI18n } from "@/lib/i18n/context";

interface PasswordFormProps {
  hasPassword?: boolean;
}

export function PasswordForm({ hasPassword = false }: PasswordFormProps) {
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage(t.auth.errors.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t.auth.errors.passwordsDoNotMatch);
      return;
    }

    if (hasPassword && !currentPassword) {
      setErrorMessage(t.auth.errors.missingCredentials);
      return;
    }

    setIsSaving(true);

    try {
      const res = await updateUserPasswordAction({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });

      if (res.success) {
        setSuccessMessage(t.settings.passwordSaved || "Password berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage(res.error || t.auth.errors.generalError);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setErrorMessage(t.auth.errors.generalError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-6 space-y-4 max-w-2xl">
      <h2 className="text-lg font-black uppercase flex items-center gap-2 border-b-2 border-black dark:border-white pb-3">
        <span className="material-symbols-outlined text-xl">lock</span>
        <span>{t.settings.passwordTitle}</span>
      </h2>

      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
        {t.settings.passwordSubtitle}
      </p>

      {!hasPassword && (
        <div className="p-3 bg-[#FFDE59]/20 border border-black dark:border-white text-xs font-mono font-bold">
          ℹ️ Akun Anda saat ini belum memiliki kata sandi. Pasang kata sandi di bawah untuk mengaktifkan login langsung dengan username.
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#FF5CAA]/20 border-2 border-[#FF5CAA] text-xs font-mono font-bold text-[#0D0D0D] dark:text-[#FFF8E7] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#FF5CAA]">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-[#06D6A0]/20 border-2 border-[#06D6A0] text-xs font-mono font-bold text-[#0D0D0D] dark:text-[#FFF8E7] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-[#06D6A0]">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {hasPassword && (
          <Input
            label={t.settings.currentPassword}
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t.settings.currentPasswordPlaceholder}
          />
        )}

        <Input
          label={t.settings.newPassword}
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t.settings.newPasswordPlaceholder}
        />

        <Input
          label={t.settings.confirmNewPassword}
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t.settings.confirmNewPasswordPlaceholder}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="accent"
            isLoading={isSaving}
          >
            <span className="material-symbols-outlined text-base">key</span>
            <span>{t.settings.savePassword}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
