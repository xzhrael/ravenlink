import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kustomisasi Tema - Ravenlink",
  description: "Sesuaikan warna dan gaya bio-link Neo-Brutalism Anda.",
};

export default async function ThemePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  const initialSettings = {
    themeBackground: user.themeBackground || "#FFF8E7",
    themeAccent: user.themeAccent || "#3772FF",
    themeTextColor: user.themeTextColor || "#0D0D0D",
    themeButtonColor: user.themeButtonColor || "#FFDE59",
    themeButtonTextColor: user.themeButtonTextColor || "#0D0D0D",
    themeCardStyle: user.themeCardStyle || "brutal-solid",
    themeFont: user.themeFont || "space-grotesk",
  };

  return (
    <ThemeCustomizer
      initialSettings={initialSettings}
      username={user.username || "setup"}
      userName={user.name || "Kreator"}
      userBio={user.bio}
      userImage={user.image}
    />
  );
}
