"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { SpatialViewport } from "@/components/spatial/SpatialViewport";
import { ContextualControls } from "@/components/controls/ContextualControls";
import { TemporalRegion } from "@/components/temporal/TemporalRegion";
import type { ApplicationMode, PlaybackState } from "@/types/spatial";

export function AetherShell() {
  const [mode, setMode] = useState<ApplicationMode>("explore");
  const [playback, setPlayback] = useState<PlaybackState>("paused");
  const [zoom, setZoom] = useState<number>(1.0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.25, 10.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.25, 0.5));
  };

  const handleResetOrientation = () => {
    setZoom(1.0);
  };

  const handleTogglePlayback = () => {
    setPlayback((prev) => (prev === "playing" ? "paused" : "playing"));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-aether-bg">
      {/* Pinned Top Navigation Region (48px) */}
      <TopBar currentMode={mode} onModeChange={setMode} />

      {/* Persistent Spatial Canvas Viewport */}
      <SpatialViewport zoom={zoom} />

      {/* Edge Contextual Navigation Controls */}
      <ContextualControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetOrientation={handleResetOrientation}
      />

      {/* Pinned Bottom Temporal Navigation Region (56px) */}
      <TemporalRegion
        playbackState={playback}
        onTogglePlayback={handleTogglePlayback}
      />
    </div>
  );
}
