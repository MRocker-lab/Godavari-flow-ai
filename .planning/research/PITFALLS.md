# Pitfalls & Quality Safeguards — GODAVARI FLOW AI

## 1. Visual Identity Bleed Between Portals
- **Pitfall:** Using the same dark cards in the Pilgrim Portal or the same light travel cards in the Command Centre, making both look like the same template.
- **Safeguard:** Enforce strict root theme containers (`PilgrimLayout` vs `CommandLayout`) with distinct typography, surface tokens, spacing density, and navigation patterns before building page views.

## 2. Misleading Simulated Data as Live Telemetry
- **Pitfall:** Displaying "LIVE CCTV FEED" or "REAL-TIME GPS SENSOR" without clarifying that the platform is running in software simulation mode.
- **Safeguard:** Every telemetry header, AI recommendation, role selector, and map legend includes an explicit, well-designed **Simulation / Data Provenance Badge** (`Simulated Baseline`, `Authority Override`, `Digital Twin Projection`, or `Hardware Integration Pending`).

## 3. Multilingual Layout Breakage (Telugu & Hindi)
- **Pitfall:** Telugu (`తెలుగు`) and Hindi (`हिन्दी`) strings often have 20–35% wider glyph widths or taller line heights than English, causing clipped buttons, overflowing mobile headers, or broken table cells.
- **Safeguard:** Load `Noto Sans Telugu` and `Noto Sans Devanagari`, set generous `line-height` (`1.6` for Indic scripts), avoid fixed-height single-line truncation on critical navigation/buttons, and test all 6 responsive breakpoints (`360px` to `1920px`) across all 3 languages.

## 4. Map Tile & Coordinate Mismatches
- **Pitfall:** Placing markers at random coordinates that appear in the middle of the river or far from Rajamahendravaram roads.
- **Safeguard:** Use verified GPS coordinates (`lat/lng`) for actual Rajamahendravaram & Kovvur ghats, bridges, railway stations, and road corridors.

## 5. Dead Buttons & Static Mockups
- **Pitfall:** Filtering controls, "Approve/Reject/Simulate" buttons, incident creation dialogs, or journey planner steps that don't actually compute or update state.
- **Safeguard:** Wire every button, filter, search box, layer toggle, and modal to the shared Zustand store and verify against the 12-point UX QA checklist in `UI-UX-SPEC.md`.

