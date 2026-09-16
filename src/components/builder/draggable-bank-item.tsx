"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { LinkData } from "@/components/links/link-form-modal";
import { useI18n } from "@/lib/i18n/context";

interface DraggableBankItemProps {
  link: LinkData;
  onQuickAssign?: (linkId: string) => void;
}

export function DraggableBankItem({ link, onQuickAssign }: DraggableBankItemProps) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bank-${link.id}`,
    data: {
      type: "BANK_ITEM",
      link,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white dark:bg-[#1C1B1A] brutal-card transition-shadow cursor-grab active:cursor-grabbing ${
        isDragging
          ? "opacity-50 border-dashed border-2 scale-105 z-50 shadow-2xl"
          : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          {...listeners}
          {...attributes}
          className="flex items-center gap-2.5 min-w-0 flex-1 select-none"
        >
          <span className="material-symbols-outlined text-lg text-neutral-400 dark:text-neutral-500">
            drag_indicator
          </span>

          <span className="material-symbols-outlined text-lg p-1 bg-[#F4F0EA] dark:bg-[#2A2928] border border-black dark:border-white">
            {link.icon || "link"}
          </span>

          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs uppercase tracking-tight truncate text-black dark:text-white">
              {link.title}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 truncate">
              {link.category}
            </div>
          </div>
        </div>

        {/* Quick Assign Button for accessibility / mobile convenience */}
        {onQuickAssign && (
          <button
            type="button"
            onClick={() => onQuickAssign(link.id!)}
            className="p-1 px-2 text-[10px] font-mono font-bold bg-[#3772FF] text-white brutal-border-sm hover:bg-[#2563EB] active:translate-y-0.5 cursor-pointer flex items-center gap-0.5"
            title={t.builder.quickAssignTitle}
          >
            <span>{t.builder.installBtn}</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}
