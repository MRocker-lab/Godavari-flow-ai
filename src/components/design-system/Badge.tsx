import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Info,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import {
  DataProvenanceSource,
  OperationalLevel,
  ParkingOperationalStatus,
  RoadOperationalStatus,
  ShuttleOperationalStatus,
} from '@/types';
import { useTranslation } from '@/i18n/useTranslation';

export interface StatusIndicatorProps {
  level:
    | OperationalLevel
    | RoadOperationalStatus
    | ParkingOperationalStatus
    | ShuttleOperationalStatus;
  portal?: 'pilgrim' | 'command';
  customLabel?: string;
  size?: 'sm' | 'md';
}

/**
 * Accessible status indicator that NEVER relies on color alone (always pairs icon + explicit text label + border).
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  level,
  portal = 'pilgrim',
  customLabel,
  size = 'md',
}) => {
  const { language } = useTranslation();

  const getSemanticConfig = () => {
    switch (level) {
      case 'LOW':
      case 'OPEN':
      case 'AVAILABLE':
      case 'FREQUENT':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
          pilgrimStyle: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          commandStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
          defaultLabel:
            level === 'AVAILABLE'
              ? { en: 'Available', te: 'అందుబాటులో ఉంది', hi: 'उपलब्ध' }
              : level === 'FREQUENT'
              ? { en: 'Frequent Service', te: 'తరచుగా బస్సులు', hi: 'नियमित सेवा' }
              : level === 'OPEN'
              ? { en: 'Open & Clear', te: 'తెరిచి ఉంది', hi: 'खुला मार्ग' }
              : { en: 'Low Crowd', te: 'తక్కువ రద్దీ', hi: 'कम भीड़' },
        };

      case 'MODERATE':
      case 'MODERATE_WAIT':
      case 'DIVERTED':
        return {
          icon: <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
          pilgrimStyle: 'bg-amber-50 text-amber-900 border-amber-300',
          commandStyle: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
          defaultLabel:
            level === 'DIVERTED'
              ? { en: 'Diverted Route', te: 'మళ్లించిన మార్గం', hi: 'डायवर्ट मार्ग' }
              : level === 'MODERATE_WAIT'
              ? { en: 'Moderate Wait', te: 'సాధారణ నిరీక్షణ', hi: 'सामान्य प्रतीक्षा' }
              : { en: 'Moderate', te: 'మోస్తరు రద్దీ', hi: 'मध्यम भीड़' },
        };

      case 'HIGH':
      case 'CONGESTED':
      case 'FILLING_FAST':
      case 'HIGH_DEMAND':
      case 'RESERVED_ACCESSIBILITY':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
          pilgrimStyle: 'bg-orange-50 text-orange-950 border-orange-300',
          commandStyle: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
          defaultLabel:
            level === 'FILLING_FAST'
              ? { en: 'Filling Fast', te: 'వేగంగా నిండుతోంది', hi: 'तेज़ी से भर रहा' }
              : level === 'RESERVED_ACCESSIBILITY'
              ? {
                  en: 'Senior/Permit Priority',
                  te: 'వృద్ధులు/పాస్ ప్రాధాన్యత',
                  hi: 'वरिष्ठ/पास आरक्षित',
                }
              : level === 'CONGESTED'
              ? { en: 'Congested', te: 'అధిక ట్రాఫిక్', hi: 'भारी ट्रैफिक' }
              : level === 'HIGH_DEMAND'
              ? { en: 'High Demand', te: 'అధిక డిమాండ్', hi: 'उच्च मांग' }
              : { en: 'High Crowd', te: 'అధిక రద్దీ', hi: 'अधिक भीड़' },
        };

      case 'CRITICAL':
      case 'CLOSED':
      case 'FULL':
      case 'DELAYED':
      case 'EMERGENCY_ONLY':
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
          pilgrimStyle: 'bg-red-50 text-red-900 border-red-300',
          commandStyle: 'bg-red-950/80 text-red-300 border-red-500/50',
          defaultLabel:
            level === 'CLOSED'
              ? {
                  en: 'Closed to Private Cars',
                  te: 'ప్రైవేట్ వాహనాలకు మూసివేత',
                  hi: 'निजी वाहनों हेतु बंद',
                }
              : level === 'FULL'
              ? { en: 'Lot Full', te: 'పార్కింగ్ నిండింది', hi: 'पार्किंग पूर्ण' }
              : { en: 'Critical / Surge', te: 'అత్యధిక రద్దీ', hi: 'अत्यधिक भीड़' },
        };
    }
  };

  const config = getSemanticConfig();
  const styleClass = portal === 'command' ? config.commandStyle : config.pilgrimStyle;
  const sizeClass =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styleClass} ${sizeClass}`}
    >
      {config.icon}
      <span>{customLabel || config.defaultLabel[language]}</span>
    </span>
  );
};

export interface SimulationBadgeProps {
  source?: DataProvenanceSource;
  portal?: 'pilgrim' | 'command';
  compact?: boolean;
}

/**
 * Mandatory Data Honesty Badge (FOUND-08) clearly identifying simulated telemetry,
 * operator overrides, Digital Twin projections, and demo role access.
 */
