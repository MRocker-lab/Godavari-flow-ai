# Requirements Specification — GODAVARI FLOW AI

**Defined:** 2026-11-07
**Core Value:** Unified, honest operational intelligence that connects authority decisions directly to pilgrim guidance in real time—without compromising visual design, usability, accessibility, or data transparency.
**Mandatory Design Reference:** [.planning/UI-UX-SPEC.md](./UI-UX-SPEC.md)

---

## 1. MVP Requirements (v1 — Complete Software Demonstration Platform)

### Category A: Foundation, Design System & Shared Mobility Architecture (`FOUND`)

- [x] **FOUND-01**: **Single-Command Execution** — The entire application starts cleanly with `npm run dev` and builds cleanly with `npm run build` without requiring any external database, backend server, or paid API keys.
- [x] **FOUND-02**: **Dual-Identity Theme & Design System** — Implement a reusable component library (`Navigation`, `Sidebar`, `Button`, `FormField`, `SearchBox`, `Dropdown`, `Dialog`, `Drawer`, `Tooltip`, `NotificationPanel`, `StatusIndicator`, `MetricVisualization`, `DataTable`, `MapControl`, `EmptyState`, `LoadingSkeleton`, `ErrorState`, `ConfirmationScreen`) with strict theme scoping:
  - *Pilgrim Portal:* Warm ivory/white surfaces, deep royal blue primary actions, river cyan/teal & subtle saffron accents, dark navy text, soft shadows.
  - *Authority Command Centre:* Deep midnight navy, graphite & dark slate panels, controlled cyan accents, semantic red/amber/green status indicators, dark mode primary.
- [x] **FOUND-03**: **Canonical Rajamahendravaram–Kovvur Dataset** — Single shared spatial and operational dataset covering 8 Ghats/Destinations (Pushkar, Kotilingala, Gautami, Saraswati, Padmavathi, Kovvur Gospada, Dowleswaram, ISKCON), 8 Parking Hubs, 6 Shuttle Corridors, 10 Road/Bridge Segments, baseline Incidents, Police Response Teams, AI Recommendations, and Digital Twin Scenarios.
- [x] **FOUND-04**: **Service & Repository Adapter Architecture** — All UI components interact with state exclusively via typed `IMobilityRepository`, `IJourneyPlannerService`, `IAIServiceAdapter`, and `IDigitalTwinEngine` interfaces so REST/WebSocket backends can be attached later without rewriting UI layers.
- [x] **FOUND-05**: **Persistent Storage & Resilience** — Persist canonical state mutations in versioned `localStorage` with automatic schema validation and graceful fallback to in-memory storage if browser storage is unavailable or full.
- [x] **FOUND-06**: **Cross-Tab Synchronization Engine** — Synchronize all state changes across open browser tabs and windows using `BroadcastChannel`, monotonic `stateRevision` + timestamp conflict handling, and `window.onstorage` fallback (without assuming or guaranteeing fixed synchronization latency).
- [x] **FOUND-07**: **Reset Demo Data to Baseline** — Provide an accessible **Reset Demo Data to Baseline** control with a confirmation dialog in both portals that restores the canonical dataset and broadcasts the reset to all open tabs.
- [x] **FOUND-08**: **Data Honesty & Provenance Labeling** — Explicitly badge all simulated telemetry, operator overrides, Digital Twin projections, local AI outputs, and unavailable live integrations (`Simulated Baseline`, `Authority Override`, `Digital Twin Projection`, `Demo Role Access`). Never represent simulated data as live hardware telemetry.

---

### Category B: Interactive Mapping & Offline Riverfront Engine (`MAP`)

- [ ] **MAP-01**: **Dual-Theme Map Engine + Offline Interactive SVG Riverfront Fallback** — Support Leaflet + CartoDB Light/Dark basemaps when online AND a first-class **Interactive SVG Riverfront Map Engine** (selectable at any time and automatic when offline/tiles fail) that renders the Godavari River, bridges, road corridors, ghats, parking hubs, shuttle routes, crowd heatmaps, incidents, and route polylines without internet access.
- [ ] **MAP-02**: **7 Operational Map Layers** — Support independent toggling and visualization of: (1) Traffic Layer, (2) Parking Layer, (3) Shuttle Layer, (4) Crowd Heatmap, (5) Incident Layer, (6) Emergency Routes, and (7) Road Closure Overlays.
- [ ] **MAP-03**: **Interactive Map Controls & Location Inspection** — Provide layer controls, search, zoom/pan, marker selection, accessible non-color-only legends, detail inspection drawers/panels, and map/list view toggles.

---

### Category C: Multilingual (EN / TE / HI) & Accessibility (`A11Y`)

