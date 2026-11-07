export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface LocalizedText {
  en: string;
  te: string;
  hi: string;
}

export type DataProvenanceSource =
  | 'SIMULATED_BASELINE'
  | 'AUTHORITY_OVERRIDE'
  | 'DIGITAL_TWIN_PROJECTION'
  | 'LOCAL_DOMAIN_AI'
  | 'BACKEND_PROXY_AI_UNCONFIGURED'
  | 'DEMO_ROLE_ACCESS';

export interface DataProvenance {
  source: DataProvenanceSource;
  updatedAt: string;
  updatedByRole?: string;
  note?: LocalizedText;
}

export interface SyncMetadata {
  schemaVersion: number;
  stateRevision: number;
  lastUpdatedAt: string;
  lastUpdatedByTabId: string;
  lastActionSummary: LocalizedText;
  activeDigitalTwinScenarioId: string | null;
}

