import { GeoPoint, OperationalLevel } from './mobility';
import { LocalizedText } from './provenance';

export type JourneyOriginId =
  | 'RAJAMAHENDRAVARAM_RAILWAY'
  | 'GODAVARI_RAILWAY'
  | 'GOKAVARAM_BUS_COMPLEX'
  | 'NH16_MORAMPUDI_ENTRY'
  | 'NH16_LALACHERUVU_ENTRY'
  | 'KOVVUR_WEST_ENTRY'
  | 'MADHURAPUDI_AIRPORT';

export type JourneyTravelMode =
  | 'CAR_PLUS_SHUTTLE'
  | 'PUBLIC_SHUTTLE_DIRECT'
  | 'ACCESSIBILITY_PRIORITY_TRANSIT'
  | 'WALKING_NEARBY';

export interface JourneyOriginPoint {
  id: JourneyOriginId;
  name: LocalizedText;
  type: 'RAILWAY_STATION' | 'BUS_TERMINAL' | 'HIGHWAY_ENTRY' | 'AIRPORT';
  coordinates: GeoPoint;
  defaultParkingHubId: string;
  defaultShuttleId: string;
}

export interface JourneyPreferences {
  groupSize: 'SOLO_COUPLE' | 'FAMILY_GROUP' | 'LARGE_GROUP';
  withSeniorCitizens: boolean;
  wheelchairRequired: boolean;
  withYoungChildren: boolean;
  preferMinimalWalking: boolean;
  avoidHighCrowds: boolean;
}

export interface JourneyPlannerRequest {
  originId: JourneyOriginId;
  destinationGhatId: string;
  travelMode: JourneyTravelMode;
  preferences: JourneyPreferences;
}

export interface ComputedJourneyOption {
  id: string;
  rank: 'RECOMMENDED_BEST' | 'ACCESSIBILITY_OPTIMAL' | 'LOWEST_CROWD_ALTERNATIVE';
  badgeLabel: LocalizedText;
  title: LocalizedText;
  destinationGhatId: string;
  isAlternateGhatSuggested: boolean;
  estimatedTotalDurationMinutes: number;
  walkingDistanceMeters: number;
  trafficCondition: OperationalLevel;
  crowdLevel: OperationalLevel;
  recommendedParkingId: string | null;
  recommendedShuttleId: string | null;
  activeRoadIdsUsed: string[];
  avoidedClosedRoadIds: string[];
  routeCoordinates: GeoPoint[];
  recommendationReason: LocalizedText;
  stepByStepDirections: LocalizedText[];
  accessibilityHighlights: LocalizedText[];
  authorityAdvisoryWarning?: LocalizedText;
}

