import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bus,
  Car,
  CheckCircle2,
  Cpu,
  Gauge,
  ParkingSquare,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  ProvenanceBadge,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { defaultAIService } from '@/adapters/ai/LocalDomainAIEngine';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useTranslation } from '@/i18n/useTranslation';

export const CommandOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const state = useMobilityStore((s) => s.state);
  const approveAIRecommendation = useMobilityStore((s) => s.approveAIRecommendation);
  const markAIRecommendationSimulated = useMobilityStore(
    (s) => s.markAIRecommendationSimulated
  );
  const activeRoleProfile = useAuthorityAuthStore((s) => s.getActiveRoleProfile());

  // Compute 8 balanced KPI metrics
  const metrics = useMemo(() => {
    const avgCongestion = Math.round(
      state.roads.reduce((acc, r) => acc + r.congestionIndex, 0) / state.roads.length
    );
    const totalVehiclesPerHour = state.roads.reduce(
      (acc, r) => acc + r.monitoredVehicleCountPerHour,
      0
    );
    const totalAvailableParking = state.parkingHubs.reduce(
      (acc, p) => acc + p.availableSpaces,
      0
    );
    const totalParkingCapacity = state.parkingHubs.reduce(
      (acc, p) => acc + p.totalCapacity,
      0
    );
    const totalActiveBuses = state.shuttles.reduce(
      (acc, s) => acc + s.activeBusesCount,
      0
    );
    const avgShuttleFreq = (
      state.shuttles.reduce((acc, s) => acc + s.frequencyMinutes, 0) /
      state.shuttles.length
    ).toFixed(1);
    const totalPilgrimsAtGhats = state.ghats.reduce(
      (acc, g) => acc + g.currentOccupancyCount,
      0
    );
    const totalGhatCapacity = state.ghats.reduce(
      (acc, g) => acc + g.maxCapacityCount,
      0
    );
    const ghatLoadPct = Math.round(
      (totalPilgrimsAtGhats / Math.max(1, totalGhatCapacity)) * 100
    );

    const openIncidents = state.incidents.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
    );
    const criticalAlertsCount =
      openIncidents.filter((i) => i.priority === 'CRITICAL' || i.priority === 'HIGH')
        .length +
      state.ghats.filter((g) => g.crowdLevel === 'CRITICAL').length +
      state.roads.filter((r) => r.status === 'CLOSED').length;

    const predictiveRiskScore = Math.min(
      96,
      Math.round(avgCongestion * 0.55 + ghatLoadPct * 0.45)
    );

    return {
      avgCongestion,
      totalVehiclesPerHour,
      totalAvailableParking,
      totalParkingCapacity,
      totalActiveBuses,
      avgShuttleFreq,
      totalPilgrimsAtGhats,
      ghatLoadPct,
      openIncidentsCount: openIncidents.length,
      criticalAlertsCount,
      predictiveRiskScore,
    };
  }, [state]);

  const situationSummary = useMemo(
    () => defaultAIService.generateSituationSummary(state, language),
    [state, language]
  );

  return (
    <div data-testid="command-overview-page" className="space-y-6">
      {/* Top Page Title & AI Situation Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-command-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-300">
                <Activity className="w-3.5 h-3.5" />
                {t({
                  en: 'Real-Time Corridor Command Overview',
                  te: 'రియల్-టైమ్ కారిడార్ కమాండ్ ఓవర్‌వ్యూ',
                  hi: 'रियल-टाइम कॉरिडोर कमांड अवलोकन',
                })}
              </span>
              <SimulationBadge source="LOCAL_DOMAIN_AI" portal="command" compact />
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
              {t({
                en: 'Godavari Pushkaralu Integrated Urban Mobility & Crowd Operations',
                te: 'గోదావరి పుష్కర ఇంటిగ్రేటెడ్ అర్బన్ మొబిలిటీ & క్రౌడ్ ఆపరేషన్స్',
                hi: 'गोदावरी पुष्करालु एकीकृत शहरी गतिशीलता एवं भीड़ संचालन',
              })}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              portal="command"
              variant="outline"
              size="sm"
              leftIcon={<Cpu className="w-4 h-4" />}
              onClick={() => navigate('/command/digital-twin')}
            >
              {t({
                en: 'Launch Digital Twin Simulator',
                te: 'డిజిటల్ ట్విన్ సిమ్యులేటర్',
                hi: 'डिजिटल ट्विन सिम्युलेटर खोलें',
              })}
            </Button>
            <Button
              portal="command"
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate('/command/ai-decisions')}
            >
              {t({
                en: 'Open AI Decision Centre',
                te: 'AI డెసిషన్ సెంటర్',
                hi: 'AI निर्णय केंद्र खोलें',
              })}
            </Button>
          </div>
        </div>

        {/* AI-Generated Corridor Situation Summary */}
        <div
          data-testid="command-ai-situation-summary"
          className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 text-xs text-slate-200 leading-relaxed flex items-start gap-3"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-cyan-300 mr-1.5">
              {t({
                en: 'AI Corridor Situation Assessment:',
                te: 'AI కారిడార్ విశ్లేషణ:',
                hi: 'AI कॉरिडोर स्थिति मूल्यांकन:',
              })}
            </span>
            <span>{situationSummary}</span>
          </div>
        </div>
      </div>

      {/* CMD-03: Balanced 8-KPI Strip */}
      <div
        data-testid="command-8-kpi-strip"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {/* KPI 1: Traffic Congestion Index */}
        <Card portal="command" padding="sm" data-testid="kpi-congestion-index">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '1. Traffic Congestion Index',
                te: '1. ట్రాఫిక్ రద్దీ సూచీ',
                hi: '1. यातायात भीड़ सूचकांक',
              })}
            </span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {metrics.avgCongestion}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <StatusIndicator
              level={metrics.avgCongestion >= 70 ? 'HIGH' : 'MODERATE'}
              portal="command"
              size="sm"
            />
          </div>
        </Card>

        {/* KPI 2: Total Monitored Vehicle Count */}
        <Card portal="command" padding="sm" data-testid="kpi-vehicle-count">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '2. Monitored Vehicle Flow',
                te: '2. వాహనాల ప్రవాహం (/గం.)',
                hi: '2. निगरानी वाहन प्रवाह',
              })}
            </span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {metrics.totalVehiclesPerHour.toLocaleString()}
              <span className="text-xs font-normal text-slate-400"> /hr</span>
            </span>
            <span className="font-mono text-xs text-cyan-300">10 Corridors</span>
          </div>
        </Card>

        {/* KPI 3: Parking Availability */}
        <Card portal="command" padding="sm" data-testid="kpi-parking-availability">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '3. Satellite Parking Free',
                te: '3. ఖాళీ పార్కింగ్ స్థలాలు',
                hi: '3. उपलब्ध पार्किंग स्थान',
              })}
            </span>
            <ParkingSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-emerald-400">
              {metrics.totalAvailableParking.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-slate-400">
              / {metrics.totalParkingCapacity.toLocaleString()} bays
            </span>
          </div>
        </Card>

        {/* KPI 4: Shuttle Fleet Status */}
        <Card portal="command" padding="sm" data-testid="kpi-shuttle-fleet">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '4. APSRTC Shuttle Fleet',
                te: '4. ఆర్టీసీ షటిల్ బస్సులు',
                hi: '4. शटल बस बेड़ा',
              })}
            </span>
            <Bus className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {metrics.totalActiveBuses}{' '}
              <span className="text-xs font-normal text-slate-400">buses</span>
            </span>
            <span className="font-mono text-xs text-teal-300">
              Avg {metrics.avgShuttleFreq}m headway
            </span>
          </div>
        </Card>

        {/* KPI 5: Crowd Density Across 8 Ghats */}
        <Card portal="command" padding="sm" data-testid="kpi-crowd-density">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '5. Riverfront Crowd Load',
                te: '5. ఘాట్ల వద్ద భక్తుల రద్దీ',
                hi: '5. घाट भीड़ घनत्व',
              })}
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {metrics.totalPilgrimsAtGhats.toLocaleString()}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {metrics.ghatLoadPct}% capacity
            </span>
          </div>
        </Card>

        {/* KPI 6: Active Incidents */}
        <Card portal="command" padding="sm" data-testid="kpi-active-incidents">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '6. Active Field Incidents',
                te: '6. చురుకైన సంఘటనలు',
                hi: '6. सक्रिय फील्ड घटनाएँ',
              })}
            </span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-white">
              {metrics.openIncidentsCount}
            </span>
            <button
              type="button"
              onClick={() => navigate('/command/incidents')}
              className="text-xs font-bold text-cyan-300 hover:underline"
            >
              {t({ en: 'Dispatch →', te: 'నిర్వహణ →', hi: 'प्रबंधन →' })}
            </button>
          </div>
        </Card>

        {/* KPI 7: Critical Alerts */}
        <Card portal="command" padding="sm" data-testid="kpi-critical-alerts">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '7. Critical Surge Alerts',
                te: '7. క్రిటికల్ అలర్ట్‌లు',
                hi: '7. क्रिटिकल सर्ज अलर्ट',
              })}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-amber-300">
              {metrics.criticalAlertsCount}
            </span>
            <span className="text-xs text-slate-400">
              {state.roads.filter((r) => r.status === 'CLOSED').length} closed road(s)
            </span>
          </div>
        </Card>

        {/* KPI 8: Predictive Risk Indicator */}
        <Card portal="command" padding="sm" data-testid="kpi-predictive-risk">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {t({
                en: '8. Predictive Risk Score (+60m)',
                te: '8. రాబోయే 60 ని. రిస్క్ స్కోరు',
                hi: '8. पूर्वानुमानित जोखिम (+60 मि.)',
              })}
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-extrabold text-cyan-300">
              {metrics.predictiveRiskScore}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <StatusIndicator
              level={metrics.predictiveRiskScore >= 75 ? 'HIGH' : 'MODERATE'}
              portal="command"
              size="sm"
            />
          </div>
        </Card>
      </div>

      {/* Central Interactive 7-Layer Operational Map */}
      <MobilityMapWorkspace
        portal="command"
        enableOperatorControls={true}
      />

      {/* Bottom 2-Column Grid: Recommended Authority Actions + Recent Incidents Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Recommended Authority Actions */}
        <Card portal="command" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {t({
                  en: 'Recommended Authority Actions (AI Decision Feed)',
                  te: 'AI సిఫార్సు చేసిన అధికారిక చర్యలు',
                  hi: 'अनुशंसित प्राधिकरण कार्रवाइयाँ (AI निर्णय फ़ीड)',
                })}
              </h2>
              <p className="text-xs text-slate-400">
                {t({
                  en: 'Approving an action updates canonical shared state and broadcasts to the Pilgrim Portal.',
                  te: 'ఆమోదించిన చర్య వెంటనే భక్తుల పోర్టల్‌కు ప్రత్యక్షంగా ప్రసారం చేయబడుతుంది.',
                  hi: 'किसी कार्रवाई को स्वीकृत करने पर वह तुरंत पिलग्रिम पोर्टल पर सिंक हो जाती है।',
                })}
              </p>
            </div>
            <Button
              portal="command"
              variant="outline"
              size="sm"
              onClick={() => navigate('/command/ai-decisions')}
            >
              {t({ en: 'View All', te: 'అన్నీ చూడండి', hi: 'सभी देखें' })}
            </Button>
          </div>

          <div className="space-y-3">
            {state.aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                data-testid={`overview-ai-rec-${rec.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">
                      {rec.code}
                    </span>
                    <StatusIndicator
                      level={rec.severity}
                      portal="command"
                      size="sm"
                    />
                    <span className="font-bold text-slate-200">
                      {t(rec.affectedLocationName)}
                    </span>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                    {rec.decisionStatus}
                  </span>
                </div>

                <p className="font-semibold text-white">
                  {t(rec.recommendedAction)}
                </p>
                <p className="text-slate-400">{t(rec.expectedImpact)}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <ProvenanceBadge provenance={rec.provenance} portal="command" />
                  <div className="flex items-center gap-2">
                    <Button
                      portal="command"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        markAIRecommendationSimulated(rec.id);
                        navigate(
                          `/command/digital-twin?scenario=${rec.linkedDigitalTwinScenarioId}`
                        );
                      }}
                    >
                      {t({ en: 'Simulate', te: 'సిమ్యులేట్', hi: 'सिम्युलेट करें' })}
                    </Button>
                    {rec.decisionStatus !== 'APPROVED_APPLIED' ? (
                      <Button
                        portal="command"
                        variant="primary"
                        size="sm"
                        data-testid={`overview-approve-rec-${rec.id}`}
                        onClick={() =>
                          approveAIRecommendation(
                            rec.id,
                            activeRoleProfile.operatorName
                          )
                        }
                      >
                        {t({
                          en: 'Approve & Apply',
                          te: 'ఆమోదించు & అమలు చేయి',
                          hi: 'स्वीकृत और लागू करें',
                        })}
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t({ en: 'Applied Live', te: 'అమలులో ఉంది', hi: 'लागू किया गया' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right 5 Cols: Recent Active Incidents & Field Alerts */}
        <Card portal="command" className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                {t({
                  en: 'Live Incident & Dispatch Feed',
                  te: 'ప్రత్యక్ష సంఘటనలు & డిస్పాచ్ ఫీడ్',
                  hi: 'लाइव घटना और डिस्पैच फ़ीड',
                })}
              </h2>
              <p className="text-xs text-slate-400">
                {t({
                  en: 'Includes field alerts and Pilgrim Safety Hub requests.',
                  te: 'ఫీల్డ్ అలర్ట్‌లు మరియు భక్తుల సహాయ అభ్యర్థనలు.',
                  hi: 'फील्ड अलर्ट और श्रद्धालु सहायता अनुरोध शामिल हैं।',
                })}
              </p>
            </div>
            <Button
              portal="command"
              variant="outline"
              size="sm"
              onClick={() => navigate('/command/incidents')}
            >
              {t({ en: 'Manage All', te: 'నిర్వహించండి', hi: 'प्रबंधित करें' })}
            </Button>
          </div>

          <div className="space-y-3">
            {state.incidents.slice(0, 4).map((inc) => (
              <div
                key={inc.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-300">
                    {inc.code} • {inc.priority}
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                    {inc.status}
                  </span>
                </div>
                <div className="font-bold text-white">{t(inc.title)}</div>
                <div className="text-slate-400">{t(inc.locationName)}</div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>
                    {t({ en: 'Unit:', te: 'బృందం:', hi: 'टीम:' })}{' '}
                    <strong className="text-cyan-300">
                      {inc.assignedTeamId || 'Unassigned'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/command/incidents')}
                    className="font-bold text-cyan-300 hover:underline"
                  >
                    {t({ en: 'Update Status →', te: 'స్థితి మార్చండి →', hi: 'स्थिति अपडेट करें →' })}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
