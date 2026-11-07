import {
  CanonicalMobilityState,
  createBaselineMobilityState,
  CURRENT_SCHEMA_VERSION,
} from '@/data/baselineState';

export const STORAGE_KEY = 'godavari_flow_canonical_state_v1';

export class LocalStorageAdapter {
  private memoryFallback: CanonicalMobilityState | null = null;
  private usingMemoryFallback = false;

  public load(tabId = 'local-tab'): CanonicalMobilityState {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.usingMemoryFallback = true;
        if (!this.memoryFallback) {
          this.memoryFallback = createBaselineMobilityState(tabId);
        }
        return JSON.parse(JSON.stringify(this.memoryFallback));
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const baseline = createBaselineMobilityState(tabId);
        this.save(baseline);
        return baseline;
      }

      const parsed = JSON.parse(raw) as CanonicalMobilityState;
      if (
        !parsed ||
        !parsed.metadata ||
        parsed.metadata.schemaVersion !== CURRENT_SCHEMA_VERSION ||
        !Array.isArray(parsed.ghats) ||
        !Array.isArray(parsed.parkingHubs) ||
        !Array.isArray(parsed.shuttles) ||
        !Array.isArray(parsed.roads)
      ) {
        const baseline = createBaselineMobilityState(tabId);
        this.save(baseline);
        return baseline;
      }

      this.memoryFallback = parsed;
      return parsed;
    } catch {
      this.usingMemoryFallback = true;
      if (!this.memoryFallback) {
        this.memoryFallback = createBaselineMobilityState(tabId);
      }
      return JSON.parse(JSON.stringify(this.memoryFallback));
    }
  }

  public save(state: CanonicalMobilityState): void {
    this.memoryFallback = JSON.parse(JSON.stringify(state));
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        this.usingMemoryFallback = false;
      } else {
        this.usingMemoryFallback = true;
      }
    } catch {
      this.usingMemoryFallback = true;
    }
  }

  public clearAndReset(tabId: string): CanonicalMobilityState {
    const baseline = createBaselineMobilityState(tabId);
    this.save(baseline);
    return baseline;
  }

  public isMemoryFallback(): boolean {
    return this.usingMemoryFallback;
  }
}

