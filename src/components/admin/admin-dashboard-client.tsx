"use client";

import React, { useState } from "react";
import {
  AdminPlatformStats,
  AdminUserListItem,
  AdminUserDetail,
} from "@/types/admin";
import {
  getAdminUsersAction,
  getAdminUserDetailAction,
  adminDeleteUserAction,
  getAdminPlatformStatsAction,
} from "@/app/actions/admin";
import { AdminUserInspectorModal } from "./admin-user-inspector-modal";
import { AdminCreateUserModal } from "./admin-create-user-modal";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";

interface AdminDashboardClientProps {
  initialStats: AdminPlatformStats;
  initialUsers: AdminUserListItem[];
  totalUsersCount: number;
}

export function AdminDashboardClient({
  initialStats,
  initialUsers,
  totalUsersCount,
}: AdminDashboardClientProps) {
  const { t, locale } = useI18n();

  // State
  const [stats, setStats] = useState<AdminPlatformStats>(initialStats);
  const [users, setUsers] = useState<AdminUserListItem[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<"telemetry" | "users">("telemetry");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Inspector modal state
  const [inspectedUser, setInspectedUser] = useState<AdminUserDetail | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isLoadingInspector, setIsLoadingInspector] = useState(false);
  const [inspectingUserId, setInspectingUserId] = useState<string | null>(null);

  // Create user modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Action status state
  const [actionBusyUserId, setActionBusyUserId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Reload stats
  const refreshStats = async () => {
    const res = await getAdminPlatformStatsAction();
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  // Fetch / search users
  const handleFilterUsers = async (query = searchQuery, role = roleFilter, status = statusFilter) => {
    setIsLoadingUsers(true);
    const res = await getAdminUsersAction({ query, role, status, page: 1, limit: 50 });
    setIsLoadingUsers(false);
    if (res.success && res.data) {
      setUsers(res.data.users);
    }
  };

  // Open Inspector
  const handleOpenInspector = async (userId: string) => {
    setInspectingUserId(userId);
    setIsLoadingInspector(true);
    const res = await getAdminUserDetailAction(userId);
    setIsLoadingInspector(false);
    setInspectingUserId(null);
    if (res.success && res.data) {
      setInspectedUser(res.data);
      setIsInspectorOpen(true);
    } else {
      showFeedback(res.error || t.admin.prompts.userDetailError);
    }
  };

  // Create User Success Handler
  const handleCreateUserSuccess = (newUser: AdminUserListItem) => {
    setUsers((prev) => [newUser, ...prev]);
    showFeedback(`Pengguna @${newUser.username || newUser.name} berhasil ditambahkan.`);
    refreshStats();
  };


  // Delete user
  const handleDeleteUser = async (user: AdminUserListItem) => {
    if (
      !confirm(
        t.admin.prompts.confirmDeleteUser
          .replace("{username}", user.username || "")
          .replace("{email}", user.email || "-")
      )
    ) {
      return;
    }

    setActionBusyUserId(user.id);
    const res = await adminDeleteUserAction(user.id);
    setActionBusyUserId(null);

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showFeedback(
        t.admin.prompts.userDeletedFeedback.replace(
          "{username}",
          user.username || ""
        )
      );
      refreshStats();
    } else {
      showFeedback(res.error || t.admin.prompts.userDeleteError);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-[#FFDE59] text-[#0D0D0D] border-3 border-black shadow-[4px_4px_0px_#000] font-mono text-xs font-black uppercase flex items-center gap-2 animate-in slide-in-from-top-3">
          <span className="material-symbols-outlined text-base">info</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-black uppercase px-2.5 py-0.5 bg-[#FFDE59] text-[#0D0D0D] border border-black">
              {t.admin.header.enterpriseBadge}
            </span>
            <span className="text-xs font-mono text-neutral-500 font-bold">
              {t.admin.header.controlCenter}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            <span>{t.admin.header.title}</span>
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1">
            {t.admin.header.subtitle}
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-2.5 text-xs font-mono font-black uppercase brutal-border-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "telemetry"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7] hover:bg-[#FFF2CE]"
            }`}
          >
            <span className="material-symbols-outlined text-base">monitoring</span>
            <span>{t.admin.tabs.telemetry}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-xs font-mono font-black uppercase brutal-border-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7] hover:bg-[#FFF2CE]"
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>{t.admin.tabs.users}</span>
            <span className="px-1.5 py-0.2 bg-[#FFDE59] text-[#0D0D0D] text-[10px] font-bold">
              {totalUsersCount}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE PLATFORM TELEMETRY & ANALYTICS */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          {/* KPI Grid (6 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Users */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.totalUsers}
                </span>
                <span className="material-symbols-outlined text-xl text-[#3772FF]">
                  groups
                </span>
              </div>
              <div className="text-3xl font-black">{stats.totalUsers}</div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-2 pt-1">
                <span className="text-[#06D6A0] font-bold">● {stats.activeUsers} {t.admin.telemetry.activeBadge}</span>
                <span>•</span>
                <span className="text-rose-500 font-bold">● {stats.suspendedUsers} {t.admin.telemetry.suspendedBadge}</span>
              </div>
            </div>

            {/* Card 2: Global Clicks */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.globalClicks}
                </span>
                <span className="material-symbols-outlined text-xl text-[#FF5CAA]">
                  ads_click
                </span>
              </div>
              <div className="text-3xl font-black">{stats.totalClicks.toLocaleString()}</div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                {t.admin.telemetry.avgClicksPrefix} <strong>{stats.avgClicksPerUser}</strong> {t.admin.telemetry.clicksPerCreator}
              </div>
            </div>

            {/* Card 3: Total Links */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.totalLinks}
                </span>
                <span className="material-symbols-outlined text-xl text-[#06D6A0]">
                  link
                </span>
              </div>
              <div className="text-3xl font-black">{stats.totalLinks}</div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                <strong>{stats.activeLinks}</strong> {t.admin.telemetry.linksLiveSubtitle}
              </div>
            </div>

            {/* Card 4: Avg Links */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.contentDensity}
                </span>
                <span className="material-symbols-outlined text-xl text-[#FFDE59]">
                  layers
                </span>
              </div>
              <div className="text-3xl font-black">{stats.avgLinksPerUser}</div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                {t.admin.telemetry.avgLinksDesc}
              </div>
            </div>

            {/* Card 5: Super Admins */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.superAdmins}
                </span>
                <span className="material-symbols-outlined text-xl text-purple-600">
                  verified_user
                </span>
              </div>
              <div className="text-3xl font-black">{stats.superAdminCount}</div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                {t.admin.telemetry.superAdminDesc}
              </div>
            </div>

            {/* Card 6: Health */}
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-mono font-bold uppercase">
                  {t.admin.telemetry.systemStatus}
                </span>
                <span className="material-symbols-outlined text-xl text-[#06D6A0]">
                  health_and_safety
                </span>
              </div>
              <div className="text-xl font-black text-[#06D6A0] uppercase tracking-wider flex items-center gap-1.5 mt-1">
                <span className="w-3 h-3 rounded-full bg-[#06D6A0] animate-ping" />
                <span>{t.admin.telemetry.systemOperational}</span>
              </div>
              <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400 pt-1">
                {t.admin.telemetry.systemSubtitle}
              </div>
            </div>
          </div>

          {/* 2-Column Analytics: Top Creators & Real-Time Event Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Top 5 Performing Creators (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <h2 className="text-sm font-black uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">workspace_premium</span>
                  <span>{t.admin.telemetry.topCreators}</span>
                </h2>
                <span className="text-[11px] font-mono text-neutral-500">
                  {t.admin.telemetry.byMostClicks}
                </span>
              </div>

              {stats.topPerformingUsers.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-neutral-500">
                  {t.admin.telemetry.noCreators}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.topPerformingUsers.map((creator, idx) => (
                    <div
                      key={creator.id}
                      className="p-3 brutal-border-sm bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>

                        {creator.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={creator.image}
                            alt={creator.name || "User"}
                            className="w-8 h-8 border border-black object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-[#FFDE59] text-black border border-black flex items-center justify-center font-bold text-xs shrink-0">
                            {(creator.name || creator.username || "U")[0]?.toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate">
                            {creator.name || creator.username}
                          </div>
                          <Link
                            href={`/${creator.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono text-[#3772FF] hover:underline"
                          >
                            @{creator.username}
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-black text-xs">
                            {creator.totalClicks.toLocaleString()} {t.admin.telemetry.clicksUnit}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500">
                            {creator.linkCount} {t.admin.telemetry.linksUnit}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenInspector(creator.id)}
                          className="p-1 px-2 bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7] brutal-border-sm text-xs font-mono font-bold hover:bg-[#FFDE59] hover:text-[#0D0D0D] cursor-pointer"
                          title={t.admin.telemetry.inspectTooltip}
                        >
                          {t.admin.telemetry.inspectBtn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Real-Time Event Stream (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#1C1B1A] brutal-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <h2 className="text-sm font-black uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">history</span>
                  <span>{t.admin.telemetry.recentActivity}</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#06D6A0] text-[#0D0D0D] border border-black font-bold">
                  {t.admin.telemetry.liveBadge}
                </span>
              </div>

              {stats.recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-neutral-500">
                  {t.admin.telemetry.noActivity}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity, idx) => {
                    const isSelfDeleted = activity.type === "USER_SELF_DELETED";
                    const isAdminDeleted = activity.type === "USER_DELETED_BY_ADMIN";
                    const isRegistered = activity.type === "USER_REGISTERED";

                    const icon = isAdminDeleted
                      ? "delete_forever"
                      : isSelfDeleted
                      ? "person_remove"
                      : isRegistered
                      ? "person_add"
                      : "add_link";

                    const iconStyle = isAdminDeleted
                      ? "bg-rose-600 text-white"
                      : isSelfDeleted
                      ? "bg-[#FB8500] text-black"
                      : isRegistered
                      ? "bg-[#3772FF] text-white"
                      : "bg-[#FFDE59] text-black";

                    const badgeText = isAdminDeleted
                      ? t.admin.telemetry.badgeAdminDeleted
                      : isSelfDeleted
                      ? t.admin.telemetry.badgeSelfDeleted
                      : isRegistered
                      ? t.admin.telemetry.badgeRegistered
                      : t.admin.telemetry.badgeLink;

                    const badgeStyle = isAdminDeleted
                      ? "bg-rose-100 text-rose-900 border-rose-600"
                      : isSelfDeleted
                      ? "bg-amber-100 text-amber-900 border-amber-600"
                      : isRegistered
                      ? "bg-blue-100 text-blue-900 border-blue-600"
                      : "bg-yellow-100 text-yellow-900 border-yellow-600";

                    // Dynamic localized title & subtitle
                    const cleanTarget =
                      activity.targetName ||
                      (activity.title.includes(": @")
                        ? activity.title.split(": @")[1]
                        : activity.title.includes('"')
                        ? activity.title.split('"')[1]
                        : activity.title.split(": ")[1] || "");

                    let localizedTitle = activity.title;
                    let localizedSubtitle = activity.subtitle;

                    if (isRegistered) {
                      const username = cleanTarget || activity.subtitle || "user";
                      localizedTitle = `${t.admin.telemetry.userRegisteredTitle}: @${username}`;
                      localizedSubtitle =
                        activity.subtitle && activity.subtitle !== "Akun Baru"
                          ? activity.subtitle.replace("Registrasi via", locale === "en" ? "Registered via" : "Registrasi via")
                          : t.admin.telemetry.newAccount;
                    } else if (activity.type === "LINK_CREATED") {
                      const linkTitle = cleanTarget || activity.title;
                      localizedTitle = `${t.admin.telemetry.linkCreatedTitle}: "${linkTitle}"`;
                      if (activity.subtitle && activity.subtitle.includes("•")) {
                        const creatorPart = activity.actorName || activity.subtitle.split("@")[1]?.split(" ")[0] || "creator";
                        const categoryPart = activity.subtitle.split(": ")[1] || "CUSTOM";
                        localizedSubtitle = `${t.admin.telemetry.byCreator} @${creatorPart} • ${t.admin.telemetry.categoryLabel} ${categoryPart}`;
                      }
                    } else if (isSelfDeleted) {
                      const username = cleanTarget || "user";
                      localizedTitle = `${t.admin.telemetry.userSelfDeletedTitle}: @${username}`;
                      if (activity.subtitle) {
                        localizedSubtitle = activity.subtitle.replace(
                          "Tindakan mandiri pengguna",
                          locale === "en" ? "User self-action" : "Tindakan mandiri pengguna"
                        );
                      }
                    } else if (isAdminDeleted) {
                      const username = cleanTarget || "user";
                      localizedTitle = `${t.admin.telemetry.userAdminDeletedTitle}: @${username}`;
                      if (activity.subtitle) {
                        localizedSubtitle = activity.subtitle.replace(
                          "Dihapus oleh Super Admin",
                          locale === "en" ? "Deleted by Super Admin" : "Dihapus oleh Super Admin"
                        );
                      }
                    }

                    return (
                      <div
                        key={activity.id || idx}
                        className="p-2.5 brutal-border-sm bg-[#FFF8E7] dark:bg-[#1A1A1A] flex items-start gap-2.5 hover:bg-white dark:hover:bg-[#252422] transition-colors"
                      >
                        <span
                          className={`material-symbols-outlined text-base p-1 border border-black shrink-0 ${iconStyle}`}
                        >
                          {icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 text-[9px] font-mono font-black uppercase border ${badgeStyle}`}
                            >
                              {badgeText}
                            </span>
                            <span className="font-bold text-xs truncate leading-snug">
                              {localizedTitle}
                            </span>
                          </div>
                          {localizedSubtitle && (
                            <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                              {localizedSubtitle}
                            </div>
                          )}
                          <div className="text-[9px] font-mono text-neutral-400 mt-0.5">
                            {new Date(activity.timestamp).toLocaleString(
                              locale === "en" ? "en-US" : "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "short",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT & PUBLIC BIO MODERATION */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-72 md:w-80">
                <span className="absolute left-3 top-2.5 material-symbols-outlined text-lg text-neutral-500">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterUsers(e.target.value, roleFilter, statusFilter);
                  }}
                  placeholder={t.admin.users.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#1A1A1A] brutal-border-sm focus:outline-none"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                {/* Role filter */}
                <div className="flex items-center gap-1">
                  <span className="text-neutral-500 text-[11px]">{t.admin.users.filterRole}</span>
                  {["ALL", "USER", "SUPER_ADMIN"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRoleFilter(r);
                        handleFilterUsers(searchQuery, r, statusFilter);
                      }}
                      className={`px-2.5 py-1 brutal-border-sm uppercase cursor-pointer ${
                        roleFilter === r
                          ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                          : "bg-white dark:bg-[#252422]"
                      }`}
                    >
                      {r === "ALL" ? t.admin.users.filterAll : r === "SUPER_ADMIN" ? t.admin.users.filterAdmin : t.admin.users.filterUser}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 sm:ml-2">
                  <span className="text-neutral-500 text-[11px]">{t.admin.users.filterStatus}</span>
                  {["ALL", "ACTIVE", "SUSPENDED"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStatusFilter(s);
                        handleFilterUsers(searchQuery, roleFilter, s);
                      }}
                      className={`px-2.5 py-1 brutal-border-sm uppercase cursor-pointer ${
                        statusFilter === s
                          ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                          : "bg-white dark:bg-[#252422]"
                      }`}
                    >
                      {s === "ALL" ? t.admin.users.filterAll : s === "ACTIVE" ? t.admin.users.filterActive : t.admin.users.filterSuspended}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-9 px-4 bg-[#06D6A0] hover:bg-[#05b98a] text-black font-mono font-bold text-xs brutal-border-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>{t.admin.users.btnAddUser}</span>
            </button>
          </div>

          {/* User Table */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#FFF8E7] dark:bg-[#252422] border-b-2 border-black dark:border-white font-black uppercase text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <th className="p-3 sm:p-4">{t.admin.users.colUser}</th>
                    <th className="p-3 sm:p-4 hidden md:table-cell">{t.admin.users.colEmail}</th>
                    <th className="p-3 sm:p-4">{t.admin.users.colRole}</th>
                    <th className="p-3 sm:p-4">{t.admin.users.colStatus}</th>
                    <th className="p-3 sm:p-4 text-center">{t.admin.users.colLinks}</th>
                    <th className="p-3 sm:p-4 text-center">{t.admin.users.colClicks}</th>
                    <th className="p-3 sm:p-4 text-right">{t.admin.users.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        {t.admin.users.loadingUsers}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-500">
                        {t.admin.users.noUsersFound}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#FFFDF7] dark:hover:bg-[#1F1E1D] transition-colors"
                      >
                        {/* User identity */}
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-2.5">
                            {user.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={user.image}
                                alt={user.name || "Avatar"}
                                className="w-8 h-8 border border-black object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-[#FFDE59] text-[#0D0D0D] border border-black flex items-center justify-center font-bold text-xs shrink-0">
                                {(user.name || user.username || "U")[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-xs truncate">
                                {user.name || user.username}
                              </div>
                              <Link
                                href={`/${user.username}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#3772FF] hover:underline"
                              >
                                @{user.username || "unset"}
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="p-3 sm:p-4 hidden md:table-cell text-neutral-600 dark:text-neutral-400">
                          {user.email || "-"}
                        </td>

                        {/* Role Badge */}
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-black ${
                              user.role === "SUPER_ADMIN"
                                ? "bg-black text-white dark:bg-white dark:text-black font-black"
                                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-black ${
                              user.status === "ACTIVE"
                                ? "bg-[#06D6A0] text-[#0D0D0D]"
                                : "bg-rose-500 text-white"
                            }`}
                          >
                            {user.status === "ACTIVE" ? t.admin.users.statusActive : t.admin.users.statusSuspended}
                          </span>
                        </td>

                        {/* Total Links */}
                        <td className="p-3 sm:p-4 text-center font-bold">
                          {user._count.links}
                        </td>

                        {/* Total Clicks */}
                        <td className="p-3 sm:p-4 text-center font-bold">
                          {user.totalClicks.toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="p-3 sm:p-4 text-right">
                          <div className="flex items-center justify-end gap-2 shrink-0">
                            {/* Manage User (Full CRUD Modal) */}
                            <button
                              type="button"
                              disabled={isLoadingInspector && inspectingUserId === user.id}
                              onClick={() => handleOpenInspector(user.id)}
                              className="h-8 px-3 bg-[#FFDE59] hover:bg-[#FFE8A3] text-[#0D0D0D] brutal-border-sm font-mono font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-transform active:translate-x-0.5 active:translate-y-0.5"
                              title={t.admin.users.manageTooltip}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isLoadingInspector && inspectingUserId === user.id ? "sync" : "tune"}
                              </span>
                              <span>{t.admin.users.btnManage}</span>
                            </button>

                            {/* Delete User Button */}
                            <button
                              type="button"
                              disabled={actionBusyUserId === user.id}
                              onClick={() => handleDeleteUser(user)}
                              className="h-8 w-8 bg-white dark:bg-[#252422] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 brutal-border-sm flex items-center justify-center shadow-[2px_2px_0px_0px_#000] cursor-pointer shrink-0 transition-transform active:translate-x-0.5 active:translate-y-0.5"
                              title={t.admin.users.tooltipDeleteUser}
                              aria-label={t.admin.users.tooltipDeleteUser}
                            >
                              <span className="material-symbols-outlined text-sm leading-none">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION & USER EDIT MODAL */}
      <AdminUserInspectorModal
        user={inspectedUser}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setInspectedUser(null);
        }}
        onRefresh={() => {
          if (inspectedUser) {
            handleOpenInspector(inspectedUser.id);
            handleFilterUsers();
            refreshStats();
          }
        }}
      />

      {/* CREATE USER MODAL */}
      <AdminCreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateUserSuccess}
      />
    </div>
  );
}
