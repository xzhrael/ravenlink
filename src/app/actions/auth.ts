"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateAndSaveEmailOtp, SendOtpResult } from "@/lib/email-otp";
import { generateUniqueUsername } from "@/lib/username";

/**
 * 1. Action to trigger sending a 6-digit verification code to the given email
 */
export async function sendEmailOtpAction(email: string): Promise<SendOtpResult> {
  return await generateAndSaveEmailOtp(email);
}

/**
 * 2. Action to register a new user account with Username + Password
 */
export async function registerWithUsernamePasswordAction(params: {
  username: string;
  password: string;
  email?: string;
  name?: string;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const rawUsername = params.username?.trim().toLowerCase();
    const password = params.password;
    const rawEmail = params.email?.trim().toLowerCase();
    const name = params.name?.trim();

    if (!rawUsername || rawUsername.length < 3) {
      return {
        success: false,
        error: "Username minimal harus 3 karakter.",
      };
    }

    // Username format check (only alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
      return {
        success: false,
        error: "Username hanya boleh memuat huruf, angka, tanda hubung (-), dan garis bawah (_).",
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Password minimal harus 6 karakter.",
      };
    }

    // Check if username already taken
    const existingUserByUsername = await prisma.user.findFirst({
      where: { username: rawUsername },
    });

    if (existingUserByUsername) {
      return {
        success: false,
        error: "Username sudah digunakan. Silakan pilih username lain.",
      };
    }

    // If email provided, check email uniqueness
    if (rawEmail) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: rawEmail },
      });
      if (existingUserByEmail) {
        return {
          success: false,
          error: "Email sudah terdaftar. Silakan masuk menggunakan email tersebut.",
        };
      }
    }

    // Hash the password securely with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        username: rawUsername,
        password: hashedPassword,
        email: rawEmail || null,
        name: name || rawUsername,
        role: "USER",
        status: "ACTIVE",
        bio: "Creative creator on Ravenlink.",
        themeBackground: "#FFF8E7",
        themeAccent: "#3772FF",
        themeTextColor: "#0D0D0D",
        themeButtonColor: "#FFDE59",
        themeButtonTextColor: "#0D0D0D",
        themeCardStyle: "brutal-solid",
        themeFont: "space-grotesk",
      },
    });

    return {
      success: true,
      message: "Akun berhasil dibuat! Silakan masuk dengan username dan password Anda.",
    };
  } catch (error) {
    console.error("Error in registerWithUsernamePasswordAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat akun.",
    };
  }
}

/**
 * 3. Action to update or set user password from dashboard settings
 */
export async function updateUserPasswordAction(params: {
  currentPassword?: string;
  newPassword: string;
}): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
    }

    if (!params.newPassword || params.newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // If user already had a password, verify current password
    if (user.password) {
      if (!params.currentPassword) {
        return { success: false, error: "Password saat ini wajib diisi." };
      }
      const isCurrentValid = await bcrypt.compare(params.currentPassword, user.password);
      if (!isCurrentValid) {
        return { success: false, error: "Password saat ini salah." };
      }
    }

    const hashed = await bcrypt.hash(params.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return {
      success: true,
      message: "Password berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error in updateUserPasswordAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui password.",
    };
  }
}
