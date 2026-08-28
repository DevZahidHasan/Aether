/**
 * AETHER — SPATIAL ARCHITECTURE TYPE CONTRACTS
 * Source of truth: docs/AETHER-SPATIAL-ARCHITECTURE.md
 *
 * Defines the six orthogonal state dimensions:
 * MapState × LayerState × TemporalState × LocationState × InspectionState × UIState
 */

export type ProjectionType = "globe-3d" | "orthographic" | "mercator";

export type LevelOfDetail = "global" | "continental" | "regional" | "local" | "point";

export type ApplicationMode = "explore" | "inspect";

export type PlaybackState = "paused" | "playing" | "buffering";

export type ActiveTool = "navigate" | "inspect" | "measure" | "search";

export interface GeoCoordinate {
  longitude: number;
  latitude: number;
  altitude?: number;
}

export interface GeographicHierarchy {
  continent?: string;
  country?: string;
  region?: string;
  city?: string;
  watershed?: string;
}

export interface MapOrientation {
  heading: number; // azimuth in degrees (0 = North)
  pitch: number;   // tilt angle in degrees (0 = nadir)
  roll: number;
}

/**
 * 1. Map State
 * Controls orbital position, zoom, orientation, and level of detail.
 */
export interface MapState {
  center: GeoCoordinate;
  zoom: number;
  orientation: MapOrientation;
  projection: ProjectionType;
  lod: LevelOfDetail;
}

/**
 * 2. Layer State
 * Controls data layer active status, opacities, ordering, and visualization mode.
 */
export interface LayerConfig {
  layerId: string;
  visible: boolean;
  opacity: number; // 0.0 to 1.0
  order: number;
  blendMode?: "normal" | "additive" | "multiply";
}

export interface LayerState {
  activeLayerIds: string[];
  layerConfigs: Record<string, LayerConfig>;
  activeVisualizationMode: "raster" | "vector-field" | "particles" | "contour";
}

/**
 * 3. Temporal State
 * Controls continuous time navigation, playback, and historical baseline references.
 */
export interface TemporalState {
  currentTimestamp: number; // Unix timestamp in ms
  rangeStart: number;       // Unix timestamp in ms
  rangeEnd: number;         // Unix timestamp in ms
  playbackState: PlaybackState;
  playbackSpeed: number;    // Multiplier, e.g. 1x, 2x, 5x
  baselinePeriod: {
    startYear: number;
    endYear: number;
  };
}

/**
 * 4. Location State
 * Controls selected region or geographic entity.
 */
export interface LocationState {
  selectedCoordinate: GeoCoordinate | null;
  selectedRegionName: string | null;
  hierarchy: GeographicHierarchy | null;
}

/**
 * 5. Inspection State
 * Controls deep scientific interrogation of a specific coordinate or dataset.
 */
export interface InspectionMeasurement {
  datasetId: string;
  datasetName: string;
  rawValue: number;
  unit: string;
  formattedValue: string;
  baselineDeviation?: number;
  confidenceScore?: number;
}

export interface InspectionState {
  inspectedPoint: GeoCoordinate | null;
  selectedDatasetId: string | null;
  measurement: InspectionMeasurement | null;
  historicalBaselineSummary?: string;
  dataSourceCitation?: string;
}

/**
 * 6. UI State
 * Controls interface panels, tools, keyboard navigation, and modal states.
 */
export interface UIState {
  mode: ApplicationMode;
  activePanels: {
    layers: boolean;
    inspect: boolean;
    legend: boolean;
    search: boolean;
    help: boolean;
  };
  activeTool: ActiveTool;
  searchOpen: boolean;
  keyboardFocusActive: boolean;
  reducedMotionPreferred: boolean;
}

/**
 * Composite Spatial Domain State
 * Represents the complete orthogonal state container.
 */
export interface SpatialDomainState {
  map: MapState;
  layers: LayerState;
  temporal: TemporalState;
  location: LocationState;
  inspection: InspectionState;
  ui: UIState;
}
