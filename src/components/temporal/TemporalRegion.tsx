import React from "react";
import type { PlaybackState } from "@/types/spatial";

export interface TemporalRegionProps {
  currentDate?: string;
  baselinePeriod?: string;
  playbackState?: PlaybackState;
  onTogglePlayback?: () => void;
  className?: string;
}

export function TemporalRegion({
  currentDate = "2026.08.28 · 12:00 UTC",
  baselinePeriod = "1991–2020 CLIMATOLOGICAL BASELINE",
  playbackState = "paused",
  onTogglePlayback,
  className = "",
}: TemporalRegionProps) {
  return (
    <footer
      role="region"
      aria-label="Temporal dimension navigation"
      className={`fixed bottom-0 left-0 right-0 h-timeline z-controls bg-aether-bg-secondary border-t border-aether-border flex items-center justify-between px-4 select-none ${className}`}
    >
      {/* Left: Playback Trigger & State */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={playbackState === "playing" ? "Pause temporal animation" : "Play temporal animation"}
          onClick={onTogglePlayback}
          className="h-7 px-3 rounded-sm border border-aether-border bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-secondary text-[11px] font-mono tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2 h-2 border-l-4 border-y-[3px] border-y-transparent border-l-aether-fg-secondary inline-block" aria-hidden="true" />
          <span>{playbackState === "playing" ? "PAUSE" : "PLAY"}</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-aether-fg-muted">
          <span className="text-aether-fg-secondary">{baselinePeriod}</span>
        </div>
      </div>

      {/* Center: Reserved Scrub Track Slot */}
      <div className="hidden md:flex flex-1 max-w-xl mx-6 items-center">
        <div
          role="progressbar"
          aria-label="Temporal progression"
          aria-valuenow={100}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-1 bg-aether-border rounded-full relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 bottom-0 w-full bg-aether-border-interactive" />
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-aether-accent" />
        </div>
      </div>

      {/* Right: Timestamp Readout */}
      <div className="flex items-center gap-2 font-mono text-[12px] text-aether-fg tracking-wide">
        <span className="text-aether-accent" aria-hidden="true">●</span>
        <time dateTime="2026-08-28">{currentDate}</time>
      </div>
    </footer>
  );
}
