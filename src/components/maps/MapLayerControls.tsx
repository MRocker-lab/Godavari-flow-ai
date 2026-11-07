import React from 'react';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Ban,
  Bus,
  Flame,
  Globe2,
  Layers,
  List,
  Map as MapIcon,
  ParkingSquare,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  MapDisplayView,
  MapEngineMode,
  MapLayerVisibility,
  OperationalMapLayerId,
} from './mapTypes';
import { SearchBox } from '@/components/design-system';
import { useTranslation } from '@/i18n/useTranslation';
import { LocalizedText } from '@/types';

export interface MapLayerControlsProps {
  portal: 'pilgrim' | 'command';
  layers: MapLayerVisibility;
  onToggleLayer: (layerId: OperationalMapLayerId) => void;
  onEnableAllLayers: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  engineMode: MapEngineMode;
  onEngineModeChange: (mode: MapEngineMode) => void;
  displayView: MapDisplayView;
  onDisplayViewChange: (view: MapDisplayView) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetViewport: () => void;
  layerCounts: Record<OperationalMapLayerId, number>;
}

const LAYER_CONFIG: Array<{
  id: OperationalMapLayerId;
  label: LocalizedText;
  icon: React.ReactNode;
}> = [
  {
    id: 'traffic',
    label: { en: 'Traffic Layer', te: 'ట్రాఫిక్ లేయర్', hi: 'ट्रैफिक लेयर' },
    icon: <Activity className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'parking',
    label: { en: 'Parking Layer', te: 'పార్కింగ్ లేయర్', hi: 'पार्किंग लेयर' },
    icon: <ParkingSquare className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'shuttles',
    label: { en: 'Shuttle Layer', te: 'షటిల్ బస్సులు', hi: 'शटल लेयर' },
    icon: <Bus className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'crowdHeatmap',
    label: { en: 'Crowd Heatmap', te: 'రద్దీ హీట్‌మ్యాప్', hi: 'भीड़ हीटमैप' },
    icon: <Flame className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'incidents',
    label: { en: 'Incident Layer', te: 'సంఘటనలు', hi: 'घटना लेयर' },
    icon: <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'emergencyRoutes',
    label: { en: 'Emergency Routes', te: 'అత్యవసర మార్గాలు', hi: 'आपातकालीन मार्ग' },
    icon: <Ambulance className="w-3.5 h-3.5" aria-hidden="true" />,
  },
  {
    id: 'roadClosures',
    label: { en: 'Road Closures', te: 'రోడ్డు మూసివేతలు', hi: 'सड़क बंद' },
    icon: <Ban className="w-3.5 h-3.5" aria-hidden="true" />,
  },
];

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  portal,
  layers,
  onToggleLayer,
  onEnableAllLayers,
  searchQuery,
  onSearchChange,
  engineMode,
  onEngineModeChange,
  displayView,
  onDisplayViewChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetViewport,
  layerCounts,
}) => {
  const { t, language } = useTranslation();

  const barBg =
    portal === 'command'
      ? 'bg-[#0F172A] border-slate-800 text-slate-200'
      : 'bg-white border-[#E5DFD5] text-[#0F172A]';

  return (
    <div className={`rounded-2xl border p-3.5 space-y-3 ${barBg}`}>
      {/* Top Row: Search + Map/List Toggle + Engine Switcher + Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72 flex-1">
          <SearchBox
            portal={portal}
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={
              language === 'te'
                ? 'ఘాట్, రోడ్డు, పార్కింగ్ లేదా షటిల్ వెతకండి...'
                : language === 'hi'
                ? 'घाट, सड़क, पार्किंग या शटल खोजें...'
                : 'Search ghats, roads, parking, shuttles, incidents...'
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Map vs List View Selector */}
          <div
            role="group"
            aria-label="Map or List View"
            className={`inline-flex p-0.5 rounded-xl border ${
              portal === 'command'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-[#FAF8F5] border-[#E5DFD5]'
            }`}
          >
            <button
              type="button"
              data-testid="view-mode-map"
              onClick={() => onDisplayViewChange('MAP_VIEW')}
              aria-pressed={displayView === 'MAP_VIEW'}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                displayView === 'MAP_VIEW'
                  ? portal === 'command'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-[#1E3A8A] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>
                {language === 'te' ? 'మ్యాప్' : language === 'hi' ? 'मैप' : 'Map'}
              </span>
            </button>
            <button
              type="button"
              data-testid="view-mode-list"
              onClick={() => onDisplayViewChange('LIST_VIEW')}
              aria-pressed={displayView === 'LIST_VIEW'}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                displayView === 'LIST_VIEW'
                  ? portal === 'command'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-[#1E3A8A] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>
                {language === 'te' ? 'జాబితా' : language === 'hi' ? 'सूची' : 'List'}
              </span>
            </button>
          </div>

          {/* Interactive SVG Riverfront (Offline-Ready) vs Leaflet Tile Mode */}
          <div
            role="group"
            aria-label="Map Rendering Engine"
            className={`inline-flex p-0.5 rounded-xl border ${
              portal === 'command'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-[#FAF8F5] border-[#E5DFD5]'
            }`}
          >
            <button
              type="button"
              data-testid="engine-offline-svg"
              onClick={() => onEngineModeChange('OFFLINE_SVG')}
              aria-pressed={engineMode === 'OFFLINE_SVG'}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                engineMode === 'OFFLINE_SVG'
                  ? portal === 'command'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-[#0D9488] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
              title="Interactive Vector Riverfront Map (Works 100% Offline)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {language === 'te'
                  ? 'రివర్‌ఫ్రంట్ వెక్టర్ (ఆఫ్‌లైన్)'
                  : language === 'hi'
                  ? 'रिवरफ्रंट वेक्टर (ऑफ़लाइन)'
                  : 'Riverfront Vector (Offline-Ready)'}
              </span>
            </button>
            <button
              type="button"
              data-testid="engine-online-leaflet"
              onClick={() => onEngineModeChange('ONLINE_LEAFLET')}
              aria-pressed={engineMode === 'ONLINE_LEAFLET'}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 ${
                engineMode === 'ONLINE_LEAFLET'
                  ? portal === 'command'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-[#0D9488] text-white'
                  : 'opacity-75 hover:opacity-100'
              }`}
              title="Leaflet Street Tile Map (Online)"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>
                {language === 'te'
                  ? 'స్ట్రీట్ టైల్స్ (Leaflet)'
                  : language === 'hi'
                  ? 'स्ट्रीट टाइल्स (Leaflet)'
                  : 'Street Tiles (Leaflet)'}
              </span>
            </button>
          </div>

          {/* Zoom Controls */}
          <div
            className={`inline-flex items-center rounded-xl border p-0.5 ${
              portal === 'command'
                ? 'bg-slate-900 border-slate-700'
                : 'bg-[#FAF8F5] border-[#E5DFD5]'
            }`}
          >
            <button
              type="button"
              data-testid="map-zoom-out"
              onClick={onZoomOut}
              aria-label="Zoom out"
              className="p-1.5 rounded-lg hover:bg-slate-500/10"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span
              data-testid="map-zoom-value"
              className="px-2 text-xs font-mono font-semibold"
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              data-testid="map-zoom-in"
              onClick={onZoomIn}
              aria-label="Zoom in"
              className="p-1.5 rounded-lg hover:bg-slate-500/10"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-testid="map-zoom-reset"
              onClick={onResetViewport}
              aria-label="Reset map view"
              title="Reset Map Viewport"
              className="p-1.5 rounded-lg hover:bg-slate-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: All 7 Mandatory Operational Layer Toggles */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-65 mr-1">
          {language === 'te'
            ? 'మ్యాప్ లేయర్లు (7):'
            : language === 'hi'
            ? 'मैप लेयर्स (7):'
            : 'Operational Layers (7):'}
        </span>

        {LAYER_CONFIG.map((layer) => {
          const active = layers[layer.id];
          const count = layerCounts[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              data-testid={`layer-toggle-${layer.id}`}
              onClick={() => onToggleLayer(layer.id)}
              aria-pressed={active}
              className={`min-h-[34px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                active
                  ? portal === 'command'
                    ? 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-xs'
                    : 'bg-[#1E3A8A] border-[#1E3A8A] text-white shadow-xs'
                  : portal === 'command'
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-[#FAF8F5] border-[#E5DFD5] text-slate-600 hover:text-slate-900'
              }`}
            >
              {layer.icon}
              <span>{t(layer.label)}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  active
                    ? portal === 'command'
                      ? 'bg-cyan-500/20 text-cyan-200'
                      : 'bg-white/20 text-white'
                    : 'bg-slate-500/15'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onEnableAllLayers}
          className="text-xs font-semibold underline px-2 py-1 opacity-75 hover:opacity-100"
        >
          {language === 'te'
            ? 'అన్నీ చూపించు'
            : language === 'hi'
            ? 'सभी दिखाएँ'
            : 'Show All 7'}
        </button>
      </div>
    </div>
  );
};
