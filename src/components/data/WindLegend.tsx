"use client";

import React from "react";

export interface WindLegendProps {
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  className?: string;
}

export function WindLegend({
  active = true,
  opacity = 0.8,
  progressPercent = 85,
  className = "",
}: WindLegendProps) {
  if (!active) return null;

  // Planetary global mean 10m surface wind speed (~7.4 m/s average ERA5 climatology)
  const t = Math.max(0, Math.min(1, progressPercent / 100));
  const globalMeanWind = 7.42 + Math.sin(t * 75.398) * 0.28; // ~7.1 to 7.7 m/s

  // Position on the 0 to 35 m/s scale (0% = 0, 100% = 35 m/s)
  const markerPercent = Math.max(0, Math.min(100, (globalMeanWind / 35.0) * 100));

  return (
    <aside
      aria-label="Wind Velocity Legend"
      className={`select-none bg-aether-surface border border-aether-border p-3 w-[250px] flex flex-col gap-2 rounded-sm shadow-lg pointer-events-auto transition-opacity duration-300 ${className}`}
      style={{ opacity: Math.max(0.4, opacity) }}
    >
      {/* 1. Header & Live Global Mean Wind Velocity */}
      <div className="flex items-center justify-between border-b border-aether-border-subtle pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aether-fg uppercase">
            WIND VELOCITY (10M)
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400">
          <span>{globalMeanWind.toFixed(1)} m/s</span>
        </div>
      </div>

      {/* 2. Sequential Gradient Bar with Moving Global Mean Needle */}
      <div className="relative w-full h-3 rounded-[1px] border border-aether-border-subtle overflow-visible my-0.5">
        {/* Gradient track (Calm Mint -> Sky Blue -> Deep Ocean Blue -> Jet Stream Magenta) */}
        <div
          className="w-full h-full rounded-[1px] overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #99f6e4 0%, #38bdf8 25%, #2563eb 55%, #1d4ed8 75%, #ec4899 100%)",
          }}
        />

        {/* Dynamic Global Mean Needle */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[3px] bg-white border border-black shadow-[0_0_4px_rgba(0,0,0,0.9)] transition-all duration-100 pointer-events-none rounded-[1px]"
          style={{ left: `calc(${markerPercent}% - 1.5px)` }}
          title={`Global Mean 10m Wind Speed: ${globalMeanWind.toFixed(1)} m/s`}
        />
      </div>

      {/* 3. Numeric Graduation Ticks */}
      <div className="flex justify-between items-center font-mono text-[9px] text-aether-fg-muted">
        <span className="text-aether-fg font-medium">0</span>
        <span>5</span>
        <span>12</span>
        <span>22</span>
        <span className="text-emerald-400 font-medium">35+</span>
      </div>

      {/* Semantic Color Meaning Labels */}
      <div className="flex justify-between items-center text-[8.5px] font-mono tracking-tight -mt-1">
        <span className="text-teal-300">CALM</span>
        <span className="text-sky-300">BREEZE</span>
        <span className="text-blue-400">STRONG</span>
        <span className="text-pink-400">JET STREAM</span>
      </div>

      {/* 4. Climatological Reference & Unit */}
      <div className="flex justify-between items-center text-[9px] font-mono text-aether-fg-muted pt-1 border-t border-aether-border-subtle">
        <span>ERA5 REANALYSIS</span>
        <span className="text-aether-fg-secondary">m / s</span>
      </div>
    </aside>
  );
}
