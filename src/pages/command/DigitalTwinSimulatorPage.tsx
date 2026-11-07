import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import {
  Button,
  Card,
  Dialog,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { runDigitalTwinSimulation } from '@/services/digitalTwinSimulator';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { SimulationControls } from '@/types';

export const DigitalTwinSimulatorPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const state = useMobilityStore((s) => s.state);
  const applyDigitalTwinIntervention = useMobilityStore(
    (s) => s.applyDigitalTwinIntervention
  );

  const initialScenarioId =
    searchParams.get('scenario') ||
    state.metadata.activeDigitalTwinScenarioId ||
    state.digitalTwinScenarios[0].id;

  const [selectedScenarioId, setSelectedScenarioId] =
    useState<string>(initialScenarioId);

  const activeScenario =
    state.digitalTwinScenarios.find((s) => s.id === selectedScenarioId) ||
    state.digitalTwinScenarios[0];

  const [controls, setControls] = useState<SimulationControls>(
    activeScenario.defaultControls
  );
  const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);
  const [appliedBannerVisible, setAppliedBannerVisible] = useState(false);

  useEffect(() => {
    const scen =
      state.digitalTwinScenarios.find((s) => s.id === selectedScenarioId) ||
      state.digitalTwinScenarios[0];
    setControls(scen.defaultControls);
    setAppliedBannerVisible(false);
  }, [selectedScenarioId, state.digitalTwinScenarios]);

  const simulationResult = useMemo(
    () => runDigitalTwinSimulation(activeScenario.id, controls, state),
    [activeScenario.id, controls, state]
  );

  const handleResetScenario = () => {
    setControls(activeScenario.defaultControls);
    setAppliedBannerVisible(false);
  };

  const handleConfirmApplyToLiveState = () => {
    applyDigitalTwinIntervention(activeScenario.id, controls);
    setConfirmApplyOpen(false);
    setAppliedBannerVisible(true);
  };

  return (
    <div data-testid="digital-twin-simulator-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-300">
              <Cpu className="w-3.5 h-3.5" />
              {t({
                en: 'Interactive Corridor Digital Twin Simulator',
                te: 'ఇంటరాక్టివ్ కారిడార్ డిజిటల్ ట్విన్ సిమ్యులేటర్',
                hi: 'इंटरएक्टिव कॉरिडोर डिजिटल ट्विन सिम्युलेटर',
              })}
            </span>
            <SimulationBadge source="DIGITAL_TWIN_PROJECTION" portal="command" />
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
            {t({
              en: 'What-If Surge Modeling, Before/After Delta Charts & Live State Deployment',
              te: 'వాట్-ఇఫ్ రద్దీ మోడలింగ్, ముందు/తరువాత పోలిక చార్టులు & ప్రత్యక్ష అమలు',
              hi: 'व्हाट-इफ सर्ज मॉडलिंग, पहले/बाद की तुलना और लाइव स्टेट तैनाती',
            })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {t({
              en: 'Test traffic diversions, shuttle boosts, and bridge restrictions safely before applying the intervention to the active Pilgrim Portal state.',
              te: 'పిల్గ్రిమ్ పోర్టల్‌లో అమలు చేసే ముందు ట్రాఫిక్ మళ్లింపులు మరియు షటిల్ బస్సుల మార్పులను ఇక్కడ పరీక్షించండి.',
              hi: 'सक्रिय पिलग्रिम पोर्टल पर लागू करने से पहले यातायात डायवर्जन और शटल बूस्ट का सुरक्षित परीक्षण करें।',
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            portal="command"
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            data-testid="reset-scenario-params-btn"
            onClick={handleResetScenario}
          >
            {t({
              en: 'Reset Scenario Parameters',
              te: 'పారామీటర్లను రీసెట్ చేయండి',
              hi: 'पैरामीटर रीसेट करें',
            })}
          </Button>
          <Button
            portal="command"
            variant="primary"
            size="sm"
            leftIcon={<Play className="w-4 h-4" />}
            data-testid="apply-twin-to-live-state-btn"
            onClick={() => setConfirmApplyOpen(true)}
          >
            {t({
              en: 'Apply Intervention to Active Demo State',
              te: 'ఈ మార్పులను ప్రత్యక్ష డెమో స్టేట్‌కు వర్తింపజేయండి',
              hi: 'सक्रिय डेमो स्टेट में हस्तक्षेप लागू करें',
            })}
          </Button>
        </div>
      </div>

      {appliedBannerVisible && (
        <div
          role="status"
          data-testid="twin-applied-banner"
          className="rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-xs text-emerald-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">
                {t({
                  en: `Digital Twin Intervention Applied (Revision #${state.metadata.stateRevision})`,
                  te: `డిజిటల్ ట్విన్ మార్పులు అమలు చేయబడ్డాయి (రివిజన్ #${state.metadata.stateRevision})`,
                  hi: `डिजिटल ट्विन हस्तक्षेप लागू किया गया (रिवीजन #${state.metadata.stateRevision})`,
                })}
              </div>
              <p className="text-emerald-300 mt-0.5">
                {t({
                  en: 'Road statuses, shuttle frequencies, parking guidance, and ghat wait times have been synchronized to all open Pilgrim Portal windows.',
                  te: 'రోడ్లు, షటిల్ బస్సులు, పార్కింగ్ మరియు ఘాట్ నిరీక్షణ సమయాలు భక్తుల పోర్టల్‌కు సింక్ చేయబడ్డాయి.',
                  hi: 'सड़क स्थिति, शटल आवृत्ति, पार्किंग और घाट प्रतीक्षा समय सभी खुले पिलग्रिम पोर्टल विंडो के साथ सिंक हो गए हैं।',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Scenario Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {state.digitalTwinScenarios.map((scen) => {
          const isSelected = scen.id === activeScenario.id;
          return (
            <button
              key={scen.id}
              type="button"
              onClick={() => setSelectedScenarioId(scen.id)}
              data-testid={`twin-scenario-btn-${scen.id}`}
              className={`rounded-2xl border p-4 text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-2 border-cyan-400 bg-cyan-950/40 shadow-command-panel'
                  : 'border-slate-800 bg-[#0F172A] hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {scen.code}
                  </span>
                  {isSelected && (
                    <span className="rounded bg-cyan-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">
                      ACTIVE SCENARIO
                    </span>
                  )}
                </div>
                <h2 className="mt-1.5 font-display text-sm font-extrabold text-white">
                  {t(scen.name)}
                </h2>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {t(scen.summary)}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-amber-300">
                Trigger: {t(scen.triggerCondition)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Workspace: Controls (Left 5 Cols) + Side-by-Side Baseline vs Intervention Deltas (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 Cols: Adjustable Simulation Sliders & Toggles */}
        <Card
          portal="command"
          elevated
          className="lg:col-span-5 space-y-5"
          data-testid="twin-controls-panel"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="font-display text-base font-extrabold text-white">
              {t({
                en: 'Simulation Parameters & Intervention Levers',
                te: 'సిమ్యులేషన్ పారామీటర్లు & నియంత్రణలు',
                hi: 'सिम्युलेशन पैरामीटर और हस्तक्षेप नियंत्रण',
              })}
            </h2>
          </div>

          {/* Slider 1: Pilgrim Inflow Multiplier */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-bold">
              <label htmlFor="slider-inflow" className="text-slate-200">
                {t({
                  en: '1. Pilgrim Inflow Surge Multiplier',
                  te: '1. భక్తుల ప్రవాహ మల్టిప్లయర్',
                  hi: '1. तीर्थयात्री प्रवाह गुणक',
                })}
              </label>
              <span
                data-testid="val-inflow-multiplier"
                className="font-mono text-amber-300"
              >
                {controls.pilgrimInflowMultiplierPercent}%
              </span>
            </div>
            <input
              id="slider-inflow"
              type="range"
              min={70}
              max={180}
              step={5}
              value={controls.pilgrimInflowMultiplierPercent}
              data-testid="slider-inflow-multiplier"
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  pilgrimInflowMultiplierPercent: Number(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>70% (Off-Peak)</span>
              <span>100% (Baseline)</span>
              <span>180% (Muhurtham Peak)</span>
            </div>
          </div>

          {/* Slider 2: Shuttle Frequency Boost */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-bold">
              <label htmlFor="slider-shuttle" className="text-slate-200">
                {t({
                  en: '2. APSRTC Shuttle Frequency Boost',
                  te: '2. ఆర్టీసీ షటిల్ బస్సుల పెంపు %',
                  hi: '2. शटल बस आवृत्ति वृद्धि %',
                })}
              </label>
              <span
                data-testid="val-shuttle-boost"
                className="font-mono text-cyan-300"
              >
                +{controls.shuttleFrequencyBoostPercent}%
              </span>
            </div>
            <input
              id="slider-shuttle"
              type="range"
              min={0}
              max={100}
              step={10}
              value={controls.shuttleFrequencyBoostPercent}
              data-testid="slider-shuttle-boost"
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  shuttleFrequencyBoostPercent: Number(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Slider 3: Parking Diversion to Satellite Hubs */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-bold">
              <label htmlFor="slider-parking" className="text-slate-200">
                {t({
                  en: '3. Highway Vehicle Interception at Satellite Hubs',
                  te: '3. శాటిలైట్ పార్కింగ్ మళ్లింపు %',
                  hi: '3. सैटेलाइट हब पार्किंग डायवर्जन %',
                })}
              </label>
              <span
                data-testid="val-parking-diversion"
                className="font-mono text-emerald-300"
              >
                {controls.parkingDiversionToSatellitePercent}%
              </span>
            </div>
            <input
              id="slider-parking"
              type="range"
              min={0}
              max={100}
              step={5}
              value={controls.parkingDiversionToSatellitePercent}
              data-testid="slider-parking-diversion"
              onChange={(e) =>
                setControls((prev) => ({
                  ...prev,
                  parkingDiversionToSatellitePercent: Number(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* 3 Operational Corridor Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
            {[
              {
                id: 'close-pushkar',
                checked: controls.closePushkarApproachRoad,
                onChange: (val: boolean) =>
                  setControls((p) => ({ ...p, closePushkarApproachRoad: val })),
                label: {
                  en: 'Close Pushkar Approach Road to Private Cars (Green Shuttle Lane Only)',
                  te: 'పుష్కర అప్రోచ్ రోడ్డును ప్రైవేట్ కార్లకు మూసివేయండి (షటిల్ మాత్రమే)',
                  hi: 'पुष्कर एप्रोच रोड निजी कारों के लिए बंद करें (केवल शटल लेन)',
                },
              },
              {
                id: 'close-bridge',
                checked: controls.closeOldBridgeToPrivateVehicles,
                onChange: (val: boolean) =>
                  setControls((p) => ({
                    ...p,
                    closeOldBridgeToPrivateVehicles: val,
                  })),
                label: {
                  en: 'Restrict Road-cum-Rail Bridge to Emergency & APSRTC Shuttles',
                  te: 'రోడ్-కమ్-రైల్ వంతెనను షటిల్ & అంబులెన్స్‌లకే పరిమితం చేయండి',
                  hi: 'रोड-कम-रेल पुल को आपातकालीन और शटल बसों तक सीमित करें',
                },
              },
              {
                id: 'senior-corridor',
                checked: controls.enableDedicatedSeniorShuttleCorridor,
                onChange: (val: boolean) =>
                  setControls((p) => ({
                    ...p,
                    enableDedicatedSeniorShuttleCorridor: val,
                  })),
                label: {
                  en: 'Activate Dedicated S3 Senior Citizen & Electric Buggy Priority Lane',
                  te: 'S3 వృద్ధుల షటిల్ & ఎలక్ట్రిక్ బగ్గీ ప్రత్యేక లేన్ ఆన్ చేయండి',
                  hi: 'समर्पित S3 वरिष्ठ नागरिक और इलेक्ट्रिक बग्गी लेन सक्रिय करें',
                },
              },
            ].map((toggle) => (
              <label
                key={toggle.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-3 cursor-pointer"
              >
                <span className="font-semibold text-slate-200">
                  {t(toggle.label)}
                </span>
                <input
                  type="checkbox"
                  checked={toggle.checked}
                  data-testid={`twin-toggle-${toggle.id}`}
                  onChange={(e) => toggle.onChange(e.target.checked)}
                  className="h-4 w-4 rounded accent-cyan-400"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Right 7 Cols: Side-by-Side Baseline vs Intervention Comparison & Charts */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Side-by-Side Baseline vs Intervention Delta Cards */}
          <div
            data-testid="twin-delta-cards-grid"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
          >
            {/* Metric 1: Corridor Congestion */}
            <Card portal="command" padding="sm">
              <div className="text-xs font-bold text-slate-400">
                {t({
                  en: 'Corridor Congestion Index (Before → After)',
                  te: 'కారిడార్ ట్రాఫిక్ రద్దీ (ముందు → తరువాత)',
                  hi: 'कॉरिडोर भीड़ सूचकांक (पहले → बाद में)',
                })}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="font-mono text-xl font-extrabold">
                  <span className="text-red-400 line-through mr-2">
                    {simulationResult.overallCongestionIndexBaseline}
                  </span>
                  <span
                    data-testid="twin-simulated-congestion"
                    className="text-emerald-400 text-2xl"
                  >
                    → {simulationResult.overallCongestionIndexSimulated}/100
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                  <TrendingDown className="w-3.5 h-3.5" />-
                  {Math.max(
                    0,
                    simulationResult.overallCongestionIndexBaseline -
                      simulationResult.overallCongestionIndexSimulated
                  )}{' '}
                  pts
                </span>
              </div>
            </Card>

            {/* Metric 2: Average Ghat Wait Time */}
            <Card portal="command" padding="sm">
              <div className="text-xs font-bold text-slate-400">
                {t({
                  en: 'Avg Bathing Queue Wait (Before → After)',
                  te: 'సగటు స్నాన నిరీక్షణ సమయం (ముందు → తరువాత)',
                  hi: 'औसत स्नान प्रतीक्षा समय (पहले → बाद में)',
                })}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="font-mono text-xl font-extrabold">
                  <span className="text-red-400 line-through mr-2">
                    {simulationResult.avgBathingWaitBaselineMinutes}m
                  </span>
                  <span
                    data-testid="twin-simulated-wait"
                    className="text-emerald-400 text-2xl"
                  >
                    → {simulationResult.avgBathingWaitSimulatedMinutes}m
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-500/40 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
                  Saves{' '}
                  {Math.max(
                    0,
                    simulationResult.avgBathingWaitBaselineMinutes -
                      simulationResult.avgBathingWaitSimulatedMinutes
                  )}
                  m
                </span>
              </div>
            </Card>

            {/* Metric 3: Inner Parking Saturation */}
            <Card portal="command" padding="sm">
              <div className="text-xs font-bold text-slate-400">
                {t({
                  en: 'Inner-City Parking Saturation (Before → After)',
                  te: 'ఇన్నర్-సిటీ పార్కింగ్ ఒత్తిడి (ముందు → తరువాత)',
                  hi: 'आंतरिक शहर पार्किंग संतृप्ति (पहले → बाद में)',
                })}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="font-mono text-xl font-extrabold">
                  <span className="text-amber-400 line-through mr-2">
                    {simulationResult.parkingSaturationBaselinePercent}%
                  </span>
                  <span className="text-cyan-300 text-2xl">
                    → {simulationResult.parkingSaturationSimulatedPercent}%
                  </span>
                </div>
                <span className="font-mono text-xs text-cyan-300">
                  Satellite Intercept Active
                </span>
              </div>
            </Card>

            {/* Metric 4: Emergency Corridor Clearance */}
            <Card portal="command" padding="sm">
              <div className="text-xs font-bold text-slate-400">
                {t({
                  en: 'Emergency Ambulance Corridor Clearance',
                  te: 'అత్యవసర అంబులెన్స్ మార్గం క్లియరెన్స్ స్కోరు',
                  hi: 'आपातकालीन एम्बुलेंस कॉरिडोर निकासी स्कोर',
                })}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {simulationResult.emergencyCorridorClearanceScore}%
                </span>
                <span className="font-mono text-xs text-teal-300">
                  Shuttle Wait: {simulationResult.shuttleWaitBaselineMinutes}m →{' '}
                  {simulationResult.shuttleWaitSimulatedMinutes}m
                </span>
              </div>
            </Card>
          </div>

          {/* Before / After Ghat Crowd Load Visual Comparison Chart */}
          <Card
            portal="command"
            className="space-y-3.5"
            data-testid="twin-before-after-chart"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                {t({
                  en: 'Before vs. After Ghat Crowd Load (%) & Queue Wait Comparison',
                  te: 'ఘాట్ వారీగా ముందు మరియు తరువాత రద్దీ (%) పోలిక చార్ట్',
                  hi: 'घाट-वार पहले बनाम बाद में भीड़ भार (%) तुलना चार्ट',
                })}
              </h3>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-red-300">
                  <span className="w-2.5 h-2.5 rounded-xs bg-red-500/80 inline-block" />
                  Baseline Surge
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
                  With Intervention
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {simulationResult.ghatComparisons.slice(0, 6).map((item) => (
                <div
                  key={item.ghatId}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {t(item.ghatName)}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-red-300">
                        {item.baselineCrowdPercent}% ({item.baselineWaitMinutes}m)
                      </span>
                      <span>→</span>
                      <span className="text-emerald-300 font-bold">
                        {item.simulatedCrowdPercent}% ({item.simulatedWaitMinutes}m)
                      </span>
                      <StatusIndicator
                        level={item.simulatedLevel}
                        portal="command"
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Dual Horizontal Comparison Bars */}
                  <div className="space-y-1">
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-red-500/80 rounded-full transition-all"
                        style={{ width: `${item.baselineCrowdPercent}%` }}
                      />
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${item.simulatedCrowdPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 6-Hour Hourly Congestion & Crowd Projection Chart + Predicted Consequences */}
          <Card portal="command" className="space-y-3.5">
            <h3 className="font-display text-sm font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {t({
                en: '6-Hour Predictive Timeline & AI Consequence Explanation',
                te: '6-గంటల ముందస్తు అంచనా & AI వివరణ',
                hi: '6-घंटे की पूर्वानुमानित समयरेखा और AI परिणाम व्याख्या',
              })}
            </h3>

            {/* 6-Hour Projection Columns */}
            <div className="grid grid-cols-6 gap-2 pt-2 text-center font-mono text-[11px]">
              {simulationResult.hourlyProjectionSeries.map((pt) => (
                <div
                  key={pt.hourLabel}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 space-y-1.5"
                >
                  <div className="text-slate-400 font-bold">{pt.hourLabel}</div>
                  <div className="text-red-400 text-[10px]">
                    Base: {pt.baselineCongestion}%
                  </div>
                  <div className="text-emerald-400 font-extrabold text-xs">
                    Sim: {pt.interventionCongestion}%
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-slate-200 leading-relaxed">
              <strong className="text-cyan-300">Why Metrics Changed: </strong>
              {t(simulationResult.whyChangedExplanation)}
            </div>

            <ul className="space-y-1 text-xs text-slate-300">
              {simulationResult.predictedConsequences.map((c, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t(c)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Map-Based Delta Visualization */}
      <MobilityMapWorkspace
        portal="command"
        enableOperatorControls={true}
        compactHeight
      />

      {/* Confirmation Dialog for Applying Digital Twin Intervention to Live State */}
      <Dialog
        isOpen={confirmApplyOpen}
        onClose={() => setConfirmApplyOpen(false)}
        portal="command"
        title={t({
          en: 'Deploy Digital Twin Intervention to Active Corridor State?',
          te: 'డిజిటల్ ట్విన్ మార్పులను ప్రత్యక్ష కారిడార్ స్టేట్‌కు వర్తింపజేయాలా?',
          hi: 'सक्रिय कॉरिडोर स्टेट में डिजिटल ट्विन हस्तक्षेप लागू करें?',
        })}
        description={t({
          en: 'This will apply the simulated road closures, shuttle frequency boosts, and ghat crowd reliefs to the canonical shared store and synchronize all open Pilgrim Portal windows.',
          te: 'ఈ చర్య అనుకరించిన రోడ్డు మూసివేతలు మరియు షటిల్ బస్సుల మార్పులను షేర్డ్ స్టోర్‌లో అమలు చేసి భక్తుల పోర్టల్‌కు సింక్ చేస్తుంది.',
          hi: 'यह सिम्युलेटेड सड़क बंदी, शटल बूस्ट और घाट राहत को साझा स्टोर पर लागू करेगा और पिलग्रिम पोर्टल के साथ सिंक करेगा।',
        })}
        footer={
          <>
            <Button
              portal="command"
              variant="ghost"
              onClick={() => setConfirmApplyOpen(false)}
            >
              Cancel
            </Button>
            <Button
              portal="command"
              variant="primary"
              data-testid="confirm-apply-twin-modal-btn"
              onClick={handleConfirmApplyToLiveState}
            >
              Confirm & Apply to Active Demo State
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Scenario: <strong>{t(activeScenario.name)}</strong> — Projected
            Corridor Congestion drops from{' '}
            <strong>{simulationResult.overallCongestionIndexBaseline}/100</strong>{' '}
            to{' '}
            <strong>{simulationResult.overallCongestionIndexSimulated}/100</strong>.
          </span>
        </div>
      </Dialog>
    </div>
  );
};
