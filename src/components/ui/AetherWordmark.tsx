import React from "react";
import { AETHER_CONSTANTS } from "@/config/tokens";

export interface AetherWordmarkProps {
  showTagline?: boolean;
  className?: string;
}

export function AetherWordmark({ showTagline = true, className = "" }: AetherWordmarkProps) {
  return (
    <div className={`flex items-baseline gap-2.5 select-none ${className}`}>
      <span className="font-display font-medium text-[15px] tracking-[0.08em] text-aether-fg">
        {AETHER_CONSTANTS.appName}
      </span>
      {showTagline && (
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-aether-fg-muted">
          {AETHER_CONSTANTS.tagline}
        </span>
      )}
    </div>
  );
}
