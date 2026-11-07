import { describe, it, expect, beforeEach } from 'vitest';
import { createBaselineMobilityState } from '@/data/baselineState';
import {
  LocalMobilityRepository,
  shouldAcceptIncomingState,
} from '@/adapters/local/BroadcastSyncAdapter';
import { LocalStorageAdapter, STORAGE_KEY } from '@/adapters/local/LocalStorageAdapter';
import { defaultAIService } from '@/adapters/ai/LocalDomainAIEngine';
import { computeJourneyOptions } from '@/services/journeyPlannerEngine';
import { runDigitalTwinSimulation } from '@/services/digitalTwinSimulator';
import { useMobilityStore } from '@/store/useMobilityStore';

describe('Phase 1 Verification Suite: Foundation, Persistence, Multi-Window Sync & Trilingual AI', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
  });

  it('1. Canonical Dataset Integrity: loads all Rajamahendravaram–Kovvur entities', () => {
    const state = useMobilityStore.getState().state;
    expect(state.ghats).toHaveLength(8);
    expect(state.origins).toHaveLength(7);
    expect(state.parkingHubs).toHaveLength(8);
    expect(state.shuttles).toHaveLength(6);
    expect(state.roads).toHaveLength(10);
    expect(state.incidents.length).toBeGreaterThanOrEqual(3);
    expect(state.policeTeams).toHaveLength(6);
    expect(state.aiRecommendations).toHaveLength(3);
    expect(state.digitalTwinScenarios).toHaveLength(4);
  });

  it('2. localStorage Persistence: persists state mutations to localStorage and restores on reload', () => {
    const store = useMobilityStore.getState();
    store.setRoadStatus('road-pushkar-approach', 'CLOSED');
    store.updateParkingOccupancy('park-arts-college', 97, 'FULL');

    const rawSaved = window.localStorage.getItem(STORAGE_KEY);
    expect(rawSaved).toBeTruthy();

    // Simulate a fresh browser reload reading from localStorage via a new adapter instance
    const freshStorage = new LocalStorageAdapter();
    const reloadedState = freshStorage.load('reloaded-tab');
    expect(reloadedState.metadata.stateRevision).toBe(3);
    expect(
      reloadedState.roads.find((r) => r.id === 'road-pushkar-approach')?.status
    ).toBe('CLOSED');
    expect(
      reloadedState.parkingHubs.find((p) => p.id === 'park-arts-college')?.status
    ).toBe('FULL');
  });

  it('3. Two-Window Cross-Tab Sync (BroadcastChannel + Storage Event): syncs Authority actions to Pilgrim window', () => {
    const commandWindowRepo = new LocalMobilityRepository('window-command-centre');
    const pilgrimWindowRepo = new LocalMobilityRepository('window-pilgrim-portal');

    let pilgrimWindowReceivedState = pilgrimWindowRepo.loadState();
    const unsubscribe = pilgrimWindowRepo.subscribeToExternalUpdates((incomingState) => {
      if (shouldAcceptIncomingState(pilgrimWindowReceivedState, incomingState)) {
        pilgrimWindowReceivedState = incomingState;
      }
    });

    // Authority Window closes Pushkar Approach Road and updates parking
    const mutated = commandWindowRepo.loadState();
    mutated.metadata.stateRevision += 1;
    mutated.metadata.lastUpdatedByTabId = 'window-command-centre';
    mutated.metadata.lastUpdatedAt = new Date(Date.now() + 1000).toISOString();
    mutated.roads = mutated.roads.map((r) =>
      r.id === 'road-pushkar-approach' ? { ...r, status: 'CLOSED' } : r
    );

    commandWindowRepo.saveAndBroadcastState(mutated);

    // Also dispatch storage event to verify storage-event fallback path in JSDOM
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(mutated),
      })
    );

    expect(pilgrimWindowReceivedState.metadata.stateRevision).toBe(
      mutated.metadata.stateRevision
    );
    expect(
      pilgrimWindowReceivedState.roads.find((r) => r.id === 'road-pushkar-approach')
        ?.status
    ).toBe('CLOSED');

    unsubscribe();
  });

  it('4. Revision Conflict Handling: rejects stale state and accepts newer revisions or baseline resets', () => {
    const current = createBaselineMobilityState('tab-1');
    current.metadata.stateRevision = 4;

    const stale = createBaselineMobilityState('tab-2');
    stale.metadata.stateRevision = 2;

    const newer = createBaselineMobilityState('tab-2');
    newer.metadata.stateRevision = 5;

    expect(shouldAcceptIncomingState(current, stale)).toBe(false);
    expect(shouldAcceptIncomingState(current, newer)).toBe(true);
    expect(shouldAcceptIncomingState(current, stale, true)).toBe(true);
  });

  it('5. Operational Store Workflows: AI approval, Incident lifecycle, Shuttle boost, and Baseline Reset', () => {
    // Approve AI recommendation AI-DEC-01 (closes Pushkar Approach Road & relieves Pushkar Ghat crowd)
    useMobilityStore.getState().approveAIRecommendation('ai-rec-01', 'DSP Satyanarayana');
    let state = useMobilityStore.getState().state;
    expect(
      state.aiRecommendations.find((r) => r.id === 'ai-rec-01')?.decisionStatus
    ).toBe('APPROVED_APPLIED');
    expect(
      state.roads.find((r) => r.id === 'road-pushkar-approach')?.status
    ).toBe('CLOSED');

    // Create a new incident and progress its status
    useMobilityStore.getState().createIncident({
      title: {
        en: 'Medical Assist at Gautami Ghat',
        te: 'గౌతమి ఘాట్ వద్ద వైద్య సహాయం',
        hi: 'गौतमी घाट पर चिकित्सा सहायता',
      },
      category: 'MEDICAL_ASSISTANCE',
      priority: 'HIGH',
      locationName: {
        en: 'Gautami Ghat Sector 2',
        te: 'గౌతమి ఘాట్ సెక్టార్ 2',
        hi: 'गौतमी घाट सेक्टर 2',
      },
      linkedGhatId: 'ghat-gautami',
      assignedTeamId: 'team-med-03',
      description: {
        en: 'Pilgrim hydration support requested.',
        te: 'భక్తులకు త్రాగునీటి సహాయం.',
        hi: 'तीर्थयात्री जलयोजन सहायता।',
      },
      actorName: 'Emergency Coordinator',
    });

    state = useMobilityStore.getState().state;
    const createdInc = state.incidents[0];
    expect(createdInc.status).toBe('ASSIGNED');

    useMobilityStore
      .getState()
      .updateIncidentStatus(
        createdInc.id,
        'RESOLVED',
        'Dr. Lakshmi Devi',
        'Assisted and resolved on site.'
      );
    state = useMobilityStore.getState().state;
    expect(state.incidents[0].status).toBe('RESOLVED');

    // Reset baseline restores everything
    useMobilityStore.getState().resetDemoDataToBaseline();
    state = useMobilityStore.getState().state;
    expect(state.metadata.stateRevision).toBe(1);
    expect(
      state.roads.find((r) => r.id === 'road-pushkar-approach')?.status
    ).toBe('CONGESTED');
  });

  it('6. Dynamic Journey Planner: recalculates routes when Command Centre closes a road', () => {
    const baseState = useMobilityStore.getState().state;
    const initialRoutes = computeJourneyOptions(
      {
        originId: 'NH16_MORAMPUDI_ENTRY',
        destinationGhatId: 'ghat-pushkar',
        travelMode: 'CAR_PLUS_SHUTTLE',
        preferences: {
          groupSize: 'FAMILY_GROUP',
          withSeniorCitizens: false,
          wheelchairRequired: false,
          withYoungChildren: true,
          preferMinimalWalking: false,
          avoidHighCrowds: false,
        },
      },
      baseState
    );
    expect(initialRoutes[0].avoidedClosedRoadIds).toHaveLength(0);

    // Authority closes Pushkar Approach Road
    useMobilityStore.getState().setRoadStatus('road-pushkar-approach', 'CLOSED');
    const updatedState = useMobilityStore.getState().state;
    const recalculatedRoutes = computeJourneyOptions(
      {
        originId: 'NH16_MORAMPUDI_ENTRY',
        destinationGhatId: 'ghat-pushkar',
        travelMode: 'CAR_PLUS_SHUTTLE',
        preferences: {
          groupSize: 'FAMILY_GROUP',
          withSeniorCitizens: false,
          wheelchairRequired: false,
          withYoungChildren: true,
          preferMinimalWalking: false,
          avoidHighCrowds: false,
        },
      },
      updatedState
    );

    expect(recalculatedRoutes[0].avoidedClosedRoadIds).toContain(
      'road-pushkar-approach'
    );
    expect(recalculatedRoutes[0].recommendationReason.en).toContain(
      'closed to private vehicles'
    );
  });

  it('7. Trilingual Local Domain AI Engine: generates live-state-grounded responses in English, Telugu, and Hindi', async () => {
    // Mutate state so we prove AI responses are dynamically generated from live state, not static strings
    useMobilityStore.getState().setRoadStatus('road-pushkar-approach', 'CLOSED');
    useMobilityStore.getState().updateGhatCrowdLevel('ghat-saraswati', 'LOW', 7, 3200);
    const liveState = useMobilityStore.getState().state;

    // English query on road closures
    const enTraffic = await defaultAIService.generateConciergeReply(
      'Are any roads or bridges closed in Rajamahendravaram?',
      'en',
      liveState,
      false
    );
    expect(enTraffic.language).toBe('en');
    expect(enTraffic.intentDetected).toBe('ROAD_CLOSURE_AND_TRAFFIC');
    expect(enTraffic.replyText).toContain('Pushkar Ghat Approach');
    expect(enTraffic.replyText).toContain('CLOSED');
    expect(enTraffic.mapLinks.length).toBeGreaterThan(0);

    // Telugu query on senior citizen & wheelchair accessibility (verifies updated 7-minute wait time at Saraswati Ghat!)
    const teSenior = await defaultAIService.generateConciergeReply(
      'వృద్ధులు మరియు వీల్‌చైర్ ఉన్నవారికి ఏ ఘాట్ ఉత్తమం?',
      'te',
      liveState,
      true
    );
    expect(teSenior.language).toBe('te');
    expect(teSenior.intentDetected).toBe('SENIOR_AND_ACCESSIBILITY');
    expect(teSenior.replyText).toContain('సరస్వతి ఘాట్');
    expect(teSenior.replyText).toContain('7 నిమిషాలు');

    // Hindi query on parking availability
    const hiParking = await defaultAIService.generateConciergeReply(
      'NH-16 से आने पर कार कहाँ पार्क करें?',
      'hi',
      liveState,
      false
    );
    expect(hiParking.language).toBe('hi');
    expect(hiParking.intentDetected).toBe('PARKING_RECOMMENDATION');
    expect(hiParking.replyText).toContain('पार्किंग');
    expect(hiParking.replyText).toContain('2,480'); // Kovvur or Lalacheruvu/Dowleswaram dynamic space count

    // Trilingual situation summary for Command Overview
    const summaryEn = defaultAIService.generateSituationSummary(liveState, 'en');
    const summaryTe = defaultAIService.generateSituationSummary(liveState, 'te');
    const summaryHi = defaultAIService.generateSituationSummary(liveState, 'hi');
    expect(summaryEn).toContain('1 road segment(s) currently closed');
    expect(summaryTe).toContain('1 రోడ్లు మూసివేయబడ్డాయి');
    expect(summaryHi).toContain('1 सड़कें बंद हैं');
  });

  it('8. Digital Twin Simulator: computes before/after intervention metrics and hourly series', () => {
    const state = useMobilityStore.getState().state;
    const scenario = state.digitalTwinScenarios[0];
    const sim = runDigitalTwinSimulation(scenario.id, scenario.defaultControls, state);

    expect(sim.overallCongestionIndexSimulated).toBeLessThan(
      sim.overallCongestionIndexBaseline
    );
    expect(sim.avgBathingWaitSimulatedMinutes).toBeLessThan(
      sim.avgBathingWaitBaselineMinutes
    );
    expect(sim.ghatComparisons).toHaveLength(8);
    expect(sim.hourlyProjectionSeries).toHaveLength(6);
  });
});
