import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { STORAGE_KEY } from '@/adapters/local/LocalStorageAdapter';
import { createBaselineMobilityState } from '@/data/baselineState';

describe('Phase 1 UI & Two-Window Real-Time Synchronization Verification', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
    useAccessibilityStore.getState().setLanguage('en');
    useAccessibilityStore.getState().setSeniorCitizenMode(false);
  });

  it('renders App, toggles road closure, parking, shuttle, and crowd, and persists to localStorage', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('road-status-value')).toHaveTextContent('CONGESTED');
    expect(screen.getByTestId('parking-status-value')).toHaveTextContent('88% (215 free)');

    // Click Close Pushkar Approach Road
    fireEvent.click(screen.getByTestId('toggle-road-btn'));
    expect(screen.getByTestId('road-status-value')).toHaveTextContent('CLOSED');

    // Click Toggle Arts College Lot
    fireEvent.click(screen.getByTestId('toggle-parking-btn'));
    expect(screen.getByTestId('parking-status-value')).toHaveTextContent('98% (36 free)');

    // Click Boost Shuttle S1
    fireEvent.click(screen.getByTestId('boost-shuttle-btn'));
    expect(screen.getByTestId('shuttle-status-value')).toHaveTextContent(
      'Every 2m (36 buses)'
    );

    // Click Toggle Pushkar Crowd
    fireEvent.click(screen.getByTestId('toggle-crowd-btn'));
    expect(screen.getByTestId('crowd-status-value')).toHaveTextContent('CRITICAL (65m)');
  });

  it('updates UI immediately when an external browser window broadcasts a state update', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('road-status-value')).toHaveTextContent('CONGESTED');

    // Simulate Window 2 (Authority Command Centre) mutating state and broadcasting to Window 1 (Pilgrim Portal)
    const externalState = createBaselineMobilityState('external-command-window');
    externalState.metadata.stateRevision = 12;
    externalState.metadata.lastUpdatedAt = new Date(Date.now() + 5000).toISOString();
    externalState.metadata.lastActionSummary = {
      en: 'Command Window closed Pushkar Approach Road & boosted Shuttle S1',
      te: 'కమాండ్ విండో పుష్కర అప్రోచ్ రోడ్డును మూసివేసింది',
      hi: 'कमांड विंडो ने पुष्कर एप्रोच रोड बंद किया',
    };
    externalState.roads = externalState.roads.map((r) =>
      r.id === 'road-pushkar-approach' ? { ...r, status: 'CLOSED' } : r
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(externalState),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('road-status-value')).toHaveTextContent('CLOSED');
      expect(screen.getByTestId('sync-status-line')).toHaveTextContent('Revision #12');
      expect(screen.getByRole('status')).toHaveTextContent(
        'Command Window closed Pushkar Approach Road'
      );
    });
  });

  it('switches languages (English, Telugu, Hindi) and verifies AI Concierge responses in each language', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    );

    // Close road so AI response includes live road closure
    fireEvent.click(screen.getByTestId('toggle-road-btn'));

    // 1. Test English AI response
    fireEvent.click(screen.getByText(/Ask AI: Road Closures \(EN\)/i));
    await waitFor(() => {
      expect(screen.getByTestId('ai-response-box')).toHaveTextContent(
        'Pushkar Ghat Approach & Old Bridge Rotary Road (CLOSED)'
      );
    });

    // 2. Switch to Telugu (తెలుగు)
    fireEvent.click(screen.getByText('తెలుగు'));
    expect(
      screen.getByText(
        'గోదావరిని దర్శించండి. పుష్కరాలను మరింత సులభంగా అనుభూతి చెందండి.'
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Ask AI: Road Closures \(TE\)/i));
    await waitFor(() => {
      expect(screen.getByTestId('ai-response-box')).toHaveTextContent(
        'పుష్కర ఘాట్ అప్రోచ్ & ఓల్డ్ బ్రిడ్జ్ రోటరీ రోడ్ (CLOSED)'
      );
    });

    // 3. Switch to Hindi (हिन्दी)
    fireEvent.click(screen.getByText('हिन्दी'));
    expect(
      screen.getByText('गोदावरी का दर्शन करें। पुष्करालु का स्मार्ट अनुभव लें।')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Ask AI: Road Closures \(HI\)/i));
    await waitFor(() => {
      expect(screen.getByTestId('ai-response-box')).toHaveTextContent(
        'पुष्कर घाट एप्रोच और ओल्ड ब्रिज रोटरी रोड (CLOSED)'
      );
    });
  });
});
