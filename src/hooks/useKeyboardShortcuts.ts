"use client";

import { useEffect } from "react";

export interface KeyboardShortcutsHandlers {
  onToggleSearch?: () => void;
  onToggleInspect?: () => void;
  onCloseOverlays?: () => void;
  onTogglePlayback?: () => void;
}

export function useKeyboardShortcuts({
  onToggleSearch,
  onToggleInspect,
  onCloseOverlays,
  onTogglePlayback,
}: KeyboardShortcutsHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Escape always closes overlays, even from inputs
      if (event.key === "Escape") {
        if (onCloseOverlays) {
          event.preventDefault();
          onCloseOverlays();
        }
        return;
      }

      // Ignore other shortcuts when focused on form controls
      if (isInput) {
        return;
      }

      if (event.key === "/" && onToggleSearch) {
        event.preventDefault();
        onToggleSearch();
      } else if ((event.key === "i" || event.key === "I") && onToggleInspect) {
        event.preventDefault();
        onToggleInspect();
      } else if (event.key === " " && onTogglePlayback) {
        event.preventDefault();
        onTogglePlayback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onToggleSearch, onToggleInspect, onCloseOverlays, onTogglePlayback]);
}
