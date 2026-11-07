import {
  AIAuthorityRecommendation,
  DigitalTwinScenarioPreset,
  GhatDestination,
  JourneyOriginPoint,
  OperationalIncident,
  ParkingHub,
  PoliceResponseTeam,
  RoadCorridorSegment,
  ShuttleCorridor,
  SyncMetadata,
} from '@/types';
import { DIGITAL_TWIN_SCENARIOS } from './digitalTwinScenarios';
import { INITIAL_GHATS_AND_DESTINATIONS, JOURNEY_ORIGIN_POINTS } from './ghatsAndDestinations';
import {
  AUTHORITY_ROLE_PROFILES,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_INCIDENTS,
  INITIAL_POLICE_TEAMS,
} from './initialIncidentsAndTeams';
import { INITIAL_PARKING_HUBS, INITIAL_SHUTTLE_CORRIDORS } from './parkingAndShuttles';
import { INITIAL_ROAD_CORRIDORS } from './roadsAndCorridors';

export const CURRENT_SCHEMA_VERSION = 1;

export interface CanonicalMobilityState {
  metadata: SyncMetadata;
  ghats: GhatDestination[];
  origins: JourneyOriginPoint[];
  parkingHubs: ParkingHub[];
  shuttles: ShuttleCorridor[];
  roads: RoadCorridorSegment[];
  incidents: OperationalIncident[];
  policeTeams: PoliceResponseTeam[];
  aiRecommendations: AIAuthorityRecommendation[];
  digitalTwinScenarios: DigitalTwinScenarioPreset[];
}

export function createBaselineMobilityState(tabId = 'baseline-init'): CanonicalMobilityState {
  const snapshot: CanonicalMobilityState = {
    metadata: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      stateRevision: 1,
      lastUpdatedAt: new Date().toISOString(),
      lastUpdatedByTabId: tabId,
      lastActionSummary: {
        en: 'Canonical Rajamahendravaram–Kovvur baseline state loaded',
        te: 'రాజమహేంద్రవరం–కొవ్వూరు ప్రాథమిక డేటా లోడ్ చేయబడింది',
        hi: 'राजमहेंद्रवरम-कोव्वुर बेसलाइन डेटा लोड किया गया',
      },
      activeDigitalTwinScenarioId: null,
    },
    ghats: INITIAL_GHATS_AND_DESTINATIONS,
    origins: JOURNEY_ORIGIN_POINTS,
    parkingHubs: INITIAL_PARKING_HUBS,
    shuttles: INITIAL_SHUTTLE_CORRIDORS,
    roads: INITIAL_ROAD_CORRIDORS,
    incidents: INITIAL_INCIDENTS,
    policeTeams: INITIAL_POLICE_TEAMS,
    aiRecommendations: INITIAL_AI_RECOMMENDATIONS,
    digitalTwinScenarios: DIGITAL_TWIN_SCENARIOS,
  };

  return JSON.parse(JSON.stringify(snapshot)) as CanonicalMobilityState;
}

export { AUTHORITY_ROLE_PROFILES };

