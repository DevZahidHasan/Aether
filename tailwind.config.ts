import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aether: {
          bg: "var(--aether-bg)",
          "bg-secondary": "var(--aether-bg-secondary)",
          "bg-elevated": "var(--aether-bg-elevated)",
          surface: "var(--aether-surface)",
          "surface-elevated": "var(--aether-surface-elevated)",
          "surface-hover": "var(--aether-surface-hover)",
          fg: "var(--aether-fg)",
          "fg-secondary": "var(--aether-fg-secondary)",
          "fg-muted": "var(--aether-fg-muted)",
          "fg-disabled": "var(--aether-fg-disabled)",
          border: "var(--aether-border)",
          "border-subtle": "var(--aether-border-subtle)",
          "border-interactive": "var(--aether-border-interactive)",
          "border-focus": "var(--aether-border-focus)",
          accent: "var(--aether-accent)",
          "accent-hover": "var(--aether-accent-hover)",
          "accent-soft": "var(--aether-accent-soft)",
          success: "var(--aether-success)",
          warning: "var(--aether-warning)",
          danger: "var(--aether-danger)",
          info: "var(--aether-info)",
        },
      },
      fontFamily: {
        display: ["var(--aether-font-display)"],
        body: ["var(--aether-font-body)"],
        mono: ["var(--aether-font-mono)"],
      },
      spacing: {
        "2xs": "var(--aether-space-2xs)",
        xs: "var(--aether-space-xs)",
        sm: "var(--aether-space-sm)",
        md: "var(--aether-space-md)",
        lg: "var(--aether-space-lg)",
        xl: "var(--aether-space-xl)",
        "2xl": "var(--aether-space-2xl)",
        "3xl": "var(--aether-space-3xl)",
        "4xl": "var(--aether-space-4xl)",
        "5xl": "var(--aether-space-5xl)",
        "6xl": "var(--aether-space-6xl)",
        "7xl": "var(--aether-space-7xl)",
        topbar: "var(--aether-topbar-h)",
        timeline: "var(--aether-timeline-h)",
        "panel-layer": "var(--aether-panel-layer-w)",
        "panel-inspect": "var(--aether-panel-inspect-w)",
      },
      borderRadius: {
        sm: "var(--aether-radius-sm)",
        md: "var(--aether-radius-md)",
        lg: "var(--aether-radius-lg)",
        xl: "var(--aether-radius-xl)",
      },
      zIndex: {
        globe: "var(--aether-z-globe)",
        data: "var(--aether-z-data)",
        controls: "var(--aether-z-controls)",
        panel: "var(--aether-z-panel)",
        tooltip: "var(--aether-z-tooltip)",
        topbar: "var(--aether-z-topbar)",
        modal: "var(--aether-z-modal)",
      },
    },
  },
  plugins: [],
};

export default config;
