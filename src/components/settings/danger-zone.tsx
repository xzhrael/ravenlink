"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteOwnAccountAction } from "@/app/actions/user";
import { useI18n } from "@/lib/i18n/context";

interface DangerZoneProps {
  userRole?: string;
}

export function DangerZone({ userRole }: DangerZoneProps) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const handleDeleteAccount = async () => {
    if (isSuperAdmin || isDeleting) return;

    setIsDeleting(true);
    setErrorMessage(null);

    const res = await deleteOwnAccountAction();
    if (res.success) {
      // Logout and redirect to login
      await signOut({ callbackUrl: "/login" });
    } else {
      setIsDeleting(false);
      setErrorMessage(res.error || "Gagal menghapus akun.");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card border-rose-600 dark:border-rose-500 shadow-[4px_4px_0px_0px_#E11D48] p-4 sm:p-6 space-y-4 max-w-2xl">
        <h2 className="text-lg font-black uppercase flex items-center gap-2 text-rose-600 dark:text-rose-500 border-b-2 border-rose-600 dark:border-rose-500 pb-3">
          <span className="material-symbols-outlined text-xl">warning</span>
          <span>{t.settings.dangerZoneTitle}</span>
        </h2>

        <div>
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
            {t.settings.deleteAccountTitle}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono leading-relaxed">
            {t.settings.deleteAccountWarning}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-100 border border-rose-600 text-rose-900 text-xs font-mono font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2">
          {isSuperAdmin ? (
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-500">
              <span className="material-symbols-outlined text-base">shield_person</span>
              <span>Akun Super Admin tidak dapat dihapus mandiri dari menu ini demi keamanan sistem.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs uppercase brutal-border-sm flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-base">delete_forever</span>
              <span>{t.settings.deleteAccountButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card border-rose-600 max-w-md w-full p-6 space-y-4 shadow-[6px_6px_0px_0px_#E11D48]">
            <div className="flex items-center gap-2 text-rose-600 border-b-2 border-black dark:border-white pb-3">
              <span className="material-symbols-outlined text-2xl">error</span>
              <h3 className="text-base font-black uppercase">
                {t.settings.deleteAccountConfirmModalTitle}
              </h3>
            </div>

            <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {t.settings.deleteAccountConfirmModalDesc}
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-neutral-200 dark:border-neutral-800 font-mono">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold uppercase bg-white dark:bg-[#252422] hover:bg-neutral-100 brutal-border-sm cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-xs font-bold uppercase bg-rose-600 hover:bg-rose-700 text-white brutal-border-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                    <span>{t.settings.deletingAccount}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete_forever</span>
                    <span>{t.settings.deleteAccountConfirmBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
