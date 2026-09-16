import React from "react";
import {
  getAdminPlatformStatsAction,
  getAdminUsersAction,
} from "@/app/actions/admin";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import type { AdminPlatformStats, AdminUserListItem } from "@/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const statsRes = await getAdminPlatformStatsAction();
  const usersRes = await getAdminUsersAction({ page: 1, limit: 20 });

  const defaultStats: AdminPlatformStats = {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    superAdminCount: 0,
    totalLinks: 0,
    activeLinks: 0,
    totalClicks: 0,
    avgClicksPerUser: 0,
    avgLinksPerUser: 0,
    topPerformingUsers: [],
    recentActivity: [],
  };

  const stats = statsRes.success && statsRes.data ? statsRes.data : defaultStats;
  const users = usersRes.success && usersRes.data?.users ? usersRes.data.users : [];
  const totalUsersCount = usersRes.success && usersRes.data?.totalCount ? usersRes.data.totalCount : 0;

  return (
    <div className="space-y-6">
      <AdminDashboardClient
        initialStats={stats}
        initialUsers={users}
        totalUsersCount={totalUsersCount}
      />
    </div>
  );
}
