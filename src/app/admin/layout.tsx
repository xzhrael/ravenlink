import React from "react";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/providers/session-provider";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Super Admin Command Center | Ravenlink",
  description: "Enterprise Super Admin Command Center and Platform Telemetry",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const userImage = session.user.image;
  const userName = session.user.name || session.user.email || "Super Admin";

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-[#FFF8E7] dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#FFF8E7]">
        <AdminNav
          userName={userName}
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
