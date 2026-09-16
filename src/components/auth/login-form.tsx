"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { sendEmailOtpAction, registerWithUsernamePasswordAction } from "@/app/actions/auth";
import { RavenlinkLogo } from "@/components/ui/ravenlink-logo";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Mode: "login" or "register"
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Inputs
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine whether input looks like an email
  const trimmedId = identifier.trim();
  const isEmail = trimmedId.includes("@");
  const isUsername = trimmedId.length > 0 && !isEmail;

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Check URL error parameter on initial load
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      console.warn("[Ravenlink Auth Error]", errorParam);
      if (errorParam === "CredentialsSignin") {
        setErrorMessage(t.auth.errors.invalidPassword);
      } else if (errorParam === "AccountSuspended") {
        setErrorMessage(t.auth.errors.accountSuspended);
      } else if (errorParam === "OAuthAccountNotLinked") {
        setErrorMessage("Email ini telah terdaftar melalui metode lain. Silakan masuk menggunakan Email OTP.");
      } else if (errorParam === "OAuthCallback" || errorParam === "OAuthSignin" || errorParam === "Callback") {
        setErrorMessage("Gagal memproses otentikasi Google. Silakan coba kembali.");
      } else {
        setErrorMessage(t.auth.errors.generalError);
      }
    }
  }, [searchParams, t]);

  // 1. Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trimmedId || !isEmail) {
      setErrorMessage(t.auth.errors.missingCredentials);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await sendEmailOtpAction(trimmedId);
      if (result.success) {
        setOtpSent(true);
        setCountdown(60);
        if (result.devCode) {
          setDevOtpPreview(result.devCode);
        }
        setSuccessMessage(`${t.auth.codeSentTo} ${trimmedId}`);
      } else {
        setErrorMessage(result.error || t.auth.errors.generalError);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setErrorMessage(t.auth.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedId || !otpCode.trim()) {
      setErrorMessage(t.auth.errors.missingCredentials);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("email-otp", {
        email: trimmedId,
        code: otpCode.trim(),
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error.includes("AccountSuspended")) {
          setErrorMessage(t.auth.errors.accountSuspended);
        } else {
          setErrorMessage(t.auth.errors.invalidOrExpiredCode);
        }
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setErrorMessage(t.auth.errors.generalError);
      setIsLoading(false);
    }
  };

  // 3. Login with Username & Password
  const handleUsernamePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedId || !password) {
      setErrorMessage(t.auth.errors.missingCredentials);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("username-password", {
        username: trimmedId,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error.includes("AccountSuspended")) {
          setErrorMessage(t.auth.errors.accountSuspended);
        } else if (res.error.includes("PasswordNotSet")) {
          setErrorMessage(t.auth.errors.passwordNotSet);
        } else if (res.error.includes("UserNotFound")) {
          setErrorMessage(t.auth.errors.userNotFound);
        } else {
          setErrorMessage(t.auth.errors.invalidPassword);
        }
        setIsLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setErrorMessage(t.auth.errors.generalError);
      setIsLoading(false);
    }
  };

  // 4. Register new user with Username + Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!trimmedId || !password) {
      setErrorMessage(t.auth.errors.missingCredentials);
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t.auth.errors.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t.auth.errors.passwordsDoNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithUsernamePasswordAction({
        username: trimmedId,
        password,
        name: name || undefined,
        email: registerEmail || undefined,
      });

      if (result.success) {
        setSuccessMessage(result.message || "Akun berhasil dibuat! Silakan masuk.");
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(result.error || t.auth.errors.generalError);
      }
    } catch (err) {
      console.error("Error registering:", err);
      setErrorMessage(t.auth.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Google Sign In
  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Google sign in error", error);
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1C1B1A] brutal-card p-5 sm:p-8">
      {/* Header */}
      <div className="mb-6 border-b-2 border-black dark:border-[#E2DFD8] pb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <RavenlinkLogo size="md" />
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            {authMode === "register" ? t.auth.registerTitle : t.auth.title}
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium">
          {t.auth.subtitle}
        </p>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-[#FF5CAA]/15 border-2 border-[#FF5CAA] text-[#0D0D0D] dark:text-[#FFF8E7] text-xs font-mono font-bold flex items-start gap-2">
          <span className="material-symbols-outlined text-base text-[#FF5CAA] shrink-0 mt-0.5">
            error
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-[#06D6A0]/15 border-2 border-[#06D6A0] text-[#0D0D0D] dark:text-[#FFF8E7] text-xs font-mono font-bold flex items-start gap-2">
          <span className="material-symbols-outlined text-base text-[#06D6A0] shrink-0 mt-0.5">
            check_circle
          </span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Local Dev OTP Notice Banner */}
      {devOtpPreview && (
        <div className="mb-4 p-3 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black text-xs font-mono font-bold flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-base shrink-0">
              key
            </span>
            <span className="truncate">
              {t.auth.devCodeNotice}: <span className="underline font-black text-sm">{devOtpPreview}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOtpCode(devOtpPreview)}
            className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold uppercase cursor-pointer hover:bg-neutral-800 shrink-0"
          >
            Isi Otomatis
          </button>
        </div>
      )}

      {/* --- FORM SECTION --- */}
      {authMode === "register" ? (
        /* REGISTER VIEW (Username + Password) */
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Username *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-neutral-200 dark:bg-neutral-800 brutal-border-sm border-r-0 font-mono text-sm font-bold">
                @
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="pilih-username"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              {t.auth.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.auth.namePlaceholder}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Email (Opsional)
            </label>
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              {t.auth.passwordLabel} *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              {t.auth.confirmPasswordLabel} *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.auth.confirmPasswordPlaceholder}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-mono font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-0.5"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-lg">person_add</span>
            )}
            <span>{t.auth.submitRegister}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="group inline-flex items-center gap-1 text-xs font-mono font-bold text-[#3772FF] cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-sm inline-block transition-transform group-hover:-translate-x-0.5 leading-none select-none">
                arrow_back
              </span>
              <span className="group-hover:underline leading-none">
                {t.auth.alreadyHaveAccount} {t.auth.loginNow}
              </span>
            </button>
          </div>
        </form>
      ) : otpSent ? (
        /* EMAIL OTP VERIFICATION VIEW */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              {t.auth.verificationCodeLabel}
            </label>
            <input
              type="text"
              required
              maxLength={6}
              autoFocus
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t.auth.verificationCodePlaceholder}
              className="w-full px-4 py-3 text-2xl tracking-[0.5em] text-center font-mono font-black bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otpCode.length < 6}
            className="w-full py-3 bg-[#06D6A0] text-[#0D0D0D] brutal-btn font-mono font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-0.5"
          >
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin text-lg">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-lg">login</span>
            )}
            <span>{t.auth.verifyAndLogin}</span>
          </button>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <button
              type="button"
              disabled={countdown > 0 || isLoading}
              onClick={() => handleSendOtp()}
              className="text-[#3772FF] hover:underline font-bold disabled:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `${t.auth.resendIn} ${countdown}s`
                : t.auth.resendCode}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtpCode("");
                setDevOtpPreview(null);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
            >
              {t.auth.changeEmail}
            </button>
          </div>
        </form>
      ) : (
        /* SMART LOGIN VIEW (Auto-detects Username vs Email) */
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <label className="block text-xs font-black uppercase">
                  {t.auth.identifierLabel}
                </label>
                {/* Info Tooltip Icon */}
                <div className="relative group inline-flex items-center">
                  <span
                    tabIndex={0}
                    role="button"
                    aria-label="Info metode login"
                    className="material-symbols-outlined text-[16px] text-neutral-400 hover:text-black dark:hover:text-white cursor-help transition-colors select-none"
                  >
                    help
                  </span>
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block group-focus-within:block w-64 p-2 bg-black text-white dark:bg-[#FFF8E7] dark:text-[#0D0D0D] text-[11px] font-mono leading-relaxed border-2 border-black dark:border-white shadow-[2px_2px_0px_#FFDE59] z-30 pointer-events-none transition-all">
                    {t.auth.identifierTooltip}
                  </div>
                </div>
              </div>

              {/* Dynamic Badge indicating detected mode */}
              {isEmail && (
                <span className="px-2 py-0.5 bg-[#3772FF] text-white text-[10px] font-mono font-black uppercase brutal-border-sm">
                  {t.auth.modeEmail}
                </span>
              )}
              {isUsername && (
                <span className="px-2 py-0.5 bg-[#FFDE59] text-[#0D0D0D] text-[10px] font-mono font-black uppercase brutal-border-sm">
                  {t.auth.modeUsername}
                </span>
              )}
            </div>

            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setErrorMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isUsername) {
                  e.preventDefault();
                  passwordInputRef.current?.focus();
                }
              }}
              placeholder={t.auth.identifierPlaceholder}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
            />
          </div>

          {/* Conditional Input based on Email vs Username detection */}
          {isEmail ? (
            /* EMAIL DETECTED: Show Send Verification Code button */
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isLoading}
                className="w-full py-3 bg-[#3772FF] text-white brutal-btn font-mono font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                    <span>{t.auth.sendingCode}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span>{t.auth.sendVerificationCode}</span>
                  </>
                )}
              </button>
            </div>
          ) : isUsername ? (
            /* USERNAME DETECTED: Show Password field and Login button */
            <form onSubmit={handleUsernamePasswordLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  {t.auth.passwordLabel}
                </label>
                <input
                  ref={passwordInputRef}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full py-3 bg-[#FFDE59] text-[#0D0D0D] brutal-btn font-mono font-black text-sm uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:translate-y-0.5"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-lg">login</span>
                )}
                <span>{t.auth.loginWithPassword}</span>
              </button>
            </form>
          ) : null}

          {/* PERSISTENT CREATE ACCOUNT LINK (Always visible without needing user to input first) */}
          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-dashed border-black/20 dark:border-white/20 mt-3">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              {t.auth.dontHaveAccount}
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="group inline-flex items-center gap-1.5 text-[#3772FF] font-black cursor-pointer select-none"
            >
              <span className="group-hover:underline leading-none">{t.auth.registerNow}</span>
              <span className="material-symbols-outlined text-sm inline-block transition-transform group-hover:translate-x-0.5 leading-none select-none">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}

      {/* --- DIVIDER --- */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t-2 border-dashed border-black/30 dark:border-white/30"></div>
        <span className="flex-shrink mx-3 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
          {t.auth.orContinueWith}
        </span>
        <div className="flex-grow border-t-2 border-dashed border-black/30 dark:border-white/30"></div>
      </div>

      {/* --- SECONDARY AUTH OPTIONS: GOOGLE --- */}
      <div className="space-y-3">
        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-neutral-50 dark:bg-[#2A2928] dark:hover:bg-[#333230] text-black dark:text-white brutal-btn cursor-pointer font-bold disabled:opacity-50 text-xs sm:text-sm"
        >
          {isLoadingGoogle ? (
            <span className="material-symbols-outlined animate-spin text-xl">
              progress_activity
            </span>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{t.auth.googleLogin}</span>
        </button>
      </div>
    </div>
  );
}
