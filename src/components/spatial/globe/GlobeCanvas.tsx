"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { GlobeScene } from "./GlobeScene";
import type { GeoCoordinate } from "@/types/spatial";

export interface GlobeCanvasProps {
  zoom?: number;
  resetOrientationTrigger?: number;
  onCoordinateChange?: (coord: GeoCoordinate) => void;
}

function GlobeLoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="w-48 h-48 border border-dashed border-aether-accent/40 rounded-full animate-spin flex items-center justify-center" style={{ animationDuration: "8s" }}>
        <div className="w-32 h-32 border border-aether-border rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-aether-accent animate-pulse" />
        </div>
      </div>
      <div className="mt-4 font-mono text-[11px] uppercase tracking-widest text-aether-fg-muted">
        STREAMING NASA BLUE MARBLE...
      </div>
    </div>
  );
}

export function GlobeCanvas({
  zoom = 1.0,
  resetOrientationTrigger = 0,
  onCoordinateChange,
}: GlobeCanvasProps) {
  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<GlobeLoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 45 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
          }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <GlobeScene
            zoom={zoom}
            resetOrientationTrigger={resetOrientationTrigger}
            onCoordinateChange={onCoordinateChange}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
