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
      aria-label="Climate data layers"
      className="fixed top-topbar bottom-timeline left-0 w-panel-layer z-panel bg-aether-surface border-r border-aether-border flex flex-col select-none transition-transform duration-slow ease-out"
    >
      {/* Panel Header */}
      <div className="h-10 px-4 border-b border-aether-border flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-aether-fg font-medium">
          CLIMATE LAYERS
        </span>
        <button
          type="button"
          aria-label="Close layers panel"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center text-aether-fg-muted hover:text-aether-fg hover:bg-aether-surface-hover rounded transition-colors text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {layers.map((layer) => {
          return (
            <div
              key={layer.id}
              className={`p-2.5 rounded-sm border transition-colors ${
                layer.active
                  ? "bg-aether-surface-elevated border-aether-accent-soft"
                  : "bg-aether-bg-secondary border-aether-border-subtle hover:border-aether-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[13px] font-sans font-medium text-aether-fg leading-tight">
                    {layer.name}
                  </span>
                  <span className="font-mono text-[10px] text-aether-fg-muted mt-0.5">
                    UNIT: {layer.unit} · {layer.source}
                  </span>
                </div>

                {/* Layer Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={layer.active}
                  aria-label={`Toggle ${layer.name}`}
                  onClick={() => onToggleLayer(layer.id)}
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    layer.active ? "bg-aether-accent" : "bg-aether-border"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-aether-bg transition-transform ${
                      layer.active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Opacity Control (Visible when layer is active) */}
              {layer.active && onChangeOpacity && (
                <div className="mt-2 pt-2 border-t border-aether-border-subtle flex items-center justify-between text-[10px] font-mono text-aether-fg-muted">
                  <span>OPACITY</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={layer.opacity}
                    onChange={(e) =>
                      onChangeOpacity(layer.id, parseFloat(e.target.value))
                    }
                    className="w-24 accent-aether-accent h-1 bg-aether-border rounded cursor-pointer"
                    aria-label={`${layer.name} opacity`}
                  />
                  <span>{Math.round(layer.opacity * 100)}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attribution Footer */}
      <div className="p-3 border-t border-aether-border bg-aether-bg-secondary text-[10px] font-mono text-aether-fg-disabled leading-relaxed">
        DATA SOURCES: ECMWF ERA5, NASA GISTEMP, GPCP, COPERNICUS CAMS
      </div>
    </aside>
  );
}
