# GODAVARI FLOW AI — Pushkaram Mobility & Command Platform

**GODAVARI FLOW AI** is a dual-portal smart mobility, pilgrim guidance, and real-time event command platform built for **Godavari Pushkaralu** along the **Rajamahendravaram (Rajahmundry) & Kovvur Corridor**.

---

## Key Highlights

- **Single-Command Startup (`npm run dev`):** Runs completely out-of-the-box with zero external database or backend setup required.
- **Two Connected Portals Sharing One Canonical State:**
  1. **Pilgrim Portal (`/`)** — Mobile-first, high-contrast, accessible travel companion featuring a 13-section homepage, Explore Godavari destinations, a 5-Step Guided Journey Planner with side-by-side route comparisons, Map-First Parking & Shuttle discovery, a Trilingual AI Travel Concierge (**English**, **Telugu / తెలుగు**, **Hindi / हिन्दी**), and Safety/Accessibility modes.
  2. **Authority Command Centre (`/command`)** — Dark-mode operational control room featuring a Demo Role Switcher, Command Overview KPIs, 7-Layer Operational Map Workspace, AI Decision Centre, Incident Lifecycle Management (`NEW` → `ASSIGNED` → `RESPONDING` → `RESOLVED` → `CLOSED`), Police Team Deployment, and a Digital Twin Simulator.
- **Instant Two-Window Synchronization:** Changes made in the Authority Command Centre (road closures, parking occupancy, shuttle availability, ghat crowd levels, and incidents) immediately synchronize across browser tabs/windows via `BroadcastChannel` + `localStorage` with monotonic `stateRevision` conflict resolution.
- **Online Leaflet + Offline Interactive SVG Riverfront Schematic Map:** Automatically falls back to a 7-layer interactive SVG schematic map if internet or map tiles are unavailable.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open Both Portals Side-by-Side
- **Pilgrim Portal:** `http://localhost:5173/`
- **Authority Command Centre:** `http://localhost:5173/command`

---

## Verification & Quality Scripts

- **TypeScript Type Check:** `npm run typecheck`
- **Automated Test Suite (Vitest):** `npm test`
- **ESLint Code Check:** `npm run lint`
- **Production Build:** `npm run build`
