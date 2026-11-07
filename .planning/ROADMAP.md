# Implementation Roadmap — GODAVARI FLOW AI

**Project:** GODAVARI FLOW AI (Godavari Pushkaralu — Rajamahendravaram & Kovvur Corridor)
**Depth Mode:** Quick / Structured 5-Phase Delivery
**Total Mapped Requirements:** 30 (`FOUND-01..08`, `MAP-01..03`, `A11Y-01..03`, `PIL-01..08`, `CMD-01..08`, `QA-01..02`)

---

## Phase Overview

| Phase | Name | Goal | Requirements Covered |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation, Dual Design System, Canonical State & Cross-Tab Sync** | Scaffold Vite + React + TS project, build the dual-theme design system (`Pilgrim` vs `Command`), trilingual engine (EN/TE/HI), canonical Rajamahendravaram dataset, and `localStorage` + `BroadcastChannel` sync engine. | `FOUND-01..08`, `A11Y-01`, `A11Y-02`, `QA-01` |
| **Phase 2** | **Unified Mapping Engine & Offline Interactive SVG Riverfront** | Build the dual-theme Leaflet map + first-class Offline Interactive SVG Riverfront fallback supporting all 7 operational layers, route polylines, heatmaps, and location inspection panels. | `MAP-01`, `MAP-02`, `MAP-03` |
| **Phase 3** | **Pilgrim Portal — Mobile-First Travel & Mobility Experience** | Deliver the complete Pilgrim Portal: 13-part Homepage, Explore Destinations, 5-step Guided Journey Planner, Map-First Parking & Shuttles, Trilingual AI Travel Concierge, and Safety/Accessibility Hub. | `PIL-01..08` |
| **Phase 4** | **Authority Command Centre & Digital Twin Simulator** | Deliver the complete Command Centre: Demo-labeled Role Gate, 8-part Operational Shell, Command Overview, 7-Layer Map Workspace, AI Decision Centre, Incident Lifecycle, Police Teams, and Digital Twin Simulator. | `CMD-01..08` |
| **Phase 5** | **Cross-Portal Verification, Responsive Polish & 12-Point UX QA** | Verify live cross-tab synchronization across all workflows, audit all 6 responsive breakpoints (`360px`–`1920px`) across English/Telugu/Hindi, run automated tests, and pass the 12-point UX QA checklist. | `A11Y-03`, `QA-02` |

---

## Detailed Phase Breakdown

### Phase 1: Foundation, Dual Design System, Canonical State & Cross-Tab Sync
**Goal:** Establish a rock-solid technical and visual foundation where `npm run dev` boots cleanly, both visual identities are strictly isolated, and the shared canonical dataset synchronizes across browser tabs with baseline reset support.

