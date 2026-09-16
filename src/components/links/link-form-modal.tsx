"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { MaterialIconPicker } from "@/components/ui/material-icon-picker";
import { createLinkAction, updateLinkAction } from "@/app/actions/link";
import { LinkInput } from "@/types/link";
import { useI18n } from "@/lib/i18n/context";

export interface LinkData {
  id?: string;
  title: string;
  url: string;
  icon?: string | null;
  subtitle?: string | null;
  customThumbnail?: string | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  category: "SOCIAL" | "PRODUCT" | "CUSTOM" | "CONTACT";
  clicks?: number;
}

interface LinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToEdit?: LinkData | null;
  onSuccess: () => void;
}

export function LinkFormModal({
  isOpen,
  onClose,
  linkToEdit,
  onSuccess,
}: LinkFormModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<string>("");
  const [subtitle, setSubtitle] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [category, setCategory] = useState<"SOCIAL" | "PRODUCT" | "CUSTOM" | "CONTACT">("CUSTOM");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tabs for structured form
  const [activeTab, setActiveTab] = useState<"general" | "visuals" | "schedule">("general");

  useEffect(() => {
    if (linkToEdit) {
      setTitle(linkToEdit.title || "");
      setUrl(linkToEdit.url || "");
      setIcon(linkToEdit.icon || "");
      setSubtitle(linkToEdit.subtitle || "");
      setCustomThumbnail(linkToEdit.customThumbnail || "");
      setCategory(linkToEdit.category || "CUSTOM");
      setIsActive(linkToEdit.isActive ?? true);
      setStartDate(
        linkToEdit.startDate
          ? new Date(linkToEdit.startDate).toISOString().slice(0, 16)
          : ""
      );
      setEndDate(
        linkToEdit.endDate
          ? new Date(linkToEdit.endDate).toISOString().slice(0, 16)
          : ""
      );
    } else {
      setTitle("");
      setUrl("");
      setIcon("link");
      setSubtitle("");
      setCustomThumbnail("");
      setCategory("CUSTOM");
      setIsActive(true);
      setStartDate("");
      setEndDate("");
    }
    setErrorMessage(null);
    setActiveTab("general");
  }, [linkToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setErrorMessage("Judul dan URL tujuan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: LinkInput = {
      title,
      url,
      icon: icon || null,
      subtitle: subtitle || null,
      customThumbnail: customThumbnail || null,
      category,
      isActive,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    let res;
    if (linkToEdit?.id) {
      res = await updateLinkAction(linkToEdit.id, payload);
    } else {
      res = await createLinkAction(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || "Gagal menyimpan link.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={linkToEdit ? t.links.editLink : t.links.addNew}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sub-navigation tabs inside modal */}
        <div className="flex border-b-2 border-black dark:border-white pb-2 gap-2 text-xs font-mono font-bold uppercase overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 brutal-border-sm cursor-pointer whitespace-nowrap ${
              activeTab === "general"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-[#252422]"
            }`}
          >
            {t.links.tabs.general}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("visuals")}
            className={`px-3 py-1.5 brutal-border-sm cursor-pointer whitespace-nowrap ${
              activeTab === "visuals"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-[#252422]"
            }`}
          >
            {t.links.tabs.visuals}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`px-3 py-1.5 brutal-border-sm cursor-pointer whitespace-nowrap ${
              activeTab === "schedule"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-white dark:bg-[#252422]"
            }`}
          >
            {t.links.tabs.schedule}
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === "general" && (
          <div className="space-y-3">
            <Input
              label={t.links.form.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.links.form.titlePlaceholder}
              required
            />

            <Input
              label={t.links.form.url}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.links.form.urlPlaceholder}
              required
            />

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                {t.links.form.subtitle}
              </label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                placeholder={t.links.form.subtitlePlaceholder}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                {t.links.form.category}
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as "SOCIAL" | "PRODUCT" | "CUSTOM" | "CONTACT"
                  )
                }
                className="w-full px-3 py-2 text-sm font-bold bg-white dark:bg-[#1C1B1A] brutal-border-sm focus:outline-none cursor-pointer"
              >
                <option value="CUSTOM">{t.links.form.categoryCustom}</option>
                <option value="SOCIAL">{t.links.form.categorySocial}</option>
                <option value="PRODUCT">{t.links.form.categoryProduct}</option>
                <option value="CONTACT">{t.links.form.categoryContact}</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Visuals (Icon & Thumbnail) */}
        {activeTab === "visuals" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1.5">
                {t.links.form.icon}
              </label>
              <MaterialIconPicker value={icon} onChange={(i) => setIcon(i)} />
            </div>

            <Input
              label={t.links.form.thumbnail}
              value={customThumbnail}
              onChange={(e) => setCustomThumbnail(e.target.value)}
              placeholder={t.links.form.thumbnailPlaceholder}
              helperText="Opsional. Jika diisi, thumbnail gambar akan ditampilkan mendampingi atau menggantikan icon."
            />
          </div>
        )}

        {/* Tab 3: Scheduling & Active State */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F4F0EA] dark:bg-[#2A2928] brutal-border-sm">
              <Toggle
                checked={isActive}
                onChange={setIsActive}
                label={t.links.form.isActive}
              />
              <p className="text-[11px] font-mono text-neutral-500 mt-1">
                Jika dinonaktifkan, link tidak akan muncul di halaman publik bio Anda.
              </p>
            </div>

            <div className="p-3 brutal-border-sm bg-white dark:bg-[#1C1B1A] space-y-3">
              <div className="text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span>{t.links.form.scheduleTitle}</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-500">
                {t.links.form.scheduleDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                    {t.links.form.startDate}
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-[#252422] brutal-border-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                    {t.links.form.endDate}
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-[#252422] brutal-border-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold brutal-border-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions bar */}
        <div className="pt-3 border-t-2 border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t.links.form.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>{isSubmitting ? t.links.form.saving : t.links.form.save}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
