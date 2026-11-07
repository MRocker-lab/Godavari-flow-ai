import { create } from 'zustand';
import {
  LocalMobilityRepository,
  shouldAcceptIncomingState,
} from '@/adapters/local/BroadcastSyncAdapter';
import { CanonicalMobilityState } from '@/data/baselineState';
import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
  LocalizedText,
  OperationalLevel,
  ParkingOperationalStatus,
  RoadOperationalStatus,
  ShuttleOperationalStatus,
  SimulationControls,
} from '@/types';
import { runDigitalTwinSimulation } from '@/services/digitalTwinSimulator';

const repository = new LocalMobilityRepository();

export interface CreateIncidentInput {
  title: LocalizedText;
  category: IncidentCategory;
  priority: IncidentPriority;
  locationName: LocalizedText;
  linkedGhatId?: string;
  linkedRoadId?: string;
  assignedTeamId: string | null;
  description: LocalizedText;
  actorName: string;
}

export interface MobilityStoreState {
  state: CanonicalMobilityState;
  lastSyncChannel: 'LOCAL' | 'BROADCAST_CHANNEL' | 'STORAGE_EVENT';
  lastSyncNotification: LocalizedText | null;
  isMemoryFallback: boolean;

  // Actions
  setRoadStatus: (
    roadId: string,
    status: RoadOperationalStatus,
    closureReason?: LocalizedText
  ) => void;
  updateParkingOccupancy: (
    parkingId: string,
    occupancyPercent: number,
    status?: ParkingOperationalStatus
  ) => void;
  updateShuttleService: (
    shuttleId: string,
    frequencyMinutes: number,
    activeBusesCount: number,
    status?: ShuttleOperationalStatus
  ) => void;
  updateGhatCrowdLevel: (
    ghatId: string,
    crowdLevel: OperationalLevel,
    estimatedWaitMinutes: number,
    occupancyCount?: number
  ) => void;
  approveAIRecommendation: (recommendationId: string, actorName?: string) => void;
  rejectAIRecommendation: (recommendationId: string, actorName?: string) => void;
  markAIRecommendationSimulated: (recommendationId: string) => void;
  createIncident: (input: CreateIncidentInput) => void;
  updateIncidentStatus: (
    incidentId: string,
    nextStatus: IncidentStatus,
    actorName: string,
    noteText: string,
    assignedTeamId?: string | null
  ) => void;
  assignPoliceTeam: (
    teamId: string,
    incidentId: string | null,
    assignmentSummary?: LocalizedText
  ) => void;
  applyDigitalTwinIntervention: (
    scenarioId: string,
    controls: SimulationControls
  ) => void;
  resetDemoDataToBaseline: () => void;
  dismissSyncNotification: () => void;
  receiveExternalState: (
    incoming: CanonicalMobilityState,
    source: 'BROADCAST_CHANNEL' | 'STORAGE_EVENT',
    forceBaseline?: boolean
  ) => void;
}

function buildNextMetadata(
  current: CanonicalMobilityState,
  actionSummary: LocalizedText,
  activeDigitalTwinScenarioId = current.metadata.activeDigitalTwinScenarioId
) {
  return {
    ...current.metadata,
    stateRevision: current.metadata.stateRevision + 1,
    lastUpdatedAt: new Date().toISOString(),
    lastUpdatedByTabId: repository.getTabId(),
    lastActionSummary: actionSummary,
    activeDigitalTwinScenarioId,
  };
}

