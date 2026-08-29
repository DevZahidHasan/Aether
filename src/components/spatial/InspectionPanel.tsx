"use client";

import React, { useState } from "react";
import type { ClimateMeasurement } from "@/lib/spatial/locationIntelligence";

export interface InspectionPanelProps {
  data: ClimateMeasurement;
  timelineYear?: number;
  timelineMonth?: string;
  onClose: () => void;
  onFlyTo?: (lat: number, lon: number) => void;
}

/**
 * GOOGLE EARTH DARK-THEME CLIMATE INSPECTION PANEL
 *
 * Displays localized planetary intelligence for an interrogated coordinate:
 *   - Identified city, nation, or oceanic basin
 *   - High-precision coordinates with 1-click copy
 *   - 4-metric real-time climate readings
 *   - 36-year historical decadal sparkline (1990 → 2026)
 *   - Scientific attribution & camera centering action
 */
export function InspectionPanel({
  data,
  timelineYear = 2026,
  timelineMonth = "FEB",
  onClose,
  onFlyTo,
}: InspectionPanelProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"temp" | "aqi">("temp");

  const handleCopyCoord = () => {
    const coordStr = `${data.latitude.toFixed(4)}°, ${data.longitude.toFixed(4)}°`;
    navigator.clipboard.writeText(coordStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sparkline calculation for SVG
  const sparklineData = activeTab === "temp" ? data.historicalTemp : data.historicalAqi;
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;

  // SVG points: width 280, height 50
  const svgPoints = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 280;
      const y = 45 - ((val - minVal) / range) * 38;
      return `${x},${y}`;
    })
    .join(" ");

  // Current year needle position (1990 = 0, 2026 = 280)
  const needleX = Math.max(0, Math.min(280, ((timelineYear - 1990) / 36) * 280));

  return (
    <aside
      aria-label="Geographic Point Inspection Panel"
      className="absolute top-16 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-[#1e1f20] border border-[#383a3d] rounded-2xl shadow-2xl shadow-black/90 text-white flex flex-col p-5 font-sans animate-in fade-in slide-in-from-right-4 duration-200"
    >
      {/* Screen Reader Live Telemetry Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Inspected location: ${data.locationName}, ${data.region}. Coordinates: ${Math.abs(data.latitude).toFixed(2)} degrees ${data.latitude >= 0 ? "North" : "South"}, ${Math.abs(data.longitude).toFixed(2)} degrees ${data.longitude >= 0 ? "East" : "West"}. Temperature Anomaly: ${data.tempAnomaly > 0 ? "+" : ""}${data.tempAnomaly.toFixed(2)} degrees Celsius. Precipitation: ${data.precipRate.toFixed(1)} millimeters per day, ${data.precipCategory}. Wind: ${data.windSpeed.toFixed(1)} meters per second, direction ${data.windDirection}. Air Quality Index: ${data.aqi}, ${data.aqiCategory}.`}
      </div>

      {/* 1. Header: Location Name & Circular Close Button */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#383a3d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-[17px] font-semibold tracking-tight text-white leading-tight">
              {data.locationName}
            </h2>
          </div>
          <p className="text-[12px] text-[#9aa0a6] mt-0.5 font-medium">
            {data.region}
          </p>
        </div>

        {/* Google Circular Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspection panel"
          className="w-8 h-8 rounded-full bg-[#2f3032] hover:bg-[#383a3d] text-[#c4c7c5] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 2. Coordinate Badge & Copy Action */}
      <div className="mt-3 flex items-center justify-between bg-[#28292a] border border-[#383a3d] px-3 py-2 rounded-xl text-[12px] font-mono text-[#c4c7c5]">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            {Math.abs(data.latitude).toFixed(4)}° {data.latitude >= 0 ? "N" : "S"} ·{" "}
            {Math.abs(data.longitude).toFixed(4)}° {data.longitude >= 0 ? "E" : "W"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyCoord}
          aria-label="Copy coordinates to clipboard"
          className="text-[11px] text-amber-400 hover:text-amber-300 font-sans font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* 3. Multi-Layer Localized Telemetry Grid (4 Cards) */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {/* Metric 1: Temperature Anomaly */}
        <div className="bg-[#28292a] border border-[#383a3d] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
            <span>TEMPERATURE</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.tempColor }} />
          </div>
          <div className="mt-1">
            <span className="text-[20px] font-bold font-mono tracking-tight text-white">
              {data.tempAnomalyFormatted}
            </span>
          </div>
          <span className="text-[10.5px] font-medium mt-1 truncate" style={{ color: data.tempColor }}>
            {data.tempCategory}
          </span>
        </div>

        {/* Metric 2: Precipitation */}
        <div className="bg-[#28292a] border border-[#383a3d] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
            <span>PRECIPITATION</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.precipColor }} />
          </div>
          <div className="mt-1">
            <span className="text-[20px] font-bold font-mono tracking-tight text-white">
              {data.precipFormatted}
            </span>
          </div>
          <span className="text-[10.5px] font-medium mt-1 truncate" style={{ color: data.precipColor }}>
            {data.precipCategory}
          </span>
        </div>

        {/* Metric 3: Wind Vectors */}
        <div className="bg-[#28292a] border border-[#383a3d] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
            <span>SURFACE WIND</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.windColor }} />
          </div>
          <div className="mt-1">
            <span className="text-[20px] font-bold font-mono tracking-tight text-white">
              {data.windFormatted}
            </span>
          </div>
          <span className="text-[10.5px] font-medium text-[#c4c7c5] mt-1 truncate">
            {data.windDirection}
          </span>
        </div>

        {/* Metric 4: Air Quality */}
        <div className="bg-[#28292a] border border-[#383a3d] p-3 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-[#9aa0a6]">
            <span>AIR QUALITY</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.aqiColor }} />
          </div>
          <div className="mt-1">
            <span className="text-[20px] font-bold font-mono tracking-tight text-white">
              {data.aqiFormatted}
            </span>
          </div>
          <span className="text-[10.5px] font-medium mt-1 truncate" style={{ color: data.aqiColor }}>
            {data.aqiCategory}
          </span>
        </div>
      </div>

      {/* 4. 36-Year Historical Trajectory (1990 → 2026 Sparkline) */}
      <div className="mt-4 bg-[#28292a] border border-[#383a3d] p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="text-[#9aa0a6] uppercase tracking-wider font-semibold">
            36-YEAR TRAJECTORY (1990–2026)
          </span>

          {/* Sparkline Metric Switcher */}
          <div className="flex items-center bg-[#1e1f20] rounded-lg p-0.5 border border-[#383a3d]">
            <button
              type="button"
              onClick={() => setActiveTab("temp")}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab === "temp"
                  ? "bg-amber-500/20 text-amber-400 font-semibold"
                  : "text-[#9aa0a6] hover:text-white"
              }`}
            >
              Temp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("aqi")}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab === "aqi"
                  ? "bg-amber-500/20 text-amber-400 font-semibold"
                  : "text-[#9aa0a6] hover:text-white"
              }`}
            >
              AQI
            </button>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="relative h-14 w-full mt-1">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 280 50">
            {/* Horizontal baseline line */}
            <line x1="0" y1="25" x2="280" y2="25" stroke="#383a3d" strokeDasharray="3 3" strokeWidth="1" />

            {/* Sparkline path */}
            <polyline
              fill="none"
              stroke={activeTab === "temp" ? "#f59e0b" : "#a855f7"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={svgPoints}
            />

            {/* Needle representing timeline scrubber position */}
            <line
              x1={needleX}
              y1="0"
              x2={needleX}
              y2="50"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={needleX}
              cy={45 - (((activeTab === "temp" ? data.tempAnomaly : data.aqi) - minVal) / range) * 38}
              r="3.5"
              fill="#ffffff"
              stroke={activeTab === "temp" ? "#f59e0b" : "#a855f7"}
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#9aa0a6] mt-1.5 pt-1.5 border-t border-[#383a3d]">
          <span>1990 ({sparklineData[0]}{activeTab === "temp" ? "°C" : " AQI"})</span>
          <span className="text-amber-400 font-semibold">{timelineMonth} {timelineYear}</span>
          <span>2026 ({sparklineData[sparklineData.length - 1]}{activeTab === "temp" ? "°C" : " AQI"})</span>
        </div>
      </div>

      {/* 5. Footer: Attribution & Fly To Action */}
      <div className="mt-4 pt-3 border-t border-[#383a3d] flex items-center justify-between text-[11px]">
        <div className="text-[10px] font-mono text-[#9aa0a6]">
          <span>ECMWF · NASA · CAMS</span>
        </div>

        {onFlyTo && (
          <button
            type="button"
            onClick={() => onFlyTo(data.latitude, data.longitude)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded px-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Center Camera</span>
          </button>
        )}
      </div>
    </aside>
  );
}
