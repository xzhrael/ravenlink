import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardOverviewClient } from "@/components/dashboard/dashboard-overview-client";

export default async function DashboardPage() {
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

  const links = user.links || [];
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.isActive).length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  const serializedUser = {
    name: user.name,
    username: user.username || "setup",
    themeAccent: user.themeAccent || "#3772FF",
    themeCardStyle: user.themeCardStyle || "brutal-solid",
  };

  const serializedLinks = links.map((l) => ({
    id: l.id,
    title: l.title,
    url: l.url,
    icon: l.icon,
    clicks: l.clicks,
    isActive: l.isActive,
  }));

  return (
    <DashboardOverviewClient
      user={serializedUser}
      links={serializedLinks}
      totalLinks={totalLinks}
      activeLinks={activeLinks}
      totalClicks={totalClicks}
    />
  );
}
