"use client";

import React from "react";
import type { ClimateLayerId } from "@/types/climate";

export interface LayerItemConfig {
  id: ClimateLayerId;
  name: string;
  unit: string;
  source: string;
  active: boolean;
  opacity: number;
}

export interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: LayerItemConfig[];
  onToggleLayer: (id: ClimateLayerId) => void;
  onChangeOpacity?: (id: ClimateLayerId, opacity: number) => void;
}

interface LayerColorGuide {
  gradient: string;
  labels: { text: string; color?: string }[];
  description: string;
}

const LAYER_COLOR_GUIDES: Record<ClimateLayerId, LayerColorGuide> = {
  "temperature-anomaly": {
    gradient:
      "linear-gradient(to right, #1d4ed8 0%, #38bdf8 25%, #e2e8f0 50%, #f59e0b 75%, #dc2626 90%, #881337 100%)",
    labels: [
      { text: "Cooler (-3°C)", color: "text-blue-400" },
      { text: "Normal (0°)", color: "text-slate-300" },
      { text: "Extreme Heat (+3°C)", color: "text-red-400" },
    ],
    description: "Thermal deviation from 1991–2020 climatological normal.",
  },
  precipitation: {
    gradient:
      "linear-gradient(to right, rgba(186,230,253,0.3) 0%, #38bdf8 30%, #0873ea 60%, #1d4ed8 85%, #4338ca 100%)",
    labels: [
      { text: "Dry (<1)", color: "text-slate-400" },
      { text: "Light Rain (2-5)", color: "text-sky-300" },
      { text: "Downpour (>15 mm/d)", color: "text-blue-400" },
    ],
    description: "Daily rainfall rate, monsoons, and tropical convective storms.",
  },
  wind: {
    gradient:
      "linear-gradient(to right, #99f6e4 0%, #38bdf8 30%, #2563eb 60%, #ec4899 100%)",
    labels: [
      { text: "Calm (0 m/s)", color: "text-teal-300" },
      { text: "Breeze (12)", color: "text-sky-400" },
      { text: "Jet Stream (>25 m/s)", color: "text-pink-400" },
    ],
    description: "Surface wind streamlines and high-altitude storm tracks.",
  },
  "air-quality": {
    gradient:
      "linear-gradient(to right, #4ade80 0%, #facc15 20%, #fb923c 40%, #f87171 60%, #c084fc 80%, #881337 100%)",
    labels: [
      { text: "Good (0-50)", color: "text-emerald-400" },
      { text: "Moderate (100)", color: "text-amber-400" },
      { text: "Hazardous (>300)", color: "text-purple-400" },
    ],
    description: "PM2.5 particulate matter, Saharan dust, and wildfire smoke.",
  },
};

export function LayerPanel({
  isOpen,
  onClose,
  layers,
  onToggleLayer,
  onChangeOpacity,
}: LayerPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      id="layer-panel"
      role="region"
      aria-label="Climate data layers"
      className="fixed top-14 left-4 z-panel w-[340px] max-h-[calc(100vh-140px)] bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl shadow-black/80 flex flex-col select-none overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200"
    >
      {/* Google-Style Header with Circular Close Button */}
      <div className="px-4 py-3.5 border-b border-[#3c4043]/60 flex items-center justify-between bg-[#1e1f20]">
        <div className="flex items-center gap-2.5">
          {/* Circular Close Button (Direct Google Design) */}
          <button
            type="button"
            aria-label="Close layers panel"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2f3032] hover:bg-[#3c3d40] text-[#e8eaed] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[15px] font-sans font-medium text-[#f1f3f4] leading-tight tracking-tight">
              Climate Layers
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#9aa0a6]">
              PLANETARY OBSERVATION
            </span>
          </div>
        </div>

        {/* Active count badge */}
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#2f3032] text-[#9aa0a6] border border-[#3c4043]/50">
          {layers.filter((l) => l.active).length} / {layers.length}
        </span>
      </div>

      {/* Layers List (Google Dark Surface Container Cards with Color Meaning Guides) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 bg-[#1e1f20] custom-scrollbar">
        {layers.map((layer) => {
          const colorGuide = LAYER_COLOR_GUIDES[layer.id];

          return (
            <div
              key={layer.id}
              className={`p-3 rounded-xl border transition-all duration-150 ${
                layer.active
                  ? "bg-[#28292a] border-aether-accent/50 shadow-sm"
                  : "bg-[#28292a] border-[#3c4043]/40 hover:border-[#5f6368] hover:bg-[#2e2f31]"
              }`}
            >
              {/* Layer Title & Google Material Switch */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-sans font-medium text-[#f1f3f4] leading-snug">
                    {layer.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#9aa0a6] mt-0.5">
                    {layer.unit} · {layer.source}
                  </span>
                </div>

                {/* Google Material-Style Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={layer.active}
                  aria-label={`Toggle ${layer.name}`}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1f20] ${
                    layer.active ? "bg-aether-accent" : "bg-[#3c4043] hover:bg-[#484c50]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all shadow-sm ${
                      layer.active
                        ? "translate-x-4 bg-white"
                        : "translate-x-0 bg-[#9aa0a6]"
                    }`}
                  />
                </button>
              </div>

              {/* Color Meaning Guide Bar */}
              {colorGuide && (
                <div className="mt-2.5 pt-2 border-t border-[#3c4043]/50 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#9aa0a6]">
                    <span className="tracking-wide uppercase">COLOR SCALE MEANING</span>
                  </div>

                  {/* Gradient Strip */}
                  <div
                    className="w-full h-2 rounded-[2px] border border-[#3c4043]/80 my-0.5"
                    style={{ background: colorGuide.gradient }}
                  />

                  {/* Color Labels */}
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    {colorGuide.labels.map((lbl, idx) => (
                      <span key={idx} className={lbl.color || "text-[#9aa0a6]"}>
                        {lbl.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Opacity Control (Visible when layer is active) */}
              {layer.active && onChangeOpacity && (
                <div className="mt-2.5 pt-2 border-t border-[#3c4043]/50 flex items-center justify-between text-[10px] font-mono text-[#9aa0a6]">
                  <span className="tracking-wide">OPACITY</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={layer.opacity}
                      aria-valuemin={10}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(layer.opacity * 100)}
                      aria-valuetext={`${Math.round(layer.opacity * 100)} percent`}
                      onChange={(e) =>
                        onChangeOpacity(layer.id, parseFloat(e.target.value))
                      }
                      className="w-24 accent-aether-accent h-1 bg-[#3c4043] rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent"
                      aria-label={`${layer.name} opacity`}
                    />
                    <span className="w-7 text-right text-[#e8eaed] font-medium">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution Footer */}
      <div className="px-4 py-2.5 border-t border-[#3c4043]/60 bg-[#1e1f20] text-[10px] font-mono text-[#9aa0a6] text-center tracking-tight">
        ECMWF ERA5 · NASA · GPCP · COPERNICUS CAMS
      </div>
    </aside>
  );
}