export const useMobilityStore = create<MobilityStoreState>((set, get) => ({
  state: repository.loadState(),
  lastSyncChannel: 'LOCAL',
  lastSyncNotification: null,
  isMemoryFallback: repository.isMemoryFallbackActive(),

  setRoadStatus: (roadId, status, closureReason) => {
    const current = get().state;
    const targetRoad = current.roads.find((r) => r.id === roadId);
    if (!targetRoad) return;

    const updatedRoads = current.roads.map((road) => {
      if (road.id !== roadId) return road;
      const nextCongestion =
        status === 'CLOSED'
          ? 15
          : status === 'DIVERTED'
          ? Math.max(30, road.congestionIndex - 22)
          : status === 'CONGESTED'
          ? Math.max(78, road.congestionIndex)
          : 42;
      const nextLevel: OperationalLevel =
        status === 'CLOSED'
          ? 'LOW'
          : status === 'CONGESTED'
          ? 'HIGH'
          : 'MODERATE';

      return {
        ...road,
        status,
        congestionIndex: nextCongestion,
        trafficLevel: nextLevel,
        closureReason:
          status === 'CLOSED' || status === 'DIVERTED'
            ? closureReason || {
                en: `Authority Command Centre set corridor to ${status} for pilgrim traffic management.`,
                te: `కమాండ్ సెంటర్ ఆదేశాల మేరకు ఈ మార్గం ${status} గా మార్చబడింది.`,
                hi: `कमांड सेंटर के आदेश से यह मार्ग ${status} किया गया है।`,
              }
            : undefined,
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    // Update connected ghats' active advisory if road is closed
    const updatedGhats = current.ghats.map((ghat) => {
      if (!ghat.approachRoadIds.includes(roadId)) return ghat;
      if (status === 'CLOSED') {
        return {
          ...ghat,
          trafficCondition: 'MODERATE' as OperationalLevel,
          activeAdvisory: {
            en: `Approach road (${targetRoad.name.en}) is closed to private vehicles. Please use satellite parking and APSRTC Express Shuttles.`,
            te: `అప్రోచ్ రోడ్ (${targetRoad.name.te}) ప్రైవేట్ వాహనాలకు మూసివేయబడింది. దయచేసి శాటిలైట్ పార్కింగ్ మరియు షటిల్ బస్సులను ఉపయోగించండి.`,
            hi: `एप्रोच रोड (${targetRoad.name.hi}) निजी वाहनों के लिए बंद है। कृपया सैटेलाइट पार्किंग और शटल बसों का उपयोग करें।`,
          },
          provenance: {
            source: 'AUTHORITY_OVERRIDE' as const,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return ghat;
    });

    const summary: LocalizedText = {
      en: `Road status updated: ${targetRoad.name.en} → ${status}`,
      te: `రోడ్డు స్థితి అప్‌డేట్: ${targetRoad.name.te} → ${status}`,
      hi: `सड़क स्थिति अपडेट: ${targetRoad.name.hi} → ${status}`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      roads: updatedRoads,
      ghats: updatedGhats,
    };

    repository.saveAndBroadcastState(nextState);
    set({
      state: nextState,
      lastSyncChannel: 'LOCAL',
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  updateParkingOccupancy: (parkingId, occupancyPercent, explicitStatus) => {
    const current = get().state;
    const clampedPct = Math.max(0, Math.min(100, Math.round(occupancyPercent)));
    const targetHub = current.parkingHubs.find((p) => p.id === parkingId);
    if (!targetHub) return;

    const computedStatus: ParkingOperationalStatus =
      explicitStatus ||
      (clampedPct >= 96
        ? 'FULL'
        : clampedPct >= 80
        ? 'FILLING_FAST'
        : 'AVAILABLE');

    const updatedParkingHubs = current.parkingHubs.map((hub) => {
      if (hub.id !== parkingId) return hub;
      const availableSpaces = Math.max(
        0,
        Math.round(hub.totalCapacity * ((100 - clampedPct) / 100))
      );
      return {
        ...hub,
        occupancyPercent: clampedPct,
        availableSpaces,
        status: computedStatus,
        isRecommended: computedStatus === 'AVAILABLE',
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const summary: LocalizedText = {
      en: `Parking updated: ${targetHub.name.en} at ${clampedPct}% (${computedStatus})`,
      te: `పార్కింగ్ అప్‌డేట్: ${targetHub.name.te} ${clampedPct}% (${computedStatus})`,
      hi: `पार्किंग अपडेट: ${targetHub.name.hi} ${clampedPct}% (${computedStatus})`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      parkingHubs: updatedParkingHubs,
    };

    repository.saveAndBroadcastState(nextState);
    set({
      state: nextState,
      lastSyncChannel: 'LOCAL',
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  updateShuttleService: (shuttleId, frequencyMinutes, activeBusesCount, explicitStatus) => {
    const current = get().state;
    const targetShuttle = current.shuttles.find((s) => s.id === shuttleId);
    if (!targetShuttle) return;

    const updatedShuttles = current.shuttles.map((shuttle) => {
      if (shuttle.id !== shuttleId) return shuttle;
      const safeFreq = Math.max(2, frequencyMinutes);
      const safeBuses = Math.max(4, activeBusesCount);
      const totalFleetSeatCapacity = safeBuses * 50;
      const newOccupancyPct = Math.max(
        30,
        Math.min(
          92,
          Math.round(
            shuttle.occupancyPercent * (shuttle.activeBusesCount / safeBuses)
          )
        )
      );
      const availableCapacitySeats = Math.max(
        25,
        Math.round(totalFleetSeatCapacity * ((100 - newOccupancyPct) / 100))
      );

      return {
        ...shuttle,
        frequencyMinutes: safeFreq,
        estimatedArrivalMinutes: Math.max(1, safeFreq - 1),
        activeBusesCount: safeBuses,
        occupancyPercent: newOccupancyPct,
        availableCapacitySeats,
        totalFleetSeatCapacity,
        status:
          explicitStatus ||
          (safeFreq <= 4 ? 'FREQUENT' : newOccupancyPct > 80 ? 'HIGH_DEMAND' : 'MODERATE_WAIT'),
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const summary: LocalizedText = {
      en: `Shuttle fleet updated: ${targetShuttle.routeCode} (${activeBusesCount} buses, every ${frequencyMinutes}m)`,
      te: `షటిల్ సర్వీస్ అప్‌డేట్: ${targetShuttle.routeCode} (${activeBusesCount} బస్సులు, ప్రతి ${frequencyMinutes} ని.కు)`,
      hi: `शटल सेवा अपडेट: ${targetShuttle.routeCode} (${activeBusesCount} बसें, हर ${frequencyMinutes} मिनट में)`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      shuttles: updatedShuttles,
    };

    repository.saveAndBroadcastState(nextState);
    set({
      state: nextState,
      lastSyncChannel: 'LOCAL',
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  updateGhatCrowdLevel: (ghatId, crowdLevel, estimatedWaitMinutes, occupancyCount) => {
    const current = get().state;
    const targetGhat = current.ghats.find((g) => g.id === ghatId);
    if (!targetGhat) return;

    const updatedGhats = current.ghats.map((ghat) => {
      if (ghat.id !== ghatId) return ghat;
      const computedCount =
        occupancyCount !== undefined
          ? occupancyCount
          : crowdLevel === 'CRITICAL'
          ? Math.round(ghat.maxCapacityCount * 0.92)
          : crowdLevel === 'HIGH'
          ? Math.round(ghat.maxCapacityCount * 0.8)
          : crowdLevel === 'MODERATE'
          ? Math.round(ghat.maxCapacityCount * 0.55)
          : Math.round(ghat.maxCapacityCount * 0.35);

      return {
        ...ghat,
        crowdLevel,
        estimatedBathingWaitMinutes: Math.max(5, estimatedWaitMinutes),
        currentOccupancyCount: computedCount,
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const summary: LocalizedText = {
      en: `Ghat crowd updated: ${targetGhat.name.en} → ${crowdLevel} (${estimatedWaitMinutes}m wait)`,
      te: `ఘాట్ రద్దీ అప్‌డేట్: ${targetGhat.name.te} → ${crowdLevel} (${estimatedWaitMinutes} ని. నిరీక్షణ)`,
      hi: `घाट भीड़ अपडेट: ${targetGhat.name.hi} → ${crowdLevel} (${estimatedWaitMinutes} मिनट प्रतीक्षा)`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      ghats: updatedGhats,
    };

    repository.saveAndBroadcastState(nextState);
    set({
      state: nextState,
      lastSyncChannel: 'LOCAL',
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  approveAIRecommendation: (recommendationId, actorName = 'Authority Commander') => {
    const current = get().state;
    const rec = current.aiRecommendations.find((r) => r.id === recommendationId);
    if (!rec) return;

    const effect = rec.operationalEffect;
    let nextRoads = [...current.roads];
    let nextParking = [...current.parkingHubs];
    let nextShuttles = [...current.shuttles];
    let nextGhats = [...current.ghats];

    if (effect.type === 'CLOSE_ROAD_AND_DIVERT' && effect.targetRoadId) {
      nextRoads = nextRoads.map((r) =>
        r.id === effect.targetRoadId
          ? {
              ...r,
              status: effect.newRoadStatus || 'CLOSED',
              congestionIndex: Math.max(25, r.congestionIndex - 32),
              trafficLevel: 'LOW',
              closureReason: rec.recommendedAction,
              provenance: {
                source: 'AUTHORITY_OVERRIDE',
                updatedAt: new Date().toISOString(),
                updatedByRole: actorName,
              },
            }
          : r
      );

      if (effect.targetGhatId) {
        nextGhats = nextGhats.map((g) =>
          g.id === effect.targetGhatId
            ? {
                ...g,
                crowdLevel: 'MODERATE',
                estimatedBathingWaitMinutes: Math.max(
                  15,
                  g.estimatedBathingWaitMinutes - 16
                ),
                currentOccupancyCount: Math.round(g.currentOccupancyCount * 0.82),
                activeAdvisory: rec.recommendedAction,
                provenance: {
                  source: 'AUTHORITY_OVERRIDE',
                  updatedAt: new Date().toISOString(),
                  updatedByRole: actorName,
                },
              }
            : g
        );
      }
    }

    if (effect.type === 'REDIRECT_PARKING_OVERFLOW' && effect.targetParkingId) {
      nextParking = nextParking.map((p) =>
        p.id === effect.targetParkingId
          ? {
              ...p,
              status: 'RESERVED_ACCESSIBILITY',
              isRecommended: false,
              recommendationReason: {
                en: 'Reserved for Senior Citizen & Accessibility vehicles by Command Centre order. General vehicles redirected to Morampudi Mega Hub.',
                te: 'కమాండ్ సెంటర్ ఆదేశాల ప్రకారం వృద్ధులు & దివ్యాంగుల వాహనాలకే పరిమితం. సాధారణ వాహనాలు మోరంపూడి హబ్‌కు మళ్లించబడ్డాయి.',
                hi: 'कमांड सेंटर के आदेश से केवल वरिष्ठ एवं दिव्यांग वाहनों के लिए आरक्षित। सामान्य वाहन मोरमपुडी हब की ओर निर्देशित।',
              },
              provenance: {
                source: 'AUTHORITY_OVERRIDE',
                updatedAt: new Date().toISOString(),
                updatedByRole: actorName,
              },
            }
          : p
      );
    }

    if (
      (effect.type === 'BOOST_SHUTTLE_FREQUENCY' ||
        effect.type === 'REDIRECT_PARKING_OVERFLOW') &&
      effect.targetShuttleId
    ) {
      nextShuttles = nextShuttles.map((s) => {
        if (s.id !== effect.targetShuttleId) return s;
        const nextFreq = Math.max(
          2,
          s.frequencyMinutes + (effect.shuttleFrequencyDeltaMinutes || -2)
        );
        const nextBuses = s.activeBusesCount + 6;
        return {
          ...s,
          frequencyMinutes: nextFreq,
          estimatedArrivalMinutes: Math.max(1, nextFreq - 1),
          activeBusesCount: nextBuses,
          occupancyPercent: Math.max(42, s.occupancyPercent - 20),
          availableCapacitySeats: s.availableCapacitySeats + 240,
          status: 'FREQUENT',
          provenance: {
            source: 'AUTHORITY_OVERRIDE',
            updatedAt: new Date().toISOString(),
            updatedByRole: actorName,
          },
        };
      });
    }

    const updatedRecs = current.aiRecommendations.map((item) =>
      item.id === recommendationId
        ? {
            ...item,
            decisionStatus: 'APPROVED_APPLIED' as const,
            provenance: {
              source: 'AUTHORITY_OVERRIDE' as const,
              updatedAt: new Date().toISOString(),
              updatedByRole: actorName,
            },
          }
        : item
    );

    const summary: LocalizedText = {
      en: `Approved AI Action ${rec.code}: ${rec.affectedLocationName.en}`,
      te: `AI సిఫార్సు ${rec.code} ఆమోదించబడింది: ${rec.affectedLocationName.te}`,
      hi: `AI सिफारिश ${rec.code} स्वीकृत: ${rec.affectedLocationName.hi}`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      roads: nextRoads,
      parkingHubs: nextParking,
      shuttles: nextShuttles,
      ghats: nextGhats,
      aiRecommendations: updatedRecs,
    };

    repository.saveAndBroadcastState(nextState);
    set({
      state: nextState,
      lastSyncChannel: 'LOCAL',
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  rejectAIRecommendation: (recommendationId, actorName = 'Authority Commander') => {
    const current = get().state;
    const rec = current.aiRecommendations.find((r) => r.id === recommendationId);
    if (!rec) return;

    const updatedRecs = current.aiRecommendations.map((item) =>
      item.id === recommendationId
        ? {
            ...item,
            decisionStatus: 'REJECTED' as const,
            provenance: {
              source: 'AUTHORITY_OVERRIDE' as const,
              updatedAt: new Date().toISOString(),
              updatedByRole: actorName,
            },
          }
        : item
    );

    const summary: LocalizedText = {
      en: `Dismissed AI Recommendation ${rec.code}`,
      te: `AI సిఫార్సు ${rec.code} తిరస్కరించబడింది`,
      hi: `AI सिफारिश ${rec.code} अस्वीकृत`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      aiRecommendations: updatedRecs,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  markAIRecommendationSimulated: (recommendationId) => {
    const current = get().state;
    const rec = current.aiRecommendations.find((r) => r.id === recommendationId);
    if (!rec) return;

    const updatedRecs = current.aiRecommendations.map((item) =>
      item.id === recommendationId && item.decisionStatus === 'PENDING_REVIEW'
        ? { ...item, decisionStatus: 'SIMULATED_IN_TWIN' as const }
        : item
    );

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(
        current,
        {
          en: `Loaded ${rec.code} into Digital Twin Simulator`,
          te: `${rec.code} డిజిటల్ ట్విన్ సిమ్యులేటర్‌లో లోడ్ చేయబడింది`,
          hi: `${rec.code} डिजिटल ट्विन सिम्युलेटर में लोड किया गया`,
        },
        rec.linkedDigitalTwinScenarioId
      ),
      aiRecommendations: updatedRecs,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  createIncident: (input) => {
    const current = get().state;
    const linkedGhat = current.ghats.find((g) => g.id === input.linkedGhatId);
    const linkedRoad = current.roads.find((r) => r.id === input.linkedRoadId);

    const coordinates =
      linkedGhat?.coordinates ||
      linkedRoad?.polyline[0] || { lat: 17.0002, lng: 81.7712, svgX: 510, svgY: 335 };

    const newId = `inc-${Date.now().toString().slice(-4)}`;
    const newCode = `INC-2026-${100 + current.incidents.length + 1}`;
    const initialStatus: IncidentStatus = input.assignedTeamId ? 'ASSIGNED' : 'NEW';
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newIncident = {
      id: newId,
      code: newCode,
      title: input.title,
      category: input.category,
      priority: input.priority,
      status: initialStatus,
      locationName: input.locationName,
      linkedGhatId: input.linkedGhatId,
      linkedRoadId: input.linkedRoadId,
      coordinates,
      assignedTeamId: input.assignedTeamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: input.description,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          timestamp: nowTime,
          status: initialStatus,
          actor: input.actorName,
          note: {
            en: `Incident logged (${input.priority} priority)${
              input.assignedTeamId ? ' and response unit assigned.' : '.'
            }`,
            te: `సంఘటన నమోదు చేయబడింది (${input.priority} ప్రాధాన్యత).`,
            hi: `घटना दर्ज की गई (${input.priority} प्राथमिकता)।`,
          },
        },
      ],
      provenance: {
        source: 'AUTHORITY_OVERRIDE' as const,
        updatedAt: new Date().toISOString(),
        updatedByRole: input.actorName,
      },
    };

    // If linked to a ghat and priority is CRITICAL/HIGH, post advisory on that ghat for Pilgrim Portal
    const updatedGhats = current.ghats.map((g) => {
      if (g.id !== input.linkedGhatId) return g;
      return {
        ...g,
        crowdLevel:
          input.priority === 'CRITICAL' ? ('CRITICAL' as OperationalLevel) : g.crowdLevel,
        activeAdvisory: {
          en: `Active Alert (${newCode}): ${input.title.en}. Response unit deployed.`,
          te: `ముఖ్య హెచ్చరిక (${newCode}): ${input.title.te}. సహాయ బృందం నియమించబడింది.`,
          hi: `सक्रिय अलर्ट (${newCode}): ${input.title.hi}। प्रतिक्रिया टीम तैनात।`,
        },
      };
    });

    const updatedTeams = current.policeTeams.map((team) =>
      team.id === input.assignedTeamId
        ? {
            ...team,
            status: 'EN_ROUTE' as const,
            associatedIncidentId: newId,
            assignedLocationName: input.locationName,
          }
        : team
    );

    const summary: LocalizedText = {
      en: `Incident created: ${newCode} — ${input.title.en}`,
      te: `కొత్త సంఘటన నమోదు: ${newCode} — ${input.title.te}`,
      hi: `नई घटना दर्ज: ${newCode} — ${input.title.hi}`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      incidents: [newIncident, ...current.incidents],
      ghats: updatedGhats,
      policeTeams: updatedTeams,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  updateIncidentStatus: (
    incidentId,
    nextStatus,
    actorName,
    noteText,
    assignedTeamId
  ) => {
    const current = get().state;
    const targetIncident = current.incidents.find((i) => i.id === incidentId);
    if (!targetIncident) return;

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const effectiveTeamId =
      assignedTeamId !== undefined ? assignedTeamId : targetIncident.assignedTeamId;

    const updatedIncidents = current.incidents.map((inc) => {
      if (inc.id !== incidentId) return inc;
      const entry = {
        id: `tl-${Date.now()}`,
        timestamp: nowTime,
        status: nextStatus,
        actor: actorName,
        note: {
          en: noteText || `Status transitioned to ${nextStatus}`,
          te: noteText || `స్థితి ${nextStatus} కు మార్చబడింది`,
          hi: noteText || `स्थिति बदलकर ${nextStatus} की गई`,
        },
      };
      return {
        ...inc,
        status: nextStatus,
        assignedTeamId: effectiveTeamId,
        updatedAt: new Date().toISOString(),
        resolutionSummary:
          nextStatus === 'RESOLVED' || nextStatus === 'CLOSED'
            ? {
                en: noteText || 'Incident resolved and verified by field team.',
                te: noteText || 'సమస్య పరిష్కరించబడింది మరియు ధృవీకరించబడింది.',
                hi: noteText || 'घटना का समाधान और सत्यापन किया गया।',
              }
            : inc.resolutionSummary,
        timeline: [...inc.timeline, entry],
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
          updatedByRole: actorName,
        },
      };
    });

    const updatedTeams = current.policeTeams.map((team) => {
      if (team.id === effectiveTeamId) {
        return {
          ...team,
          associatedIncidentId:
            nextStatus === 'RESOLVED' || nextStatus === 'CLOSED' ? null : incidentId,
          status:
            nextStatus === 'RESOLVED' || nextStatus === 'CLOSED'
              ? ('STANDBY_READY' as const)
              : nextStatus === 'RESPONDING'
              ? ('DEPLOYED_ACTIVE' as const)
              : ('EN_ROUTE' as const),
        };
      }
      return team;
    });

    const summary: LocalizedText = {
      en: `Incident ${targetIncident.code} updated to ${nextStatus}`,
      te: `సంఘటన ${targetIncident.code} స్థితి ${nextStatus} కు మార్చబడింది`,
      hi: `घटना ${targetIncident.code} की स्थिति ${nextStatus} की गई`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      incidents: updatedIncidents,
      policeTeams: updatedTeams,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  assignPoliceTeam: (teamId, incidentId, assignmentSummary) => {
    const current = get().state;
    const team = current.policeTeams.find((t) => t.id === teamId);
    if (!team) return;

    const targetIncident = current.incidents.find((i) => i.id === incidentId);

    const updatedTeams = current.policeTeams.map((t) => {
      if (t.id !== teamId) return t;
      return {
        ...t,
        associatedIncidentId: incidentId,
        status: incidentId ? ('DEPLOYED_ACTIVE' as const) : ('STANDBY_READY' as const),
        assignedLocationName: targetIncident
          ? targetIncident.locationName
          : t.assignedLocationName,
        currentAssignment:
          assignmentSummary ||
          (targetIncident
            ? {
                en: `Dispatched to ${targetIncident.code}: ${targetIncident.title.en}`,
                te: `${targetIncident.code} కు నియమించబడింది: ${targetIncident.title.te}`,
                hi: `${targetIncident.code} पर तैनात: ${targetIncident.title.hi}`,
              }
            : t.currentAssignment),
        provenance: {
          source: 'AUTHORITY_OVERRIDE' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const updatedIncidents = current.incidents.map((inc) =>
      inc.id === incidentId
        ? {
            ...inc,
            assignedTeamId: teamId,
            status: inc.status === 'NEW' ? ('ASSIGNED' as const) : inc.status,
          }
        : inc
    );

    const summary: LocalizedText = {
      en: `Team ${team.teamIdentifier} assignment updated`,
      te: `${team.teamIdentifier} బృందం అసైన్‌మెంట్ అప్‌డేట్ చేయబడింది`,
      hi: `टीम ${team.teamIdentifier} का कार्यभार अपडेट किया गया`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary),
      policeTeams: updatedTeams,
      incidents: updatedIncidents,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  applyDigitalTwinIntervention: (scenarioId, controls) => {
    const current = get().state;
    const simResult = runDigitalTwinSimulation(scenarioId, controls, current);

    const updatedRoads = current.roads.map((road) => {
      if (road.id === 'road-pushkar-approach' && controls.closePushkarApproachRoad) {
        return {
          ...road,
          status: 'CLOSED' as const,
          congestionIndex: 28,
          trafficLevel: 'LOW' as const,
          closureReason: {
            en: 'Closed to private vehicles via Digital Twin Intervention; Shuttle & Pedestrian corridor active.',
            te: 'డిజిటల్ ట్విన్ సూచన మేరకు ప్రైవేట్ వాహనాలకు మూసివేత; షటిల్ & పాదచారుల మార్గం అమలులో ఉంది.',
            hi: 'डिजिटल ट्विन हस्तक्षेप के तहत निजी वाहनों के लिए बंद; शटल और पैदल कॉरिडोर सक्रिय।',
          },
          provenance: {
            source: 'DIGITAL_TWIN_PROJECTION' as const,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      if (
        road.id === 'road-rail-cum-road-bridge' &&
        controls.closeOldBridgeToPrivateVehicles
      ) {
        return {
          ...road,
          status: 'DIVERTED' as const,
          congestionIndex: 35,
          trafficLevel: 'LOW' as const,
          provenance: {
            source: 'DIGITAL_TWIN_PROJECTION' as const,
            updatedAt: new Date().toISOString(),
          },
        };
      }
      return {
        ...road,
        congestionIndex: simResult.overallCongestionIndexSimulated,
        provenance: {
          source: 'DIGITAL_TWIN_PROJECTION' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const updatedGhats = current.ghats.map((ghat) => {
      const delta = simResult.ghatComparisons.find((d) => d.ghatId === ghat.id);
      if (!delta) return ghat;
      return {
        ...ghat,
        crowdLevel: delta.simulatedLevel,
        estimatedBathingWaitMinutes: delta.simulatedWaitMinutes,
        currentOccupancyCount: Math.round(
          (delta.simulatedCrowdPercent / 100) * ghat.maxCapacityCount
        ),
        provenance: {
          source: 'DIGITAL_TWIN_PROJECTION' as const,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    const summary: LocalizedText = {
      en: `Applied Digital Twin Intervention (${scenarioId}) to active demo state`,
      te: `డిజిటల్ ట్విన్ మార్పులు (${scenarioId}) డెమో స్టేట్‌కు వర్తింపజేయబడ్డాయి`,
      hi: `डिजिटल ट्विन हस्तक्षेप (${scenarioId}) सक्रिय डेमो स्टेट पर लागू किया गया`,
    };

    const nextState: CanonicalMobilityState = {
      ...current,
      metadata: buildNextMetadata(current, summary, scenarioId),
      roads: updatedRoads,
      ghats: updatedGhats,
    };

    repository.saveAndBroadcastState(nextState);
    set({ state: nextState, lastSyncChannel: 'LOCAL' });
  },

  resetDemoDataToBaseline: () => {
    const freshBaseline = repository.resetToBaseline();
    set({
      state: freshBaseline,
      lastSyncChannel: 'LOCAL',
      lastSyncNotification: {
        en: 'Demo data restored to canonical Rajamahendravaram–Kovvur baseline.',
        te: 'డెమో డేటా రాజమహేంద్రవరం–కొవ్వూరు ప్రాథమిక స్థితికి పునరుద్ధరించబడింది.',
        hi: 'डेमो डेटा को राजमहेंद्रवरम-कोव्वुर बेसलाइन स्थिति में रीसेट किया गया।',
      },
      isMemoryFallback: repository.isMemoryFallbackActive(),
    });
  },

  dismissSyncNotification: () => set({ lastSyncNotification: null }),

  receiveExternalState: (incoming, source, forceBaseline = false) => {
    const current = get().state;
    const isBaselineReset =
      forceBaseline ||
      (incoming.metadata.stateRevision === 1 &&
        incoming.metadata.lastActionSummary.en.includes('baseline'));

    if (shouldAcceptIncomingState(current, incoming, isBaselineReset)) {
      set({
        state: incoming,
        lastSyncChannel: source,
        lastSyncNotification: incoming.metadata.lastActionSummary,
      });
    }
  },
}));

// Register cross-tab synchronization listener immediately
repository.subscribeToExternalUpdates((incomingState, sourceChannel) => {
  useMobilityStore.getState().receiveExternalState(incomingState, sourceChannel);
});

