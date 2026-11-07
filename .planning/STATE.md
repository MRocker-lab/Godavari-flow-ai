# Project State — GODAVARI FLOW AI

## Current Reference
- **Project:** GODAVARI FLOW AI (Rajamahendravaram & Kovvur Corridor)
- **Core Spec:** `.planning/UI-UX-SPEC.md`
- **Architecture & Stack:** `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`
- **Requirements:** `.planning/REQUIREMENTS.md`
- **Roadmap:** `.planning/ROADMAP.md`

## Current Position
- **Current Stage:** Phase 1 Verified & Complete (`11/11` tests passing, `0` TS errors, `0` lint warnings, production build verified)
- **Current Phase:** Phase 1 Complete → Ready for Phase 2
- **Next Phase Ready:** Phase 2 — Unified Mapping Engine & Offline Interactive SVG Riverfront

## Locked Architectural & Security Guardrails
1. **Single-Command Startup:** `npm run dev` with zero external database or backend required.
2. **Gemini API Security:** Never expose private API keys via `VITE_*` or client code; Local Domain AI Engine works 100% independently; any live LLM integration uses a server-side proxy contract (`/api/ai/*`).
3. **Offline Map Reliability:** Interactive SVG Riverfront Map works 100% without internet (including markers, 7 layers, heatmaps, road closures, and routes) alongside Leaflet tiles.
4. **Resilient Cross-Tab Sync:** `BroadcastChannel` + monotonic revision conflict resolution + `window.onstorage` fallback + confirmation-gated **Reset Demo Data to Baseline**.
5. **Explicit Demo Labeling:** All simulated telemetry, AI outputs, and role-based access (`Demo Role Access — Not Production Authentication`) are transparently labeled.
