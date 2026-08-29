import React from "react";

export interface ZoomControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetOrientation?: () => void;
  className?: string;
}

export const ZoomControls = React.memo(function ZoomControls({
  onZoomIn,
  onZoomOut,
  onResetOrientation,
  className = "",
}: ZoomControlsProps) {
  return (
    <div
      role="group"
      aria-label="Zoom and orientation controls"
      className={`flex flex-col gap-1.5 select-none ${className}`}
    >
      <div className="flex flex-col bg-aether-surface border border-aether-border rounded-sm overflow-hidden shadow-sm">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={onZoomIn}
          className="w-9 h-9 flex items-center justify-center text-aether-fg-secondary hover:text-aether-fg hover:bg-aether-surface-hover transition-colors font-mono text-[16px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg z-10"
        >
          +
        </button>
        <div className="h-[1px] bg-aether-border" aria-hidden="true" />
        <button
          type="button"
          aria-label="Zoom out"
          onClick={onZoomOut}
          className="w-9 h-9 flex items-center justify-center text-aether-fg-secondary hover:text-aether-fg hover:bg-aether-surface-hover transition-colors font-mono text-[16px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg z-10"
        >
          −
        </button>
      </div>

      {onResetOrientation && (
        <button
          type="button"
          aria-label="Reset North orientation"
          onClick={onResetOrientation}
          className="w-9 h-9 flex items-center justify-center bg-aether-surface hover:bg-aether-surface-hover text-aether-fg-muted hover:text-aether-accent border border-aether-border rounded-sm transition-colors font-mono text-[11px] font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aether-accent focus-visible:ring-offset-1 focus-visible:ring-offset-aether-bg"
        >
          N
        </button>
      )}
    </div>
  );
});
