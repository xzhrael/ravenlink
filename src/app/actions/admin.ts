"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sanitizeUsername, isUsernameAvailable } from "@/lib/username";
import { recordActivityLog } from "@/lib/activity";
import type {
  AdminPlatformStats,
  AdminUserListItem,
  AdminUserDetail,
  AdminThemeOverrideInput,
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminActivityType,
} from "@/types/admin";

// Internal Super Admin verification helper
async function verifySuperAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }

  // Fast-path: Check role & status from verified session JWT
  if (session.user.role !== "SUPER_ADMIN" || session.user.status === "SUSPENDED") {
    throw new Error("FORBIDDEN_SUPER_ADMIN_REQUIRED");
  }

  return {
    session,
    adminUser: {
      id: session.user.id,
      role: session.user.role as string,
      status: (session.user.status as string) || "ACTIVE",
      email: session.user.email,
    },
  };
}

/**
 * 1. Fetch live platform telemetry and enterprise KPIs
 */
export async function getAdminPlatformStatsAction(): Promise<{
  success: boolean;
  data?: AdminPlatformStats;
  error?: string;
}> {
  try {
    await verifySuperAdmin();

    // Phase 1: Aggregate telemetry KPIs sequentially (reuses 1 pooled connection, zero contention)
    const userStatusGroups = await prisma.user.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const superAdminCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    const linkStatusGroups = await prisma.link.groupBy({
      by: ["isActive"],
      _count: { _all: true },
    });

    const clicksAggregate = await prisma.link.aggregate({
      _sum: { clicks: true },
    });

    // Parse counts from groupBy results
    let totalUsers = 0;
    let activeUsers = 0;
    let suspendedUsers = 0;
    for (const group of userStatusGroups) {
      const count = group._count._all;
      totalUsers += count;
      if (group.status === "ACTIVE") activeUsers = count;
      if (group.status === "SUSPENDED") suspendedUsers = count;
    }

    let totalLinks = 0;
    let activeLinks = 0;
    for (const group of linkStatusGroups) {
      const count = group._count._all;
      totalLinks += count;
      if (group.isActive) activeLinks = count;
    }

    // Phase 2: Top users and activity logs sequentially
    const activityLogs = await prisma.activityLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
    });

    const usersWithLinks = await prisma.user.findMany({
      take: 50,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        role: true,
        status: true,
        links: {
          select: {
            clicks: true,
          },
        },
      },
    });

    // Fallbacks only if activityLog doesn't have sufficient historical records
    const recentUsers =
      activityLogs.length < 8
        ? await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              username: true,
              createdAt: true,
            },
          })
        : [];

    const recentLinks =
      activityLogs.length < 8
        ? await prisma.link.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { username: true },
              },
            },
          })
        : [];

    const totalClicks = clicksAggregate._sum.clicks || 0;
    const avgClicksPerUser =
      totalUsers > 0 ? Math.round((totalClicks / totalUsers) * 10) / 10 : 0;
    const avgLinksPerUser =
      totalUsers > 0 ? Math.round((totalLinks / totalUsers) * 10) / 10 : 0;

    // Calculate top performing users by total clicks across their links
    const topPerformingUsers = usersWithLinks
      .map((u) => {
        const userTotalClicks = u.links.reduce((acc, l) => acc + l.clicks, 0);
        return {
          id: u.id,
          name: u.name,
          username: u.username,
          image: u.image,
          linkCount: u.links.length,
          totalClicks: userTotalClicks,
          status: u.status,
          role: u.role,
        };
      })
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);

    // Map persistent activity logs
    const loggedActivities: AdminPlatformStats["recentActivity"] = activityLogs.map((log) => ({
      type: log.type as AdminActivityType,
      id: log.id,
      title: log.title,
      subtitle: log.subtitle || "",
      targetName: log.targetName,
      actorName: log.actorName,
      timestamp: log.createdAt,
    }));

    // Fallback/Synthetic activities from existing entities if not already in activityLog
    const fallbackActivities: AdminPlatformStats["recentActivity"] = [
      ...recentUsers.map((u) => ({
        type: "USER_REGISTERED" as const,
        id: `user-${u.id}`,
        title: `Kreator Baru Bergabung: @${u.username || "user"}`,
        subtitle: u.name || "Akun Baru",
        targetName: u.username || u.name,
        actorName: u.username || u.name,
        timestamp: u.createdAt,
      })),
      ...recentLinks.map((l) => ({
        type: "LINK_CREATED" as const,
        id: `link-${l.id}`,
        title: `Link Baru Diterbitkan: "${l.title}"`,
        subtitle: `Oleh @${l.user.username || "creator"} • Kategori: ${l.category}`,
        targetName: l.title,
        actorName: l.user.username,
        timestamp: l.createdAt,
      })),
    ];

    // Combine: Give precedence to persistent logs, supplement with fallbacks
    const activityMap = new Map<string, AdminPlatformStats["recentActivity"][number]>();
    for (const act of loggedActivities) {
      activityMap.set(act.id, act);
    }
    for (const act of fallbackActivities) {
      if (activityMap.size < 8) {
        activityMap.set(act.id, act);
      }
    }

    const recentActivity = Array.from(activityMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        superAdminCount,
        totalLinks,
        activeLinks,
        totalClicks,
        avgClicksPerUser,
        avgLinksPerUser,
        topPerformingUsers,
        recentActivity,
      },
    };
  } catch (error) {
    console.error("Error getAdminPlatformStatsAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat statistik platform.",
    };
  }
}