- **Key Deliverables:**
  1. Vite + React 18 + TypeScript + Tailwind CSS + React Router + Vitest setup (`npm run dev`, `npm run build`, `npm run test`).
  2. Scoped CSS token system (`[data-portal="pilgrim"]` Warm Ivory/Royal Blue/Teal/Saffron vs. `[data-portal="command"]` Midnight Navy/Graphite/Slate/Cyan) and font loading (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`, `Noto Sans Telugu`, `Noto Sans Devanagari`).
  3. Complete Reusable Design System component library (`Button`, `Badge`, `SimulationBadge`, `Card`, `Dialog`, `Drawer`, `SearchBox`, `Select`, `DataTable`, `Tabs`, `Tooltip`, `LoadingSkeleton`, `EmptyState`, `ErrorState`, `ResetBaselineDialog`, `AccessibilityBar`).
  4. Trilingual i18n provider (`en`, `te`, `hi`) and Senior Citizen Mode / High Contrast / Reduced Motion accessibility store.
  5. Canonical Rajamahendravaram–Kovvur dataset (8 Ghats, 8 Parking Hubs, 6 Shuttle Routes, 10 Road/Bridge Segments, Incidents, Police Teams, AI Recommendations, Digital Twin Scenarios).
  6. `IMobilityRepository` & `LocalMobilityRepository` with versioned `localStorage` persistence, monotonic `stateRevision` conflict resolution, `BroadcastChannel('godavari_flow_sync_v1')` + `window.onstorage` fallback, and `Reset Demo Data to Baseline`.
  7. Secure AI Adapter architecture (`LocalDomainAIEngine` working 100% independently + `/api/ai` backend proxy contract with zero client-side API key exposure).
- **Success Criteria:**
  - `npm run dev` starts with zero errors.
  - Modifying state in Tab A immediately updates Tab B via `BroadcastChannel` and survives browser refreshes.
  - Clicking "Reset Demo Data to Baseline" restores all entities across open tabs after confirmation.

---

### Phase 2: Unified Mapping Engine & Offline Interactive SVG Riverfront
**Goal:** Build the interactive cartographic engine that works seamlessly both online (Leaflet + CartoDB Positron/Dark Matter tiles) and 100% offline via a coordinate-accurate Interactive SVG Riverfront Map of Rajamahendravaram & Kovvur.

- **Key Deliverables:**
  1. `MobilityMapCanvas` supporting Pilgrim (light) and Command (dark) themes plus instant toggle/automatic fallback to `InteractiveRiverfrontSvgMap`.
  2. Complete vector rendering of the Godavari River, Road-cum-Rail Bridge, 4th Godavari Bridge, Dowleswaram Barrage, 8 Ghats, 8 Parking Hubs, 6 Shuttle Routes, and 10 Road Corridors.
  3. All 7 operational layers: Traffic congestion polylines, Parking capacity markers, Shuttle live-simulated route pins, Crowd density heatmap zones, Incident markers, Emergency corridors, and Road closure overlays.
  4. `MapLayerControls`, accessible `MapLegend` (icons + text + patterns + colors), search/zoom controls, and `LocationDetailPanel` when selecting any feature.
- **Success Criteria:**
  - Every ghat, parking hub, shuttle route, road segment, and incident is selectable on both the tile map and the offline SVG riverfront map.
  - Road closures or crowd changes in the shared store immediately update map colors, badges, and legends.

---

### Phase 3: Pilgrim Portal — Mobile-First Travel & Mobility Experience
**Goal:** Implement the complete, welcoming, mobile-first Pilgrim Portal adhering strictly to Section 2 of `UI-UX-SPEC.md`.

- **Key Deliverables:**
  1. `PilgrimLayout` (Desktop clean top navigation + Mobile compact header & touch-friendly bottom navigation bar + language & Senior Citizen Mode controls + footer).
  2. **Homepage (`/`)**: All 13 required sections including the Godavari riverfront hero, *"Discover Godavari. Experience Pushkaralu Smarter."* headline, primary CTAs, compact mobility status strip, featured ghat cards, smart travel tips, and safety/accessibility section.
  3. **Explore Destinations (`/explore`)**: Filterable ghat & temple guide with live-synced crowd levels, wait times, accessibility details, active advisories, and *"Plan Journey Here"* deep links.
  4. **5-Step Guided Journey Planner (`/journey-planner`)**: Step-by-step wizard (Origin → Destination → Mode → Family/Accessibility Preferences → Side-by-Side Route Comparison + Interactive Route Map) powered by `journeyPlannerEngine.ts` that dynamically respects Command Centre road closures, parking saturation, and crowd levels.
  5. **Map-First Parking (`/parking`) & Shuttles (`/shuttles`)**: Split/toggle map and list views displaying all mandatory metrics (capacity, occupancy, distance, traffic, walking distance, ETA, wheelchair/senior priority, and clear recommendation badges).
  6. **AI Travel Concierge (`/assistant`)**: Polished conversational interface in English, Telugu, and Hindi with suggested questions, map-linked destination/route cards, conversation history, and transparent *Simulated Domain AI* provenance badges.
  7. **Safety & Accessibility (`/safety`)**: Emergency helplines, medical camps, lost-and-found centers, and senior citizen/wheelchair assistance guide.
- **Success Criteria:**
  - First-time visitors can complete the 5-step Journey Planner in under 60 seconds on both 360px mobile and 1440px desktop viewports.
  - Switching between English, Telugu, and Hindi updates all Pilgrim Portal screens cleanly without clipping.

---

### Phase 4: Authority Command Centre & Digital Twin Simulator
**Goal:** Implement the desktop-first, dark-mode Authority Command Centre and Digital Twin Simulator adhering strictly to Section 3 of `UI-UX-SPEC.md`.

- **Key Deliverables:**
  1. **Demo-Labeled Authority Role Switcher (`/command/login`)**: One-click entry as *Traffic Police Commander*, *Event Authority Director*, or *Emergency Response Coordinator* with prominent *Demo Role Access — Not Production Authentication* disclosure.
  2. **8-Part Command Layout Shell**: Collapsible left sidebar, top command header with Event/Simulation Mode indicator, global search (`Ctrl+K` / click), notifications & critical alerts drawer, role switcher, central workspace, and right-side context panel.
  3. **Command Overview (`/command`)**: Balanced KPI strip (8 core indicators), central 7-layer operational map, recent alerts feed, AI-generated situation summary, and recommended authority actions.
  4. **Operational Map Workspace (`/command/map`)**: Full-workspace tactical map with direct operator controls to close/reopen road segments, adjust parking status, and trigger corridor advisories (syncing immediately to the Pilgrim Portal).
  5. **AI Decision Centre (`/command/ai-decisions`)**: Actionable intelligence cards with Severity, Affected Location, Detected Condition, Predicted Consequences, Recommended Action, Reasoning, Expected Impact, and confirmation-gated **Approve**, **Reject**, and **Simulate** workflows.
  6. **Incident Management (`/command/incidents`)**: Full lifecycle table and board (`New` → `Assigned` → `Responding` → `Resolved` → `Closed`), new incident creation dialog, team assignment, timestamped audit timeline, and operator notes.
  7. **Police Team Management (`/command/teams`)**: Searchable/sortable roster of police & response units with team ID, location, leader, current assignment, task status, linked incident, and explicit *Simulated Assignment* badges.
  8. **Digital Twin Simulator (`/command/digital-twin`)**: Scenario selector + parameter controls (crowd surge %, road closure toggles, shuttle dispatch boost, parking diversion ratio), side-by-side Baseline vs. Intervention comparison, map delta view, before/after Recharts visualizations, predicted consequences, *Reset Scenario*, and optional *Apply to Active Demo State*.
- **Success Criteria:**
  - Approving an AI recommendation, closing a road, or creating a critical incident in the Command Centre immediately updates the Pilgrim Portal in another open tab.
  - Operators can run a Digital Twin scenario, inspect before/after charts and map deltas, and reset the scenario cleanly.

---

### Phase 5: Cross-Portal Verification, Responsive Polish & 12-Point UX QA
**Goal:** Conduct comprehensive automated testing, responsive verification across all 6 required widths (`360px` to `1920px`), multilingual layout verification, and the mandatory 12-point UX Quality Assurance review from `UI-UX-SPEC.md`.

- **Key Deliverables:**
  1. Automated Vitest test suite verifying:
     - 5-step Journey Planner routing & road-closure avoidance
     - Digital Twin before/after delta math
     - Incident lifecycle state transitions
     - `localStorage` persistence & `BroadcastChannel` conflict resolution
     - Baseline state reset integrity
  2. Responsive & accessibility audit across `360px`, `390px`, `768px`, `1024px`, `1440px`, and `1920px` in English, Telugu, and Hindi.
  3. Complete verification report against all 12 UX QA questions and Section 8 Final Design Acceptance Criteria in `UI-UX-SPEC.md`.
- **Success Criteria:**
  - Zero TypeScript errors, zero build errors, all Vitest suites passing, zero dead buttons, and 12/12 UX QA checks verified.
