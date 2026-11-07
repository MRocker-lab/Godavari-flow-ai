import { GeoPoint, OperationalLevel } from './mobility';
import { DataProvenance, LocalizedText } from './provenance';

export type AuthorityRoleId =
  | 'TRAFFIC_POLICE_COMMANDER'
  | 'EVENT_AUTHORITY_DIRECTOR'
  | 'EMERGENCY_RESPONSE_COORDINATOR';

export interface AuthorityRoleProfile {
  id: AuthorityRoleId;
  title: LocalizedText;
  department: LocalizedText;
  badgeCode: string;
  operatorName: string;
  jurisdiction: LocalizedText;
  focusDescription: LocalizedText;
}

export type IncidentStatus = 'NEW' | 'ASSIGNED' | 'RESPONDING' | 'RESOLVED' | 'CLOSED';
export type IncidentPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentCategory =
  | 'CROWD_SURGE'
  | 'TRAFFIC_BOTTLENECK'
  | 'MEDICAL_ASSISTANCE'
  | 'SHUTTLE_DELAY'
  | 'BARRICADE_BREACH'
  | 'LOST_PILGRIM_ELDERLY';

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  status: IncidentStatus;
  actor: string;
  note: LocalizedText;
}

export interface OperationalIncident {
  id: string;
  code: string;
  title: LocalizedText;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  locationName: LocalizedText;
  linkedGhatId?: string;
  linkedRoadId?: string;
  coordinates: GeoPoint;
  assignedTeamId: string | null;
  createdAt: string;
  updatedAt: string;
  description: LocalizedText;
  resolutionSummary?: LocalizedText;
  timeline: IncidentTimelineEntry[];
  provenance: DataProvenance;
}

export type TeamTaskStatus = 'DEPLOYED_ACTIVE' | 'EN_ROUTE' | 'STANDBY_READY' | 'RELIEF_ROTATION';

export interface PoliceResponseTeam {
  id: string;
  teamIdentifier: string;
  unitType: 'TRAFFIC_ENFORCEMENT' | 'CROWD_MANAGEMENT' | 'MEDICAL_RAPID_RESPONSE' | 'RIVER_PATROL_NDRF';
  assignedLocationName: LocalizedText;
  linkedGhatId?: string;
  linkedRoadId?: string;
  coordinates: GeoPoint;
  teamLeader: string;
  contactCallsign: string;
  personnelStrength: number;
  currentAssignment: LocalizedText;
  status: TeamTaskStatus;
  associatedIncidentId: string | null;
  provenance: DataProvenance;
}

export type RecommendationDecisionStatus = 'PENDING_REVIEW' | 'APPROVED_APPLIED' | 'REJECTED' | 'SIMULATED_IN_TWIN';

export interface AIAuthorityRecommendation {
  id: string;
  code: string;
  severity: OperationalLevel;
  affectedLocationName: LocalizedText;
  linkedGhatId?: string;
  linkedRoadId?: string;
  linkedParkingId?: string;
  linkedShuttleId?: string;
  detectedCondition: LocalizedText;
  predictedConsequences: LocalizedText;
  recommendedAction: LocalizedText;
  reasoning: LocalizedText;
  expectedImpact: LocalizedText;
  decisionStatus: RecommendationDecisionStatus;
  /** Operational effect applied to canonical shared state when approved */
  operationalEffect: {
    type: 'CLOSE_ROAD_AND_DIVERT' | 'BOOST_SHUTTLE_FREQUENCY' | 'REDIRECT_PARKING_OVERFLOW' | 'DISPATCH_CROWD_CONTROL';
    targetRoadId?: string;
    newRoadStatus?: 'CLOSED' | 'DIVERTED' | 'OPEN';
    targetParkingId?: string;
    targetShuttleId?: string;
    shuttleFrequencyDeltaMinutes?: number;
    targetGhatId?: string;
    crowdReliefPercent?: number;
  };
  linkedDigitalTwinScenarioId: string;
  provenance: DataProvenance;
}

