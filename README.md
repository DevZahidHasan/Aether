# AETHER — Planetary Climate Intelligence Instrument

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-orange?style=flat-square&logo=three.js)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-v8-darkred?style=flat-square)](https://docs.pmnd.rs/react-three-fiber/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

> **AETHER** is a high-precision, real-time planetary climate intelligence instrument built with Next.js App Router, React 19, TypeScript, Three.js, React Three Fiber, and custom GLSL shaders.
> 
> The Earth is the primary interface. AETHER departs fundamentally from conventional SaaS dashboards, presenting planetary environmental data through calibrated 3D spatial simulation, physical advection fields, 36-year temporal trajectories (1990–2026), and geodetic point interrogation across all 177 sovereign nations.

---

## The Philosophy: Planet-First Interface

Most climate analytics applications wrap data inside dense dashboard cards, treating maps as passive background wallpaper. 

**AETHER reverses this paradigm entirely:**
* **The Earth is the Interface**: Every interaction begins and ends in 3D celestial space. Controls remain minimal and restrained along the perimeter, acting as an optical instrument frame around the planet.
* **Continuous Physical Simulation**: Data is not represented as static choropleth maps. Wind vectors flow along physical ECMWF ERA5 streamlines; precipitation blooms through procedural Gaussian atmospheric plumes; temperature anomalies warp across planetary thermal belts; aerosol haze disperses via volumetric particle advection.
* **Scientific Restraint**: Dark by default (`#141417`), hairline borders (`#383a3d`), and zero decorative gradients or glassmorphism. Instrument Amber (`#f59e0b` / `oklch(72% 0.14 38)`) is reserved strictly for active telemetry, focus rings, and spatial targeting.

---

## Anatomy of the Spatial Inspection Panel

When clicking any geographic point on Earth or searching for any city or nation, AETHER conducts a cinematic 3D great-circle flight and engages the **Spatial Inspection Panel**:

```
┌─────────────────────────────────────────────────────────────┐
│ ● New York City                                         [×] │
│   USA                                                       │
├─────────────────────────────────────────────────────────────┤
│ ⌖ 40.8025° N · 75.8806° W                              Copy │
├──────────────────────────────┬──────────────────────────────┤
│ TEMPERATURE               ●  │ PRECIPITATION              ● │
│ +0.8°C                       │ 0.0 mm/d                     │
│ Moderate Warming (+0.4°C...) │ Dry (< 1 mm/d)               │
├──────────────────────────────┼──────────────────────────────┤
│ SURFACE WIND              ●  │ AIR QUALITY                ● │
│ 10.6 m/s                     │ 44 AQI                       │
│ 274° W (Fresh Breeze)        │ Good (0–50)                  │
├──────────────────────────────┴──────────────────────────────┤
│ 36-YEAR TRAJECTORY (1990–2026)                 [Temp] [AQI] │
│   1.0°C ───────────────────────────────────●─────── /       │
│                                           │        /        │
│   0.3°C ───────────────/───────────────── │ ───────         │
│         1990 (0.3°C)         FEBRUARY 2021     2026 (1°C)   │
├─────────────────────────────────────────────────────────────┤
│ ECMWF · NASA · CAMS                        ⌖ Center Camera  │
└─────────────────────────────────────────────────────────────┘
```

### 1. Geographic Header & Identification
* **Pulsing Status Beacon**: Visual indicator confirming real-time telemetry lock.
* **Location Name & Territory**: High-precision reverse geocoding identifying metropolitan cities, regional divisions, sovereign nations, or marine oceanic basins.
* **Circular Dismiss Button**: Restores free exploration mode and clears spatial targeting.

### 2. Geodetic Coordinates Pill
* **Format**: Calibrated geographic coordinates (`40.8025° N · 75.8806° W`).
* **Copy Action**: Single-click clipboard copy formatted for GIS and scientific mapping tools.

### 3. Quad Climate Metric Grid
* **Temperature Anomaly (`°C`)**:
  * **Measurement**: Local thermal deviation from the 1991–2020 climatological baseline.
  * **Scientific Scale**: Categorized into physical regimes (`Baseline Stable`, `Moderate Warming (+0.4°C...+1.2°C)`, `Severe Warming`, `Extreme Warming (+2.5°C+)`, or `Thermal Deficit`).
  * **Visual Dot**: Color-coded dynamically to the ECMWF diverging thermal spectrum (Deep Cyan $\rightarrow$ Amber $\rightarrow$ Crimson).
* **Precipitation Rate (`mm/day`)**:
  * **Measurement**: Instantaneous atmospheric water flux.
  * **Scientific Scale**: Categorized from `Arid / Dry (< 1 mm/d)` up to `Torrential Downpour (> 50 mm/d)`.
  * **Visual Dot**: Color-coded to GPCP cyan/deep blue moisture scales.
* **Surface Wind Vectors (`m/s`)**:
  * **Measurement**: Horizontal atmospheric velocity field.
  * **Heading**: Exact compass orientation in degrees (`274° W`) and Beaufort wind classification (`Fresh Breeze`, `Gale`, `Storm`).
  * **Visual Dot**: Emerald circulation indicator synchronized with GPU particle advection.
* **Air Quality Index (`AQI`)**:
  * **Measurement**: Continuous particulate and aerosol density (0–500 scale).
  * **EPA/WHO Standard**: Categorized into `Good (0–50)`, `Moderate (51–100)`, `Unhealthy for Sensitive Groups (101–150)`, `Unhealthy (151–200)`, `Very Unhealthy (201–300)`, or `Hazardous (301–500)`.
  * **Aerosol Attribution**: Dominant particulate identification (`PM2.5 Smog`, `Mineral Dust`, `Wildfire Smoke`).

### 4. 36-Year Historical Trajectory Sparkline (1990–2026)
* **Decadal Climate Context**: Plots 10 historical temporal anchor points from 1990 through 2026.
* **Metric Switcher**: Toggle instantly between **Thermal Anomaly** and **Air Quality Trajectory**.
* **Time Playhead Needle**: A vertical dashed playhead needle indicating the exact year and month currently engaged on the global timeline (`FEBRUARY 2021`).
* **Dynamic Climatology**: Reflects authentic historical warming trends (+0.3°C in 1990 to +1.0°C in 2026).

### 5. Attribution & Camera Center
* **Scientific Sources**: ECMWF (European Centre for Medium-Range Weather Forecasts), NASA Blue Marble, and CAMS (Copernicus Atmosphere Monitoring Service).
* **Center Camera**: Triggers an orbital flight to orient the 3D celestial camera directly perpendicular to the target location.

---

## Core System Architecture

```
                                  ┌───────────────────────────┐
                                  │   Next.js 15 App Router   │
                                  │   (React 19 Concurrent)   │
                                  └─────────────┬─────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     ▼                                                     ▼
       ┌───────────────────────────┐                         ┌───────────────────────────┐
       │     Application Shell     │                         │    React Three Fiber      │
       │   (2D Spatial Overlay)    │                         │       (3D Canvas)         │
       └─────────────┬─────────────┘                         └─────────────┬─────────────┘
                     │                                                     │
        ┌────────────┴────────────┐                           ┌────────────┴────────────┐
        ▼                         ▼                           ▼                         ▼
  ┌───────────┐             ┌───────────┐               ┌───────────┐             ┌───────────┐
  │  TopBar   │             │ Timeline  │               │  Planet   │             │ Concentric│
  │  Nav &    │             │ Scrubber  │               │   Base    │             │  Shaders  │
  │  Search   │             │ 1990-2026 │               │  Sphere   │             │  Layers   │
  └───────────┘             └───────────┘               └───────────┘             └───────────┘
        │                         │                           │                         │
        ▼                         ▼                           ▼                         ▼
  ┌───────────┐             ┌───────────┐               ┌───────────┐             ┌───────────┐
  │Inspection │             │ Layer     │               │  Orbit    │             │ 3D Radar  │
  │  Panel    │             │ Panel     │               │ Controls  │             │  Target   │
  │  Overlay  │             │ Flyout    │               │ Inertia   │             │  Marker   │
  └───────────┘             └───────────┘               └───────────┘             └───────────┘
```

### 1. Concentric Radial Sphere Stacking (Z-Fighting Prevention)
To visualize multiple continuous volumetric data layers simultaneously without graphical artifacts, AETHER constructs a mathematical stack of concentric spherical shells around the planetary core ($R = 2.000$):

| Layer | Radius ($R$) | Technology | Function |
| :--- | :---: | :--- | :--- |
| **Earth Surface** | `2.0000` | MeshStandardMaterial | NASA 8K Blue Marble satellite base, specular ocean mask, night lights |
| **Country Borders** | `2.0050` | LineSegments / BufferGeometry | 177 sovereign national boundaries from high-res GeoJSON |
| **Temperature Anomaly** | `2.0080` | Custom GLSL Shader | Divergent thermal anomaly field with continuous time interpolation |
| **Air Quality (AQI)** | `2.0100` | Custom GLSL Shader | Aerosol particulate haze, organic particulate dispersion |
| **Precipitation** | `2.0120` | Custom GLSL Shader | Atmospheric moisture plumes, domain-warped turbulence |
| **Geographic Graticule**| `2.0140` | LineSegments | 30° spatial latitude/longitude coordinate grid |
| **Wind Streamlines** | `2.0200` | GPU Particle Advection | ECMWF ERA5 physical circulation streamlines |
| **Interaction Shell** | `2.0220` | Invisible Mesh (Inspect mode) | Pointer event interceptor for geodetic raycasting |
| **Inspection Target** | `2.0360` | Billboard Mesh & Rings | 3D animated radar pulse reticle beacon |
| **Atmospheric Rim** | `2.2400` | Inverted Normals Shader | Rayleigh/Mie scattering atmospheric edge glow |

### 2. Physical Motion & Cinematic Flight
* **3D Spherical Arc Flight (`flyTo`)**: Smoothly travels between any two geographic points along great-circle geodesics using Quaternion spherical linear interpolation (`Quaternion.slerp`).
* **Parabolic Altitude Arc**: The camera smoothly elevates (+0.45 units peak) mid-flight, creating an authentic orbital swoop before descending into the focus altitude ($3.3$ units).
* **Planetary Inertia**: Calibrated orbital damping (`dampingFactor: 0.038`, `rotateSpeed: 0.65`) providing natural celestial mass and coasting momentum.

### 3. Universal Search & Instant Spatial Pinning
* Instant query resolution across coordinates (`23.81, 90.41`), 177 sovereign nations, world capitals, Bangladesh administrative divisions, and planetary features (Arctic, Amazon, Sahara).
* Searching immediately activates Inspect mode, pins the target with the 3D pulse reticle, opens real-time telemetry, and executes the camera swoop.

### 4. Accessibility (WCAG 2.1 AA Compliant)
* **Reduced Motion Detection**: Automatically detects `prefers-reduced-motion: reduce`: snaps camera flights instantly (50ms cut), disables altitude elevation arcs, and pauses auto-rotation to prevent vestibular disorientation.
* **Full Keyboard Scrubbing**: The timeline track is keyboard operable (`ArrowLeft`/`ArrowRight` for 1-year steps, `PageUp`/`PageDown` for 5-year leaps, `Home`/`End` for 1990/2026 boundaries).
* **Visible Focus Indicators**: Instrument Amber (`#f59e0b`) high-contrast focus rings on all interactive elements.
* **Screen Reader Live Announcements**: `aria-live="polite"` telemetry reporting and skip links.

---

## Getting Started

### Prerequisites
* **Node.js**: `v18.17.0` or higher (Node 20+ recommended)
* **npm**: `v9.0.0` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/DevZahidHasan/Aether.git
cd aether

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| <kbd>I</kbd> | Toggle **Inspect Mode** / Free Exploration |
| <kbd>/</kbd> | Open **Geographic Search** command palette |
| <kbd>Space</kbd> | Toggle Timeline **Play / Pause** |
| <kbd>Esc</kbd> | Dismiss inspection panel / search overlay |
| <kbd>→</kbd> / <kbd>←</kbd> | Step timeline forward / backward 1 year |
| <kbd>PageUp</kbd> / <kbd>PageDn</kbd> | Leap timeline forward / backward 5 years |
| <kbd>Home</kbd> / <kbd>End</kbd> | Jump to 1990 / 2026 |

### Production Build & Verification

```bash
# Run TypeScript strict type verification
npm run type-check

# Run ESLint validation
npm run lint

# Compile optimized production bundle
npm run build

# Start production server
npm run start
```

---

## Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | High-performance React framework with server components and static optimization |
| **Library** | React 19 | Concurrent rendering, hooks, memoized component tree |
| **Language** | TypeScript (Strict) | Zero `any`, strict null checks, fully typed spatial domain models |
| **3D Rendering** | Three.js & React Three Fiber | WebGL scene graph, custom shaders, orbital physics |
| **3D Utilities** | @react-three/drei | Camera management, shader materials, mesh abstractions |
| **Styling** | Tailwind CSS & CSS Variables | Strict token-based scientific UI, OKLCH instrument amber |
| **Geographic Engine**| Custom Raycasting & GeoJSON | Jordan curve polygon matching across 177 sovereign states |

---

## Documentation Directory

For in-depth architectural specifications and engineering deep dives:

* **[Interview & Technical Architecture Deep-Dive](docs/AETHER-TECHNICAL-INTERVIEW-GUIDE.md)**: Exhaustive architectural guide with mathematical derivations, WebGL shader breakdowns, performance strategies, and answers to senior/staff interview questions.
* **[Product Vision](docs/AETHER-PRODUCT-VISION.md)**: Product mission and philosophy.
* **[Design Direction](docs/AETHER-DESIGN-DIRECTION.md)**: Visual language and dark-mode instrument aesthetics.
* **[Design System](docs/AETHER-DESIGN-SYSTEM.md)**: Color tokens, typography, and UI guidelines.
* **[Spatial Architecture](docs/AETHER-SPATIAL-ARCHITECTURE.md)**: 3D coordinate systems, concentric spheres, and camera choreography.
* **[Data Visualization](docs/AETHER-DATA-VISUALIZATION.md)**: Scientific color scales, divergence, and data layers.
* **[Development Progress](docs/AETHER-PROGRESS.md)**: Verification log across all 11 roadmap milestones.

---

## Author & Acknowledgements

* **Architect & Engineer**: Zahid Hasan ([@DevZahidHasan](https://github.com/DevZahidHasan))
* **Scientific Data Citations**:
  * ECMWF (European Centre for Medium-Range Weather Forecasts) — ERA5 Reanalysis
  * NASA Earth Observatory — Blue Marble: Next Generation
  * GPCP (Global Precipitation Climatology Project)
  * CAMS (Copernicus Atmosphere Monitoring Service)
  * Natural Earth Vector Datasets

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
