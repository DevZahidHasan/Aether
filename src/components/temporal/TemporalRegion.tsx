"use client";

import React, { useRef } from "react";
import type { PlaybackState } from "@/types/spatial";

export interface TemporalRegionProps {
  currentDate?: string;
  baselinePeriod?: string;
  playbackState?: PlaybackState;
  playbackSpeed?: number;
  progressPercent?: number; // 0 to 100
  onTogglePlayback?: () => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  onChangeSpeed?: () => void;
  onSeek?: (percent: number) => void;
  className?: string;
}

export function TemporalRegion({
  currentDate = "AUGUST 2026",
  baselinePeriod = "1991–2020 BASELINE",
  playbackState = "paused",
  playbackSpeed = 1,
  progressPercent = 85,
  onTogglePlayback,
  onStepBack,
  onStepForward,
  onChangeSpeed,
  onSeek,
  className = "",
}: TemporalRegionProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || !onSeek) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(newPercent);
  };

  return (
    <footer
      role="region"
      aria-label="Temporal dimension navigation"
      className={`fixed bottom-0 left-0 right-0 h-timeline z-controls bg-aether-surface border-t border-aether-border flex items-center justify-between pl-12 pr-4 sm:px-6 gap-4 select-none ${className}`}
    >
      {/* 1. Date Range & Baseline Identification */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-aether-fg-muted shrink-0">
        <span className="hidden sm:inline text-aether-fg-secondary">
          {baselinePeriod}
        </span>
      </div>

      {/* 2. Timeline Track with Playhead & Ticks */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        role="slider"
        aria-label="Timeline scrubber"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent)}
        className="flex-1 h-6 relative flex items-center cursor-pointer group"
      >
        {/* Track Background */}
        <div className="absolute left-0 right-0 h-1 bg-aether-border rounded-sm group-hover:h-1.5 transition-all" />

        {/* Filled Progress Bar */}
        <div
          className="absolute left-0 h-1 bg-aether-accent opacity-50 rounded-sm group-hover:h-1.5 transition-all"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Playhead */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-4 bg-aether-accent rounded-sm pointer-events-none group-hover:scale-110 transition-transform"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-aether-accent" />
        </div>

        {/* Temporal Calibration Ticks */}
        <div className="absolute left-0 bottom-0 w-[1px] h-1.5 bg-aether-border-interactive" />
        <div className="absolute left-1/4 bottom-0 w-[1px] h-1.5 bg-aether-border-interactive" />
        <div className="absolute left-2/4 bottom-0 w-[1px] h-1.5 bg-aether-border-interactive" />
        <div className="absolute left-3/4 bottom-0 w-[1px] h-1.5 bg-aether-border-interactive" />
        <div className="absolute right-0 bottom-0 w-[1px] h-1.5 bg-aether-border-interactive" />
      </div>

      {/* 3. Playback Controls & Speed Selector */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Step Back */}
        <button
          type="button"
          aria-label="Step backward"
          onClick={onStepBack}
          className="w-7 h-7 flex items-center justify-center rounded-sm bg-aether-surface-elevated hover:bg-aether-surface-hover border border-aether-border text-aether-fg-muted hover:text-aether-fg transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
            <polygon points="12,3 5,8 12,13" />
          </svg>
        </button>

        {/* Play / Pause Toggle */}
        <button
          type="button"
          aria-label={playbackState === "playing" ? "Pause timeline (Shortcut: Space)" : "Play timeline (Shortcut: Space)"}
          onClick={onTogglePlayback}
          className="w-8 h-8 flex items-center justify-center rounded-sm bg-aether-surface-elevated hover:bg-aether-surface-hover border border-aether-border text-aether-fg transition-colors cursor-pointer"
        >
          {playbackState === "playing" ? (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
              <rect x="4" y="3" width="3" height="10" />
              <rect x="9" y="3" width="3" height="10" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
              <polygon points="5,3 13,8 5,13" />
            </svg>
          )}
        </button>

        {/* Step Forward */}
        <button
          type="button"
          aria-label="Step forward"
          onClick={onStepForward}
          className="w-7 h-7 flex items-center justify-center rounded-sm bg-aether-surface-elevated hover:bg-aether-surface-hover border border-aether-border text-aether-fg-muted hover:text-aether-fg transition-colors cursor-pointer"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 16 16">
            <polygon points="4,3 11,8 4,13" />
          </svg>
        </button>

        {/* Speed Selector */}
        <button
          type="button"
          aria-label={`Playback speed: ${playbackSpeed}x. Click to change`}
          onClick={onChangeSpeed}
          className="h-7 px-2 font-mono text-[10px] text-aether-fg-muted hover:text-aether-fg bg-aether-bg-secondary border border-aether-border rounded-sm transition-colors cursor-pointer ml-1"
        >
          {playbackSpeed}×
        </button>
      </div>

      {/* 4. Formatted Date Readout */}
      <div className="min-w-[110px] text-right font-mono text-[12px] font-medium text-aether-fg shrink-0">
        {currentDate}
      </div>
    </footer>
  );
}
