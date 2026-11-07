import { CanonicalMobilityState } from '@/data/baselineState';
import { DataProvenanceSource, LocalizedText, SupportedLanguage } from '@/types';

export interface ConciergeMapLink {
  entityType: 'GHAT' | 'PARKING' | 'SHUTTLE' | 'ROAD';
  entityId: string;
  label: LocalizedText;
  statusBadge: string;
  routeHref: string;
}

export interface ConciergeMessageResponse {
  id: string;
  replyText: string;
  language: SupportedLanguage;
  intentDetected:
    | 'CROWD_AND_GHAT_ADVICE'
    | 'PARKING_RECOMMENDATION'
    | 'SHUTTLE_TIMING'
    | 'SENIOR_AND_ACCESSIBILITY'
    | 'ROAD_CLOSURE_AND_TRAFFIC'
    | 'EMERGENCY_AND_MEDICAL'
    | 'JOURNEY_PLANNING_SUMMARY';
  mapLinks: ConciergeMapLink[];
  suggestedFollowUps: string[];
  provenanceSource: DataProvenanceSource;
  generatedAt: string;
}

export interface IAIServiceAdapter {
  generateConciergeReply(
    userQuery: string,
    language: SupportedLanguage,
    liveState: CanonicalMobilityState,
    seniorModeActive: boolean
  ): Promise<ConciergeMessageResponse>;

  generateSituationSummary(
    liveState: CanonicalMobilityState,
    language: SupportedLanguage
  ): string;
}

