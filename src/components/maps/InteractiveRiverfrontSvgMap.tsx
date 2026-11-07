import React, { useState } from 'react';
import {
  MapLayerVisibility,
  SelectedMapFeature,
} from './mapTypes';
import {
  ComputedJourneyOption,
  GhatDestination,
  OperationalIncident,
  ParkingHub,
  RoadCorridorSegment,
  ShuttleCorridor,
} from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

export interface InteractiveRiverfrontSvgMapProps {
  portal: 'pilgrim' | 'command';
  layers: MapLayerVisibility;
  ghats: GhatDestination[];
  parkingHubs: ParkingHub[];
  shuttles: ShuttleCorridor[];
  roads: RoadCorridorSegment[];
  incidents: OperationalIncident[];
  selectedFeature: SelectedMapFeature | null;
  onSelectFeature: (feature: SelectedMapFeature) => void;
  highlightedJourneyOption?: ComputedJourneyOption | null;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
  compactHeight?: boolean;
}

export const InteractiveRiverfrontSvgMap: React.FC<
  InteractiveRiverfrontSvgMapProps
> = ({
  portal,
  layers,
  ghats,
  parkingHubs,
  shuttles,
  roads,
  incidents,
  selectedFeature,
  onSelectFeature,
  highlightedJourneyOption,
  zoomLevel,
  panOffset,
  onPanChange,
  compactHeight = false,
}) => {
  const { t, language } = useTranslation();
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  const isCommand = portal === 'command';

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).closest('[data-interactive-node="true"]')) {
      return;
    }
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return;
    const nextX = Math.max(-260, Math.min(260, e.clientX - dragStart.x));
    const nextY = Math.max(-180, Math.min(180, e.clientY - dragStart.y));
    onPanChange({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const pointsToSvgPath = (pts: Array<{ svgX: number; svgY: number }>) => {
    if (pts.length === 0) return '';
    return pts
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.svgX} ${pt.svgY}`)
      .join(' ');
  };

  const activeIncidents = incidents.filter(
    (inc) => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED'
  );
  const closedOrDivertedRoads = roads.filter(
    (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
  );

  return (
    <div
      data-testid="offline-svg-riverfront-map"
      className={`relative w-full overflow-hidden rounded-2xl border select-none ${
        compactHeight ? 'h-[430px]' : 'h-[560px]'
      } ${
        isCommand
          ? 'bg-[#070D19] border-slate-800'
          : 'bg-[#F4F1EA] border-[#E5DFD5]'
      }`}
    >
      {/* Top-Left Schematic Map Disclosure Badge */}
      <div
        data-testid="schematic-map-disclosure"
        className={`absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 pointer-events-none ${
          isCommand
            ? 'bg-slate-900/90 border-slate-700 text-slate-200'
            : 'bg-white/90 border-[#E5DFD5] text-slate-800 shadow-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>
          {language === 'te'
            ? 'గోదావరి నదీ తీర స్కీమాటిక్ మ్యాప్ (ఆఫ్‌లైన్ సిద్ధం — సర్వే మ్యాప్ కాదు)'
            : language === 'hi'
            ? 'गोदावरी रिवरफ्रंट योजनाबद्ध मानचित्र (ऑफ़लाइन सक्षम — सर्वेक्षण मानचित्र नहीं)'
            : 'Godavari Riverfront Schematic Map (Offline-Ready — Not Survey-Grade Cartography)'}
        </span>
      </div>

      <svg
        viewBox="0 0 1000 620"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="region"
        aria-label="Interactive Rajamahendravaram and Kovvur Godavari Riverfront Map"
      >
        <defs>
          {/* River Water Gradient */}
          <linearGradient id="godavariWaterDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#082F49" />
            <stop offset="50%" stopColor="#0C4A6E" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="godavariWaterLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="50%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Radial Heatmap Gradients */}
          <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
            <stop offset="55%" stopColor="#F97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.52" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatModerate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
            <stop offset="65%" stopColor="#06B6D4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heatLow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          transform={`translate(${500 + panOffset.x}, ${
            310 + panOffset.y
          }) scale(${zoomLevel}) translate(-500, -310)`}
        >
          {/* Landmass Background Grid & Bank Zones */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="620"
            fill={isCommand ? '#070D19' : '#F4F1EA'}
          />

          {/* Subtle Topographic Grid Lines */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((gx) => (
            <line
              key={`gx-${gx}`}
              x1={gx}
              y1={0}
              x2={gx}
              y2={620}
              stroke={isCommand ? '#1E293B' : '#E5DFD5'}
              strokeWidth="0.8"
              strokeDasharray="4 4"
            />
          ))}
          {[100, 200, 300, 400, 500].map((gy) => (
            <line
              key={`gy-${gy}`}
              x1={0}
              y1={gy}
              x2={1000}
              y2={gy}
              stroke={isCommand ? '#1E293B' : '#E5DFD5'}
              strokeWidth="0.8"
              strokeDasharray="4 4"
            />
          ))}

          {/* GODAVARI RIVER CHANNEL (Flowing North-West to South-East) */}
          <path
            d="M 275 0 C 295 140, 250 280, 305 420 C 345 510, 420 575, 485 620 L 645 620 C 595 520, 535 420, 495 310 C 460 200, 455 95, 440 0 Z"
            fill={
              isCommand ? 'url(#godavariWaterDark)' : 'url(#godavariWaterLight)'
            }
            stroke={isCommand ? '#0284C7' : '#0284C7'}
            strokeWidth="2"
            opacity="0.92"
          />

          {/* River Flow Contour Lines */}
          <path
            d="M 345 20 C 355 160, 325 290, 385 430 C 420 510, 480 570, 535 610"
            fill="none"
            stroke={isCommand ? '#38BDF8' : '#0369A1'}
            strokeWidth="1.2"
            strokeDasharray="8 8"
            opacity="0.35"
          />

          {/* Sir Arthur Cotton Dowleswaram Barrage Structure */}
          <line
            x1="395"
            y1="540"
            x2="640"
            y2="545"
            stroke={isCommand ? '#94A3B8' : '#475569'}
            strokeWidth="6"
            strokeDasharray="6 3"
          />
          <text
            x="490"
            y="565"
            textAnchor="middle"
            fill={isCommand ? '#94A3B8' : '#334155'}
            fontSize="10"
            fontWeight="700"
          >
            DOWLESWARAM COTTON BARRAGE
          </text>

          {/* Geographic Region Labels */}
          <text
            x="145"
            y="65"
            fill={isCommand ? '#64748B' : '#64748B'}
            fontSize="13"
            fontWeight="800"
            letterSpacing="1.5"
          >
            WEST BANK — KOVVUR
          </text>
          <text
            x="725"
            y="55"
            fill={isCommand ? '#64748B' : '#64748B'}
            fontSize="13"
            fontWeight="800"
            letterSpacing="1.5"
          >
            EAST BANK — RAJAMAHENDRAVARAM
          </text>
          <text
            x="405"
            y="245"
            fill={isCommand ? '#7DD3FC' : '#0C4A6E'}
            fontSize="12"
            fontWeight="800"
            letterSpacing="2"
            transform="rotate(72, 405, 245)"
            opacity="0.8"
          >
            PAVITRA GODAVARI RIVER
          </text>

          {/* LAYER 4: CROWD HEATMAP LAYER */}
          {layers.crowdHeatmap && (
            <g data-testid="svg-layer-crowdHeatmap">
              {ghats.map((ghat) => {
                const occupancyRatio =
                  ghat.currentOccupancyCount / ghat.maxCapacityCount;
                const radius = Math.round(38 + occupancyRatio * 48);
                const fillGrad =
                  ghat.crowdLevel === 'CRITICAL'
                    ? 'url(#heatCritical)'
                    : ghat.crowdLevel === 'HIGH'
                    ? 'url(#heatHigh)'
                    : ghat.crowdLevel === 'MODERATE'
                    ? 'url(#heatModerate)'
                    : 'url(#heatLow)';
                return (
                  <circle
                    key={`heat-${ghat.id}`}
                    cx={ghat.coordinates.svgX}
                    cy={ghat.coordinates.svgY}
                    r={radius}
                    fill={fillGrad}
                    pointerEvents="none"
                  />
                );
              })}
            </g>
          )}

          {/* LAYER 6: EMERGENCY ROUTES LAYER */}
          {layers.emergencyRoutes && (
            <g data-testid="svg-layer-emergencyRoutes">
              {roads
                .filter((r) => r.isEmergencyRoute)
                .map((road) => (
                  <path
                    key={`emg-${road.id}`}
                    d={pointsToSvgPath(road.polyline)}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.22"
                    pointerEvents="none"
                  />
                ))}
            </g>
          )}

          {/* LAYER 1: TRAFFIC CORRIDORS LAYER */}
          {layers.traffic && (
            <g data-testid="svg-layer-traffic">
              {roads.map((road) => {
                const isSelected =
                  selectedFeature?.type === 'ROAD' &&
                  selectedFeature.id === road.id;
                const strokeColor =
                  road.status === 'CLOSED'
                    ? '#EF4444'
                    : road.status === 'DIVERTED'
                    ? '#F97316'
                    : road.status === 'CONGESTED'
                    ? '#F59E0B'
                    : '#10B981';

                const midPt =
                  road.polyline[Math.floor(road.polyline.length / 2)] ||
                  road.polyline[0];

                return (
                  <g
                    key={road.id}
                    data-interactive-node="true"
                    data-testid={`map-road-${road.id}`}
                    onClick={() =>
                      onSelectFeature({ type: 'ROAD', id: road.id })
                    }
                    className="cursor-pointer group"
                  >
                    <path
                      d={pointsToSvgPath(road.polyline)}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? '6.5' : '4.2'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={
                        road.status === 'CLOSED'
                          ? '7 5'
                          : road.status === 'DIVERTED'
                          ? '10 4'
                          : undefined
                      }
                    />
                    {/* Interactive Road Code Pill */}
                    <g
                      transform={`translate(${midPt.svgX}, ${midPt.svgY})`}
                    >
                      <rect
                        x="-26"
                        y="-10"
                        width="52"
                        height="19"
                        rx="5"
                        fill={isCommand ? '#0F172A' : '#FFFFFF'}
                        stroke={strokeColor}
                        strokeWidth={isSelected ? '2' : '1.2'}
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isCommand ? '#F8FAFC' : '#0F172A'}
                        fontSize="9"
                        fontWeight="700"
                      >
                        {road.code}:{road.congestionIndex}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* LAYER 7: ROAD CLOSURES OVERLAY LAYER */}
          {layers.roadClosures && (
            <g data-testid="svg-layer-roadClosures">
              {closedOrDivertedRoads.map((road) => {
                const mid =
                  road.polyline[Math.floor(road.polyline.length / 2)] ||
                  road.polyline[0];
                return (
                  <g
                    key={`closure-${road.id}`}
                    data-interactive-node="true"
                    data-testid={`map-closure-badge-${road.id}`}
                    transform={`translate(${mid.svgX}, ${mid.svgY - 22})`}
                    onClick={() =>
                      onSelectFeature({ type: 'ROAD', id: road.id })
                    }
                    className="cursor-pointer"
                  >
                    <rect
                      x="-46"
                      y="-11"
                      width="92"
                      height="22"
                      rx="6"
                      fill="#DC2626"
                      stroke="#FEF2F2"
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="800"
                    >
                      ⛔ {road.status}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* LAYER 3: SHUTTLE CORRIDORS LAYER */}
          {layers.shuttles && (
            <g data-testid="svg-layer-shuttles">
              {shuttles.map((shuttle) => {
                const isSelected =
                  selectedFeature?.type === 'SHUTTLE' &&
                  selectedFeature.id === shuttle.id;
                const mid =
                  shuttle.routePolyline[
                    Math.floor(shuttle.routePolyline.length / 2)
                  ] || shuttle.pickupCoordinates;

                return (
                  <g
                    key={shuttle.id}
                    data-interactive-node="true"
                    data-testid={`map-shuttle-${shuttle.id}`}
                    onClick={() =>
                      onSelectFeature({ type: 'SHUTTLE', id: shuttle.id })
                    }
                    className="cursor-pointer"
                  >
                    <path
                      d={pointsToSvgPath(shuttle.routePolyline)}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth={isSelected ? '4.5' : '2.6'}
                      strokeDasharray="5 5"
                    />
                    <g
                      transform={`translate(${mid.svgX + 18}, ${mid.svgY + 14})`}
                    >
                      <rect
                        x="-32"
                        y="-10"
                        width="64"
                        height="20"
                        rx="10"
                        fill="#0891B2"
                        stroke="#CFFAFE"
                        strokeWidth="1.2"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="700"
                      >
                        🚌 {shuttle.routeCode.split('-')[0]} ({shuttle.estimatedArrivalMinutes}m)
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* HIGHLIGHTED JOURNEY PLANNER ROUTE OVERLAY */}
          {highlightedJourneyOption && (
            <g data-testid="svg-highlighted-journey-route">
              <path
                d={pointsToSvgPath(highlightedJourneyOption.routeCoordinates)}
                fill="none"
                stroke="#2563EB"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.88"
              />
              <path
                d={pointsToSvgPath(highlightedJourneyOption.routeCoordinates)}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeDasharray="8 6"
              />
            </g>
          )}

          {/* LAYER 2: PARKING HUBS LAYER */}
          {layers.parking && (
            <g data-testid="svg-layer-parking">
              {parkingHubs.map((hub) => {
                const isSelected =
                  selectedFeature?.type === 'PARKING' &&
                  selectedFeature.id === hub.id;
                const badgeColor =
                  hub.status === 'FULL'
                    ? '#DC2626'
                    : hub.status === 'FILLING_FAST' ||
                      hub.status === 'RESERVED_ACCESSIBILITY'
                    ? '#D97706'
                    : '#1E3A8A';

                return (
                  <g
                    key={hub.id}
                    data-interactive-node="true"
                    data-testid={`map-parking-${hub.id}`}
                    transform={`translate(${hub.coordinates.svgX}, ${hub.coordinates.svgY})`}
                    onClick={() =>
                      onSelectFeature({ type: 'PARKING', id: hub.id })
                    }
                    className="cursor-pointer"
                  >
                    <rect
                      x="-26"
                      y="-13"
                      width="52"
                      height="24"
                      rx="7"
                      fill={badgeColor}
                      stroke={isSelected ? '#22D3EE' : '#FFFFFF'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                    />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="800"
                    >
                      P {hub.occupancyPercent}%
                    </text>
                    <text
                      x="0"
                      y="22"
                      textAnchor="middle"
                      fill={isCommand ? '#CBD5E1' : '#1E293B'}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {hub.code}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* GHATS & DESTINATIONS (8 PRIMARY RIVERFRONT NODES) */}
          <g data-testid="svg-layer-ghats">
            {ghats.map((ghat) => {
              const isSelected =
                selectedFeature?.type === 'GHAT' &&
                selectedFeature.id === ghat.id;
              const statusColor =
                ghat.crowdLevel === 'CRITICAL'
                  ? '#DC2626'
                  : ghat.crowdLevel === 'HIGH'
                  ? '#EA580C'
                  : ghat.crowdLevel === 'MODERATE'
                  ? '#D97706'
                  : '#0D9488';

              const shortName = t(ghat.name).split('(')[0].trim();

              return (
                <g
                  key={ghat.id}
                  data-interactive-node="true"
                  data-testid={`map-ghat-${ghat.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t(ghat.name)} - ${ghat.crowdLevel} (${ghat.estimatedBathingWaitMinutes}m wait)`}
                  transform={`translate(${ghat.coordinates.svgX}, ${ghat.coordinates.svgY})`}
                  onClick={() =>
                    onSelectFeature({ type: 'GHAT', id: ghat.id })
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectFeature({ type: 'GHAT', id: ghat.id });
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                >
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill="none"
                      stroke={isCommand ? '#22D3EE' : '#1E3A8A'}
                      strokeWidth="3"
                    />
                  )}
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill={statusColor}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="800"
                  >
                    {ghat.estimatedBathingWaitMinutes}m
                  </text>

                  {/* Ghat Callout Label */}
                  <g
                    transform={`translate(${
                      ghat.bank === 'WEST_KOVVUR' ? -80 : 16
                    }, -10)`}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="124"
                      height="21"
                      rx="6"
                      fill={isCommand ? '#0F172A' : '#FFFFFF'}
                      stroke={isSelected ? '#06B6D4' : statusColor}
                      strokeWidth="1.2"
                      opacity="0.95"
                    />
                    <text
                      x="62"
                      y="14"
                      textAnchor="middle"
                      fill={isCommand ? '#F8FAFC' : '#0F172A'}
                      fontSize="9.5"
                      fontWeight="700"
                    >
                      {shortName.slice(0, 18)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* LAYER 5: INCIDENTS LAYER */}
          {layers.incidents && (
            <g data-testid="svg-layer-incidents">
              {activeIncidents.map((incident) => {
                const isSelected =
                  selectedFeature?.type === 'INCIDENT' &&
                  selectedFeature.id === incident.id;
                return (
                  <g
                    key={incident.id}
                    data-interactive-node="true"
                    data-testid={`map-incident-${incident.id}`}
                    transform={`translate(${incident.coordinates.svgX - 20}, ${
                      incident.coordinates.svgY - 22
                    })`}
                    onClick={() =>
                      onSelectFeature({ type: 'INCIDENT', id: incident.id })
                    }
                    className="cursor-pointer"
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="14"
                      fill="#EF4444"
                      opacity="0.3"
                    />
                    <polygon
                      points="0,-11 10,8 -10,8"
                      fill="#DC2626"
                      stroke={isSelected ? '#22D3EE' : '#FFFFFF'}
                      strokeWidth="2"
                    />
                    <text
                      x="0"
                      y="6"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9.5"
                      fontWeight="900"
                    >
                      !
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};

