import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ContentBuilder } from "@/components/builder/content-builder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Puzzle Builder - Ravenlink",
  description: "Susun tata letak bio link dengan drag-and-drop 2 kolom puzzle slots.",
};

export default async function BuilderPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      links: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const serializedLinks = user.links.map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon,
    subtitle: link.subtitle,
    customThumbnail: link.customThumbnail,
    isActive: link.isActive,
    startDate: link.startDate ? link.startDate.toISOString() : null,
    endDate: link.endDate ? link.endDate.toISOString() : null,
    category: link.category as "SOCIAL" | "PRODUCT" | "CUSTOM" | "CONTACT",
    clicks: link.clicks,
    position: link.position,
  }));

  const userProfile = {
    username: user.username || "setup",
    userName: user.name || user.email || "Kreator",
    userBio: user.bio,
    userImage: user.image,
  };

  const themeSettings = {
    themeBackground: user.themeBackground || "#FFF8E7",
    themeButtonColor: user.themeButtonColor || "#FFDE59",
    themeButtonTextColor: user.themeButtonTextColor || "#0D0D0D",
    themeAccent: user.themeAccent || "#3772FF",
    themeTextColor: user.themeTextColor || "#0D0D0D",
    themeCardStyle: user.themeCardStyle || "brutal-solid",
    themeFont: user.themeFont || "space-grotesk",
  };

  return (
    <ContentBuilder
      initialLinks={serializedLinks}
      userProfile={userProfile}
      themeSettings={themeSettings}
    />
  );
}
