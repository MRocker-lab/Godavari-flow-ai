import { CanonicalMobilityState } from '@/data/baselineState';
import { IMobilityRepository, StateSyncListener } from '../interfaces/IMobilityRepository';
import { LocalStorageAdapter, STORAGE_KEY } from './LocalStorageAdapter';

export const BROADCAST_CHANNEL_NAME = 'godavari_flow_sync_v1';

export interface BroadcastSyncMessage {
  type: 'STATE_UPDATED' | 'BASELINE_RESET';
  state: CanonicalMobilityState;
}

/**
 * Determines whether an incoming cross-tab state snapshot should overwrite local state.
 * Uses monotonic stateRevision comparison with ISO timestamp tie-breaking, plus explicit baseline reset support.
 */
export function shouldAcceptIncomingState(
  currentState: CanonicalMobilityState,
  incomingState: CanonicalMobilityState,
  isBaselineReset = false
): boolean {
  if (!incomingState || !incomingState.metadata) return false;
  if (isBaselineReset) return true;

  const currentRev = currentState.metadata.stateRevision;
  const incomingRev = incomingState.metadata.stateRevision;

  if (incomingRev > currentRev) {
    return true;
  }
  if (incomingRev === currentRev) {
    return incomingState.metadata.lastUpdatedAt > currentState.metadata.lastUpdatedAt;
  }
  return false;
}

export class LocalMobilityRepository implements IMobilityRepository {
  private storageAdapter = new LocalStorageAdapter();
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<StateSyncListener>();
  private tabId: string;

  constructor(tabId?: string) {
    this.tabId = tabId || `tab-${Math.random().toString(36).substring(2, 9)}`;
    this.initBroadcastChannel();
  }

  public getTabId(): string {
    return this.tabId;
  }

  private initBroadcastChannel(): void {
    if (typeof window === 'undefined') return;

    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<BroadcastSyncMessage>) => {
          const payload = event.data;
          if (!payload || !payload.state) return;
          if (payload.state.metadata.lastUpdatedByTabId === this.tabId && payload.type !== 'BASELINE_RESET') {
            return;
          }
          this.listeners.forEach((listener) => listener(payload.state, 'BROADCAST_CHANNEL'));
        };
      } catch {
        this.channel = null;
      }
    }

    // Secondary fallback via native window storage event across browser tabs
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as CanonicalMobilityState;
          if (parsed && parsed.metadata && parsed.metadata.lastUpdatedByTabId !== this.tabId) {
            this.listeners.forEach((listener) => listener(parsed, 'STORAGE_EVENT'));
          }
        } catch {
          // Ignore malformed external storage payloads
        }
      }
    });
  }

  public loadState(): CanonicalMobilityState {
    return this.storageAdapter.load(this.tabId);
  }

  public saveAndBroadcastState(nextState: CanonicalMobilityState): void {
    this.storageAdapter.save(nextState);
    if (this.channel) {
      try {
        const message: BroadcastSyncMessage = {
          type: 'STATE_UPDATED',
          state: nextState,
        };
        this.channel.postMessage(message);
      } catch {
        // Storage event fallback handles sync if BroadcastChannel post fails
      }
    }
  }

  public resetToBaseline(tabId = this.tabId): CanonicalMobilityState {
    const freshBaseline = this.storageAdapter.clearAndReset(tabId);
    // Give reset a higher timestamp & broadcast explicit BASELINE_RESET
    if (this.channel) {
      try {
        const message: BroadcastSyncMessage = {
          type: 'BASELINE_RESET',
          state: freshBaseline,
        };
        this.channel.postMessage(message);
      } catch {
        // Ignore broadcast error
      }
    }
    return freshBaseline;
  }

  public subscribeToExternalUpdates(listener: StateSyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isMemoryFallbackActive(): boolean {
    return this.storageAdapter.isMemoryFallback();
  }
}

