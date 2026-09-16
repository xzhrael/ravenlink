import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PublicBioClient } from "@/components/public/public-bio-client";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, bio: true, image: true },
  });

  if (!user) {
    return {
      title: "User Not Found - Ravenlink",
    };
  }

  const title = user.name ? `${user.name} (@${username}) - Ravenlink` : `@${username} - Ravenlink`;
  const description = user.bio || `Official bio-link page for @${username} on Ravenlink.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.image ? [user.image] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: user.image ? [user.image] : undefined,
    },
  };
}

export default async function UserBioPage({ params }: PageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      links: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const now = new Date();
  const visibleLinks = user.links
    .filter((link) => {
      if (!link.isActive) return false;
      if (link.startDate && now < link.startDate) return false;
      if (link.endDate && now > link.endDate) return false;
      return true;
    })
    .map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: l.icon,
      subtitle: l.subtitle,
      customThumbnail: l.customThumbnail,
    }));

  const serializedUser = {
    username: user.username,
    name: user.name,
    bio: user.bio,
    image: user.image,
    themeBackground: user.themeBackground || "#FFF8E7",
    themeButtonColor: user.themeButtonColor || "#FFDE59",
    themeButtonTextColor: user.themeButtonTextColor || "#0D0D0D",
    themeAccent: user.themeAccent || "#3772FF",
    themeTextColor: user.themeTextColor || "#0D0D0D",
    themeCardStyle: user.themeCardStyle || "brutal-solid",
    themeFont: user.themeFont || "space-grotesk",
  };

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://ravenlink.app"}/${username}`;

  return (
    <PublicBioClient
      user={serializedUser}
      visibleLinks={visibleLinks}
      pageUrl={pageUrl}
    />
  );
}
