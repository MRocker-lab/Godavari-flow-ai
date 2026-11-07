import { OperationalLevel } from './mobility';
import { LocalizedText } from './provenance';

export interface SimulationControls {
  pilgrimInflowMultiplierPercent: number; // 70% to 180%
  shuttleFrequencyBoostPercent: number;   // 0% to 100%
  parkingDiversionToSatellitePercent: number; // 0% to 100%
  closePushkarApproachRoad: boolean;
  closeOldBridgeToPrivateVehicles: boolean;
  enableDedicatedSeniorShuttleCorridor: boolean;
}

export interface MetricComparisonPoint {
  metricKey: string;
  label: LocalizedText;
  unit: string;
  baselineValue: number;
  simulatedValue: number;
  deltaPercent: number;
  isImprovement: boolean;
}

export interface GhatSimulationDelta {
  ghatId: string;
  ghatName: LocalizedText;
  baselineCrowdPercent: number;
  simulatedCrowdPercent: number;
  baselineWaitMinutes: number;
  simulatedWaitMinutes: number;
  baselineLevel: OperationalLevel;
  simulatedLevel: OperationalLevel;
}

export interface DigitalTwinScenarioPreset {
  id: string;
  code: string;
  name: LocalizedText;
  summary: LocalizedText;
  triggerCondition: LocalizedText;
  defaultControls: SimulationControls;
  highlightedRoadIds: string[];
  highlightedGhatIds: string[];
}

export interface DigitalTwinSimulationResult {
  scenarioId: string;
  controls: SimulationControls;
  overallCongestionIndexBaseline: number;
  overallCongestionIndexSimulated: number;
  avgBathingWaitBaselineMinutes: number;
  avgBathingWaitSimulatedMinutes: number;
  parkingSaturationBaselinePercent: number;
  parkingSaturationSimulatedPercent: number;
  shuttleWaitBaselineMinutes: number;
  shuttleWaitSimulatedMinutes: number;
  emergencyCorridorClearanceScore: number;
  ghatComparisons: GhatSimulationDelta[];
  hourlyProjectionSeries: Array<{
    hourLabel: string;
    baselineCongestion: number;
    interventionCongestion: number;
    baselineCrowdLoad: number;
    interventionCrowdLoad: number;
  }>;
  predictedConsequences: LocalizedText[];
  whyChangedExplanation: LocalizedText;
}
