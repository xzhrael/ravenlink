"use client";

import React, { useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { updateThemeAction, ThemeSettingsInput } from "@/app/actions/theme";
import { useI18n } from "@/lib/i18n/context";

interface ThemeCustomizerProps {
  initialSettings: ThemeSettingsInput;
  username: string;
  userName: string;
  userBio?: string | null;
  userImage?: string | null;
}

interface PresetTheme {
  id: "preset1" | "preset2" | "preset3" | "preset4" | "preset5" | "preset6";
  defaultName: string;
  settings: ThemeSettingsInput;
}

const PRESET_THEMES: PresetTheme[] = [
  {
    id: "preset1",
    defaultName: "Ravenlink Signature (Palette Pilihan)",
    settings: {
      themeBackground: "#FFF8E7",
      themeButtonColor: "#FFDE59",
      themeButtonTextColor: "#0D0D0D",
      themeAccent: "#3772FF",
      themeTextColor: "#0D0D0D",
      themeCardStyle: "brutal-solid",
      themeFont: "space-grotesk",
    },
  },
  {
    id: "preset2",
    defaultName: "Magenta & Emerald Pop",
    settings: {
      themeBackground: "#FFF8E7",
      themeButtonColor: "#FF5CAA",
      themeButtonTextColor: "#FFFFFF",
      themeAccent: "#06D6A0",
      themeTextColor: "#0D0D0D",
      themeCardStyle: "brutal-solid",
      themeFont: "jetbrains-mono",
    },
  },
  {
    id: "preset3",
    defaultName: "Clean Card & Blue Accent",
    settings: {
      themeBackground: "#FFF8E7",
      themeButtonColor: "#FFFFFF",
      themeButtonTextColor: "#0D0D0D",
      themeAccent: "#3772FF",
      themeTextColor: "#0D0D0D",
      themeCardStyle: "brutal-solid",
      themeFont: "space-grotesk",
    },
  },
  {
    id: "preset4",
    defaultName: "Mono Classic Brutal",
    settings: {
      themeBackground: "#FFFFFF",
      themeButtonColor: "#F4F0EA",
      themeButtonTextColor: "#121212",
      themeAccent: "#121212",
      themeTextColor: "#121212",
      themeCardStyle: "brutal-solid",
      themeFont: "space-grotesk",
    },
  },
  {
    id: "preset5",
    defaultName: "Dark Obsidian & Gold",
    settings: {
      themeBackground: "#121212",
      themeButtonColor: "#1C1B1A",
      themeButtonTextColor: "#FFF8E7",
      themeAccent: "#FFDE59",
      themeTextColor: "#FFF8E7",
      themeCardStyle: "brutal-solid",
      themeFont: "space-grotesk",
    },
  },
  {
    id: "preset6",
    defaultName: "Concrete & Clay",
    settings: {
      themeBackground: "#EFEFEA",
      themeButtonColor: "#FFFFFF",
      themeButtonTextColor: "#121212",
      themeAccent: "#6E6A4B",
      themeTextColor: "#1C1B1A",
      themeCardStyle: "brutal-solid",
      themeFont: "jetbrains-mono",
    },
  },
];

export function ThemeCustomizer({
  initialSettings,
  username,
  userName,
  userBio,
  userImage,
}: ThemeCustomizerProps) {
  const { t } = useI18n();
  const [settings, setSettings] = useState<ThemeSettingsInput>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<"customize" | "preview">("customize");

  const handleApplyPreset = (preset: ThemeSettingsInput) => {
    setSettings(preset);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const res = await updateThemeAction(settings);
    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  const dummyLinks = [
    {
      title: t.theme.previewDummy1Title,
      icon: "palette",
      sub: t.theme.previewDummy1Sub,
    },
    {
      title: t.theme.previewDummy2Title,
      icon: "shopping_bag",
      sub: t.theme.previewDummy2Sub,
    },
    {
      title: t.theme.previewDummy3Title,
      icon: "smart_display",
      sub: t.theme.previewDummy3Sub,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Mobile Tab Switcher (< lg) */}
      <div className="flex lg:hidden bg-white dark:bg-[#1C1B1A] brutal-card p-1.5 gap-2">
        <button
          type="button"
          onClick={() => setMobileTab("customize")}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "customize"
              ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
              : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
          }`}
        >
          <span className="material-symbols-outlined text-base">tune</span>
          <span>{t.theme.tabCustomize}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase brutal-border-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            mobileTab === "preview"
              ? "bg-[#FFDE59] text-[#0D0D0D] font-black"
              : "bg-white dark:bg-[#252422] text-[#0D0D0D] dark:text-[#FFF8E7]"
          }`}
        >
          <span className="material-symbols-outlined text-base">smartphone</span>
          <span>{t.theme.tabPreview}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customizer Controls (7 cols) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === "customize" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Header card */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6">
            <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-2xl">palette</span>
              <span>{t.theme.title}</span>
            </h1>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {t.theme.subtitle}
            </p>
          </div>

          {/* Presets */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 space-y-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              {t.theme.presets}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_THEMES.map((preset) => {
                const presetName =
                  t.theme.presetsList?.[preset.id] || preset.defaultName;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.settings)}
                    className="p-3 text-left brutal-border-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs">{presetName}</div>
                      <div className="text-[10px] font-mono text-neutral-500">
                        {preset.settings.themeFont}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <span
                        className="w-4 h-4 rounded-none border border-black"
                        style={{ backgroundColor: preset.settings.themeBackground }}
                      />
                      <span
                        className="w-4 h-4 rounded-none border border-black"
                        style={{ backgroundColor: preset.settings.themeAccent }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 space-y-5">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
              {t.theme.customColors}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <ColorPicker
                label={t.theme.bgLabel}
                value={settings.themeBackground}
                onChange={(val) =>
                  setSettings({ ...settings, themeBackground: val })
                }
              />
              <ColorPicker
                label={t.theme.accentLabel}
                value={settings.themeAccent}
                onChange={(val) => setSettings({ ...settings, themeAccent: val })}
              />
              <ColorPicker
                label={t.theme.btnLabel}
                value={settings.themeButtonColor}
                onChange={(val) =>
                  setSettings({ ...settings, themeButtonColor: val })
                }
              />
              <ColorPicker
                label={t.theme.btnTextLabel}
                value={settings.themeButtonTextColor}
                onChange={(val) =>
                  setSettings({ ...settings, themeButtonTextColor: val })
                }
              />
            </div>
          </div>

          {/* Typography & Card Style */}
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-2">
                {t.theme.fontLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, themeFont: "space-grotesk" })
                  }
                  className={`p-2.5 text-xs font-bold brutal-border-sm cursor-pointer ${
                    settings.themeFont === "space-grotesk"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white dark:bg-[#252422]"
                  }`}
                >
                  {t.theme.fonts.grotesk}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, themeFont: "jetbrains-mono" })
                  }
                  className={`p-2.5 text-xs font-mono font-bold brutal-border-sm cursor-pointer ${
                    settings.themeFont === "jetbrains-mono"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white dark:bg-[#252422]"
                  }`}
                >
                  {t.theme.fonts.mono}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-2">
                {t.theme.cardStyleLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "brutal-solid", label: t.theme.cardStyles.solid },
                  { id: "brutal-outline", label: t.theme.cardStyles.outline },
                  { id: "brutal-flat", label: t.theme.cardStyles.flat },
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, themeCardStyle: style.id })
                    }
                    className={`p-2 text-xs font-bold brutal-border-sm cursor-pointer ${
                      settings.themeCardStyle === style.id
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "bg-white dark:bg-[#252422]"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="sticky bottom-4 z-20">
            <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4 flex items-center justify-between gap-4 shadow-xl">
              {saveSuccess ? (
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                  {t.theme.saved}
                </span>
              ) : (
                <span className="text-xs font-mono text-neutral-500">
                  {t.theme.livePreviewNotice}
                </span>
              )}

              <Button
                variant="accent"
                onClick={handleSave}
                isLoading={isSaving}
                className="px-6 py-2.5"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{isSaving ? t.theme.saving : t.theme.saveTheme}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview (5 cols) */}
        <div
          className={`lg:col-span-5 sticky top-20 ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-white dark:bg-[#1C1B1A] brutal-card p-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white mb-4">
              <span className="text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  smartphone
                </span>
                <span>{t.theme.previewTitle}</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 brutal-border-sm font-bold">
                /{username}
              </span>
            </div>

            {/* Phone Frame Simulator */}
            <div
              className="w-full max-w-[340px] mx-auto border-4 border-black dark:border-white p-4 min-h-[480px] flex flex-col justify-between transition-colors shadow-[6px_6px_0px_#121212]"
              style={{
                backgroundColor: settings.themeBackground,
                color: settings.themeTextColor,
                fontFamily:
                  settings.themeFont === "jetbrains-mono"
                    ? '"JetBrains Mono", monospace'
                    : '"Space Grotesk", sans-serif',
              }}
            >
              {/* Profile Header */}
              <div className="text-center pt-2 pb-4">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt={userName}
                    className="w-16 h-16 mx-auto mb-2 border-3 border-black object-cover shadow-[3px_3px_0px_#000]"
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-2 bg-neutral-300 border-3 border-black flex items-center justify-center font-black text-xl text-black shadow-[3px_3px_0px_#000]">
                    {userName[0]?.toUpperCase()}
                  </div>
                )}
                <h2 className="font-black text-base uppercase tracking-tight">
                  {userName}
                </h2>
                <p className="text-xs opacity-75 font-mono mt-0.5 line-clamp-2">
                  {userBio || t.theme.previewSubtitleDefault}
                </p>
              </div>

              {/* Dummy Buttons previewing the colors and styles */}
              <div className="space-y-3 flex-1 px-1">
                {dummyLinks.map((dummy, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-3 border-black flex items-center gap-3 transition-transform cursor-pointer"
                    style={{
                      backgroundColor: settings.themeButtonColor,
                      color: settings.themeButtonTextColor,
                      boxShadow:
                        settings.themeCardStyle === "brutal-solid"
                          ? "4px 4px 0px #000"
                          : settings.themeCardStyle === "brutal-outline"
                          ? "3px 3px 0px #000"
                          : "none",
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-xl p-1.5 border-2 border-black"
                      style={{
                        backgroundColor: settings.themeAccent,
                        color: "#FFFFFF",
                      }}
                    >
                      {dummy.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold text-xs leading-tight">
                        {dummy.title}
                      </div>
                      <div className="text-[10px] opacity-70 font-mono">
                        {dummy.sub}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer Badge */}
              <div className="text-center pt-6 pb-1">
                <span className="inline-block px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000]">
                  ⚡ {t.publicBio.poweredBy}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
