import { ComputedJourneyOption } from '@/types';

export type OperationalMapLayerId =
  | 'traffic'
  | 'parking'
  | 'shuttles'
  | 'crowdHeatmap'
  | 'incidents'
  | 'emergencyRoutes'
  | 'roadClosures';

export type MapLayerVisibility = Record<OperationalMapLayerId, boolean>;

export type SelectedFeatureType = 'GHAT' | 'PARKING' | 'SHUTTLE' | 'ROAD' | 'INCIDENT';

export interface SelectedMapFeature {
  type: SelectedFeatureType;
  id: string;
}

export type MapEngineMode = 'OFFLINE_SVG' | 'ONLINE_LEAFLET';
export type MapDisplayView = 'MAP_VIEW' | 'SPLIT_VIEW' | 'LIST_VIEW';

export interface MobilityMapWorkspaceProps {
  portal: 'pilgrim' | 'command';
  initialLayers?: Partial<MapLayerVisibility>;
  initialSelectedFeature?: SelectedMapFeature | null;
  highlightedJourneyOption?: ComputedJourneyOption | null;
  enableOperatorControls?: boolean;
  onSelectGhatForJourney?: (ghatId: string) => void;
  compactHeight?: boolean;
}

export const DEFAULT_PILGRIM_LAYERS: MapLayerVisibility = {
  traffic: true,
  parking: true,
  shuttles: true,
  crowdHeatmap: true,
  incidents: false,
  emergencyRoutes: true,
  roadClosures: true,
};

export const DEFAULT_COMMAND_LAYERS: MapLayerVisibility = {
  traffic: true,
  parking: true,
  shuttles: true,
  crowdHeatmap: true,
  incidents: true,
  emergencyRoutes: true,
  roadClosures: true,
};
