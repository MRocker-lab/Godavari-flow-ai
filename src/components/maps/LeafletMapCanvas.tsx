import React from 'react';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
} from 'react-leaflet';
import { MapLayerVisibility, SelectedMapFeature } from './mapTypes';
import {
  ComputedJourneyOption,
  GhatDestination,
  OperationalIncident,
  ParkingHub,
  RoadCorridorSegment,
  ShuttleCorridor,
} from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

export interface LeafletMapCanvasProps {
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
  onTileLoadError: () => void;
  compactHeight?: boolean;
}

export const LeafletMapCanvas: React.FC<LeafletMapCanvasProps> = ({
  portal,
  layers,
  ghats,
  parkingHubs,
  shuttles,
  roads,
  incidents,
  onSelectFeature,
  highlightedJourneyOption,
  onTileLoadError,
  compactHeight = false,
}) => {
  const { t } = useTranslation();
  const isCommand = portal === 'command';

  const tileUrl = isCommand
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const activeIncidents = incidents.filter(
    (inc) => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED'
  );

  return (
    <div
      data-testid="online-leaflet-map"
      className={`relative w-full overflow-hidden rounded-2xl border ${
        compactHeight ? 'h-[430px]' : 'h-[560px]'
      } ${isCommand ? 'border-slate-800 bg-[#070D19]' : 'border-[#E5DFD5] bg-[#FAF8F5]'}`}
    >
      <MapContainer
        center={[16.9995, 81.7715]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
          eventHandlers={{
            tileerror: () => {
              onTileLoadError();
            },
          }}
        />

        {/* Layer 4: Crowd Heatmap Circles */}
        {layers.crowdHeatmap &&
          ghats.map((ghat) => {
            const color =
              ghat.crowdLevel === 'CRITICAL'
                ? '#EF4444'
                : ghat.crowdLevel === 'HIGH'
                ? '#F59E0B'
                : ghat.crowdLevel === 'MODERATE'
                ? '#06B6D4'
                : '#10B981';
            return (
              <Circle
                key={`lheat-${ghat.id}`}
                center={[ghat.coordinates.lat, ghat.coordinates.lng]}
                radius={420}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.25,
                  weight: 1,
                }}
              />
            );
          })}

        {/* Layer 6: Emergency Routes */}
        {layers.emergencyRoutes &&
          roads
            .filter((r) => r.isEmergencyRoute)
            .map((road) => (
              <Polyline
                key={`lemg-${road.id}`}
                positions={road.polyline.map((p) => [p.lat, p.lng])}
                pathOptions={{
                  color: '#10B981',
                  weight: 10,
                  opacity: 0.25,
                }}
              />
            ))}

        {/* Layer 1 & 7: Traffic Corridors & Road Closures */}
        {(layers.traffic || layers.roadClosures) &&
          roads.map((road) => {
            if (!layers.traffic && road.status !== 'CLOSED' && road.status !== 'DIVERTED') {
              return null;
            }
            const color =
              road.status === 'CLOSED'
                ? '#EF4444'
                : road.status === 'DIVERTED'
                ? '#F97316'
                : road.status === 'CONGESTED'
                ? '#F59E0B'
                : '#10B981';
            return (
              <Polyline
                key={`lroad-${road.id}`}
                positions={road.polyline.map((p) => [p.lat, p.lng])}
                pathOptions={{
                  color,
                  weight: 5,
                  dashArray:
                    road.status === 'CLOSED' || road.status === 'DIVERTED'
                      ? '8, 6'
                      : undefined,
                }}
                eventHandlers={{
                  click: () => onSelectFeature({ type: 'ROAD', id: road.id }),
                }}
              >
                <LeafletTooltip sticky>
                  {t(road.name)} ({road.status} • {road.congestionIndex}/100)
                </LeafletTooltip>
              </Polyline>
            );
          })}

        {/* Layer 3: Shuttle Corridors */}
        {layers.shuttles &&
          shuttles.map((shuttle) => (
            <Polyline
              key={`lshuttle-${shuttle.id}`}
              positions={shuttle.routePolyline.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#06B6D4',
                weight: 4,
                dashArray: '6, 6',
              }}
              eventHandlers={{
                click: () => onSelectFeature({ type: 'SHUTTLE', id: shuttle.id }),
              }}
            >
              <LeafletTooltip sticky>
                {t(shuttle.name)} (ETA {shuttle.estimatedArrivalMinutes}m)
              </LeafletTooltip>
            </Polyline>
          ))}

        {/* Highlighted Journey Planner Route */}
        {highlightedJourneyOption && (
          <Polyline
            positions={highlightedJourneyOption.routeCoordinates.map((p) => [
              p.lat,
              p.lng,
            ])}
            pathOptions={{
              color: '#2563EB',
              weight: 6,
            }}
          />
        )}

        {/* Layer 2: Parking Hubs */}
        {layers.parking &&
          parkingHubs.map((hub) => (
            <CircleMarker
              key={`lpark-${hub.id}`}
              center={[hub.coordinates.lat, hub.coordinates.lng]}
              radius={9}
              pathOptions={{
                color: '#FFFFFF',
                fillColor:
                  hub.status === 'FULL'
                    ? '#DC2626'
                    : hub.status === 'FILLING_FAST'
                    ? '#D97706'
                    : '#1E3A8A',
                fillOpacity: 0.95,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onSelectFeature({ type: 'PARKING', id: hub.id }),
              }}
            >
              <LeafletTooltip>
                {t(hub.name)} ({hub.availableSpaces} free)
              </LeafletTooltip>
            </CircleMarker>
          ))}

        {/* Ghats & Destinations */}
        {ghats.map((ghat) => (
          <CircleMarker
            key={`lghat-${ghat.id}`}
            center={[ghat.coordinates.lat, ghat.coordinates.lng]}
            radius={11}
            pathOptions={{
              color: '#FFFFFF',
              fillColor:
                ghat.crowdLevel === 'CRITICAL'
                  ? '#DC2626'
                  : ghat.crowdLevel === 'HIGH'
                  ? '#EA580C'
                  : ghat.crowdLevel === 'MODERATE'
                  ? '#D97706'
                  : '#0D9488',
              fillOpacity: 0.95,
              weight: 2.5,
            }}
            eventHandlers={{
              click: () => onSelectFeature({ type: 'GHAT', id: ghat.id }),
            }}
          >
            <LeafletTooltip>
              {t(ghat.name)} ({ghat.crowdLevel} • {ghat.estimatedBathingWaitMinutes}m wait)
            </LeafletTooltip>
          </CircleMarker>
        ))}

        {/* Layer 5: Incidents */}
        {layers.incidents &&
          activeIncidents.map((inc) => (
            <CircleMarker
              key={`linc-${inc.id}`}
              center={[inc.coordinates.lat, inc.coordinates.lng]}
              radius={10}
              pathOptions={{
                color: '#FEF2F2',
                fillColor: '#DC2626',
                fillOpacity: 1,
                weight: 2.5,
              }}
              eventHandlers={{
                click: () => onSelectFeature({ type: 'INCIDENT', id: inc.id }),
              }}
            >
              <LeafletTooltip>
                {inc.code}: {t(inc.title)}
              </LeafletTooltip>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
};
