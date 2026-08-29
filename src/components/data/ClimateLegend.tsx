"use client";

import React from "react";

export interface ClimateLegendProps {
  active?: boolean;
  opacity?: number;
  progressPercent?: number; // 0 to 100
  className?: string;
}

export function ClimateLegend({
  active = true,
  opacity = 0.75,
  progressPercent = 85,
  className = "",
}: ClimateLegendProps) {
  if (!active) return null;

  // Calculate planetary global mean anomaly for the current timeline position (1990 to 2026)
  const t = Math.max(0, Math.min(1, progressPercent / 100));
  // Global trend accelerates from +0.25°C in 1990 to +1.48°C in 2026 (matching IPCC / ERA5 data)
  const globalMeanAnomaly = 0.25 + (1.48 - 0.25) * Math.pow(t, 1.15);

  // Position on the -3.0°C to +3.0°C scale (0% = -3°C, 50% = 0°C, 100% = +3°C)
  const markerPercent = Math.max(0, Math.min(100, ((globalMeanAnomaly - -3.0) / 6.0) * 100));

  return (
    <aside
      aria-label="Temperature Anomaly Legend"
      className={`select-none bg-aether-surface border border-aether-border p-3 w-[250px] flex flex-col gap-2 rounded-sm shadow-lg pointer-events-auto transition-opacity duration-300 ${className}`}
      style={{ opacity: Math.max(0.4, opacity) }}
    >
      {/* 1. Header & Live Global Mean Anomaly */}
      <div className="flex items-center justify-between border-b border-aether-border-subtle pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aether-accent animate-pulse" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-aether-fg uppercase">
            TEMPERATURE ANOMALY
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-aether-accent">
          <span>+{globalMeanAnomaly.toFixed(2)}°C</span>
        </div>
      </div>

      {/* 2. Diverging Gradient Bar with Moving Global Mean Needle */}
      <div className="relative w-full h-3 rounded-[1px] border border-aether-border-subtle overflow-visible my-0.5">
        {/* Gradient track */}
        <div
          className="w-full h-full rounded-[1px] overflow-hidden"
          style={{
            background:
              "linear-gradient(to right, #1d4ed8 0%, #38bdf8 25%, #e2e8f0 50%, #f59e0b 75%, #dc2626 90%, #881337 100%)",
          }}
        />

        {/* Zero Baseline Reference Line */}
        <div
          className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-aether-fg/80 pointer-events-none"
          title="0.0°C Baseline (1991–2020)"
        />

        {/* Dynamic Global Mean Needle (Moves with the Year!) */}
        <div
          className="absolute -top-1 bottom-[-4px] w-[3px] bg-white border border-black shadow-[0_0_4px_rgba(0,0,0,0.9)] transition-all duration-100 pointer-events-none rounded-[1px]"
          style={{ left: `calc(${markerPercent}% - 1.5px)` }}
          title={`Global Mean Anomaly: +${globalMeanAnomaly.toFixed(2)}°C`}
        />
      </div>

      {/* 3. Numeric Graduation Ticks */}
      <div className="flex justify-between items-center font-mono text-[9px] text-aether-fg-muted">
        <span>-3°</span>
        <span>-2°</span>
        <span>-1°</span>
        <span className="text-aether-fg font-medium">0°</span>
        <span>+1°</span>
        <span>+2°</span>
        <span className="text-aether-data-anomaly-pos font-medium">+3°</span>
      </div>

      {/* Semantic Color Meaning Labels */}
      <div className="flex justify-between items-center text-[8.5px] font-mono tracking-tight -mt-1">
        <span className="text-blue-400">COOLER</span>
        <span className="text-slate-400">BASELINE</span>
        <span className="text-red-400">EXTREME HEAT</span>
      </div>

      {/* 4. Climatological Baseline Reference & Metric */}
      <div className="flex justify-between items-center text-[9px] font-mono text-aether-fg-muted pt-1 border-t border-aether-border-subtle">
        <span>1991–2020 BASELINE</span>
        <span className="text-aether-fg-secondary">GLOBAL MEAN TRACKER</span>
      </div>
    </aside>
  );
}
