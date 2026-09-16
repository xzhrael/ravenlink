import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Profil - Ravenlink",
  description: "Kelola profil dan klaim alamat URL bio-link unik Anda.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      bio: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
      <PasswordForm hasPassword={!!user.password} />
      <DangerZone userRole={user.role} />
    </div>
  );
}