- [x] **A11Y-01**: **Full Trilingual Support (English, Telugu, Hindi)** — Prominent language selector switching all UI navigation, labels, status indicators, ghat descriptions, Journey Planner outputs, and AI Concierge interactions between **English**, **Telugu (`తెలుగు`)**, and **Hindi (`हिन्दी`)** using `Noto Sans Telugu` and `Noto Sans Devanagari` without layout overflow.
- [x] **A11Y-02**: **Senior Citizen Mode & Accessibility Controls** — One-click Senior Citizen Mode (enlarged typography, high contrast, simplified prominence, accessibility-first route defaults), keyboard navigation, ARIA screen-reader labels, `>=44px` touch targets, non-color-only status indicators (text + icon + status badge), and `prefers-reduced-motion` compliance.
- [ ] **A11Y-03**: **Responsive Breakpoint Optimization** — Verified layouts across `360px`, `390px`, `768px`, `1024px`, `1440px`, and `1920px` widths with zero horizontal overflow on mobile.

---

### Category D: Pilgrim Portal — Mobile-First Premium Travel Experience (`PIL`)

- [ ] **PIL-01**: **13-Part Pilgrim Homepage Experience** — Includes: (1) Premium navigation header, (2) GODAVARI FLOW AI branding, (3) Explore/Plan Journey/Parking/Shuttles/AI Assistant navigation, (4) Prominent language selector, (5) Godavari riverfront hero visual, (6) Headline *"Discover Godavari. Experience Pushkaralu Smarter."*, (7) Primary CTAs (*Plan My Journey*, *Explore Destinations*), (8) AI Travel Assistant entry point, (9) Compact mobility status section, (10) Featured destination cards, (11) Smart travel information, (12) Safety & accessibility information, and (13) Well-designed footer.
- [ ] **PIL-02**: **Responsive Pilgrim Navigation** — Clean top navigation with clear active states on desktop; compact header + touch-friendly bottom navigation bar on mobile.
- [ ] **PIL-03**: **Explore Destinations Experience** — Curated guide to Rajamahendravaram & Kovvur ghats and temples showing crowd level, wait estimate, accessibility rating, shuttle connectivity, active authority advisories, and one-click *"Plan Journey Here"*.
- [ ] **PIL-04**: **5-Step Guided Journey Planner** — Interactive stepper:
  - Step 1: Select starting location
  - Step 2: Select destination (ghat/temple)
  - Step 3: Select travel mode (Car + Shuttle, Direct Public Transit, Walking/Drop-off, Accessibility Priority)
  - Step 4: Set family/group & accessibility preferences (Senior Citizens, Wheelchair, Young Children, Avoid Crowds, Minimal Walking)
  - Step 5: Side-by-side route comparison cards + interactive route map showing duration, walking distance, traffic condition, crowd level, parking recommendation, shuttle option, and explicit reason for recommendation. Dynamically reflects Command Centre road closures and diversions.
- [ ] **PIL-05**: **Map-First Parking Experience** — Interactive map + list toggle displaying each parking hub's Name, Available Capacity, Occupancy %, Distance to Destination, Traffic Condition, Walking Distance, Linked Shuttle Route, and Recommendation Badge.
- [ ] **PIL-06**: **Map-First Shuttle Experience** — Interactive map + list toggle displaying each shuttle corridor's Route Name, Pickup Point, Destination Ghat, Estimated Arrival (ETA), Occupancy Level, Available Capacity, and Wheelchair/Senior Priority status.
- [ ] **PIL-07**: **AI Travel Assistant (Concierge Interface)** — Conversational travel concierge supporting English, Telugu, and Hindi with suggested questions, natural language input, live state-grounded destination/parking/shuttle recommendations, interactive map-linked response cards, loading states, and conversation history. Powered by the independent Local Domain AI Engine by default (and never exposing private keys on the client).
- [ ] **PIL-08**: **Safety, Emergency & Accessibility Hub** — Quick access to emergency helplines, medical camp locations, lost-and-found desks, drinking water/sanitation points, and wheelchair/elderly assistance request guidance.

---

### Category E: Authority Command Centre — Desktop-First Operations Platform (`CMD`)