export const SimulationBadge: React.FC<SimulationBadgeProps> = ({
  source = 'SIMULATED_BASELINE',
  portal = 'pilgrim',
  compact = false,
}) => {
  const { language } = useTranslation();

  const labels: Record<DataProvenanceSource, { en: string; te: string; hi: string }> = {
    SIMULATED_BASELINE: {
      en: compact ? 'Simulated Data' : 'Simulated Baseline Data',
      te: compact ? 'అనుకరించిన డేటా' : 'అనుకరించిన ప్రాథమిక డేటా',
      hi: compact ? 'सिम्युलेटेड डेटा' : 'सिम्युलेटेड बेसलाइन डेटा',
    },
    AUTHORITY_OVERRIDE: {
      en: compact ? 'Authority Updated' : 'Live Synced Authority Override (Simulated)',
      te: compact ? 'అథారిటీ అప్‌డేట్' : 'అథారిటీ కమాండ్ అప్‌డేట్ (అనుకరణ)',
      hi: compact ? 'अथॉरिटी अपडेट' : 'अथॉरिटी कमांड अपडेट (सिम्युलेटेड)',
    },
    DIGITAL_TWIN_PROJECTION: {
      en: compact ? 'Digital Twin Sim' : 'Digital Twin Projection',
      te: compact ? 'డిజిటల్ ట్విన్' : 'డిజిటల్ ట్విన్ అంచనా',
      hi: compact ? 'डिजिटल ट्विन' : 'डिजिटल ट्विन प्रक्षेपण',
    },
    LOCAL_DOMAIN_AI: {
      en: compact ? 'Domain AI Engine' : 'Local Domain AI Engine (State-Grounded)',
      te: compact ? 'లోకల్ AI ఇంజిన్' : 'లోకల్ డొమైన్ AI ఇంజిన్',
      hi: compact ? 'लोकल AI इंजन' : 'लोकल डोमेन AI इंजन',
    },
    BACKEND_PROXY_AI_UNCONFIGURED: {
      en: 'Backend LLM Proxy Not Connected — Using Local Domain AI',
      te: 'బ్యాకెండ్ LLM ప్రాక్సీ కనెక్ట్ కాలేదు — లోకల్ AI పనిచేస్తోంది',
      hi: 'बैकएंड LLM प्रॉक्सी असंबद्ध — लोकल AI सक्रिय',
    },
    DEMO_ROLE_ACCESS: {
      en: compact
        ? 'Demo Role Access'
        : 'Demo Role Access Only — Not Production Authentication',
      te: compact
        ? 'డెమో పాత్ర మాత్రమే'
        : 'డెమో పాత్ర ప్రవేశం మాత్రమే — ప్రొడక్షన్ ఆథెంటికేషన్ కాదు',
      hi: compact
        ? 'केवल डेमो भूमिका'
        : 'केवल डेमो भूमिका प्रवेश — प्रोडक्शन प्रमाणीकरण नहीं',
    },
  };

  const icon =
    source === 'AUTHORITY_OVERRIDE' ? (
      <Sliders className="w-3 h-3 shrink-0" aria-hidden="true" />
    ) : source === 'LOCAL_DOMAIN_AI' || source === 'DIGITAL_TWIN_PROJECTION' ? (
      <Cpu className="w-3 h-3 shrink-0" aria-hidden="true" />
    ) : (
      <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden="true" />
    );

  const style =
    portal === 'command'
      ? source === 'AUTHORITY_OVERRIDE'
        ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/40'
        : 'bg-slate-800/90 text-slate-300 border-slate-600'
      : source === 'AUTHORITY_OVERRIDE'
      ? 'bg-teal-50 text-teal-900 border-teal-300'
      : 'bg-slate-100 text-slate-700 border-slate-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-medium tracking-wide ${style}`}
    >
      {icon}
      <span>{labels[source][language]}</span>
    </span>
  );
};

