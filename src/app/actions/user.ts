"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isUsernameAvailable, sanitizeUsername } from "@/lib/username";
import { revalidatePath } from "next/cache";

export async function checkUsernameAction(usernameCandidate: string) {
  const session = await auth();
  const userId = session?.user?.id;
  const sanitized = sanitizeUsername(usernameCandidate);
  return await isUsernameAvailable(sanitized, userId);
}

export async function updateUsernameAction(newUsernameCandidate: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const sanitized = sanitizeUsername(newUsernameCandidate);
  const availability = await isUsernameAvailable(sanitized, session.user.id);
  if (!availability.available) {
    return { success: false, error: availability.error };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: sanitized },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath(`/${sanitized}`);

    return { success: true, username: updated.username };
  } catch (error) {
    console.error("Failed to update username:", error);
    return { success: false, error: "Gagal memperbarui username di database." };
  }
}

export async function updateUserProfileAction(data: {
  name?: string;
  bio?: string;
  image?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name?.trim(),
        bio: data.bio?.trim(),
        image: data.image?.trim() || undefined,
      },
    });

    revalidatePath("/dashboard", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    if (updated.username) {
      revalidatePath(`/${updated.username}`);
    }

    return { success: true, user: updated };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Gagal memperbarui profil pengguna." };
  }
}

export async function getCurrentUserData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      links: {
        orderBy: { position: "asc" },
      },
    },
  });
}

/**
 * Delete own account by authenticated user
 */
export async function deleteOwnAccountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, username: true, email: true, role: true },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    if (user.role === "SUPER_ADMIN") {
      return {
        success: false,
        error: "Akun Super Admin tidak dapat dihapus secara mandiri untuk menjaga integritas sistem.",
      };
    }

    // 1. Record activity log before cascade deletion
    const { recordActivityLog } = await import("@/lib/activity");
    await recordActivityLog({
      type: "USER_SELF_DELETED",
      title: `Pengguna Menghapus Akun Sendiri: @${user.username || user.name || "user"}`,
      subtitle: `Email: ${user.email || "-"} • Tindakan mandiri pengguna`,
      actorId: user.id,
      actorName: user.username || user.name,
      targetId: user.id,
      targetName: user.username || user.name,
      metadata: {
        email: user.email,
        username: user.username,
        name: user.name,
        selfDeleted: true,
      },
    });

    // 2. Cascade delete
    await prisma.link.deleteMany({ where: { userId: user.id } });
    await prisma.account.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete own account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus akun.",
    };
  }
}
