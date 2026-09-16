import React from "react";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Gunakan data dari JWT session yang sudah tersedia tanpa database round-trip
  let username = session.user.username;
  let userImage = session.user.image;
  let userName = session.user.name || session.user.email || "Pengguna";
  let userRole = session.user.role;

  // Fallback ke database hanya jika data sesi belum lengkap (misal pengguna baru register)
  if (!username && session.user.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        name: true,
        image: true,
        role: true,
        email: true,
      },
    });
    if (dbUser) {
      username = dbUser.username;
      userImage = dbUser.image || userImage;
      userName = dbUser.name || dbUser.email || userName;
      userRole = dbUser.role || userRole;
    }
  }

  const finalUsername = username || "setup";

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
        <DashboardNav
          username={finalUsername}
          userName={userName}
          userRole={userRole}
          userImage={userImage}
          signOutAction={handleSignOut}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
