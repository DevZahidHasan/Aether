"use client";

import React from "react";
import { AetherWordmark } from "@/components/ui/AetherWordmark";
import type { ApplicationMode } from "@/types/spatial";

export interface TopBarProps {
  currentMode?: ApplicationMode;
  onModeChange?: (mode: ApplicationMode) => void;
  isLayerPanelOpen?: boolean;
  onToggleLayerPanel?: () => void;
  onOpenSearch?: () => void;
  activeLayerName?: string | null;
  className?: string;
}

export function TopBar({
  currentMode = "explore",
  onModeChange,
  isLayerPanelOpen = false,
  onToggleLayerPanel,
  onOpenSearch,
  activeLayerName = null,
  className = "",
}: TopBarProps) {
  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 h-topbar z-topbar bg-aether-bg-secondary border-b border-aether-border flex items-center justify-between px-4 select-none ${className}`}
    >
      {/* Left: Brand Identity & Active Layer Indicator */}
      <div className="flex items-center gap-4">
        <AetherWordmark />

        {activeLayerName && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-aether-surface border border-aether-border rounded-sm font-sans text-[11px] text-aether-fg-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" aria-hidden="true" />
            <span>{activeLayerName}</span>
          </div>
        )}
      </div>

      {/* Center: Scientific Instrument Telemetry & Mode */}
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

      {/* Right: Interface Controls & Triggers */}
      <nav aria-label="Instrument triggers" className="flex items-center gap-2">
        {/* Layer Panel Trigger */}
        <button
          type="button"
          aria-label="Toggle climate data layers panel"
          aria-expanded={isLayerPanelOpen}
          aria-controls="layer-panel"
          onClick={onToggleLayerPanel}
          className={`h-7 px-2.5 rounded-sm border text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg ${
            isLayerPanelOpen
              ? "bg-aether-accent-soft text-aether-accent border-aether-accent"
              : "bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-secondary border-aether-border"
          }`}
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="12,2 2,7 12,12 22,7" />
            <polyline points="2,17 12,22 22,17" />
            <polyline points="2,12 12,17 22,12" />
          </svg>
          <span>LAYERS</span>
        </button>

        {/* Inspect Mode Toggle */}
        <button
          type="button"
          aria-label="Inspect mode (Shortcut: I)"
          aria-pressed={currentMode === "inspect"}
          onClick={() => onModeChange?.(currentMode === "inspect" ? "explore" : "inspect")}
          className={`h-7 px-2.5 rounded-sm border text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg ${
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

        {/* Search Command Trigger */}
        <button
          type="button"
          aria-label="Search geographic locations (Shortcut: /)"
          onClick={onOpenSearch}
          className="h-7 px-2.5 rounded-sm border border-aether-border bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-secondary text-[11px] font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg"
        >
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <span>SEARCH</span>
          <kbd className="text-[9px] text-aether-fg-muted bg-aether-bg px-1 py-0.5 rounded border border-aether-border-subtle">
            /
          </kbd>
        </button>
      </nav>
    </header>
  );
}
