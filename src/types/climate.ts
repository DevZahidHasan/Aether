/**
 * AETHER — CLIMATE DATA DOMAIN CONTRACTS
 * Source of truth: docs/AETHER-DATA-VISUALIZATION.md & docs/AETHER-TECH-ARCHITECTURE.md
 *
 * Defines the strongly typed contracts for climate layers, data sources, and observations.
 */

import type { GeoCoordinate } from "./spatial";

export type ClimateLayerId =
  | "temperature-anomaly"
  | "precipitation"
  | "wind"
  | "air-quality";

export type ColorScaleType =
  | "diverging"
  | "sequential"
  | "vector"
  | "categorical";

export type LayerRendererType =
  | "gl-raster"
  | "gl-vector-field"
  | "gl-particles"
  | "gl-contour";

export interface ColorStop {
  value: number;
  colorCss: string; // CSS color string (oklch)
  label?: string;
}

export interface ColorScaleDefinition {
  type: ColorScaleType;
  min: number;
  max: number;
  unit: string;
  stops: ColorStop[];
  zeroValue?: number; // E.g. baseline 0 for temperature anomaly
}

export interface ClimateDataSource {
  id: string;
  name: string;
  provider: string; // E.g. "ECMWF (ERA5)", "NASA (GISTEMP)", "Copernicus (CAMS)"
  citation: string;
  spatialResolution: string; // E.g. "0.25° (~28 km)"
  temporalCadence: string;   // E.g. "Hourly", "Daily", "Monthly"
  license: string;
}

/**
 * Climate Layer Contract
 * Every climate layer implemented in AETHER must fulfill this specification.
 */
export interface ClimateLayer {
  id: ClimateLayerId;
  name: string;
  description: string;
  unit: string;
  symbol: string;
  source: ClimateDataSource;
  temporalResolution: string;
  spatialResolution: string;
  colorScale: ColorScaleDefinition;
  renderer: LayerRendererType;
  defaultOpacity: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Single Point Observation Contract
 * Used during spatial point interrogation (Inspect Mode).
 */
export interface ClimatePointObservation {
  coordinate: GeoCoordinate;
  timestamp: number;
  layerId: ClimateLayerId;
  rawValue: number;
  anomalyDeviation?: number;
  unit: string;
  confidenceScore: number; // 0.0 to 1.0
  sourceAttribution: string;
}
