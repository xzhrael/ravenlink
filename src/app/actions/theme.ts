"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ThemeSettingsInput {
  themeBackground: string;
  themeAccent: string;
  themeTextColor: string;
  themeButtonColor: string;
  themeButtonTextColor: string;
  themeCardStyle: string;
  themeFont: string;
}

export async function updateThemeAction(settings: ThemeSettingsInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        themeBackground: settings.themeBackground,
        themeAccent: settings.themeAccent,
        themeTextColor: settings.themeTextColor,
        themeButtonColor: settings.themeButtonColor,
        themeButtonTextColor: settings.themeButtonTextColor,
        themeCardStyle: settings.themeCardStyle,
        themeFont: settings.themeFont,
      },
    });

    revalidatePath("/dashboard/theme");
    revalidatePath("/dashboard");
    if (updated.username) {
      revalidatePath(`/${updated.username}`);
    }

    return { success: true, user: updated };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return { success: false, error: "Gagal menyimpan pengaturan tema ke database." };
  }
}
