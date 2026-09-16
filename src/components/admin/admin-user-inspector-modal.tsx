"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminUserDetail, AdminThemeOverrideInput } from "@/types/admin";
import { ColorPicker } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import {
  adminUpdateUserThemeAction,
  adminToggleUserLinkAction,
  adminDeleteUserLinkAction,
  adminReorderUserLinksAction,
  adminUpdateUserAction,
} from "@/app/actions/admin";
import { checkUsernameAction } from "@/app/actions/user";
import { sanitizeUsername } from "@/lib/username";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";

interface AdminUserInspectorModalProps {
  user: AdminUserDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

interface AdminSortableLinkItemProps {
  link: AdminUserDetail["links"][number];
  index: number;
  busyLinkId: string | null;
  onToggle: (linkId: string, currentActive: boolean) => void;
  onDelete: (linkId: string) => void;
  deactivateLabel: string;
  activateLabel: string;
}

function AdminSortableLinkItem({
  link,
  index,
  busyLinkId,
  onToggle,
  onDelete,
  deactivateLabel,
  activateLabel,
}: AdminSortableLinkItemProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 brutal-border-sm flex items-center justify-between gap-3 transition-all ${
        isDragging
          ? "opacity-50 scale-[1.02] z-40 bg-[#FFDE59] border-dashed shadow-[6px_6px_0px_#000]"
          : link.isActive
          ? "bg-[#FFF8E7] dark:bg-[#1A1A1A] shadow-[2px_2px_0px_#000]"
          : "bg-neutral-100 dark:bg-neutral-800 opacity-60 border-neutral-400"
      }`}
    >
      {/* Drag handle & Order badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-black dark:hover:text-white select-none transition-colors"
          title={t.admin.inspector.dragTooltip}
          aria-label={t.admin.inspector.dragTooltip}
        >
          <span className="material-symbols-outlined text-lg leading-none">
            drag_indicator
          </span>
        </button>
        <span className="w-6 h-6 flex items-center justify-center font-mono font-black text-[11px] bg-black text-white dark:bg-white dark:text-black border border-black">
          #{index + 1}
        </span>
      </div>

      {/* Link Title & Destination Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {link.icon && (
            <span className="material-symbols-outlined text-sm shrink-0">
              {link.icon}
            </span>
          )}
          <span className="font-mono font-bold text-xs truncate text-[#0D0D0D] dark:text-[#FFF8E7]">
            {link.title}
          </span>
          <span className="px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-700 text-[9px] font-mono uppercase font-bold shrink-0">
            {link.category}
          </span>
        </div>
        <div className="text-[11px] font-mono text-neutral-500 truncate mt-0.5">
          {link.url}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={busyLinkId === link.id}
          onClick={() => onToggle(link.id, link.isActive)}
          className={`px-2 py-1 text-[10px] font-mono font-bold uppercase brutal-border-sm cursor-pointer transition-colors ${
            link.isActive
              ? "bg-[#06D6A0] text-[#0D0D0D] hover:bg-[#05b889]"
              : "bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          {link.isActive ? deactivateLabel : activateLabel}
        </button>
        <button
          type="button"
          disabled={busyLinkId === link.id}
          onClick={() => onDelete(link.id)}
          className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-600 cursor-pointer"
          title={t.admin.inspector.deleteLink}
          aria-label={t.admin.inspector.deleteLink}
        >
          <span className="material-symbols-outlined text-base leading-none">
            delete
          </span>
        </button>
      </div>
    </div>
  );
}

export function AdminUserInspectorModal({
  user,
  isOpen,
  onClose,
  onRefresh,
}: AdminUserInspectorModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"profile" | "links" | "theme">("profile");

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<"USER" | "SUPER_ADMIN">(
    (user?.role as "USER" | "SUPER_ADMIN") || "USER"
  );
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "SUSPENDED">(
    (user?.status as "ACTIVE" | "SUSPENDED") || "ACTIVE"
  );
  const [editBio, setEditBio] = useState(user?.bio || "");
  const [editImage, setEditImage] = useState(user?.image || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMessage, setProfileSavedMessage] = useState<string | null>(null);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);
  const [usernameCheckError, setUsernameCheckError] = useState<string | null>(null);

  const [themeSettings, setThemeSettings] = useState<AdminThemeOverrideInput>(() => ({
    themeBackground: user?.themeBackground || "#FFF8E7",
    themeButtonColor: user?.themeButtonColor || "#FFDE59",
    themeButtonTextColor: user?.themeButtonTextColor || "#0D0D0D",
    themeAccent: user?.themeAccent || "#3772FF",
    themeTextColor: user?.themeTextColor || "#0D0D0D",
    themeCardStyle: user?.themeCardStyle || "brutal-solid",
    themeFont: user?.themeFont || "space-grotesk",
  }));

