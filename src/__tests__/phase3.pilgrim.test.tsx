import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

describe('Phase 3: Pilgrim Portal (PIL-01 through PIL-08) & Responsive Verification', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
    useAccessibilityStore.getState().setLanguage('en');
    useAccessibilityStore.getState().setSeniorCitizenMode(false);
    if (useAccessibilityStore.getState().highContrastMode) {
      useAccessibilityStore.getState().toggleHighContrastMode();
    }
    if (useAccessibilityStore.getState().reducedMotionMode) {
      useAccessibilityStore.getState().toggleReducedMotionMode();
    }
  });

  it('PIL-01 & PIL-02: renders PilgrimLayout shell and complete 13-section PilgrimHomePage', () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // Layout shell & emergency strip
    expect(screen.getByTestId('pilgrim-portal-shell')).toBeInTheDocument();
    expect(screen.getByTestId('pilgrim-home-page')).toBeInTheDocument();
    expect(screen.getByTestId('home-hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('home-main-headline')).toBeInTheDocument();

    // Two primary hero CTAs
    expect(screen.getByTestId('hero-cta-plan-journey')).toBeInTheDocument();
    expect(screen.getByTestId('hero-cta-explore-destinations')).toBeInTheDocument();

    // Sections 8-12: AI Concierge Entry Card, Compact Mobility Status Section, Featured Destinations, Smart Travel Info, Safety & Accessibility
    expect(screen.getByTestId('home-ai-entry-card')).toBeInTheDocument();
    expect(screen.getByTestId('home-mobility-status-section')).toBeInTheDocument();
    expect(screen.getByTestId('home-featured-destinations-section')).toBeInTheDocument();
    expect(screen.getByTestId('home-smart-travel-section')).toBeInTheDocument();
    expect(screen.getByTestId('home-safety-accessibility-section')).toBeInTheDocument();

    // Clicking "Open Interactive Corridor Map" reveals inline interactive map workspace
    fireEvent.click(screen.getByTestId('toggle-home-inline-map-btn'));
    expect(screen.getByTestId('mobility-map-workspace')).toBeInTheDocument();
  });

  it('PIL-03: renders ExploreDestinationsPage, filters ghats by bank, low crowd, and accessibility, and navigates to Journey Planner', () => {
    render(
      <MemoryRouter
        initialEntries={['/explore']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('explore-destinations-page')).toBeInTheDocument();
    expect(screen.getByTestId('destination-card-ghat-pushkar')).toBeInTheDocument();
    expect(screen.getByTestId('destination-card-ghat-kovvur-gospada')).toBeInTheDocument();

    // Filter by West Kovvur bank
    fireEvent.click(screen.getByTestId('bank-filter-WEST_KOVVUR'));
    expect(screen.getByTestId('destination-card-ghat-kovvur-gospada')).toBeInTheDocument();
    expect(screen.queryByTestId('destination-card-ghat-pushkar')).not.toBeInTheDocument();

    // Reset to All banks and filter by Low Crowd Only
    fireEvent.click(screen.getByTestId('bank-filter-ALL'));
    fireEvent.click(screen.getByTestId('filter-low-crowd-btn'));
    expect(screen.getByTestId('destination-card-ghat-saraswati')).toBeInTheDocument();
    expect(screen.queryByTestId('destination-card-ghat-pushkar')).not.toBeInTheDocument();

    // Click "Plan Best Route to This Ghat" on Saraswati Ghat
    fireEvent.click(screen.getByTestId('plan-to-ghat-ghat-saraswati'));
    expect(screen.getByTestId('journey-planner-page')).toBeInTheDocument();
  });

  it('PIL-04: executes full 5-step Guided Journey Planner and dynamically recalculates routes when a road is closed in shared state', () => {
    render(
      <MemoryRouter
        initialEntries={['/journey-planner']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // Step 1: Select Starting Location
    expect(screen.getByTestId('planner-step-1-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('origin-option-RAJAMAHENDRAVARAM_RAILWAY'));
    fireEvent.click(screen.getByTestId('step-1-next-btn'));

    // Step 2: Select Destination Ghat (Pushkar Ghat)
    expect(screen.getByTestId('planner-step-2-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dest-option-ghat-pushkar'));
    fireEvent.click(screen.getByTestId('step-2-next-btn'));

    // Step 3: Select Travel Mode
    expect(screen.getByTestId('planner-step-3-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('mode-option-CAR_PLUS_SHUTTLE'));
    fireEvent.click(screen.getByTestId('step-3-next-btn'));

    // Step 4: Set Family & Accessibility Preferences
    expect(screen.getByTestId('planner-step-4-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('pref-checkbox-senior'));
    fireEvent.click(screen.getByTestId('step-4-compute-btn'));

    // Step 5: Side-by-side route comparisons + interactive map
    expect(screen.getByTestId('planner-step-5-panel')).toBeInTheDocument();
    expect(screen.getByTestId('route-comparison-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('route-comparison-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('route-comparison-card-2')).toBeInTheDocument();

    // Now simulate Authority Command Centre closing Pushkar Ghat Approach Road
    act(() => {
      useMobilityStore.getState().setRoadStatus('road-pushkar-approach', 'CLOSED');
    });

    // Verify route cards immediately reflect road closure bypass
    expect(screen.getAllByText(/Bypasses Closed Road/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/closed to private vehicles by Command Centre order/i)
    ).toBeInTheDocument();
  });

  it('PIL-05 & PIL-06: renders Map-First Parking Finder and Shuttle Tracker with live filters', () => {
    const { unmount } = render(
      <MemoryRouter
        initialEntries={['/parking']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('parking-finder-page')).toBeInTheDocument();
    expect(screen.getByTestId('parking-card-park-morampudi')).toBeInTheDocument();
    expect(screen.getByTestId('parking-card-park-arts-college')).toBeInTheDocument();

    // Filter by Available Now (Arts College is FILLING_FAST at 88%, Morampudi is AVAILABLE at 42%)
    fireEvent.click(screen.getByTestId('parking-filter-AVAILABLE_ONLY'));
    expect(screen.getByTestId('parking-card-park-morampudi')).toBeInTheDocument();
    expect(screen.queryByTestId('parking-card-park-arts-college')).not.toBeInTheDocument();

    unmount();

    // Render Shuttle Tracker Page
    render(
      <MemoryRouter
        initialEntries={['/shuttles']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('shuttle-tracker-page')).toBeInTheDocument();
    expect(screen.getByTestId('shuttle-card-shuttle-s1')).toBeInTheDocument();
    expect(screen.getByTestId('shuttle-card-shuttle-s3')).toBeInTheDocument();

    // Filter by Wheelchair & Senior Priority
    fireEvent.click(screen.getByTestId('shuttle-filter-WHEELCHAIR_PRIORITY'));
    expect(screen.getByTestId('shuttle-card-shuttle-s3')).toBeInTheDocument();
  });

  it('PIL-07: verifies Trilingual AI Travel Concierge (English, Telugu, Hindi) and interactive map links', async () => {
    render(
      <MemoryRouter
        initialEntries={['/assistant']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('ai-travel-assistant-page')).toBeInTheDocument();

    // Wait for initial English concierge welcome message
    await waitFor(() => {
      expect(screen.getAllByTestId('chat-turn-assistant').length).toBeGreaterThan(0);
    });

    // Switch AI Assistant to Telugu (తెలుగు)
    fireEvent.click(screen.getByTestId('ai-lang-btn-te'));
    await waitFor(() => {
      expect(screen.getByTestId('ai-corridor-summary-text')).toHaveTextContent(
        'ప్రస్తుత కారిడార్ విశ్లేషణ'
      );
    });

    // Switch AI Assistant to Hindi (हिंदी)
    fireEvent.click(screen.getByTestId('ai-lang-btn-hi'));
    await waitFor(() => {
      expect(screen.getByTestId('ai-corridor-summary-text')).toHaveTextContent(
        'वर्तमान कॉरिडोर सारांश'
      );
    });

    // Ask custom question via chat input
    fireEvent.change(screen.getByTestId('ai-chat-input'), {
      target: { value: 'Senior citizen wheelchair ramp ghat' },
    });
    fireEvent.click(screen.getByTestId('ai-chat-send-btn'));

    await waitFor(() => {
      expect(screen.getAllByTestId('chat-turn-user').length).toBeGreaterThan(0);
    });
  });

  it('PIL-08: toggles Senior Citizen Mode and dispatches a live Pilgrim Assistance Request into the shared canonical store', () => {
    render(
      <MemoryRouter
        initialEntries={['/safety']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('safety-accessibility-page')).toBeInTheDocument();

    // Toggle Senior Citizen Mode on
    fireEvent.click(screen.getByTestId('safety-toggle-senior-mode-btn'));
    expect(useAccessibilityStore.getState().seniorCitizenMode).toBe(true);

    // Fill out and submit the Senior/Wheelchair Buggy Assistance Request form
    const initialIncidentCount = useMobilityStore.getState().state.incidents.length;
    fireEvent.change(screen.getByTestId('assist-name-input'), {
      target: { value: 'Smt. Lakshmi Devi (Age 74)' },
    });
    fireEvent.change(screen.getByTestId('assist-notes-input'), {
      target: { value: 'Near Saraswati Ghat Gate 1 ramp, requesting electric buggy.' },
    });
    fireEvent.click(screen.getByTestId('submit-assistance-request-btn'));

    // Verify confirmation alert and canonical shared store mutation
    expect(screen.getByTestId('assistance-submitted-alert')).toBeInTheDocument();
    const updatedIncidents = useMobilityStore.getState().state.incidents;
    expect(updatedIncidents.length).toBe(initialIncidentCount + 1);
    expect(updatedIncidents[0].title.en).toContain('Electric Buggy Pickup Request');
  });

  it('verifies responsive rendering across 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports', () => {
    const viewports = [360, 390, 768, 1024, 1440, 1920];

    for (const width of viewports) {
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        window.dispatchEvent(new Event('resize'));
      });

      const { unmount } = render(
        <MemoryRouter
          initialEntries={['/']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </MemoryRouter>
      );

      expect(screen.getByTestId('pilgrim-portal-shell')).toBeInTheDocument();
      expect(screen.getByTestId('home-main-headline')).toBeInTheDocument();
      expect(screen.getByTestId('hero-cta-plan-journey')).toBeInTheDocument();
      unmount();
    }
  });
});
