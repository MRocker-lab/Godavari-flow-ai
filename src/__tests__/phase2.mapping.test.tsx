import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';

describe('Phase 2 Verification Suite: Unified Mapping Engine & Offline Interactive SVG Riverfront', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useMobilityStore.getState().resetDemoDataToBaseline();
    useAccessibilityStore.getState().setLanguage('en');
  });

  it('1. Renders geographically accurate Offline SVG Riverfront Map with East/West banks, barrage, and 8 ghats', () => {
    render(<MobilityMapWorkspace portal="command" />);

    const svgMap = screen.getByTestId('offline-svg-riverfront-map');
    expect(svgMap).toBeInTheDocument();
    expect(within(svgMap).getByText(/WEST BANK — KOVVUR/i)).toBeInTheDocument();
    expect(
      within(svgMap).getByText(/EAST BANK — RAJAMAHENDRAVARAM/i)
    ).toBeInTheDocument();
    expect(
      within(svgMap).getByText(/DOWLESWARAM COTTON BARRAGE/i)
    ).toBeInTheDocument();

    // Verify all 8 ghats render as interactive nodes
    expect(screen.getByTestId('map-ghat-ghat-pushkar')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-kotilingala')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-saraswati')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-gautami')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-padmavathi')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-kovvur-gospada')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-dowleswaram')).toBeInTheDocument();
    expect(screen.getByTestId('map-ghat-ghat-iskcon')).toBeInTheDocument();
  });

  it('2. Supports toggling all 7 mandatory operational layers on and off', () => {
    render(<MobilityMapWorkspace portal="command" />);

    const layerIds = [
      'traffic',
      'parking',
      'shuttles',
      'crowdHeatmap',
      'incidents',
      'emergencyRoutes',
      'roadClosures',
    ] as const;

    // In command portal, all 7 layers start active
    for (const id of layerIds) {
      expect(screen.getByTestId(`svg-layer-${id}`)).toBeInTheDocument();

      // Toggle off
      fireEvent.click(screen.getByTestId(`layer-toggle-${id}`));
      expect(screen.queryByTestId(`svg-layer-${id}`)).not.toBeInTheDocument();

      // Toggle back on
      fireEvent.click(screen.getByTestId(`layer-toggle-${id}`));
      expect(screen.getByTestId(`svg-layer-${id}`)).toBeInTheDocument();
    }
  });

  it('3. Opens LocationDetailPanel when clicking Ghats, Roads, Parking, Shuttles, and Incidents', () => {
    render(<MobilityMapWorkspace portal="command" enableOperatorControls={true} />);

    // Initially shows empty selection prompt
    expect(screen.getByTestId('location-detail-empty')).toBeInTheDocument();

    // Click Pushkar Ghat marker
    fireEvent.click(screen.getByTestId('map-ghat-ghat-pushkar'));
    const detailPanel = screen.getByTestId('location-detail-panel');
    expect(detailPanel).toHaveTextContent('Pushkar Ghat (Main Riverfront)');
    expect(detailPanel).toHaveTextContent('14,200 / 16,500');

    // Click Morampudi Parking Hub marker
    fireEvent.click(screen.getByTestId('map-parking-park-morampudi'));
    expect(screen.getByTestId('location-detail-panel')).toHaveTextContent(
      'Morampudi Mega Satellite Parking Hub'
    );

    // Click Shuttle S1 marker
    fireEvent.click(screen.getByTestId('map-shuttle-shuttle-s1'));
    expect(screen.getByTestId('location-detail-panel')).toHaveTextContent(
      'S1: Morampudi Mega Hub ↔ Pushkar Ghat Express'
    );

    // Click Incident 101 marker
    fireEvent.click(screen.getByTestId('map-incident-inc-101'));
    expect(screen.getByTestId('location-detail-panel')).toHaveTextContent(
      'INC-2026-101'
    );
  });

  it('4. Synchronizes operational actions from Map Detail Panel to Road Closure Overlays, Legend, and Store', () => {
    render(<MobilityMapWorkspace portal="command" enableOperatorControls={true} />);

    // Initially 0 closed roads in legend
    expect(screen.getByTestId('map-legend')).toHaveTextContent('Road Closed (0)');
    expect(
      screen.queryByTestId('map-closure-badge-road-pushkar-approach')
    ).not.toBeInTheDocument();

    // Select Pushkar Approach Road on the map
    fireEvent.click(screen.getByTestId('map-road-road-pushkar-approach'));
    expect(screen.getByTestId('location-detail-panel')).toHaveTextContent(
      'Pushkar Ghat Approach & Old Bridge Rotary Road'
    );

    // Click "Close Road to Private Vehicles" inside the detail panel
    fireEvent.click(screen.getByTestId('detail-road-close'));

    // Verify Road Closure Overlay badge appears on the SVG map and Legend updates to Road Closed (1)
    expect(
      screen.getByTestId('map-closure-badge-road-pushkar-approach')
    ).toBeInTheDocument();
    expect(screen.getByTestId('map-legend')).toHaveTextContent('Road Closed (1)');
    expect(
      useMobilityStore
        .getState()
        .state.roads.find((r) => r.id === 'road-pushkar-approach')?.status
    ).toBe('CLOSED');
  });

  it('5. Supports Search Filtering, Zoom Controls, and Map/List View Switching', () => {
    render(<MobilityMapWorkspace portal="pilgrim" />);

    // Test Zoom controls
    expect(screen.getByTestId('map-zoom-value')).toHaveTextContent('100%');
    fireEvent.click(screen.getByTestId('map-zoom-in'));
    expect(screen.getByTestId('map-zoom-value')).toHaveTextContent('120%');
    fireEvent.click(screen.getByTestId('map-zoom-reset'));
    expect(screen.getByTestId('map-zoom-value')).toHaveTextContent('100%');

    // Switch to List View
    fireEvent.click(screen.getByTestId('view-mode-list'));
    const listView = screen.getByTestId('map-structured-list-view');
    expect(listView).toBeInTheDocument();
    expect(within(listView).getByText(/Ghats & Destinations \(8\)/i)).toBeInTheDocument();

    // Filter by searching "Kovvur"
    const searchInput = screen.getByPlaceholderText(
      /Search ghats, roads, parking, shuttles, incidents/i
    );
    fireEvent.change(searchInput, { target: { value: 'Kovvur' } });
    expect(within(listView).getByText(/Ghats & Destinations \(1\)/i)).toBeInTheDocument();

    // Click filtered Kovvur Ghat in list view to open Detail Panel
    fireEvent.click(screen.getByTestId('list-ghat-ghat-kovvur-gospada'));
    expect(screen.getByTestId('location-detail-panel')).toHaveTextContent(
      'Kovvur Gospada Kshetram Ghat'
    );
  });
});
