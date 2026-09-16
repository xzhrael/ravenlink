"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LinkCategory, LinkInput } from "@/types/link";
import { revalidatePath } from "next/cache";

function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  return trimmed;
}

function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(urlStr));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createLinkAction(data: LinkInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  if (!data.title || data.title.trim().length === 0) {
    return { success: false, error: "Judul link wajib diisi." };
  }

  if (!data.url || !isValidUrl(data.url)) {
    return { success: false, error: "Format URL tujuan tidak valid (harus berupa URL valid)." };
  }

  const cleanUrl = normalizeUrl(data.url);

  try {
    // Determine next position
    const maxPositionLink = await prisma.link.findFirst({
      where: { userId: session.user.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const nextPosition =
      data.position !== undefined
        ? data.position
        : maxPositionLink
        ? maxPositionLink.position + 1
        : 0;

    const newLink = await prisma.link.create({
      data: {
        userId: session.user.id,
        title: data.title.trim(),
        url: cleanUrl,
        icon: data.icon?.trim() || null,
        subtitle: data.subtitle?.trim() || null,
        customThumbnail: data.customThumbnail?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        position: nextPosition,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        category: (data.category as LinkCategory) || LinkCategory.CUSTOM,
      },
    });

    // Record activity log
    const { recordActivityLog } = await import("@/lib/activity");
    await recordActivityLog({
      type: "LINK_CREATED",
      title: `Link Baru Diterbitkan: "${newLink.title}"`,
      subtitle: `Oleh @${session.user.username || "creator"} • Kategori: ${newLink.category}`,
      actorId: session.user.id,
      actorName: session.user.username || session.user.name,
      targetId: newLink.id,
      targetName: newLink.title,
      metadata: { url: newLink.url, category: newLink.category },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/builder");
    if (session.user.username) {
      revalidatePath(`/${session.user.username}`);
    }

    return { success: true, link: newLink };
  } catch (error) {
    console.error("Error creating link:", error);
    return { success: false, error: "Gagal membuat link baru di database." };
  }
}

export async function updateLinkAction(id: string, data: Partial<LinkInput>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const existing = await prisma.link.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Link tidak ditemukan atau akses ditolak." };
  }

  let cleanUrl = existing.url;
  if (data.url !== undefined) {
    if (!data.url || !isValidUrl(data.url)) {
      return { success: false, error: "Format URL tujuan tidak valid." };
    }
    cleanUrl = normalizeUrl(data.url);
  }

  try {
    const updated = await prisma.link.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        url: cleanUrl,
        icon: data.icon !== undefined ? (data.icon ? data.icon.trim() : null) : undefined,
        subtitle:
          data.subtitle !== undefined
            ? data.subtitle
              ? data.subtitle.trim()
              : null
            : undefined,
        customThumbnail:
          data.customThumbnail !== undefined
            ? data.customThumbnail
              ? data.customThumbnail.trim()
              : null
            : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        position: data.position !== undefined ? data.position : undefined,
        startDate:
          data.startDate !== undefined
            ? data.startDate
              ? new Date(data.startDate)
              : null
            : undefined,
        endDate:
          data.endDate !== undefined
            ? data.endDate
              ? new Date(data.endDate)
              : null
            : undefined,
        category: data.category ? (data.category as LinkCategory) : undefined,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/builder");
    if (session.user.username) {
      revalidatePath(`/${session.user.username}`);
    }

    return { success: true, link: updated };
  } catch (error) {
    console.error("Error updating link:", error);
    return { success: false, error: "Gagal memperbarui link." };
  }
}

export async function deleteLinkAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const existing = await prisma.link.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Link tidak ditemukan atau akses ditolak." };
  }

  try {
    await prisma.link.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/builder");
    if (session.user.username) {
      revalidatePath(`/${session.user.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    return { success: false, error: "Gagal menghapus link." };
  }
}

export async function toggleLinkActiveAction(id: string, isActive: boolean) {
  return await updateLinkAction(id, { isActive });
}

export async function reorderLinksAction(
  orderedItems: { id: string; position: number; isActive?: boolean }[]
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    await prisma.$transaction(
      orderedItems.map((item) =>
        prisma.link.update({
          where: { id: item.id },
          data: {
            position: item.position,
            isActive: item.isActive !== undefined ? item.isActive : undefined,
          },
        })
      )
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/links");
    revalidatePath("/dashboard/builder");
    if (session.user.username) {
      revalidatePath(`/${session.user.username}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error reordering links:", error);
    return { success: false, error: "Gagal menyimpan urutan link." };
  }
}