  const [links, setLinks] = useState<AdminUserDetail["links"]>(() =>
    user ? [...user.links].sort((a, b) => a.position - b.position) : []
  );
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      setEditUsername(user.username || "");
      setEditPassword("");
      setEditRole((user.role as "USER" | "SUPER_ADMIN") || "USER");
      setEditStatus((user.status as "ACTIVE" | "SUSPENDED") || "ACTIVE");
      setEditBio(user.bio || "");
      setEditImage(user.image || "");
      setProfileSavedMessage(null);
      setProfileErrorMessage(null);
      setUsernameCheckError(null);
      setLinks([...user.links].sort((a, b) => a.position - b.position));
      setThemeSettings({
        themeBackground: user.themeBackground || "#FFF8E7",
        themeButtonColor: user.themeButtonColor || "#FFDE59",
        themeButtonTextColor: user.themeButtonTextColor || "#0D0D0D",
        themeAccent: user.themeAccent || "#3772FF",
        themeTextColor: user.themeTextColor || "#0D0D0D",
        themeCardStyle: user.themeCardStyle || "brutal-solid",
        themeFont: user.themeFont || "space-grotesk",
      });
    }
  }, [user]);

  const handleUsernameChange = async (val: string) => {
    const clean = sanitizeUsername(val);
    setEditUsername(clean);

    if (!clean || clean === user?.username) {
      setUsernameCheckError(null);
      return;
    }

    if (clean.length < 3) {
      setUsernameCheckError("Username minimal 3 karakter.");
      return;
    }

    setUsernameCheckLoading(true);
    const res = await checkUsernameAction(clean);
    setUsernameCheckLoading(false);

    if (!res.available) {
      setUsernameCheckError(res.error || "Username sudah digunakan.");
    } else {
      setUsernameCheckError(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || usernameCheckError || isSavingProfile) return;

    setIsSavingProfile(true);
    setProfileSavedMessage(null);
    setProfileErrorMessage(null);

    const res = await adminUpdateUserAction(user.id, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      username: editUsername.trim(),
      password: editPassword ? editPassword.trim() : undefined,
      role: editRole,
      status: editStatus,
      bio: editBio.trim() || undefined,
      image: editImage.trim() || undefined,
    });

    setIsSavingProfile(false);

    if (res.success && res.user) {
      setProfileSavedMessage("Data profil dan akun pengguna berhasil disimpan.");
      setEditPassword("");
      setTimeout(() => setProfileSavedMessage(null), 3500);
      onRefresh();
    } else {
      setProfileErrorMessage(res.error || "Gagal memperbarui data pengguna.");
    }
  };

  if (!isOpen || !user) return null;

  const handleSaveTheme = async () => {
    setIsSavingTheme(true);
    setThemeSaved(false);
    const res = await adminUpdateUserThemeAction(user.id, themeSettings);
    setIsSavingTheme(false);
    if (res.success) {
      setThemeSaved(true);
      setTimeout(() => setThemeSaved(false), 3500);
      onRefresh();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((item) => item.id === active.id);
    const newIndex = links.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(links, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      position: idx,
    }));

    setLinks(reordered);
    setIsReordering(true);

    const payload = reordered.map((l) => ({
      id: l.id,
      position: l.position,
    }));

    const res = await adminReorderUserLinksAction(user.id, payload);
    setIsReordering(false);

    if (res.success) {
      onRefresh();
    } else {
      setLinks([...user.links].sort((a, b) => a.position - b.position));
      alert(res.error || t.admin.inspector.errorReorder);
    }
  };

  const handleToggleLink = async (linkId: string, currentActive: boolean) => {
    setBusyLinkId(linkId);
    setLinks((prev) =>
      prev.map((l) => (l.id === linkId ? { ...l, isActive: !currentActive } : l))
    );
    const res = await adminToggleUserLinkAction(linkId, !currentActive);
    setBusyLinkId(null);
    if (!res.success) {
      setLinks([...user.links].sort((a, b) => a.position - b.position));
      alert(res.error || t.admin.inspector.errorToggleStatus);
    } else {
      onRefresh();
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm(t.admin.inspector.confirmDeleteLink)) return;
    setBusyLinkId(linkId);
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
    const res = await adminDeleteUserLinkAction(linkId);
    setBusyLinkId(null);
    if (!res.success) {
      setLinks([...user.links].sort((a, b) => a.position - b.position));
      alert(res.error || t.admin.inspector.errorDeleteLink);
    } else {
      onRefresh();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFF8E7] dark:bg-[#141414] brutal-card w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[92vh] border-4 border-black dark:border-white shadow-[10px_10px_0px_#000]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-white dark:bg-[#1C1B1A] border-b-3 border-black dark:border-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-10 h-10 border-2 border-black dark:border-white object-cover shadow-[2px_2px_0px_#000]"
              />
            ) : (
              <div className="w-10 h-10 bg-[#FFDE59] text-[#0D0D0D] border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_#000]">
                {(user.name || user.username || "U")[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base uppercase truncate text-[#0D0D0D] dark:text-[#FFF8E7]">
                  {user.name || user.username}
                </h2>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border border-black ${
                    user.status === "ACTIVE"
                      ? "bg-[#06D6A0] text-[#0D0D0D]"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {user.status}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-black text-white dark:bg-white dark:text-black">
                  {user.role}
                </span>
              </div>
              <div className="text-xs font-mono text-neutral-500 flex items-center gap-2 mt-0.5">
                <span>@{user.username || "unset"}</span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.username && (
              <Link
                href={`/${user.username}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-[#FFF2CE] dark:bg-[#252422] brutal-border-sm text-xs font-mono font-bold hover:bg-[#FFE8A3]"
                title={t.admin.inspector.openInNew}
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>/{user.username}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 px-2.5 bg-[#FFDE59] text-[#0D0D0D] brutal-border-sm font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
              <span>{t.common.close}</span>
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns (Controls on Left, Live Bio Preview Simulator on Right) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tabbed Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tab Selector */}
            <div className="flex bg-white dark:bg-[#1C1B1A] brutal-card p-1.5 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                    : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
                }`}
              >
                <span className="material-symbols-outlined text-base">manage_accounts</span>
                <span>Profil & Akun</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("links")}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "links"
                    ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                    : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
                }`}
              >
                <span className="material-symbols-outlined text-base">link</span>
                <span>{t.admin.inspector.tabLinks}</span>
                <span className="px-1.5 py-0.2 bg-black text-white dark:bg-white dark:text-black text-[10px]">
                  {links.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("theme")}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "theme"
                    ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                    : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
                }`}
              >
                <span className="material-symbols-outlined text-base">palette</span>
                <span>{t.admin.inspector.tabTheme}</span>
              </button>
            </div>

            {/* TAB 1: User Profile & Account CRUD */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
                  <h3 className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">manage_accounts</span>
                    <span>Edit Profil & Kredensial Pengguna</span>
                  </h3>
                </div>

                {profileSavedMessage && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-600 text-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600 shrink-0">check_circle</span>
                    <span>{profileSavedMessage}</span>
                  </div>
                )}

                {profileErrorMessage && (
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-600 text-rose-900 dark:text-rose-200 text-xs font-mono font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-rose-600 shrink-0">error</span>
                    <span>{profileErrorMessage}</span>
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Nama Pengguna *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#252422] brutal-border-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#252422] brutal-border-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Username / Alamat Bio *
                    </label>
                    <div className="flex items-stretch brutal-border-sm bg-[#FFF2CE] dark:bg-[#252422]">
                      <span className="px-2 py-2 text-[11px] font-mono font-bold text-neutral-500 border-r border-black select-none flex items-center">
                        /
                      </span>
                      <input
                        type="text"
                        required
                        value={editUsername}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="flex-1 px-2.5 py-2 text-xs font-mono font-bold bg-[#FFF8E7] dark:bg-[#252422] text-black dark:text-white focus:outline-none"
                      />
                    </div>
                    {usernameCheckLoading && (
                      <div className="text-[10px] font-mono text-neutral-500 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                        Memeriksa ketersediaan...
                      </div>
                    )}
                    {usernameCheckError && (
                      <div className="text-[10px] font-mono text-rose-600 font-bold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        {usernameCheckError}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Ganti Password (Opsional)
                    </label>
                    <input
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak diubah"
                      className="w-full px-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#252422] brutal-border-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Role & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Hak Akses (Role)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditRole("USER")}
                        className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase brutal-border-sm cursor-pointer transition-all ${
                          editRole === "USER"
                            ? "bg-[#FFDE59] text-[#0D0D0D] font-black shadow-[2px_2px_0px_#000]"
                            : "bg-[#FFF8E7] dark:bg-[#252422] opacity-60"
                        }`}
                      >
                        USER
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditRole("SUPER_ADMIN")}
                        className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase brutal-border-sm cursor-pointer transition-all ${
                          editRole === "SUPER_ADMIN"
                            ? "bg-black text-white dark:bg-white dark:text-black font-black shadow-[2px_2px_0px_#000]"
                            : "bg-[#FFF8E7] dark:bg-[#252422] opacity-60"
                        }`}
                      >
                        SUPER ADMIN
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                      Status Akun
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditStatus("ACTIVE")}
                        className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase brutal-border-sm cursor-pointer transition-all ${
                          editStatus === "ACTIVE"
                            ? "bg-[#06D6A0] text-[#0D0D0D] font-black shadow-[2px_2px_0px_#000]"
                            : "bg-[#FFF8E7] dark:bg-[#252422] opacity-60"
                        }`}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus("SUSPENDED")}
                        className={`flex-1 py-1.5 px-2 text-xs font-mono font-bold uppercase brutal-border-sm cursor-pointer transition-all ${
                          editStatus === "SUSPENDED"
                            ? "bg-rose-500 text-white font-black shadow-[2px_2px_0px_#000]"
                            : "bg-[#FFF8E7] dark:bg-[#252422] opacity-60"
                        }`}
                      >
                        SUSPENDED
                      </button>
                    </div>
                  </div>
                </div>

                {/* Avatar URL & Bio */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                    URL Foto Avatar (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://... (URL gambar)"
                    className="w-full px-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#252422] brutal-border-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                    Bio Profil
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={2}
                    placeholder="Deskripsi singkat profil kreator..."
                    className="w-full px-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#252422] brutal-border-sm focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingProfile}
                    disabled={!!usernameCheckError}
                  >
                    <span className="material-symbols-outlined text-sm">save</span>
                    <span>Simpan Perubahan Pengguna</span>
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: User's Public Links */}
            {activeTab === "links" && (
              <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
                  <h3 className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">format_list_bulleted</span>
                    <span>{t.admin.inspector.registeredLinks} ({links.length})</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                    {isReordering ? (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                        <span>{t.admin.inspector.reorderSaving}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">drag_pan</span>
                        <span>{t.admin.inspector.reorderDragHint}</span>
                      </span>
                    )}
                  </div>
                </div>

                {links.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-neutral-500">
                    <span className="material-symbols-outlined text-3xl mb-1 block">
                      link_off
                    </span>
                    {t.admin.inspector.noLinks}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={links.map((l) => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2.5">
                        {links.map((link, idx) => (
                          <AdminSortableLinkItem
                            key={link.id}
                            link={link}
                            index={idx}
                            busyLinkId={busyLinkId}
                            onToggle={handleToggleLink}
                            onDelete={handleDeleteLink}
                            deactivateLabel={t.admin.inspector.deactivateLink}
                            activateLabel={t.admin.inspector.activateLink}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}

            {/* TAB 2: User's Public Theme Override */}
            {activeTab === "theme" && (
              <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
                  <h3 className="font-mono text-xs font-black uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">palette</span>
                    <span>{t.admin.inspector.tabTheme}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {t.admin.inspector.themeSubtitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPicker
                    label={t.admin.inspector.bgBioLabel}
                    value={themeSettings.themeBackground}
                    onChange={(val) =>
                      setThemeSettings({ ...themeSettings, themeBackground: val })
                    }
                  />
                  <ColorPicker
                    label={t.admin.inspector.accentColorLabel}
                    value={themeSettings.themeAccent}
                    onChange={(val) =>
                      setThemeSettings({ ...themeSettings, themeAccent: val })
                    }
                  />
                  <ColorPicker
                    label={t.admin.inspector.btnColorLabel}
                    value={themeSettings.themeButtonColor}
                    onChange={(val) =>
                      setThemeSettings({ ...themeSettings, themeButtonColor: val })
                    }
                  />
                  <ColorPicker
                    label={t.admin.inspector.btnTextColorLabel}
                    value={themeSettings.themeButtonTextColor}
                    onChange={(val) =>
                      setThemeSettings({
                        ...themeSettings,
                        themeButtonTextColor: val,
                      })
                    }
                  />
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase mb-1.5">
                      {t.admin.inspector.cardStyleTitle}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "brutal-solid", label: t.admin.inspector.styleHardShadow },
                        { id: "brutal-outline", label: t.admin.inspector.styleOutline },
                        { id: "brutal-flat", label: t.admin.inspector.styleFlat },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() =>
                            setThemeSettings({
                              ...themeSettings,
                              themeCardStyle: style.id,
                            })
                          }
                          className={`p-2 text-xs font-mono font-bold brutal-border-sm cursor-pointer ${
                            themeSettings.themeCardStyle === style.id
                              ? "bg-black text-white dark:bg-white dark:text-black"
                              : "bg-white dark:bg-[#252422]"
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase mb-1.5">
                      {t.admin.inspector.typographyTitle}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setThemeSettings({
                            ...themeSettings,
                            themeFont: "space-grotesk",
                          })
                        }
                        className={`p-2 text-xs font-mono font-bold brutal-border-sm cursor-pointer ${
                          themeSettings.themeFont === "space-grotesk"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white dark:bg-[#252422]"
                        }`}
                      >
                        {t.admin.inspector.fontSans}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setThemeSettings({
                            ...themeSettings,
                            themeFont: "jetbrains-mono",
                          })
                        }
                        className={`p-2 text-xs font-mono font-bold brutal-border-sm cursor-pointer ${
                          themeSettings.themeFont === "jetbrains-mono"
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-white dark:bg-[#252422]"
                        }`}
                      >
                        {t.admin.inspector.fontMono}
                      </button>
                    </div>
                  </div>
                </div>

                {themeSaved && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 brutal-border-sm font-mono text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>{t.admin.inspector.themeSaved}</span>
                  </div>
                )}

                <Button
                  variant="accent"
                  onClick={handleSaveTheme}
                  isLoading={isSavingTheme}
                  className="w-full py-2.5"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{isSavingTheme ? t.admin.inspector.saving : t.admin.inspector.saveTheme}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Live Simulator of User's Public Bio Page (5 cols) */}
          <div className="lg:col-span-5 sticky top-4">
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black dark:border-white">
                <span className="text-xs font-mono font-black uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">smartphone</span>
                  <span>{t.admin.inspector.publicPreview}</span>
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 brutal-border-sm font-bold">
                  /{user.username || "preview"}
                </span>
              </div>

              {/* Phone Frame Simulator */}
              <div
                className="w-full max-w-[320px] mx-auto border-3 border-black dark:border-white p-4 min-h-[440px] flex flex-col justify-between transition-colors shadow-[5px_5px_0px_#000]"
                style={{
                  backgroundColor: themeSettings.themeBackground,
                  color: themeSettings.themeTextColor,
                  fontFamily:
                    themeSettings.themeFont === "jetbrains-mono"
                      ? '"JetBrains Mono", monospace'
                      : '"Space Grotesk", sans-serif',
                }}
              >
                {/* Profile Header */}
                <div className="text-center pt-2 pb-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "Avatar"}
                      className="w-14 h-14 mx-auto mb-2 border-2 border-black object-cover shadow-[2px_2px_0px_#000]"
                    />
                  ) : (
                    <div className="w-14 h-14 mx-auto mb-2 bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#000]">
                      {(user.name || user.username || "U")[0]?.toUpperCase()}
                    </div>
                  )}
                  <h4 className="font-black text-sm uppercase tracking-tight">
                    {user.name || user.username}
                  </h4>
                  <p className="text-[11px] opacity-75 font-mono mt-0.5 line-clamp-2">
                    {user.bio || t.admin.inspector.defaultBioPreview}
                  </p>
                </div>

                {/* Simulated Links */}
                <div className="space-y-2 flex-1 px-1">
                  {links.filter((l) => l.isActive).length === 0 ? (
                    <div className="py-6 text-center text-[10px] font-mono opacity-60">
                      {t.admin.inspector.noActiveLinksPreview}
                    </div>
                  ) : (
                    links
                      .filter((l) => l.isActive)
                      .slice(0, 4)
                      .map((l) => (
                        <div
                          key={l.id}
                          className="p-2.5 border-2 border-black flex items-center gap-2"
                          style={{
                            backgroundColor: themeSettings.themeButtonColor,
                            color: themeSettings.themeButtonTextColor,
                            boxShadow:
                              themeSettings.themeCardStyle === "brutal-solid"
                                ? "3px 3px 0px #000"
                                : themeSettings.themeCardStyle === "brutal-outline"
                                ? "2px 2px 0px #000"
                                : "none",
                          }}
                        >
                          <span
                            className="material-symbols-outlined text-base p-1 border border-black"
                            style={{
                              backgroundColor: themeSettings.themeAccent,
                              color: "#FFFFFF",
                            }}
                          >
                            {l.icon || "link"}
                          </span>
                          <span className="font-bold text-xs truncate flex-1">
                            {l.title}
                          </span>
                          <span className="material-symbols-outlined text-xs">
                            arrow_forward
                          </span>
                        </div>
                      ))
                  )}
                </div>

                {/* Footer Badge */}
                <div className="text-center pt-4 pb-1">
                  <span className="inline-block px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider border border-black bg-white text-black shadow-[1px_1px_0px_#000]">
                    ⚡ {t.publicBio.poweredBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
