import React from "react";
import { AetherWordmark } from "@/components/ui/AetherWordmark";
import type { ApplicationMode } from "@/types/spatial";

export interface TopBarProps {
  currentMode?: ApplicationMode;
  onModeChange?: (mode: ApplicationMode) => void;
  className?: string;
}

export function TopBar({
  currentMode = "explore",
  onModeChange,
  className = "",
}: TopBarProps) {
  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 h-topbar z-topbar bg-aether-bg-secondary border-b border-aether-border flex items-center justify-between px-4 select-none ${className}`}
    >
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-4">
        <AetherWordmark />
      </div>

      {/* Center: Scientific Instrument Status */}
      <div
        className="hidden md:flex items-center gap-3 font-mono text-[11px] text-aether-fg-muted"
        aria-live="polite"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aether-accent" aria-hidden="true" />
          <span className="text-aether-fg tracking-wide uppercase">
            STATUS: ACTIVE
          </span>
        </span>
        <span className="text-aether-border" aria-hidden="true">|</span>
        <span className="tracking-wide uppercase">
          MODE: {currentMode}
        </span>
      </div>

      {/* Right: Interface Controls & Keyboard Shortcuts */}
      <nav aria-label="System navigation" className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Inspect mode (Shortcut: I)"
          onClick={() => onModeChange?.(currentMode === "inspect" ? "explore" : "inspect")}
          className={`h-7 px-2.5 rounded-sm border text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
            currentMode === "inspect"
              ? "bg-aether-accent-soft text-aether-accent border-aether-accent"
              : "bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-secondary border-aether-border"
          }`}
        >
          <span>INSPECT</span>
          <kbd className="text-[9px] text-aether-fg-muted bg-aether-bg px-1 py-0.5 rounded border border-aether-border-subtle">
            I
          </kbd>
        </button>

        <button
          type="button"
          aria-label="Search geographic locations (Shortcut: /)"
          className="h-7 px-2.5 rounded-sm border border-aether-border bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-secondary text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>SEARCH</span>
          <kbd className="text-[9px] text-aether-fg-muted bg-aether-bg px-1 py-0.5 rounded border border-aether-border-subtle">
            /
          </kbd>
        </button>
      </nav>
    </header>
  );
}