/**
 * 2. Fetch paginated, searchable, filterable list of all platform users
 */
export async function getAdminUsersAction(params?: {
  query?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: {
    users: AdminUserListItem[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}> {
  try {
    await verifySuperAdmin();

    const query = params?.query?.trim().toLowerCase();
    const roleFilter = params?.role;
    const statusFilter = params?.status;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(100, Math.max(1, params?.limit || 20));
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { username: { contains: query } },
      ];
    }

    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = roleFilter;
    }

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    const totalCount = await prisma.user.count({ where: whereClause });
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { links: true },
        },
        links: {
          select: { clicks: true },
        },
      },
    });

    const formattedUsers: AdminUserListItem[] = users.map((u) => {
      const totalClicks = u.links.reduce((acc, l) => acc + l.clicks, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        image: u.image,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        _count: u._count,
        totalClicks,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: {
        users: formattedUsers,
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error getAdminUsersAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat daftar pengguna.",
    };
  }
}

/**
 * 3. Deep inspection of a specific user: profile, public bio theme, and public links
 */
export async function getAdminUserDetailAction(userId: string): Promise<{
  success: boolean;
  data?: AdminUserDetail;
  error?: string;
}> {
  try {
    await verifySuperAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        links: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    return {
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        role: user.role,
        status: user.status,
        themeBackground: user.themeBackground,
        themeAccent: user.themeAccent,
        themeTextColor: user.themeTextColor,
        themeButtonColor: user.themeButtonColor,
        themeButtonTextColor: user.themeButtonTextColor,
        themeCardStyle: user.themeCardStyle,
        themeFont: user.themeFont,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        links: user.links.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon,
          subtitle: l.subtitle,
          customThumbnail: l.customThumbnail,
          isActive: l.isActive,
          clicks: l.clicks,
          position: l.position,
          category: l.category,
          startDate: l.startDate,
          endDate: l.endDate,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })),
      },
    };
  } catch (error) {
    console.error("Error getAdminUserDetailAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memuat detail pengguna.",
    };
  }
}

/**
 * 4. Update user status (Activate / Suspend)
 */
export async function updateUserStatusAction(
  userId: string,
  status: "ACTIVE" | "SUSPENDED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { adminUser } = await verifySuperAdmin();

    if (userId === adminUser.id) {
      return {
        success: false,
        error: "Super Admin tidak dapat menangguhkan akunnya sendiri.",
      };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { username: true },
    });

    revalidatePath("/admin");
    if (updated.username) {
      revalidatePath(`/${updated.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updateUserStatusAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status akun.",
    };
  }
}

/**
 * 5. Update user role (Promote to SUPER_ADMIN or Demote to USER)
 */
export async function updateUserRoleAction(
  userId: string,
  role: "USER" | "SUPER_ADMIN"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { adminUser } = await verifySuperAdmin();

    if (userId === adminUser.id && role === "USER") {
      return {
        success: false,
        error: "Anda tidak dapat menurunkan hak akses Super Admin pada diri sendiri.",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updateUserRoleAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui peran pengguna.",
    };
  }
}

/**
 * 6. Super Admin override for a user's public bio theme appearance
 */
export async function adminUpdateUserThemeAction(
  userId: string,
  themeSettings: AdminThemeOverrideInput
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifySuperAdmin();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        themeBackground: themeSettings.themeBackground,
        themeButtonColor: themeSettings.themeButtonColor,
        themeButtonTextColor: themeSettings.themeButtonTextColor,
        themeAccent: themeSettings.themeAccent,
        themeTextColor: themeSettings.themeTextColor,
        themeCardStyle: themeSettings.themeCardStyle,
        themeFont: themeSettings.themeFont,
      },
      select: { username: true },
    });

    revalidatePath("/admin");
    if (updated.username) {
      revalidatePath(`/${updated.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adminUpdateUserThemeAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui tema pengguna.",
    };
  }
}

