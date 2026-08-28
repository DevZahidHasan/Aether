import React from "react";

export interface ContextualControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetOrientation?: () => void;
  className?: string;
}

export function ContextualControls({
  onZoomIn,
  onZoomOut,
  onResetOrientation,
  className = "",
}: ContextualControlsProps) {
  return (
    <aside
      aria-label="Spatial navigation controls"
      className={`fixed top-16 right-4 z-controls flex flex-col gap-1.5 ${className}`}
    >
      <div className="flex flex-col bg-aether-surface border border-aether-border rounded-sm overflow-hidden shadow-sm">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={onZoomIn}
          className="w-8 h-8 flex items-center justify-center text-aether-fg-secondary hover:text-aether-fg hover:bg-aether-surface-hover transition-colors font-mono text-[14px] cursor-pointer"
        >
          +
        </button>
        <div className="h-[1px] bg-aether-border" aria-hidden="true" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={onZoomOut}
          className="w-8 h-8 flex items-center justify-center text-aether-fg-secondary hover:text-aether-fg hover:bg-aether-surface-hover transition-colors font-mono text-[14px] cursor-pointer"
        >
          −
        </button>
      </div>

      <button
        type="button"
        aria-label="Reset North orientation"
        onClick={onResetOrientation}
        className="w-8 h-8 flex items-center justify-center bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-muted hover:text-aether-accent border border-aether-border rounded-sm transition-colors font-mono text-[11px] font-medium cursor-pointer"
      >
        N
      </button>
    </aside>
  );
}
