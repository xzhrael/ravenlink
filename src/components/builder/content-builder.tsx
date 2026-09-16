"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LinkData } from "@/components/links/link-form-modal";
import { DraggableBankItem } from "./draggable-bank-item";
import { PuzzleSlot } from "./puzzle-slot";
import { BuilderPreview } from "./builder-preview";
import { Button } from "@/components/ui/button";
import { reorderLinksAction } from "@/app/actions/link";
import { useI18n } from "@/lib/i18n/context";
import Link from "next/link";

interface ContentBuilderProps {
  initialLinks: LinkData[];
  userProfile: {
    username: string;
    userName: string;
    userBio?: string | null;
    userImage?: string | null;
  };
  themeSettings: {
    themeBackground: string;
    themeButtonColor: string;
    themeButtonTextColor: string;
    themeAccent: string;
    themeTextColor: string;
    themeCardStyle: string;
    themeFont: string;
  };
}

function BankDroppableZone({
  children,
  count,
  emptyTitle,
  emptySub,
}: {
  children: React.ReactNode;
  count: number;
  emptyTitle: string;
  emptySub: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "bank-droppable-zone",
    data: { type: "BANK_ZONE" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2.5 min-h-[160px] p-2 transition-colors ${
        isOver
          ? "bg-amber-50 dark:bg-amber-950/30 border-2 border-dashed border-amber-500"
          : ""
      }`}
    >
      {count === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-neutral-500 border-2 border-dashed border-neutral-300 dark:border-neutral-700">
          <span className="material-symbols-outlined text-3xl mb-1 block">
            inventory_2
          </span>
          {emptyTitle}
          <br />
          {emptySub}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function SlotsDroppableZone({
  children,
  isOver,
}: {
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: "slots-droppable-zone",
    data: { type: "SLOTS_ZONE" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[220px] p-1.5 transition-colors ${
        isOver
          ? "bg-neutral-100/70 dark:bg-neutral-800/40 rounded-sm"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

export function ContentBuilder({
  initialLinks,
  userProfile,
  themeSettings,
}: ContentBuilderProps) {
  const { t } = useI18n();

  // Divide into Bank (inactive / unassigned) and Slots (active / ordered)
  const [bankLinks, setBankLinks] = useState<LinkData[]>(() =>
    initialLinks.filter((l) => !l.isActive)
  );
  const [slotLinks, setSlotLinks] = useState<LinkData[]>(() =>
    initialLinks.filter((l) => l.isActive)
  );

  const [activeDragItem, setActiveDragItem] = useState<LinkData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<"bank" | "slots" | "preview">("slots");

  // Setup dnd sensors
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "BANK_ITEM") {
      setActiveDragItem(activeData.link);
    } else if (activeData?.type === "SLOT_ITEM") {
      setActiveDragItem(activeData.link);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Case 1: Dragging from BANK to SLOTS
    if (activeId.startsWith("bank-")) {
      const linkId = activeId.replace("bank-", "");
      const itemToMove = bankLinks.find((l) => l.id === linkId);
      if (!itemToMove) return;

      // If dropped onto slot area or specific slot
      if (
        overId === "slots-droppable-zone" ||
        overId === "empty-next-slot" ||
        overId.startsWith("slot-")
      ) {
        // Remove from bank
        setBankLinks((prev) => prev.filter((l) => l.id !== linkId));

        // Insert into slotLinks
        setSlotLinks((prev) => {
          const activatedItem = { ...itemToMove, isActive: true };
          if (overId.startsWith("slot-")) {
            const targetLinkId = overId.replace("slot-", "");
            const targetIndex = prev.findIndex((l) => l.id === targetLinkId);
            if (targetIndex >= 0) {
              const copy = [...prev];
              copy.splice(targetIndex, 0, activatedItem);
              return copy;
            }
          }
          return [...prev, activatedItem];
        });
      }
      return;
    }

    // Case 2: Dragging from SLOT to BANK (Ejecting / Deactivating)
    if (
      activeId.startsWith("slot-") &&
      (overId === "bank-droppable-zone" || overId.startsWith("bank-"))
    ) {
      const linkId = activeId.replace("slot-", "");
      const itemToEject = slotLinks.find((l) => l.id === linkId);
      if (!itemToEject) return;

      setSlotLinks((prev) => prev.filter((l) => l.id !== linkId));
      setBankLinks((prev) => [...prev, { ...itemToEject, isActive: false }]);
      return;
    }

    // Case 3: Reordering within SLOTS
    if (activeId.startsWith("slot-") && overId.startsWith("slot-")) {
      const activeLinkId = activeId.replace("slot-", "");
      const overLinkId = overId.replace("slot-", "");

      if (activeLinkId !== overLinkId) {
        setSlotLinks((prev) => {
          const oldIndex = prev.findIndex((l) => l.id === activeLinkId);
          const newIndex = prev.findIndex((l) => l.id === overLinkId);
          if (oldIndex >= 0 && newIndex >= 0) {
            return arrayMove(prev, oldIndex, newIndex);
          }
          return prev;
        });
      }
    }
  };

  // Quick eject button handler: remove from slots -> push to bank
  const handleRemoveFromSlot = (linkId: string) => {
    const item = slotLinks.find((l) => l.id === linkId);
    if (!item) return;

    setSlotLinks((prev) => prev.filter((l) => l.id !== linkId));
    setBankLinks((prev) => [...prev, { ...item, isActive: false }]);
  };

  // Quick assign button handler: remove from bank -> push to slots
  const handleQuickAssign = (linkId: string) => {
    const item = bankLinks.find((l) => l.id === linkId);
    if (!item) return;

    setBankLinks((prev) => prev.filter((l) => l.id !== linkId));
    setSlotLinks((prev) => [...prev, { ...item, isActive: true }]);
  };

  // Save changes to database via server action
  const handleSaveLayout = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const orderedItems = [
      ...slotLinks.map((link, idx) => ({
        id: link.id!,
        position: idx,
        isActive: true,
      })),
      ...bankLinks.map((link, idx) => ({
        id: link.id!,
        position: 9000 + idx,
        isActive: false,
      })),
    ];

    const res = await reorderLinksAction(orderedItems);
    setIsSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">extension</span>
              <span>{t.builder.title}</span>
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-1">
              {t.builder.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/links"
              className="flex-1 sm:flex-initial text-center px-3 py-2 bg-white dark:bg-[#252422] text-xs font-mono font-bold brutal-border-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {t.links.addNew}
            </Link>

            <Button
              variant="accent"
              onClick={handleSaveLayout}
              isLoading={isSaving}
              className="flex-1 sm:flex-initial px-5 py-2"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSaving ? t.builder.saving : t.builder.saveOrder}</span>
            </Button>
          </div>
        </div>

        {/* Mobile View Switcher (< lg) */}
        <div className="flex lg:hidden bg-white dark:bg-[#1C1B1A] brutal-card p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setMobileTab("bank")}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === "bank"
                ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            <span>{t.builder.mobileTabBank}</span>
            <span className="ml-1 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
              {bankLinks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("slots")}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === "slots"
                ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
            }`}
          >
            <span className="material-symbols-outlined text-base">view_agenda</span>
            <span>{t.builder.mobileTabSlots}</span>
            <span className="ml-1 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold">
              {slotLinks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileTab === "preview"
                ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
                : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
            }`}
          >
            <span className="material-symbols-outlined text-base">smartphone</span>
            <span>{t.builder.mobileTabPreview}</span>
          </button>
        </div>

        {/* 2-Column Grid + Live Preview Side Bar (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI (4 cols): Bank Konten */}
          <div
            className={`lg:col-span-4 space-y-4 ${
              mobileTab === "bank" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-3">
                <div>
                  <h2 className="text-sm font-mono font-black uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg">
                      inventory_2
                    </span>
                    <span>{t.builder.bankTitle}</span>
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {t.builder.bankSubtitle}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 brutal-border-sm">
                  {bankLinks.length}
                </span>
              </div>

              <BankDroppableZone
                count={bankLinks.length}
                emptyTitle={t.builder.bankEmpty}
                emptySub={t.builder.bankEmptySub}
              >
                {bankLinks.map((link) => (
                  <DraggableBankItem
                    key={link.id}
                    link={link}
                    onQuickAssign={handleQuickAssign}
                  />
                ))}
              </BankDroppableZone>
            </div>

            {/* Hint Box */}
            <div className="p-4 bg-[#F4F0EA] dark:bg-[#2A2928] brutal-border-sm text-xs font-mono text-neutral-600 dark:text-neutral-400 space-y-1.5">
              <div className="font-bold uppercase text-black dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                <span>{t.builder.puzzleHintTitle}</span>
              </div>
              <p>• {t.builder.puzzleHint1}</p>
              <p>• {t.builder.puzzleHint2}</p>
              <p>• {t.builder.puzzleHint3}</p>
            </div>
          </div>

          {/* KOLOM KANAN (5 cols): Slot Puzzle Vertikal */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === "slots" ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-5">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-3">
                <div>
                  <h2 className="text-sm font-mono font-black uppercase tracking-tight flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg">
                      view_agenda
                    </span>
                    <span>{t.builder.slotsTitle}</span>
                  </h2>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {t.builder.slotsSubtitle}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-black text-white dark:bg-white dark:text-black">
                  {slotLinks.length} {t.dashboard.active}
                </span>
              </div>

              {/* Droppable and Sortable Puzzle Slots */}
              <SortableContext
                items={slotLinks.map((l) => `slot-${l.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <SlotsDroppableZone isOver={false}>
                  {slotLinks.map((link, index) => (
                    <PuzzleSlot
                      key={link.id}
                      id={`slot-${link.id}`}
                      slotNumber={index + 1}
                      link={link}
                      onRemove={handleRemoveFromSlot}
                    />
                  ))}

                  {/* Empty Slot Drop Target at the end */}
                  <PuzzleSlot
                    id="empty-next-slot"
                    slotNumber={slotLinks.length + 1}
                    isEmptySlot={true}
                  />
                </SlotsDroppableZone>
              </SortableContext>
            </div>

            {/* Save bar notification */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 brutal-border-sm text-xs font-mono font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{t.builder.saved}</span>
              </div>
            )}
          </div>

          {/* SISI KANAN / BAWAH (3 cols): Real-Time Mini Preview */}
          <div
            className={`lg:col-span-3 sticky top-20 ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <BuilderPreview
              username={userProfile.username}
              userName={userProfile.userName}
              userBio={userProfile.userBio}
              userImage={userProfile.userImage}
              theme={themeSettings}
              slotLinks={slotLinks}
            />
          </div>
        </div>
      </div>

      {/* Drag Overlay Ghost */}
      <DragOverlay>
        {activeDragItem ? (
          <div className="p-3 bg-white dark:bg-[#1C1B1A] border-3 border-black dark:border-white shadow-[6px_6px_0px_#000] rotate-2 scale-105 opacity-90">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="material-symbols-outlined text-lg">
                {activeDragItem.icon || "link"}
              </span>
              <span>{activeDragItem.title}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
