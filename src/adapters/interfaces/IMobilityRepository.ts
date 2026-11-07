import { CanonicalMobilityState } from '@/data/baselineState';

export type StateSyncListener = (incomingState: CanonicalMobilityState, sourceChannel: 'BROADCAST_CHANNEL' | 'STORAGE_EVENT') => void;

export interface IMobilityRepository {
  /** Load current canonical state from persistence or initialize baseline */
  loadState(): CanonicalMobilityState;
  /** Persist updated state and broadcast to other open browser tabs/windows */
  saveAndBroadcastState(nextState: CanonicalMobilityState): void;
  /** Restore canonical Rajamahendravaram–Kovvur baseline state and notify all tabs */
  resetToBaseline(tabId: string): CanonicalMobilityState;
  /** Subscribe to incoming cross-tab state updates */
  subscribeToExternalUpdates(listener: StateSyncListener): () => void;
  /** Returns true if browser storage was blocked/unavailable and memory fallback is active */
  isMemoryFallbackActive(): boolean;
}

