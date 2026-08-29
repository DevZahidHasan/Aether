"use client";

import React from "react";

export interface PrecipitationLegendProps {
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  className?: string;
}

export function PrecipitationLegend({
  active = true,
  opacity = 0.65,
  progressPercent = 85,
  className = "",
}: PrecipitationLegendProps) {
  if (!active) return null;

  // Planetary global mean precipitation rate (~2.7 mm/day average, slight seasonal oscillation)
  const t = Math.max(0, Math.min(1, progressPercent / 100));
  const globalMeanPrecip = 2.68 + Math.sin(t * 75.398) * 0.18; // ~2.5 to 2.9 mm/day

  // Position on the 0 to 16 mm/day scale (0% = 0, 100% = 16 mm/day)
  const markerPercent = Math.max(0, Math.min(100, (globalMeanPrecip / 16.0) * 100));

  return (
    <aside
      aria-label="Precipitation Rate Legend"
      className={`select-none bg-aether-surface border border-aether-border p-3 w-[250px] flex flex-col gap-2 rounded-sm shadow-lg pointer-events-auto transition-opacity duration-300 ${className}`}
      style={{ opacity: Math.max(0.4, opacity) }}
    >
      {/* 1. Header & Live Global Mean Precipitation */}
      <div className="flex items-center justify-between border-b border-aether-border-subtle pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aether-fg uppercase">
            PRECIPITATION RATE
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-sky-400">
          <span>{globalMeanPrecip.toFixed(1)} mm/d</span>
        </div>
      </div>

      {/* 2. Sequential Gradient Bar with Moving Global Mean Needle */}
      <div className="relative w-full h-3 rounded-[1px] border border-aether-border-subtle overflow-visible my-0.5">
        {/* Gradient track */}
        <div
          className="w-full h-full rounded-[1px] overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, rgba(186,230,253,0.2) 0%, #38bdf8 25%, #2563eb 55%, #1d4ed8 75%, #3730a3 100%)",
          }}
        />

        {/* Dynamic Global Mean Needle */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[3px] bg-white border border-black shadow-[0_0_4px_rgba(0,0,0,0.9)] transition-all duration-100 pointer-events-none rounded-[1px]"
          style={{ left: `calc(${markerPercent}% - 1.5px)` }}
          title={`Global Mean Precipitation: ${globalMeanPrecip.toFixed(1)} mm/day`}
        />
      </div>

      {/* 3. Numeric Graduation Ticks */}
      <div className="flex justify-between items-center font-mono text-[9px] text-aether-fg-muted">
        <span className="text-aether-fg font-medium">0</span>
        <span>2</span>
        <span>5</span>
        <span>10</span>
        <span className="text-sky-400 font-medium">15+</span>
      </div>

      {/* Semantic Color Meaning Labels */}
      <div className="flex justify-between items-center text-[8.5px] font-mono tracking-tight -mt-1">
        <span className="text-slate-400">DRY</span>
        <span className="text-sky-300">LIGHT</span>
        <span className="text-blue-400">MODERATE</span>
        <span className="text-indigo-400">DOWNPOUR</span>
      </div>

      {/* 4. Climatological Reference & Unit */}
      <div className="flex justify-between items-center text-[9px] font-mono text-aether-fg-muted pt-1 border-t border-aether-border-subtle">
        <span>GPCP / TRMM</span>
        <span className="text-aether-fg-secondary">mm / DAY</span>
      </div>
    </aside>
  );
}
