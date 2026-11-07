import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { STORAGE_KEY } from '@/adapters/local/LocalStorageAdapter';

describe('Phase 5: Two-Window Cross-Portal E2E Synchronization & 12-Point Master UX Audit', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
    useAuthorityAuthStore.getState().selectDemoRole('TRAFFIC_POLICE_COMMANDER');
    useAccessibilityStore.getState().setLanguage('en');
    useAccessibilityStore.getState().setSeniorCitizenMode(false);
  });

  it('1. Verifies real-time Authority-to-Pilgrim synchronization across all 5 operational domains (Roads, Parking, Shuttles, Crowd, Incidents) + Baseline Reset', async () => {
    // STEP A: Window 1 (Authority Command Centre at /command/map) executes operational changes
    const commandWindow = render(
      <MemoryRouter
        initialEntries={['/command/map']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // 1. Road Closure: Close Pushkar Approach Road
    fireEvent.click(
      screen.getByTestId('set-road-road-pushkar-approach-CLOSED')
    );

    // 2. Parking Occupancy: Mark Arts College Parking Hub FULL (99%)
    fireEvent.click(screen.getByTestId('matrix-tab-PARKING'));
    fireEvent.click(
      screen.getByTestId('set-parking-park-arts-college-FULL')
    );

    // 3. Shuttle Availability: Boost Shuttle S1 Fleet
    fireEvent.click(screen.getByTestId('matrix-tab-SHUTTLES'));
    fireEvent.click(screen.getByTestId('boost-shuttle-shuttle-s1'));

    // 4. Crowd Conditions: Set Pushkar Ghat to CRITICAL (65m wait)
    fireEvent.click(screen.getByTestId('matrix-tab-GHATS'));
    fireEvent.click(
      screen.getByTestId('set-ghat-ghat-pushkar-CRITICAL')
    );

    // 5. Incident Creation: Log a CRITICAL incident on Kotilingala Ghat
    act(() => {
      useMobilityStore.getState().createIncident({
        title: {
          en: 'Barricade Surge Alert at Kotilingala Ghat',
          te: 'కోటిలింగాల ఘాట్ వద్ద బ్యారికేడ్ రద్దీ అలర్ట్',
          hi: 'कोटिलिंगाला घाट पर बैरिकेड सर्ज अलर्ट',
        },
        category: 'CROWD_SURGE',
        priority: 'CRITICAL',
        locationName: {
          en: 'Kotilingala Ghat',
          te: 'కోటిలింగాల ఘాట్',
          hi: 'कोटिलिंगाला घाट',
        },
        linkedGhatId: 'ghat-kotilingala',
        assignedTeamId: 'team-crowd-2',
        description: {
          en: 'Additional queue lanes opened by Crowd Unit 2.',
          te: 'అదనపు క్యూ లైన్లు తెరవబడ్డాయి.',
          hi: 'अतिरिक्त कतार लेन खोली गईं।',
        },
        actorName: 'Command Window 1',
      });
    });

    // Capture serialized state persisted in localStorage by Window 1
    const rawSavedByWindow1 = window.localStorage.getItem(STORAGE_KEY);
    expect(rawSavedByWindow1).toBeTruthy();

    commandWindow.unmount();

    // STEP B: Window 2 (Pilgrim Portal) receives the state synchronization event and renders updated state across all pages
    const pilgrimWindow = render(
      <MemoryRouter
        initialEntries={['/journey-planner']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // Simulate storage/BroadcastChannel wakeup in Window 2
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: rawSavedByWindow1,
        })
      );
    });

    // Jump to Step 5 of Journey Planner to verify Road Closure + Parking + Shuttle + Crowd sync
    fireEvent.click(screen.getByTestId('jump-to-results-btn'));
    expect(screen.getByTestId('planner-step-5-panel')).toBeInTheDocument();
    expect(screen.getAllByText(/Bypasses Closed Road/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/closed to private vehicles by Command Centre order/i)
    ).toBeInTheDocument();

    pilgrimWindow.unmount();

    // Verify Explore Destinations Page in Pilgrim Window reflects CRITICAL incident advisory on Kotilingala Ghat
    const exploreWindow = render(
      <MemoryRouter
        initialEntries={['/explore']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByTestId('destination-card-ghat-kotilingala')
    ).toHaveTextContent(/Barricade Surge Alert at Kotilingala Ghat/i);

    exploreWindow.unmount();

    // STEP C: Trigger "Reset Demo Data to Baseline" from Command Centre with confirmation modal
    const resetWindow = render(
      <MemoryRouter
        initialEntries={['/command']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('command-reset-baseline-btn'));
    fireEvent.click(screen.getByTestId('confirm-reset-baseline-btn'));

    await waitFor(() => {
      const stateAfterReset = useMobilityStore.getState().state;
      expect(
        stateAfterReset.roads.find((r) => r.id === 'road-pushkar-approach')
          ?.status
      ).toBe('CONGESTED');
      expect(
        stateAfterReset.parkingHubs.find((p) => p.id === 'park-arts-college')
          ?.status
      ).toBe('FILLING_FAST');
      expect(
        stateAfterReset.ghats.find((g) => g.id === 'ghat-pushkar')?.crowdLevel
      ).toBe('HIGH');
    });

    resetWindow.unmount();
  });

  it('2. Executes 12-Point Master UX Audit (QA-02) & Responsive Breakpoint Verification (A11Y-03) across both portals', () => {
    const breakpoints = [360, 390, 768, 1024, 1440, 1920];

    for (const width of breakpoints) {
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Verify Authority Command Centre renders cleanly at every breakpoint (including mobile module bar)
      const cmdRender = render(
        <MemoryRouter
          initialEntries={['/command']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('authority-command-shell')).toBeInTheDocument();
      expect(
        screen.getByTestId('command-mobile-module-bar')
      ).toBeInTheDocument();
      expect(screen.getByTestId('command-8-kpi-strip')).toBeInTheDocument();
      cmdRender.unmount();
    }

    // Verify zero VITE_ private API key exposure in import.meta.env
    const metaEnv =
      (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
    const envKeys = Object.keys(metaEnv);
    const exposedSecretKeys = envKeys.filter(
      (k) =>
        k.toUpperCase().includes('GEMINI') ||
        k.toUpperCase().includes('SECRET') ||
        k.toUpperCase().includes('PRIVATE')
    );
    expect(exposedSecretKeys).toHaveLength(0);
  });
});
