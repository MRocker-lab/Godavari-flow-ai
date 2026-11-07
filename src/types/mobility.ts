import { DataProvenance, LocalizedText } from './provenance';

export type OperationalLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RoadOperationalStatus = 'OPEN' | 'CONGESTED' | 'DIVERTED' | 'CLOSED' | 'EMERGENCY_ONLY';
export type ParkingOperationalStatus = 'AVAILABLE' | 'FILLING_FAST' | 'FULL' | 'RESERVED_ACCESSIBILITY';
export type ShuttleOperationalStatus = 'FREQUENT' | 'MODERATE_WAIT' | 'HIGH_DEMAND' | 'DELAYED';

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Normalized SVG coordinates (0-1000 x, 0-620 y) for the Offline Interactive SVG Riverfront Map */
  svgX: number;
  svgY: number;
}

export interface GhatDestination {
  id: string;
  code: string;
  name: LocalizedText;
  bank: 'EAST_RAJAMAHENDRAVARAM' | 'WEST_KOVVUR' | 'BARRAGE_SOUTH';
  category: 'MAIN_PUSHKAR_GHAT' | 'HERITAGE_GHAT' | 'SENIOR_FRIENDLY_GHAT' | 'TEMPLE_LANDMARK';
  description: LocalizedText;
  highlights: LocalizedText[];
  coordinates: GeoPoint;
  crowdLevel: OperationalLevel;
  currentOccupancyCount: number;
  maxCapacityCount: number;
  estimatedBathingWaitMinutes: number;
  trafficCondition: OperationalLevel;
  accessibilityScore: number; // 1 to 5
  wheelchairRampAvailable: boolean;
  seniorPriorityLane: boolean;
  medicalCampActive: boolean;
  nearestParkingIds: string[];
  connectedShuttleIds: string[];
  approachRoadIds: string[];
  activeAdvisory?: LocalizedText;
  imageUrl: string;
  provenance: DataProvenance;
}

export interface ParkingHub {
  id: string;
  code: string;
  name: LocalizedText;
  zone: LocalizedText;
  coordinates: GeoPoint;
  totalCapacity: number;
  availableSpaces: number;
  occupancyPercent: number;
  status: ParkingOperationalStatus;
  trafficCondition: OperationalLevel;
  primaryGhatId: string;
  distanceToDestinationKm: number;
  walkingDistanceMeters: number;
  walkingDurationMinutes: number;
  connectedShuttleIds: string[];
  approachRoadId: string;
  wheelchairAccessibleBays: number;
  seniorDropOffAvailable: boolean;
  recommendationReason: LocalizedText;
  isRecommended: boolean;
  provenance: DataProvenance;
}

export interface ShuttleCorridor {
  id: string;
  routeCode: string;
  name: LocalizedText;
  pickupPointName: LocalizedText;
  pickupParkingId: string;
  destinationGhatId: string;
  destinationName: LocalizedText;
  pickupCoordinates: GeoPoint;
  dropoffCoordinates: GeoPoint;
  routePolyline: GeoPoint[];
  activeBusesCount: number;
  frequencyMinutes: number;
  estimatedArrivalMinutes: number;
  occupancyPercent: number;
  availableCapacitySeats: number;
  totalFleetSeatCapacity: number;
  status: ShuttleOperationalStatus;
  wheelchairAccessible: boolean;
  seniorCitizenPrioritySeats: boolean;
  primaryRoadIds: string[];
  advisoryNote: LocalizedText;
  provenance: DataProvenance;
}

export interface RoadCorridorSegment {
  id: string;
  code: string;
  name: LocalizedText;
  corridorType: 'BRIDGE' | 'ARTERIAL_ROAD' | 'GHAT_APPROACH' | 'HIGHWAY_RING' | 'EMERGENCY_CORRIDOR';
  status: RoadOperationalStatus;
  congestionIndex: number; // 0 - 100
  trafficLevel: OperationalLevel;
  monitoredVehicleCountPerHour: number;
  speedKmh: number;
  isEmergencyRoute: boolean;
  closureReason?: LocalizedText;
  diversionRouteDescription?: LocalizedText;
  polyline: GeoPoint[];
  connectedGhatIds: string[];
  connectedParkingIds: string[];
  provenance: DataProvenance;
}
