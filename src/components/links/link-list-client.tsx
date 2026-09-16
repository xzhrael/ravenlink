"use client";

import React, { useState, useMemo } from "react";
import { LinkData, LinkFormModal } from "./link-form-modal";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Modal } from "@/components/ui/modal";
import { deleteLinkAction, toggleLinkActiveAction } from "@/app/actions/link";
import { useI18n } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";

interface LinkListClientProps {
  initialLinks: LinkData[];
  username: string;
}

export function LinkListClient({
  initialLinks,
  username,
}: LinkListClientProps) {
  const { t } = useI18n();
  const router = useRouter();

  const [links, setLinks] = useState<LinkData[]>(initialLinks);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkData | null>(null);

  // Delete confirmation modal state
  const [linkToDelete, setLinkToDelete] = useState<LinkData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        (l.subtitle && l.subtitle.toLowerCase().includes(search.toLowerCase()));

      const matchCat =
        selectedCategory === "ALL" || l.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [links, search, selectedCategory]);

  const handleToggleActive = async (link: LinkData) => {
    const updatedStatus = !link.isActive;
    // Optimistic UI update
    setLinks((prev) =>
      prev.map((item) =>
        item.id === link.id ? { ...item, isActive: updatedStatus } : item
      )
    );

    if (link.id) {
      await toggleLinkActiveAction(link.id, updatedStatus);
      router.refresh();
    }
  };

  const handleOpenCreate = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: LinkData) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete?.id) return;
    setIsDeleting(true);
    await deleteLinkAction(linkToDelete.id);
    setIsDeleting(false);
    setLinkToDelete(null);
    setLinks((prev) => prev.filter((item) => item.id !== linkToDelete.id));
    router.refresh();
  };

  const getScheduleStatus = (link: LinkData) => {
    if (!link.startDate && !link.endDate) return null;
    const now = new Date();
    if (link.startDate && now < new Date(link.startDate)) {
      return { label: t.links.statusUpcoming, color: "bg-amber-100 text-amber-900 border-amber-500" };
    }
    if (link.endDate && now > new Date(link.endDate)) {
      return { label: t.links.statusExpired, color: "bg-neutral-200 text-neutral-600 border-neutral-400" };
    }
    return { label: t.links.statusLive, color: "bg-emerald-100 text-emerald-900 border-emerald-500" };
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">link</span>
            <span>{t.links.title}</span>
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
            {t.links.subtitle}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>{t.links.addNew}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 material-symbols-outlined text-lg text-neutral-500">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.links.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#FFF8E7] dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#FFF8E7] brutal-border-sm focus:outline-none"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto text-xs font-mono font-bold uppercase">
          {[
            { id: "ALL", label: t.links.filterAll },
            { id: "CUSTOM", label: t.links.filterCustom },
            { id: "SOCIAL", label: t.links.filterSocial },
            { id: "PRODUCT", label: t.links.filterProduct },
            { id: "CONTACT", label: t.links.filterContact },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 brutal-border-sm cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#FFDE59] text-[#0D0D0D] font-black shadow-sm"
                  : "bg-white dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#FFF8E7] hover:bg-[#FFF2CE] dark:hover:bg-neutral-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-12 text-center font-mono">
          <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2 block">
            folder_off
          </span>
          <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
            {search || selectedCategory !== "ALL"
              ? t.links.noFilterMatch
              : t.links.noLinksYet}
          </p>
          <div className="mt-4">
            <Button variant="accent" size="sm" onClick={handleOpenCreate}>
              {t.links.firstLinkBtn}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const schedule = getScheduleStatus(link);

            return (
              <div
                key={link.id}
                className={`bg-white dark:bg-[#1C1B1A] brutal-card p-4 transition-all ${
                  !link.isActive ? "opacity-60 bg-[#FFF2CE] dark:bg-[#181818]" : ""
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Icon, Title, URL, Subtitle */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Thumbnail or Icon */}
                    {link.customThumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={link.customThumbnail}
                        alt={link.title}
                        className="w-12 h-12 object-cover border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_#000]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#FFF8E7] dark:bg-[#1A1A1A] border-2 border-black dark:border-white flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_#000] text-[#0D0D0D] dark:text-[#FFF8E7]">
                        <span className="material-symbols-outlined text-2xl">
                          {link.icon || "link"}
                        </span>
                      </div>
                    )}

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-black text-base uppercase tracking-tight truncate text-[#0D0D0D] dark:text-[#FFF8E7]">
                          {link.title}
                        </h3>
                        {/* Category Badge */}
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-[#FFF8E7] dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#FFF8E7] border border-black dark:border-white">
                          {link.category}
                        </span>

                        {/* Schedule badge */}
                        {schedule && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${schedule.color}`}
                          >
                            ⏱ {schedule.label}
                          </span>
                        )}
                      </div>

                      {link.subtitle && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-1 line-clamp-1">
                          {link.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[240px] sm:max-w-[340px] text-neutral-700 dark:text-neutral-300"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics, Toggle, Edit, Delete Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-end sm:self-center border-t-2 sm:border-t-0 pt-2 sm:pt-0 border-neutral-200 dark:border-neutral-800">
                    {/* Click count */}
                    <div className="px-2.5 py-1 bg-[#FFF2CE] dark:bg-[#1A1A1A] brutal-border-sm flex items-center gap-1.5 text-xs font-mono font-bold">
                      <span className="material-symbols-outlined text-sm">ads_click</span>
                      <span>{link.clicks || 0} {t.dashboard.clicks}</span>
                    </div>

                    {/* Active switch */}
                    <div className="flex items-center gap-1.5">
                      <Toggle
                        checked={link.isActive}
                        onChange={() => handleToggleActive(link)}
                      />
                      <span className="text-[11px] font-mono font-bold uppercase hidden md:inline">
                        {link.isActive ? t.dashboard.active : t.dashboard.inactive}
                      </span>
                    </div>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(link)}
                      className="p-1.5 px-2 bg-white dark:bg-[#252422] hover:bg-neutral-100 dark:hover:bg-neutral-700 brutal-border-sm cursor-pointer"
                      title={t.common.edit}
                      aria-label={t.common.edit}
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setLinkToDelete(link)}
                      className="p-1.5 px-2 bg-white dark:bg-[#252422] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 brutal-border-sm cursor-pointer"
                      title={t.common.delete}
                      aria-label={t.common.delete}
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal (Create & Edit) */}
      <LinkFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        linkToEdit={editingLink}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!linkToDelete}
        onClose={() => setLinkToDelete(null)}
        title={t.links.deleteConfirmTitle}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {t.links.deleteConfirmDesc} ({linkToDelete?.title})
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t-2 border-neutral-200 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLinkToDelete(null)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteConfirm}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              <span>{t.links.deleteButton}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
