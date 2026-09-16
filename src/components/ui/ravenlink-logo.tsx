"use client";

import React from "react";
import Image from "next/image";

interface RavenlinkLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
  priority?: boolean;
}

const sizeMap = {
  xs: { px: 20, className: "w-5 h-5" },
  sm: { px: 28, className: "w-7 h-7" },
  md: { px: 36, className: "w-9 h-9" },
  lg: { px: 48, className: "w-12 h-12" },
  xl: { px: 64, className: "w-16 h-16" },
};

export function RavenlinkLogo({
  size = "md",
  className = "",
  showText = false,
  textClassName = "",
  priority = false,
}: RavenlinkLogoProps) {
  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      <div className={`relative ${currentSize.className} shrink-0`}>
        <Image
          src="/logo.png"
          alt="Ravenlink Brand Logo"
          width={currentSize.px}
          height={currentSize.px}
          priority={priority}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
      {showText && (
        <span className={`font-black uppercase tracking-tight ${textClassName || "text-lg sm:text-xl"}`}>
          Ravenlink
        </span>
      )}
    </div>
  );
}
