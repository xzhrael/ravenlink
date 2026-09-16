"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkData } from "@/components/links/link-form-modal";
import { useI18n } from "@/lib/i18n/context";

interface PuzzleSlotProps {
  id: string;
  slotNumber: number;
  link?: LinkData | null;
  onRemove?: (linkId: string) => void;
  isEmptySlot?: boolean;
}

export function PuzzleSlot({
  id,
  slotNumber,
  link,
  onRemove,
  isEmptySlot = false,
}: PuzzleSlotProps) {
  const { t } = useI18n();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: isEmptySlot ? "EMPTY_SLOT" : "SLOT_ITEM",
      slotNumber,
      link,
    },
    disabled: isEmptySlot,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isEmptySlot || !link) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="p-4 border-3 border-dashed border-neutral-400 dark:border-neutral-600 bg-[#FBF9F5] dark:bg-[#181716] flex items-center justify-between gap-3 text-neutral-500 transition-colors hover:border-black dark:hover:border-white"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 flex items-center justify-center font-mono font-black text-xs bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600">
            #{slotNumber}
          </span>
          <div className="text-xs font-mono font-bold uppercase tracking-wide">
            {t.builder.emptySlot} {slotNumber}
          </div>
        </div>

        <span className="text-[11px] font-mono italic text-neutral-400 hidden sm:inline">
          {t.builder.dropHint} ↓
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 bg-white dark:bg-[#1C1B1A] border-3 border-black dark:border-white relative transition-all shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#E2DFD8] ${
        isDragging ? "opacity-40 scale-105 z-50 border-dashed" : ""
      }`}
    >
      {/* Puzzle connector indicator visual */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-4 bg-black dark:bg-white border border-black" />

      <div className="flex items-center justify-between gap-3 pl-2">
        {/* Left: Drag handle + Slot number + Icon + Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Reorder drag handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-neutral-400 hover:text-black dark:hover:text-white"
            title="Tarik untuk mengubah urutan tampil"
          >
            <span className="material-symbols-outlined text-lg">
              drag_indicator
            </span>
          </button>

          {/* Slot order badge */}
          <span className="px-2 py-0.5 font-mono font-black text-xs bg-black text-white dark:bg-white dark:text-black">
            #{slotNumber}
          </span>

          {/* Icon / Thumbnail */}
          <span className="material-symbols-outlined text-xl p-1 bg-[#F4F0EA] dark:bg-[#2A2928] border-2 border-black dark:border-white flex-shrink-0">
            {link.icon || "link"}
          </span>

          {/* Title & info */}
          <div className="min-w-0 flex-1">
            <div className="font-black text-sm uppercase tracking-tight truncate text-black dark:text-white">
              {link.title}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 truncate flex items-center gap-2">
              <span>{link.url}</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                {t.dashboard.active}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Eject / Remove button */}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(link.id!)}
            className="p-1 px-2 text-[11px] font-mono font-bold bg-neutral-100 hover:bg-rose-100 dark:bg-neutral-800 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-400 brutal-border-sm transition-colors cursor-pointer flex items-center gap-1"
            title={t.builder.removeFromSlot}
          >
            <span className="material-symbols-outlined text-xs">logout</span>
            <span className="hidden sm:inline">{t.builder.removeFromSlot}</span>
          </button>
        )}
      </div>
    </div>
  );
}
