# Complete Application Architecture — GODAVARI FLOW AI

## 1. Architectural Overview & Core Safeguards

1. **Dual-Portal Isolation at the Presentation Layer, Unity at the Domain Layer:**
   - The **Pilgrim Portal** and **Authority Command Centre** have completely separate layout shells, navigation trees, CSS token scopes, and component variants so they never look like the same dashboard template.
   - Underneath, both portals bind to the **exact same canonical mobility store** (`useMobilityStore`) through clean TypeScript Service and Repository interfaces.
2. **Adapter Pattern for Future Production Readiness:**
   - UI components never call `localStorage` or `BroadcastChannel` directly.
   - All reads and mutations flow through `MobilityService`, `JourneyPlannerService`, `AIDecisionService`, and `DigitalTwinService`, which talk to `IMobilityRepository`.
3. **Four Mandatory Architectural Corrections Locked In:**
   - **Gemini API Security:** Private Gemini API keys are **never** placed in `VITE_` environment variables or client-side code. The **Local Domain AI Engine** operates independently in the browser; optional live Gemini integration is strictly isolated behind a server-side proxy contract (`/api/ai/concierge`, `/api/ai/decisions`) marked as *Backend Proxy Integration*.
   - **Offline-Ready Interactive SVG Riverfront Map:** Alongside Leaflet + CartoDB tiles, `InteractiveRiverfrontSvgMap.tsx` provides a complete interactive coordinate-mapped vector canvas of Rajamahendravaram & Kovvur (Godavari River, bridges, 8 ghats, 8 parking hubs, 6 shuttle routes, 10 road segments, crowd heatmaps, incident pins, and route polylines) that works 100% offline or when map tiles are unreachable.
   - **Resilient Cross-Tab Synchronization:** Uses `BroadcastChannel('godavari_flow_sync_v1')` + monotonic `stateRevision` & timestamp conflict resolution + `window.onstorage` fallback, without assuming or guaranteeing fixed synchronization latency.
   - **Explicit Demo-Only Role Access Labeling:** Authority role selection (`Traffic Police Commander`, `Event Authority Director`, `Emergency Response Coordinator`) is explicitly labeled as **Demo Role Switcher — Simulated Access Only (Not Production Authentication/Authorization)** across the sign-in screen and command header.
