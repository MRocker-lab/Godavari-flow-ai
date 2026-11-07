import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  AccessibilityBar,
  Button,
  Card,
  CrossTabSyncBanner,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { PilgrimLayout } from '@/components/pilgrim/layout/PilgrimLayout';
import { CommandLayout } from '@/components/command/layout/CommandLayout';
import {
  AITravelAssistantPage,
  ExploreDestinationsPage,
  JourneyPlannerPage,
  ParkingFinderPage,
  PilgrimHomePage,
  SafetyAndAccessibilityPage,
  ShuttleTrackerPage,
} from '@/pages/pilgrim';
import {
  AIDecisionCentrePage,
  CommandOverviewPage,
  DigitalTwinSimulatorPage,
  IncidentManagementPage,
  OperationalMapPage,
  PoliceTeamManagementPage,
} from '@/pages/command';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { defaultAIService } from '@/adapters/ai/LocalDomainAIEngine';
import { ConciergeMessageResponse } from '@/adapters/interfaces/IAIServiceAdapter';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { MobilityMapWorkspace } from '@/components/maps';

export const CommandSyncHarness: React.FC = () => {
  const navigate = useNavigate();
  const state = useMobilityStore((s) => s.state);
  const lastSyncChannel = useMobilityStore((s) => s.lastSyncChannel);
  const setRoadStatus = useMobilityStore((s) => s.setRoadStatus);
  const updateParkingOccupancy = useMobilityStore((s) => s.updateParkingOccupancy);
  const updateShuttleService = useMobilityStore((s) => s.updateShuttleService);
  const updateGhatCrowdLevel = useMobilityStore((s) => s.updateGhatCrowdLevel);

  const { t, ui, language } = useTranslation();
  const seniorMode = useAccessibilityStore((s) => s.seniorCitizenMode);

  const [portalPreview, setPortalPreview] = useState<'pilgrim' | 'command'>('command');
  const [aiQuery, setAiQuery] = useState(
    'Are any roads or bridges closed in Rajamahendravaram?'
  );
  const [aiResponse, setAiResponse] = useState<ConciergeMessageResponse | null>(null);

  const pushkarRoad = state.roads.find((r) => r.id === 'road-pushkar-approach')!;
  const artsParking = state.parkingHubs.find((p) => p.id === 'park-arts-college')!;
  const s1Shuttle = state.shuttles.find((s) => s.id === 'shuttle-s1')!;
  const pushkarGhat = state.ghats.find((g) => g.id === 'ghat-pushkar')!;

  const handleRunAiCheck = async (customPrompt?: string) => {
    const promptToUse = customPrompt || aiQuery;
    if (customPrompt) setAiQuery(customPrompt);
    const reply = await defaultAIService.generateConciergeReply(
      promptToUse,
      language,
      state,
      seniorMode
    );
    setAiResponse(reply);
  };

  return (
    <div data-portal={portalPreview} className="min-h-screen p-4 sm:p-6 transition-colors">
      <CrossTabSyncBanner portal={portalPreview} />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight">
                GODAVARI FLOW AI
              </h1>
              <SimulationBadge source="SIMULATED_BASELINE" portal={portalPreview} />
            </div>
            <p className="text-sm opacity-80 mt-0.5">
              {portalPreview === 'pilgrim'
                ? ui('brandSubtitlePilgrim')
                : ui('brandSubtitleCommand')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              portal={portalPreview}
              variant={portalPreview === 'pilgrim' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => navigate('/')}
            >
              {ui('switchToPilgrimPortal')}
            </Button>
            <Button
              portal={portalPreview}
              variant={portalPreview === 'command' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPortalPreview('command')}
            >
              {ui('switchToCommandCentre')}
            </Button>
            <AccessibilityBar portal={portalPreview} />
          </div>
        </div>

        {/* Live Revision & Cross-Tab Sync Telemetry */}
        <Card portal={portalPreview} elevated>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">{ui('heroHeadline')}</h2>
              <p
                data-testid="sync-status-line"
                className="text-xs font-mono opacity-80 mt-1"
              >
                Revision #{state.metadata.stateRevision} • Channel: {lastSyncChannel} •
                Last Action: {t(state.metadata.lastActionSummary)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                portal={portalPreview}
                variant={pushkarRoad.status === 'CLOSED' ? 'success' : 'danger'}
                size="sm"
                data-testid="toggle-road-btn"
                onClick={() =>
                  setRoadStatus(
                    'road-pushkar-approach',
                    pushkarRoad.status === 'CLOSED' ? 'CONGESTED' : 'CLOSED'
                  )
                }
              >
                {pushkarRoad.status === 'CLOSED'
                  ? 'Reopen Pushkar Approach Road'
                  : 'Close Pushkar Approach Road'}
              </Button>
              <Button
                portal={portalPreview}
                variant="secondary"
                size="sm"
                data-testid="toggle-parking-btn"
                onClick={() =>
                  updateParkingOccupancy(
                    'park-arts-college',
                    artsParking.occupancyPercent === 98 ? 88 : 98,
                    artsParking.occupancyPercent === 98 ? 'FILLING_FAST' : 'FULL'
                  )
                }
              >
                Toggle Arts College Lot ({artsParking.occupancyPercent}%)
              </Button>
              <Button
                portal={portalPreview}
                variant="outline"
                size="sm"
                data-testid="boost-shuttle-btn"
                onClick={() =>
                  updateShuttleService(
                    'shuttle-s1',
                    s1Shuttle.frequencyMinutes === 2 ? 4 : 2,
                    s1Shuttle.activeBusesCount === 36 ? 28 : 36
                  )
                }
              >
                Boost Shuttle S1 ({s1Shuttle.frequencyMinutes}m)
              </Button>
              <Button
                portal={portalPreview}
                variant="saffron"
                size="sm"
                data-testid="toggle-crowd-btn"
                onClick={() =>
                  updateGhatCrowdLevel(
                    'ghat-pushkar',
                    pushkarGhat.crowdLevel === 'CRITICAL' ? 'HIGH' : 'CRITICAL',
                    pushkarGhat.crowdLevel === 'CRITICAL' ? 42 : 65
                  )
                }
              >
                Toggle Pushkar Crowd ({pushkarGhat.crowdLevel})
              </Button>
            </div>
          </div>

          {/* Live State Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="p-3.5 rounded-xl border border-current/10">
              <div className="text-xs opacity-70 font-semibold">
                {t(pushkarRoad.name)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusIndicator
                  level={pushkarRoad.status}
                  portal={portalPreview}
                  size="sm"
                />
                <span
                  data-testid="road-status-value"
                  className="text-xs font-mono font-bold"
                >
                  {pushkarRoad.status}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-current/10">
              <div className="text-xs opacity-70 font-semibold">
                {t(artsParking.name)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusIndicator
                  level={artsParking.status}
                  portal={portalPreview}
                  size="sm"
                />
                <span
                  data-testid="parking-status-value"
                  className="text-xs font-mono font-bold"
                >
                  {artsParking.occupancyPercent}% ({artsParking.availableSpaces} free)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-current/10">
              <div className="text-xs opacity-70 font-semibold">
                {t(s1Shuttle.name)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusIndicator
                  level={s1Shuttle.status}
                  portal={portalPreview}
                  size="sm"
                />
                <span
                  data-testid="shuttle-status-value"
                  className="text-xs font-mono font-bold"
                >
                  Every {s1Shuttle.frequencyMinutes}m ({s1Shuttle.activeBusesCount} buses)
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-current/10">
              <div className="text-xs opacity-70 font-semibold">
                {t(pushkarGhat.name)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusIndicator
                  level={pushkarGhat.crowdLevel}
                  portal={portalPreview}
                  size="sm"
                />
                <span
                  data-testid="crowd-status-value"
                  className="text-xs font-mono font-bold"
                >
                  {pushkarGhat.crowdLevel} ({pushkarGhat.estimatedBathingWaitMinutes}m)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Trilingual AI Engine Verification Card */}
        <Card portal={portalPreview}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold">
                Trilingual Local Domain AI Concierge (EN / తెలుగు / हिन्दी)
              </h3>
              <p className="text-xs opacity-75">
                Grounded in live shared state (Revision #{state.metadata.stateRevision})
              </p>
            </div>
            <SimulationBadge source="LOCAL_DOMAIN_AI" portal={portalPreview} />
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              portal={portalPreview}
              variant="outline"
              size="sm"
              onClick={() =>
                handleRunAiCheck(
                  language === 'te'
                    ? 'రాజమహేంద్రవరంలో ఏవైనా రోడ్లు మూసివేయబడ్డాయా?'
                    : language === 'hi'
                    ? 'क्या राजमहेंद्रवरम में कोई सड़क या पुल बंद है?'
                    : 'Are any roads or bridges closed in Rajamahendravaram?'
                )
              }
            >
              Ask AI: Road Closures ({language.toUpperCase()})
            </Button>
            <Button
              portal={portalPreview}
              variant="outline"
              size="sm"
              onClick={() =>
                handleRunAiCheck(
                  language === 'te'
                    ? 'వృద్ధులు మరియు వీల్‌చైర్ ఉన్నవారికి ఏ ఘాట్ ఉత్తమం?'
                    : language === 'hi'
                    ? 'वरिष्ठ नागरिकों और व्हीलचेयर के लिए सबसे अच्छा घाट कौन सा है?'
                    : 'Best ghat and shuttle for senior citizens with wheelchair?'
                )
              }
            >
              Ask AI: Senior & Wheelchair Access ({language.toUpperCase()})
            </Button>
            <Button
              portal={portalPreview}
              variant="outline"
              size="sm"
              onClick={() =>
                handleRunAiCheck(
                  language === 'te'
                    ? 'NH-16 వైపు నుండి వస్తే ఎక్కడ పార్క్ చేయాలి?'
                    : language === 'hi'
                    ? 'NH-16 से आने पर कार कहाँ पार्क करें?'
                    : 'Where should I park if arriving from NH-16?'
                )
              }
            >
              Ask AI: Parking Advice ({language.toUpperCase()})
            </Button>
          </div>

          {aiResponse && (
            <div
              data-testid="ai-response-box"
              className="mt-4 p-4 rounded-xl border border-current/15 whitespace-pre-line text-sm"
            >
              <div className="text-xs font-mono opacity-70 mb-1.5">
                Intent: {aiResponse.intentDetected} • Lang: {aiResponse.language}
              </div>
              <div>{aiResponse.replyText}</div>
            </div>
          )}
        </Card>

        {/* Phase 2: Unified Interactive Mapping & Offline Riverfront Workspace */}
        <MobilityMapWorkspace
          portal={portalPreview}
          enableOperatorControls={true}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Pilgrim Portal Routes (Mobile-First Travel & Mobility Experience) */}
      <Route element={<PilgrimLayout />}>
        <Route index element={<PilgrimHomePage />} />
        <Route path="explore" element={<ExploreDestinationsPage />} />
        <Route path="journey-planner" element={<JourneyPlannerPage />} />
        <Route path="parking" element={<ParkingFinderPage />} />
        <Route path="shuttles" element={<ShuttleTrackerPage />} />
        <Route path="assistant" element={<AITravelAssistantPage />} />
        <Route path="safety" element={<SafetyAndAccessibilityPage />} />
      </Route>

      {/* Authority Command Centre Routes (Desktop-First Operations & Digital Twin Platform) */}
      <Route path="/command" element={<CommandLayout />}>
        <Route index element={<CommandOverviewPage />} />
        <Route path="map" element={<OperationalMapPage />} />
        <Route path="ai-decisions" element={<AIDecisionCentrePage />} />
        <Route path="incidents" element={<IncidentManagementPage />} />
        <Route path="teams" element={<PoliceTeamManagementPage />} />
        <Route path="digital-twin" element={<DigitalTwinSimulatorPage />} />
      </Route>

      {/* Phase 1 Cross-Tab Sync Harness */}
      <Route path="/sync-harness" element={<CommandSyncHarness />} />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