- [ ] **CMD-01**: **Demo-Labeled Authority Role Switcher & Access Screen** — Professional Authority Sign-In / Role Switcher (`Traffic Police Commander`, `Event Authority Director`, `Emergency Response Coordinator`) with explicit **Demo Role Access — Not Production Authentication** labeling.
- [ ] **CMD-02**: **Structured 8-Part Operational Layout** — (1) Collapsible left navigation, (2) Top command header, (3) Event/Simulation mode indicator, (4) Global search across ghats/roads/incidents/teams, (5) Notifications & critical alerts drawer, (6) Authority profile & role switcher, (7) Central operational workspace, and (8) Context-sensitive right-side inspection panel.
- [ ] **CMD-03**: **Command Overview Dashboard** — Balanced KPI strip (Traffic Congestion Index, Total Monitored Vehicle Count, Parking Availability, Shuttle Fleet Status, Crowd Density, Active Incidents, Critical Alerts, Predictive Risk Indicators) above the large interactive mobility map, recent alerts feed, AI-generated situation summary, and recommended authority actions.
- [ ] **CMD-04**: **Full-Workspace Operational Map & Corridor Controls** — Central tactical map supporting all 7 layers, interactive marker/road selection, and direct operator controls to toggle road closures/diversions, update parking status, or adjust shuttle dispatches (with immediate sync to the Pilgrim Portal).
- [ ] **CMD-05**: **AI Decision Centre** — Actionable operational intelligence cards containing Severity, Affected Location, Detected Condition, Predicted Consequences, Recommended Action, Reasoning, Expected Impact, and **Approve**, **Reject**, and **Simulate** actions with confirmation dialogs for consequential operations. Approving an action mutates the shared operational state and broadcasts to the Pilgrim Portal.
- [ ] **CMD-06**: **Incident Management Workflow** — Complete lifecycle workflow (`New` → `Assigned` → `Responding` → `Resolved` → `Closed`) with incident creation modal, priority, category, location link, assigned response team, status transitions, timestamped audit timeline, operator notes, and resolution summary.
- [ ] **CMD-07**: **Police & Response Team Management** — Searchable/filterable roster displaying Team Identifier, Assigned Location, Team Leader, Current Assignment, Task Status, and Linked Incident, clearly labeled as *Simulated Assignments* with dispatch/reassignment controls.
- [ ] **CMD-08**: **Interactive Digital Twin Simulator** — Scenario selection (e.g., *Pushkar Ghat Muhurtham Surge*, *Road-cum-Rail Bridge Bottleneck*, *Morampudi Parking Overflow*, *Heavy Rain Emergency Dispersal*) + adjustable simulation sliders (inflow multiplier, shuttle frequency, road closure toggles, parking diversion %), side-by-side Baseline vs. Intervention comparison, map-based delta visualization, before/after Recharts comparisons, predicted consequences, optional *"Apply Intervention to Active Demo State"*, and *"Reset Scenario"* control.

---

### Category F: Quality Assurance & Security Guardrails (`QA`)

- [x] **QA-01**: **Zero Client Secret Exposure** — Private API keys (such as Gemini API keys) must never be embedded in frontend code or `VITE_*` variables. Any optional external LLM integration must target a server-side proxy endpoint contract (`/api/ai/*`) while the Local Domain AI Engine operates 100% independently.
- [ ] **QA-02**: **12-Point Master UX Verification & Automated Test Suite** — Pass all 12 UX Quality Assurance checks from `UI-UX-SPEC.md` Section 7 plus automated Vitest unit/integration tests for routing, simulation math, and cross-tab sync.

---

## 2. MVP (v1) vs. Future Production Features (v2+)

| Capability | MVP Scope (v1 — This Build) | Future Production Scope (v2+ Roadmap) |
| :--- | :--- | :--- |
| **Data & State Engine** | Canonical Rajamahendravaram–Kovvur dataset persisted in `localStorage` + real-time multi-tab `BroadcastChannel` sync + one-click baseline reset. | PostgreSQL + PostGIS spatial database, Redis pub/sub, and WebSocket/SSE real-time streaming backend implementing `IMobilityRepository`. |
| **Maps & Geolocation** | Leaflet (CartoDB Light/Dark tiles) + full **Offline Interactive SVG Riverfront Map Engine** with all 7 layers, markers, heatmaps, and routes. | Live GPS vehicle transponders (AIS-140) on APSRTC shuttles, ANPR camera feeds at NH-16 toll/parking gates, and drone crowd-counting feeds. |
| **AI Intelligence** | Independent Local Deterministic Domain AI Engine (EN/TE/HI) + documented Backend Proxy Adapter contract (`/api/ai/*`). | Managed backend microservice calling Vertex AI / Gemini API with server-side secret storage, rate limiting, and RAG over live police SOP manuals. |
| **Authentication & RBAC** | One-click **Demo Role Switcher** (*Traffic Police*, *Event Authority*, *Emergency Coordinator*) explicitly badged as *Demo Role Access Only*. | Production OAuth2 / OIDC SSO integrated with AP Police / District Administration identity provider, hardware MFA, and signed audit logs. |
| **Communications** | In-app cross-portal real-time alerts, advisories, and visual notifications across open tabs. | SMS / WhatsApp gateway alerts, public address (PA) system integration at ghats, and VHF police radio dispatch bridge. |

---

## 3. Traceability Matrix

| Requirement IDs | Target Phase | Status |
| :--- | :--- | :--- |
| `FOUND-01` to `FOUND-08`, `A11Y-01`, `A11Y-02`, `QA-01` | **Phase 1:** Foundation, Dual Design System, Canonical Store & Cross-Tab Sync | Pending |
| `MAP-01`, `MAP-02`, `MAP-03` | **Phase 2:** Dual-Theme Map Engine & Offline SVG Riverfront Canvas | Pending |
| `PIL-01` to `PIL-08` | **Phase 3:** Pilgrim Portal — Mobile-First Travel & Mobility Experience | Pending |
| `CMD-01` to `CMD-08` | **Phase 4:** Authority Command Centre & Digital Twin Simulator | Pending |
| `A11Y-03`, `QA-02` | **Phase 5:** Cross-Portal Integration, Responsive Polish & 12-Point UX Audit | Pending |

