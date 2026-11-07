import React, { useMemo, useState } from 'react';
import {
  DEFAULT_COMMAND_LAYERS,
  DEFAULT_PILGRIM_LAYERS,
  MapDisplayView,
  MapEngineMode,
  MapLayerVisibility,
  MobilityMapWorkspaceProps,
  OperationalMapLayerId,
  SelectedMapFeature,
} from './mapTypes';
import { MapLayerControls } from './MapLayerControls';
import { MapLegend } from './MapLegend';
import { LocationDetailPanel } from './LocationDetailPanel';
import { InteractiveRiverfrontSvgMap } from './InteractiveRiverfrontSvgMap';
import { LeafletMapCanvas } from './LeafletMapCanvas';
import { Card, StatusIndicator } from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';

export const MobilityMapWorkspace: React.FC<MobilityMapWorkspaceProps> = ({
  portal: portalProp,
  portalMode,
  initialEngine = 'OFFLINE_SVG',
  initialLayers,
  initialSelectedFeature = null,
  highlightedJourneyOption = null,
  enableOperatorControls,
  onSelectGhatForJourney,
  compactHeight = false,
}) => {
  const portal = portalProp || portalMode || 'pilgrim';
  const effectiveOperatorControls =
    enableOperatorControls !== undefined ? enableOperatorControls : portal === 'command';
  const state = useMobilityStore((s) => s.state);
  const { t, language } = useTranslation();

  const defaultLayers =
    portal === 'command' ? DEFAULT_COMMAND_LAYERS : DEFAULT_PILGRIM_LAYERS;

  const [layers, setLayers] = useState<MapLayerVisibility>({
    ...defaultLayers,
    ...initialLayers,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [engineMode, setEngineMode] = useState<MapEngineMode>(initialEngine);
  const [displayView, setDisplayView] = useState<MapDisplayView>('MAP_VIEW');
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedMapFeature | null>(initialSelectedFeature);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [tileFallbackNotice, setTileFallbackNotice] = useState(false);

  const matchesSearch = (texts: Array<string | undefined>) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return texts.some((txt) => txt && txt.toLowerCase().includes(q));
  };

  const filteredGhats = useMemo(
    () =>
      state.ghats.filter((g) =>
        matchesSearch([g.code, g.name.en, g.name.te, g.name.hi, g.description.en])
      ),
    [state.ghats, searchQuery]
  );

  const filteredParking = useMemo(
    () =>
      state.parkingHubs.filter((p) =>
        matchesSearch([p.code, p.name.en, p.name.te, p.name.hi, p.zone.en])
      ),
    [state.parkingHubs, searchQuery]
  );

  const filteredShuttles = useMemo(
    () =>
      state.shuttles.filter((s) =>
        matchesSearch([s.routeCode, s.name.en, s.name.te, s.name.hi])
      ),
    [state.shuttles, searchQuery]
  );

  const filteredRoads = useMemo(
    () =>
      state.roads.filter((r) =>
        matchesSearch([r.code, r.name.en, r.name.te, r.name.hi, r.status])
      ),
    [state.roads, searchQuery]
  );

  const filteredIncidents = useMemo(
    () =>
      state.incidents.filter((i) =>
        matchesSearch([i.code, i.title.en, i.title.te, i.title.hi, i.status])
      ),
    [state.incidents, searchQuery]
  );

  const activeIncidentsCount = state.incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  ).length;

  const closedRoadsCount = state.roads.filter(
    (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
  ).length;

  const layerCounts: Record<OperationalMapLayerId, number> = {
    traffic: filteredRoads.length,
    parking: filteredParking.length,
    shuttles: filteredShuttles.length,
    crowdHeatmap: filteredGhats.length,
    incidents: filteredIncidents.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
    ).length,
    emergencyRoutes: filteredRoads.filter((r) => r.isEmergencyRoute).length,
    roadClosures: filteredRoads.filter(
      (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
    ).length,
  };

  const handleToggleLayer = (layerId: OperationalMapLayerId) => {
    setLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const handleEnableAllLayers = () => {
    setLayers({
      traffic: true,
      parking: true,
      shuttles: true,
      crowdHeatmap: true,
      incidents: true,
      emergencyRoutes: true,
      roadClosures: true,
    });
  };

  const handleTileLoadError = () => {
    setEngineMode('OFFLINE_SVG');
    setTileFallbackNotice(true);
  };

  return (
    <div data-testid="mobility-map-workspace" className="space-y-3.5">
      <MapLayerControls
        portal={portal}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        onEnableAllLayers={handleEnableAllLayers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        engineMode={engineMode}
        onEngineModeChange={(mode) => {
          setTileFallbackNotice(false);
          setEngineMode(mode);
        }}
        displayView={displayView}
        onDisplayViewChange={setDisplayView}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.7, Number((z - 0.2).toFixed(2))))}
        onResetViewport={() => {
          setZoomLevel(1);
          setPanOffset({ x: 0, y: 0 });
        }}
        layerCounts={layerCounts}
      />

      {tileFallbackNotice && (
        <div
          role="status"
          data-testid="tile-fallback-banner"
          className="px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-medium"
        >
          {language === 'te'
            ? 'ఇంటర్నెట్ మ్యాప్ టైల్స్ అందుబాటులో లేవు — ఆఫ్‌లైన్ ఇంటరాక్టివ్ గోదావరి రివర్‌ఫ్రంట్ స్కీమాటిక్ మ్యాప్‌కు మార్చబడింది.'
            : language === 'hi'
            ? 'इंटरनेट मैप टाइल्स अनुपलब्ध — ऑफ़लाइन इंटरैक्टिव गोदावरी रिवरफ्रंट योजनाबद्ध मानचित्र सक्रिय किया गया।'
            : 'Map tile network unreachable — automatically switched to the Offline Interactive SVG Riverfront Schematic Map.'}
        </div>
      )}

      {/* Main Split Grid: Map / List Workspace (Left 2/3) + Context Detail Panel (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-3">
          {displayView === 'MAP_VIEW' ? (
            engineMode === 'OFFLINE_SVG' ? (
              <InteractiveRiverfrontSvgMap
                portal={portal}
                layers={layers}
                ghats={filteredGhats}
                parkingHubs={filteredParking}
                shuttles={filteredShuttles}
                roads={filteredRoads}
                incidents={filteredIncidents}
                selectedFeature={selectedFeature}
                onSelectFeature={setSelectedFeature}
                highlightedJourneyOption={highlightedJourneyOption}
                zoomLevel={zoomLevel}
                panOffset={panOffset}
                onPanChange={setPanOffset}
                compactHeight={compactHeight}
              />
            ) : (
              <LeafletMapCanvas
                portal={portal}
                layers={layers}
                ghats={filteredGhats}
                parkingHubs={filteredParking}
                shuttles={filteredShuttles}
                roads={filteredRoads}
                incidents={filteredIncidents}
                selectedFeature={selectedFeature}
                onSelectFeature={setSelectedFeature}
                highlightedJourneyOption={highlightedJourneyOption}
                onTileLoadError={handleTileLoadError}
                compactHeight={compactHeight}
              />
            )
          ) : (
            /* Accessible Structured List View Alternative */
            <Card
              portal={portal}
              data-testid="map-structured-list-view"
              className="space-y-5 max-h-[560px] overflow-y-auto"
            >
              <div>
                <h4 className="text-sm font-bold mb-2.5">
                  {language === 'te'
                    ? `ఘాట్లు & దర్శన ప్రదేశాలు (${filteredGhats.length})`
                    : language === 'hi'
                    ? `घाट एवं गंतव्य (${filteredGhats.length})`
                    : `Ghats & Destinations (${filteredGhats.length})`}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredGhats.map((ghat) => (
                    <button
                      key={ghat.id}
                      type="button"
                      data-testid={`list-ghat-${ghat.id}`}
                      onClick={() =>
                        setSelectedFeature({ type: 'GHAT', id: ghat.id })
                      }
                      className="text-left p-3 rounded-xl border border-current/15 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold">{t(ghat.name)}</div>
                        <div className="text-[11px] opacity-70 mt-0.5">
                          Wait: ~{ghat.estimatedBathingWaitMinutes}m •{' '}
                          {ghat.currentOccupancyCount.toLocaleString()} pilgrims
                        </div>
                      </div>
                      <StatusIndicator
                        level={ghat.crowdLevel}
                        portal={portal}
                        size="sm"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {layers.traffic && (
                <div>
                  <h4 className="text-sm font-bold mb-2.5">
                    {language === 'te'
                      ? `రోడ్డు & వంతెన కారిడార్లు (${filteredRoads.length})`
                      : language === 'hi'
                      ? `सड़क एवं पुल कॉरिडोर (${filteredRoads.length})`
                      : `Road & Bridge Corridors (${filteredRoads.length})`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredRoads.map((road) => (
                      <button
                        key={road.id}
                        type="button"
                        data-testid={`list-road-${road.id}`}
                        onClick={() =>
                          setSelectedFeature({ type: 'ROAD', id: road.id })
                        }
                        className="text-left p-3 rounded-xl border border-current/15 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold">{t(road.name)}</div>
                          <div className="text-[11px] opacity-70 mt-0.5">
                            Index: {road.congestionIndex}/100 • {road.speedKmh} km/h
                          </div>
                        </div>
                        <StatusIndicator
                          level={road.status}
                          portal={portal}
                          size="sm"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {layers.parking && (
                <div>
                  <h4 className="text-sm font-bold mb-2.5">
                    {language === 'te'
                      ? `పార్కింగ్ హబ్‌లు (${filteredParking.length})`
                      : language === 'hi'
                      ? `पार्किंग हब (${filteredParking.length})`
                      : `Parking Hubs (${filteredParking.length})`}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredParking.map((hub) => (
                      <button
                        key={hub.id}
                        type="button"
                        data-testid={`list-parking-${hub.id}`}
                        onClick={() =>
                          setSelectedFeature({ type: 'PARKING', id: hub.id })
                        }
                        className="text-left p-3 rounded-xl border border-current/15 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold">{t(hub.name)}</div>
                          <div className="text-[11px] opacity-70 mt-0.5">
                            {hub.availableSpaces.toLocaleString()} free (
                            {hub.occupancyPercent}% occupied)
                          </div>
                        </div>
                        <StatusIndicator
                          level={hub.status}
                          portal={portal}
                          size="sm"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <MapLegend
            portal={portal}
            closedRoadCount={closedRoadsCount}
            activeIncidentCount={activeIncidentsCount}
          />
        </div>

        {/* Context-Sensitive Location Inspection Panel */}
        <div className="lg:col-span-4">
          <LocationDetailPanel
            portal={portal}
            selectedFeature={selectedFeature}
            onClose={() => setSelectedFeature(null)}
            onSelectFeature={setSelectedFeature}
            onSelectGhatForJourney={onSelectGhatForJourney}
            enableOperatorControls={effectiveOperatorControls}
          />
        </div>
      </div>
    </div>
  );
};

