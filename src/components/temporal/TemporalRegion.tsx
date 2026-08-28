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
  const isDraggingRef = useRef(false);

  const updateFromPointer = (clientX: number) => {
    if (!trackRef.current || !onSeek) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const newPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(newPercent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Fallback if pointer capture is not supported
    }
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Fallback
      }
    }
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-label="Timeline scrubber"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressPercent)}
        className="flex-1 h-8 relative flex items-center cursor-pointer select-none group touch-none"
      >
        {/* Track Background Rail */}
        <div className="absolute left-0 right-0 h-1 bg-aether-border/60 rounded-full group-hover:h-1.5 transition-[height]" />

        {/* Active Played Line (Moves in 100% lockstep with pointer thumb, zero delay) */}
        <div
          className="absolute left-0 h-1 bg-aether-accent rounded-full group-hover:h-1.5 shadow-[0_0_8px_rgba(245,158,11,0.7)] pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Caliper Playhead Needle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 group-hover:scale-110 transition-transform"
          style={{ left: `${progressPercent}%` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-aether-accent shadow-[0_0_10px_rgba(245,158,11,0.9)] border border-aether-bg" />
          <div className="w-[1.5px] h-3.5 bg-aether-accent" />
        </div>

        {/* Temporal Calibration Ticks */}
        <div className="absolute left-0 bottom-0.5 w-[1px] h-1.5 bg-aether-border-interactive pointer-events-none" />
        <div className="absolute left-1/4 bottom-0.5 w-[1px] h-1.5 bg-aether-border-interactive pointer-events-none" />
        <div className="absolute left-2/4 bottom-0.5 w-[1px] h-1.5 bg-aether-border-interactive pointer-events-none" />
        <div className="absolute left-3/4 bottom-0.5 w-[1px] h-1.5 bg-aether-border-interactive pointer-events-none" />
        <div className="absolute right-0 bottom-0.5 w-[1px] h-1.5 bg-aether-border-interactive pointer-events-none" />
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
