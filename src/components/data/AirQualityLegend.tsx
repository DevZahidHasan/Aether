"use client";

import React from "react";

export interface AirQualityLegendProps {
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  className?: string;
}

export function AirQualityLegend({
  active = true,
  opacity = 0.7,
  progressPercent = 85,
  className = "",
}: AirQualityLegendProps) {
  if (!active) return null;

  // Planetary global mean background AQI (~48 AQI average, slight seasonal variance)
  const t = Math.max(0, Math.min(1, progressPercent / 100));
  const globalMeanAqi = 48.2 + Math.sin(t * 75.398) * 3.5; // ~45 to 52 AQI

  // Position on the 0 to 300 AQI scale (0% = 0, 100% = 300+ AQI)
  const markerPercent = Math.max(0, Math.min(100, (globalMeanAqi / 300.0) * 100));

  return (
    <aside
      aria-label="Air Quality Index Legend"
      className={`select-none bg-aether-surface border border-aether-border p-3 w-[250px] flex flex-col gap-2 rounded-sm shadow-lg pointer-events-auto transition-opacity duration-300 ${className}`}
      style={{ opacity: Math.max(0.4, opacity) }}
    >
      {/* 1. Header & Live Global Mean AQI */}
      <div className="flex items-center justify-between border-b border-aether-border-subtle pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aether-fg uppercase">
            AIR QUALITY (AQI)
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-amber-400">
          <span>{Math.round(globalMeanAqi)} AQI</span>
        </div>
      </div>

      {/* 2. EPA Multi-Stop AQI Gradient Bar with Moving Global Mean Needle */}
      <div className="relative w-full h-3 rounded-[1px] border border-aether-border-subtle overflow-visible my-0.5">
        {/* Gradient track: Good -> Moderate -> USG -> Unhealthy -> Very Unhealthy -> Hazardous */}
        <div
          className="w-full h-full rounded-[1px] overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #4ade80 0%, #facc15 16.6%, #fb923c 33.3%, #f87171 50%, #c084fc 66.6%, #881337 100%)",
          }}
        />

        {/* Dynamic Global Mean Needle */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[3px] bg-white border border-black shadow-[0_0_4px_rgba(0,0,0,0.9)] transition-all duration-100 pointer-events-none rounded-[1px]"
          style={{ left: `calc(${markerPercent}% - 1.5px)` }}
          title={`Global Mean Background AQI: ${Math.round(globalMeanAqi)}`}
        />
      </div>

      {/* 3. Standard EPA Category Graduation Ticks */}
      <div className="flex justify-between items-center font-mono text-[9px] text-aether-fg-muted">
        <span className="text-emerald-400 font-medium">0</span>
        <span className="text-amber-300 font-medium">50</span>
        <span className="text-orange-400">100</span>
        <span className="text-red-400">150</span>
        <span className="text-purple-400">200</span>
        <span className="text-rose-600 font-medium">300+</span>
      </div>

      {/* Semantic Color Meaning Labels */}
      <div className="flex justify-between items-center text-[8.5px] font-mono tracking-tight -mt-1">
        <span className="text-emerald-400">GOOD</span>
        <span className="text-amber-300">MOD</span>
        <span className="text-orange-400">USG</span>
        <span className="text-red-400">UNH</span>
        <span className="text-purple-400">VERY</span>
        <span className="text-rose-600 font-medium">HAZARD</span>
      </div>

      {/* 4. Climatological Reference & Unit */}
      <div className="flex justify-between items-center text-[9px] font-mono text-aether-fg-muted pt-1 border-t border-aether-border-subtle">
        <span>COPERNICUS CAMS</span>
        <span className="text-aether-fg-secondary">PM2.5 · AQI</span>
      </div>
    </aside>
  );
}
