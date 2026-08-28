/**
 * AETHER — DESIGN TOKENS & SYSTEM CONSTANTS
 * Centralized constant values corresponding to the locked design system.
 */

export const AETHER_CONSTANTS = {
  appName: "AETHER",
  tagline: "Planetary Climate Intelligence",
  layout: {
    topbarHeight: 48,
    timelineHeight: 56,
    layerPanelWidth: 280,
    inspectPanelWidth: 320,
    legendWidth: 280,
    legendHeight: 80,
    viewportMax: 1920,
    mapSafeTop: 48,
    mapSafeBottom: 56,
    mapCenterZoneRatio: 0.7,
  },
  keyboard: {
    inspectShortcut: "i",
    searchShortcut: "/",
    closeShortcut: "Escape",
    timelinePlayShortcut: " ",
  },
  motion: {
    durationInstant: 0,
    durationFast: 80,
    durationNormal: 160,
    durationSlow: 250,
    durationSlower: 400,
    globeRespond: 200,
    globeDecay: 600,
  },
  zIndex: {
    globe: 0,
    data: 10,
    controls: 20,
    panel: 30,
    tooltip: 40,
    topbar: 50,
    modal: 60,
  },
  colors: {
    instrumentAmber: "oklch(72% 0.14 38)",
    bgDark: "oklch(16% 0.018 260)",
    surface: "oklch(20% 0.020 260)",
    border: "oklch(28% 0.018 260)",
  },
} as const;
