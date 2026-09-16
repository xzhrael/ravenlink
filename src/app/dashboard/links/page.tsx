import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LinkListClient } from "@/components/links/link-list-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Link - Ravenlink",
  description: "Kelola, edit, jadwalkan, dan tinjau metrik klik konten link bio Anda.",
};

export default async function LinksPage() {
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

  return (
    <LinkListClient
      initialLinks={serializedLinks}
      username={user.username || "setup"}
    />
  );
}