/**
 * 7. Super Admin toggle user link active status
 */
export async function adminToggleUserLinkAction(
  linkId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifySuperAdmin();

    const link = await prisma.link.update({
      where: { id: linkId },
      data: { isActive },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    revalidatePath("/admin");
    if (link.user?.username) {
      revalidatePath(`/${link.user.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adminToggleUserLinkAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengubah status link.",
    };
  }
}

/**
 * 8. Super Admin reorder a user's links via drag and drop
 */
export async function adminReorderUserLinksAction(
  userId: string,
  orderedItems: { id: string; position: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifySuperAdmin();

    await prisma.$transaction(
      orderedItems.map((item) =>
        prisma.link.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    revalidatePath("/admin");
    if (user?.username) {
      revalidatePath(`/${user.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adminReorderUserLinksAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan urutan tautan pengguna.",
    };
  }
}

/**
 * 8. Super Admin delete a specific violating user link
 */
export async function adminDeleteUserLinkAction(
  linkId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await verifySuperAdmin();

    const link = await prisma.link.delete({
      where: { id: linkId },
      include: {
        user: {
          select: { username: true },
        },
      },
    });

    revalidatePath("/admin");
    if (link.user?.username) {
      revalidatePath(`/${link.user.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error adminDeleteUserLinkAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus link pengguna.",
    };
  }
}

/**
 * 9. Super Admin permanently delete an abusive user account
 */
export async function adminDeleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { adminUser } = await verifySuperAdmin();

    if (userId === adminUser.id) {
      return {
        success: false,
        error: "Super Admin tidak dapat menghapus akunnya sendiri.",
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, email: true },
    });

    if (!targetUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Record activity log for audit and stream
    await recordActivityLog({
      type: "USER_DELETED_BY_ADMIN",
      title: `Akun Dihapus oleh Admin: @${targetUser.username || targetUser.name || "user"}`,
      subtitle: `Email: ${targetUser.email || "-"} • Dihapus oleh Super Admin @${adminUser.email}`,
      actorId: adminUser.id,
      actorName: adminUser.email,
      targetId: targetUser.id,
      targetName: targetUser.username || targetUser.name,
      metadata: {
        email: targetUser.email,
        username: targetUser.username,
        name: targetUser.name,
        deletedByAdmin: true,
      },
    });

    // Delete associated accounts, sessions, links first if cascade is needed
    await prisma.link.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error adminDeleteUserAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus pengguna.",
    };
  }
}

/**
 * 10. Super Admin create a new user directly
 */
export async function adminCreateUserAction(
  data: AdminCreateUserInput
): Promise<{ success: boolean; user?: AdminUserListItem; error?: string }> {
  try {
    const { adminUser } = await verifySuperAdmin();

    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const sanitizedUsername = sanitizeUsername(data.username);

    if (!email || !email.includes("@")) {
      return { success: false, error: "Format email tidak valid." };
    }

    if (sanitizedUsername.length < 3) {
      return { success: false, error: "Username minimal 3 karakter." };
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return { success: false, error: "Email sudah terdaftar oleh pengguna lain." };
    }

    // Check username availability
    const usernameCheck = await isUsernameAvailable(sanitizedUsername);
    if (!usernameCheck.available) {
      return { success: false, error: usernameCheck.error || "Username sudah digunakan." };
    }

    let hashedPassword: string | undefined = undefined;
    if (data.password && data.password.trim()) {
      if (data.password.trim().length < 6) {
        return { success: false, error: "Password minimal 6 karakter." };
      }
      hashedPassword = await bcrypt.hash(data.password.trim(), 10);
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username: sanitizedUsername,
        password: hashedPassword,
        role: data.role || "USER",
        status: data.status || "ACTIVE",
        bio: data.bio?.trim() || null,
        emailVerified: new Date(),
        themeBackground: "#FFF8E7",
        themeAccent: "#3772FF",
        themeTextColor: "#0D0D0D",
        themeButtonColor: "#FFDE59",
        themeButtonTextColor: "#0D0D0D",
        themeCardStyle: "brutal-solid",
        themeFont: "space-grotesk",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Record activity log
    await recordActivityLog({
      type: "USER_REGISTERED",
      title: `Kreator Baru Ditambahkan: @${newUser.username || "user"}`,
      subtitle: `${newUser.name || "Akun Baru"} • Ditambahkan oleh Super Admin`,
      actorId: adminUser.id,
      actorName: adminUser.email,
      targetId: newUser.id,
      targetName: newUser.username || newUser.name,
      metadata: { email: newUser.email, username: newUser.username },
    });

    revalidatePath("/admin");
    if (newUser.username) {
      revalidatePath(`/${newUser.username}`);
    }

    return {
      success: true,
      user: {
        ...newUser,
        _count: { links: 0 },
        totalClicks: 0,
      },
    };
  } catch (error) {
    console.error("Error adminCreateUserAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat pengguna baru.",
    };
  }
}

/**
 * 11. Super Admin update all properties of a user (profile, credentials, status, role)
 */
export async function adminUpdateUserAction(
  userId: string,
  data: AdminUpdateUserInput
): Promise<{ success: boolean; user?: AdminUserDetail; error?: string }> {
  try {
    const { adminUser } = await verifySuperAdmin();

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Safety checks for self-modification
    if (userId === adminUser.id) {
      if (data.role && data.role !== "SUPER_ADMIN") {
        return { success: false, error: "Anda tidak dapat mencabut hak akses Super Admin pada akun Anda sendiri." };
      }
      if (data.status && data.status !== "ACTIVE") {
        return { success: false, error: "Anda tidak dapat menonaktifkan akun Anda sendiri." };
      }
    }

    const updatePayload: Record<string, unknown> = {};

    if (data.name !== undefined) {
      updatePayload.name = data.name.trim();
    }

    if (data.bio !== undefined) {
      updatePayload.bio = data.bio.trim() || null;
    }

    if (data.image !== undefined) {
      updatePayload.image = data.image.trim() || null;
    }

    if (data.role !== undefined) {
      updatePayload.role = data.role;
    }

    if (data.status !== undefined) {
      updatePayload.status = data.status;
    }

    // Check email uniqueness if modified
    if (data.email !== undefined && data.email.trim().toLowerCase() !== existingUser.email?.toLowerCase()) {
      const email = data.email.trim().toLowerCase();
      if (!email.includes("@")) {
        return { success: false, error: "Format email tidak valid." };
      }
      const duplicateEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (duplicateEmail && duplicateEmail.id !== userId) {
        return { success: false, error: "Email tersebut sudah terdaftar pada pengguna lain." };
      }
      updatePayload.email = email;
    }

    // Check username uniqueness if modified
    if (data.username !== undefined && data.username.trim().toLowerCase() !== existingUser.username?.toLowerCase()) {
      const sanitized = sanitizeUsername(data.username);
      if (sanitized.length < 3) {
        return { success: false, error: "Username minimal 3 karakter." };
      }
      const avail = await isUsernameAvailable(sanitized, userId);
      if (!avail.available) {
        return { success: false, error: avail.error || "Username sudah digunakan." };
      }
      updatePayload.username = sanitized;
    }

    // Update password if provided
    if (data.password && data.password.trim()) {
      if (data.password.trim().length < 6) {
        return { success: false, error: "Password baru minimal 6 karakter." };
      }
      updatePayload.password = await bcrypt.hash(data.password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
      include: {
        links: {
          orderBy: { position: "asc" },
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard", "layout");
    if (existingUser.username) {
      revalidatePath(`/${existingUser.username}`);
    }
    if (updated.username) {
      revalidatePath(`/${updated.username}`);
    }

    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        bio: updated.bio,
        image: updated.image,
        role: updated.role,
        status: updated.status,
        themeBackground: updated.themeBackground,
        themeAccent: updated.themeAccent,
        themeTextColor: updated.themeTextColor,
        themeButtonColor: updated.themeButtonColor,
        themeButtonTextColor: updated.themeButtonTextColor,
        themeCardStyle: updated.themeCardStyle,
        themeFont: updated.themeFont,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        links: updated.links.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          icon: l.icon,
          subtitle: l.subtitle,
          customThumbnail: l.customThumbnail,
          isActive: l.isActive,
          clicks: l.clicks,
          position: l.position,
          category: l.category,
          startDate: l.startDate,
          endDate: l.endDate,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })),
      },
    };
  } catch (error) {
    console.error("Error adminUpdateUserAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data pengguna.",
    };
  }
}

