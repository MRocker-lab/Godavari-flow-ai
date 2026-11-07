import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

describe('Phase 4: Authority Command Centre & Digital Twin Simulator (CMD-01 through CMD-08)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
    useAuthorityAuthStore.getState().lockDemoSession();
    useAccessibilityStore.getState().setLanguage('en');
  });

  it('CMD-01 & CMD-02: renders 8-part CommandLayout, explicit Demo Role Access disclosure, global search, alerts drawer, and baseline reset modal', () => {
    render(
      <MemoryRouter
        initialEntries={['/command']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // 8-Part Layout Verification
    expect(screen.getByTestId('authority-command-shell')).toBeInTheDocument();
    expect(screen.getByTestId('command-simulation-mode-strip')).toBeInTheDocument();
    expect(screen.getByTestId('command-top-header')).toBeInTheDocument();
    expect(screen.getByTestId('command-left-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('command-central-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('command-right-inspection-panel')).toBeInTheDocument();

    // CMD-01: Explicit Demo Role Access panel is visible before confirmation
    expect(screen.getByTestId('demo-role-access-panel')).toHaveTextContent(
      /DEMO ROLE ACCESS ONLY — NOT PRODUCTION AUTHENTICATION OR AUTHORIZATION/i
    );

    // Select Event Authority Director Demo Role
    fireEvent.click(
      screen.getByTestId('activate-demo-role-EVENT_AUTHORITY_DIRECTOR')
    );
    expect(useAuthorityAuthStore.getState().activeRoleId).toBe(
      'EVENT_AUTHORITY_DIRECTOR'
    );
    expect(useAuthorityAuthStore.getState().hasConfirmedDemoAccess).toBe(true);

    // Global Search verification
    fireEvent.change(screen.getByTestId('command-global-search-input'), {
      target: { value: 'Pushkar' },
    });
    expect(
      screen.getByTestId('command-global-search-results')
    ).toBeInTheDocument();

    // Critical Alerts Drawer verification
    fireEvent.click(screen.getByTestId('command-alerts-drawer-btn'));
    expect(screen.getByTestId('command-alerts-drawer')).toBeInTheDocument();
  });

  it('CMD-03: renders CommandOverviewPage with all 8 balanced KPIs, AI situation summary, and quick action approval', () => {
    useAuthorityAuthStore.getState().selectDemoRole('TRAFFIC_POLICE_COMMANDER');

    render(
      <MemoryRouter
        initialEntries={['/command']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('command-overview-page')).toBeInTheDocument();
    expect(screen.getByTestId('command-ai-situation-summary')).toBeInTheDocument();

    // All 8 KPI cards present
    expect(screen.getByTestId('kpi-congestion-index')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-vehicle-count')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-parking-availability')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-shuttle-fleet')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-crowd-density')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-active-incidents')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-critical-alerts')).toBeInTheDocument();
    expect(screen.getByTestId('kpi-predictive-risk')).toBeInTheDocument();
  });

  it('CMD-04: operates 7-Layer OperationalMapPage and Direct Corridor Control Matrix across Roads, Parking, Shuttles, and Ghats', () => {
    useAuthorityAuthStore.getState().selectDemoRole('TRAFFIC_POLICE_COMMANDER');

    render(
      <MemoryRouter
        initialEntries={['/command/map']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('operational-map-page')).toBeInTheDocument();
    expect(screen.getByTestId('corridor-control-matrix')).toBeInTheDocument();

    // 1. Close Pushkar Approach Road from Roads tab
    fireEvent.click(
      screen.getByTestId('set-road-road-pushkar-approach-CLOSED')
    );
    expect(
      useMobilityStore
        .getState()
        .state.roads.find((r) => r.id === 'road-pushkar-approach')?.status
    ).toBe('CLOSED');

    // 2. Switch to Parking tab and set Arts College Lot to FULL
    fireEvent.click(screen.getByTestId('matrix-tab-PARKING'));
    fireEvent.click(
      screen.getByTestId('set-parking-park-arts-college-FULL')
    );
    expect(
      useMobilityStore
        .getState()
        .state.parkingHubs.find((p) => p.id === 'park-arts-college')?.status
    ).toBe('FULL');

    // 3. Switch to Shuttles tab and boost Shuttle S1
    fireEvent.click(screen.getByTestId('matrix-tab-SHUTTLES'));
    const prevBuses =
      useMobilityStore
        .getState()
        .state.shuttles.find((s) => s.id === 'shuttle-s1')?.activeBusesCount || 0;
    fireEvent.click(screen.getByTestId('boost-shuttle-shuttle-s1'));
    expect(
      useMobilityStore
        .getState()
        .state.shuttles.find((s) => s.id === 'shuttle-s1')?.activeBusesCount
    ).toBe(prevBuses + 4);

    // 4. Switch to Ghats tab and set Pushkar Ghat crowd to CRITICAL
    fireEvent.click(screen.getByTestId('matrix-tab-GHATS'));
    fireEvent.click(
      screen.getByTestId('set-ghat-ghat-pushkar-CRITICAL')
    );
    expect(
      useMobilityStore
        .getState()
        .state.ghats.find((g) => g.id === 'ghat-pushkar')?.crowdLevel
    ).toBe('CRITICAL');
  });

  it('CMD-05: approves and rejects recommendations in AIDecisionCentrePage with confirmation dialog and verifies live store mutation', () => {
    useAuthorityAuthStore.getState().selectDemoRole('TRAFFIC_POLICE_COMMANDER');

    render(
      <MemoryRouter
        initialEntries={['/command/ai-decisions']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('ai-decision-centre-page')).toBeInTheDocument();

    const firstRec = useMobilityStore.getState().state.aiRecommendations[0];
    const secondRec = useMobilityStore.getState().state.aiRecommendations[1];

    // Click Approve on first recommendation -> opens confirmation modal
    fireEvent.click(screen.getByTestId(`approve-rec-btn-${firstRec.id}`));
    expect(
      screen.getByTestId('confirm-approve-rec-modal-btn')
    ).toBeInTheDocument();

    // Confirm approval -> mutates recommendation status and road/ghat state
    fireEvent.click(screen.getByTestId('confirm-approve-rec-modal-btn'));
    expect(screen.getByTestId(`rec-status-${firstRec.id}`)).toHaveTextContent(
      'APPROVED_APPLIED'
    );

    // Reject second recommendation
    fireEvent.click(screen.getByTestId(`reject-rec-btn-${secondRec.id}`));
    expect(screen.getByTestId(`rec-status-${secondRec.id}`)).toHaveTextContent(
      'REJECTED'
    );
  });

  it('CMD-06: creates a new incident in IncidentManagementPage and advances incident lifecycle NEW -> ASSIGNED -> RESPONDING -> RESOLVED -> CLOSED', () => {
    useAuthorityAuthStore
      .getState()
      .selectDemoRole('EMERGENCY_RESPONSE_COORDINATOR');

    render(
      <MemoryRouter
        initialEntries={['/command/incidents']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('incident-management-page')).toBeInTheDocument();
    const initialCount = useMobilityStore.getState().state.incidents.length;

    // Open Create Incident Modal and submit a CRITICAL incident
    fireEvent.click(screen.getByTestId('open-create-incident-modal-btn'));
    fireEvent.change(screen.getByTestId('new-incident-title-input'), {
      target: { value: 'Surge Barricade Alert at Kotilingala Ghat Sector B' },
    });
    fireEvent.change(screen.getByTestId('new-incident-priority-select'), {
      target: { value: 'CRITICAL' },
    });
    fireEvent.click(screen.getByTestId('submit-create-incident-btn'));

    const afterCreateIncidents = useMobilityStore.getState().state.incidents;
    expect(afterCreateIncidents.length).toBe(initialCount + 1);
    const createdInc = afterCreateIncidents[0];
    expect(createdInc.status).toBe('ASSIGNED');

    // Advance lifecycle: ASSIGNED -> RESPONDING -> RESOLVED -> CLOSED
    fireEvent.click(screen.getByTestId(`advance-incident-${createdInc.id}`));
    expect(
      screen.getByTestId(`incident-status-badge-${createdInc.id}`)
    ).toHaveTextContent('RESPONDING');

    fireEvent.click(screen.getByTestId(`advance-incident-${createdInc.id}`));
    expect(
      screen.getByTestId(`incident-status-badge-${createdInc.id}`)
    ).toHaveTextContent('RESOLVED');

    fireEvent.click(screen.getByTestId(`advance-incident-${createdInc.id}`));
    expect(
      screen.getByTestId(`incident-status-badge-${createdInc.id}`)
    ).toHaveTextContent('CLOSED');
  });

  it('CMD-07: filters PoliceTeamManagementPage roster and dispatches a team to an active incident', () => {
    useAuthorityAuthStore.getState().selectDemoRole('TRAFFIC_POLICE_COMMANDER');

    render(
      <MemoryRouter
        initialEntries={['/command/teams']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('police-team-management-page')).toBeInTheDocument();

    const firstTeam = useMobilityStore.getState().state.policeTeams[0];
    expect(
      screen.getByTestId(`police-team-card-${firstTeam.id}`)
    ).toBeInTheDocument();

    // Dispatch team to priority alert
    fireEvent.click(screen.getByTestId(`quick-dispatch-btn-${firstTeam.id}`));
    expect(screen.getByTestId(`team-status-${firstTeam.id}`)).toHaveTextContent(
      'DEPLOYED_ACTIVE'
    );
  });

  it('CMD-08: runs DigitalTwinSimulatorPage scenario modeling, updates Before/After delta charts, and applies intervention to active demo state', () => {
    useAuthorityAuthStore.getState().selectDemoRole('EVENT_AUTHORITY_DIRECTOR');

    render(
      <MemoryRouter
        initialEntries={['/command/digital-twin']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId('digital-twin-simulator-page')
    ).toBeInTheDocument();
    expect(screen.getByTestId('twin-controls-panel')).toBeInTheDocument();
    expect(screen.getByTestId('twin-delta-cards-grid')).toBeInTheDocument();
    expect(screen.getByTestId('twin-before-after-chart')).toBeInTheDocument();

    // Adjust Pilgrim Inflow Surge Multiplier slider to 150%
    fireEvent.change(screen.getByTestId('slider-inflow-multiplier'), {
      target: { value: '150' },
    });
    expect(screen.getByTestId('val-inflow-multiplier')).toHaveTextContent('150%');

    // Boost shuttle frequency to +80%
    fireEvent.change(screen.getByTestId('slider-shuttle-boost'), {
      target: { value: '80' },
    });
    expect(screen.getByTestId('val-shuttle-boost')).toHaveTextContent('+80%');

    // Click "Apply Intervention to Active Demo State" and confirm modal
    const revBefore = useMobilityStore.getState().state.metadata.stateRevision;
    fireEvent.click(screen.getByTestId('apply-twin-to-live-state-btn'));
    fireEvent.click(screen.getByTestId('confirm-apply-twin-modal-btn'));

    expect(screen.getByTestId('twin-applied-banner')).toBeInTheDocument();
    expect(
      useMobilityStore.getState().state.metadata.stateRevision
    ).toBeGreaterThan(revBefore);
  });
});
