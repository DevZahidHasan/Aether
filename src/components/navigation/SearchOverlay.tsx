"use client";

import React, { useEffect, useRef, useState } from "react";

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation?: (query: string) => void;
}

export function SearchOverlay({
  isOpen,
  onClose,
  onSelectLocation,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && onSelectLocation) {
      onSelectLocation(query.trim());
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Geographic Search"
      className="fixed inset-0 z-modal flex items-start justify-center pt-20 px-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-aether-surface border border-aether-border rounded-sm shadow-2xl p-4 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-aether-border pb-3">
          <svg
            className="w-4 h-4 text-aether-fg-muted shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH REGION, CITY, OR COORDINATES..."
            className="w-full bg-transparent font-mono text-[13px] text-aether-fg placeholder:text-aether-fg-disabled outline-none uppercase tracking-wide"
            aria-label="Search query"
          />

          <kbd className="text-[10px] font-mono text-aether-fg-muted bg-aether-bg px-1.5 py-0.5 rounded border border-aether-border-subtle shrink-0">
            ESC
          </kbd>
        </form>

        <div className="mt-3 flex flex-col gap-1 text-[11px] font-mono text-aether-fg-muted">
          <span className="text-[10px] uppercase tracking-wider text-aether-fg-disabled mb-1">
            SPATIAL QUERY FORMATS:
          </span>
          <div className="flex justify-between py-1 border-b border-aether-border-subtle/50">
            <span className="text-aether-fg-secondary">CONTINENT / REGION</span>
            <span className="text-aether-fg-disabled">Arctic Basin, Sahel, Amazonia</span>
          </div>
          <div className="flex justify-between py-1 border-b border-aether-border-subtle/50">
            <span className="text-aether-fg-secondary">GEOGRAPHIC COORDINATES</span>
            <span className="text-aether-fg-disabled">64.20° N, 18.50° W</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-aether-fg-secondary">MEASUREMENT STATION</span>
            <span className="text-aether-fg-disabled">Mauna Loa Observatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
