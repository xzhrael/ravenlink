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

  // Ambil data user langsung dari database untuk memastikan username dan profil selalu akurat
  const dbUser = session.user.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          username: true,
          name: true,
          image: true,
          role: true,
          email: true,
        },
      })
    : null;

  const username = dbUser?.username || session.user.username || "setup";
  const userImage = dbUser?.image || session.user.image;
  const userName = dbUser?.name || session.user.name || dbUser?.email || session.user.email || "Pengguna";
  const userRole = dbUser?.role || session.user.role;

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
        <DashboardNav
          username={username}
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
