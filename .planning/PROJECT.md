# GODAVARI FLOW AI

## What This Is

**GODAVARI FLOW AI** is a production-grade, dual-experience intelligent pilgrim mobility, traffic, and event-management platform built for **Godavari Pushkaralu** along the **Rajamahendravaram (Rajahmundry) & Kovvur Corridor**.

Under a single unified brand and shared real-time operational state, it delivers two distinct, purpose-built software experiences:
1. **Pilgrim Portal (Mobile-First):** A warm, calm, welcoming travel and mobility application enabling pilgrims to explore ghats and temples, plan multi-modal accessibility-aware journeys, find parking and shuttle services on interactive maps, check crowd conditions, consult a multilingual AI Travel Concierge, and access emergency and senior-citizen services.
2. **Authority Command Centre (Desktop-First):** A high-contrast, dark-mode urban mobility control room for Traffic Police Commanders, Event Authority Directors, and Emergency Response Coordinators to monitor 7-layer operational maps, review and act on AI Decision Centre recommendations, manage incident lifecycles and police response teams, and run interactive before/after Digital Twin simulations.

## Core Value

**Unified, honest operational intelligence that connects authority decisions directly to pilgrim guidance in real time—without compromising visual design, usability, accessibility, or data transparency.**

## Geographic & Domain Scope

- **Primary Corridor:** Rajamahendravaram (Rajahmundry) & Kovvur Godavari Riverfront Corridor.
- **Key Ghats & Landmarks:** Pushkar Ghat, Kotilingala Ghat, Gautami Ghat, Saraswati Ghat, Padmavathi Ghat, Kovvur Gospada Ghat, Dowleswaram Cotton Barrage, Sri Veerabhadra Swamy Temple (Pattiseema corridor entry), ISKCON Rajahmundry.
- **Transport Hubs & Corridors:** Rajahmundry Railway Station, Godavari Railway Station, Gokavaram & Kotipalli RTC Bus Complexes, Rajahmundry Airport (Madhurapudi), NH-16 Outer Ring Satellite Parking Zones (Morampudi, Lalacheruvu, Diwan Cheruvu, Kovvur Toll Plaza), Godavari Arch Bridge / Road-cum-Rail Bridge corridors.

## Non-Negotiable Principles

1. **Uncompromising UI/UX Quality:** Must look and feel like a commercial mobility platform—never a generic admin template or AI-generated boilerplate.
2. **Distinct Visual Identities:**
   - *Pilgrim Portal:* Warm ivory (`#FAF8F5`) & clean white surfaces, deep royal blue (`#1E3A8A`) primary actions, river cyan/teal (`#0D9488` / `#0891B2`), subtle saffron (`#D97706`) accents, dark navy (`#0F172A`) text.
   - *Authority Command Centre:* Deep midnight navy (`#070D19`), graphite/dark slate (`#0F172A` / `#1E293B`) panels, controlled cyan (`#06B6D4`) accents, semantic red/amber/green operational status indicators.
3. **Single Command Execution (`npm run dev`):** Zero external database or hardware setup required for demonstration.
4. **Centralized Shared State & Multi-Tab Live Sync:** Both portals read and mutate the same canonical mobility dataset via a clean Service/Repository Adapter layer, persisted locally (`localStorage` with versioning & fallback) and synchronized across open browser tabs/windows in real time via `BroadcastChannel`.
5. **Strict Data Honesty:** All simulated telemetry, AI predictions, role presets, and unavailable external hardware/sensor integrations are explicitly and transparently badged; never misrepresent simulated state as live sensor feeds.
6. **Multilingual & Accessible by Design:** Complete support for **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** without layout breakage, plus Senior Citizen Mode, high contrast, large touch targets, keyboard navigation, and `prefers-reduced-motion` support.

## Target Users & Roles

### Pilgrim Portal (Public Access)
- **First-Time Pilgrims & Families:** Need step-by-step journey comparisons, crowd clarity, and shuttle/parking guidance.
- **Senior Citizens & Differently-Abled Visitors:** Need minimum walking distance routes, wheelchair/elderly shuttle prioritization, medical/emergency proximity, and one-toggle Senior Citizen Mode (larger typography, higher contrast, simplified controls).
- **Non-English Speakers:** Native Telugu and Hindi speakers requiring clear script rendering and localized travel concierge guidance.

### Authority Command Centre (Simulated Role-Based Access)
- **Traffic Police Commander:** Monitors congestion indices, road closures, parking saturation, and traffic diversions.
- **Event Authority Director:** Monitors ghat crowd density, shuttle fleet utilization, and cross-corridor mobility balance.
- **Emergency Response Coordinator:** Manages active incidents (`New` → `Assigned` → `Responding` → `Resolved` → `Closed`), dispatches police/response teams, and maintains emergency corridor clearance.

## Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Geographic Focus | Rajamahendravaram & Kovvur Corridor | Enables realistic street-, bridge-, parking-, and ghat-level routing and Digital Twin interventions |
| Cross-Portal State | Shared state + `BroadcastChannel` + `localStorage` | Allows side-by-side live demo where Command Centre actions immediately update Pilgrim Portal |
| Backend Strategy | Client-first with Service/Repository Adapter interfaces | Runs via `npm run dev` with zero infrastructure friction while remaining ready for REST/WebSocket backends |
| AI Architecture | Hybrid AI Adapter (Deterministic Domain Engine + Optional Gemini API) | Guarantees 100% reliability offline/without keys while supporting live LLM generation when configured |
| Portal Access | Public Pilgrim Portal + Role-Based Authority Sign-In + Reset Control | Frictionless visitor UX combined with realistic role-contextualized authority operations |

