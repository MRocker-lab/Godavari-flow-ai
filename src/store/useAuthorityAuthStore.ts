import { create } from 'zustand';
import { AUTHORITY_ROLE_PROFILES } from '@/data/baselineState';
import { AuthorityRoleId, AuthorityRoleProfile } from '@/types';

const ROLE_STORAGE_KEY = 'godavari_flow_demo_role_v1';

interface AuthorityAuthState {
  /**
   * Explicitly labeled Demo Role Access (CMD-01).
   * Not production authentication or authorization.
   */
  activeRoleId: AuthorityRoleId;
  hasConfirmedDemoAccess: boolean;
  selectDemoRole: (roleId: AuthorityRoleId) => void;
  lockDemoSession: () => void;
  getActiveRoleProfile: () => AuthorityRoleProfile;
}

function loadInitialRole(): { activeRoleId: AuthorityRoleId; hasConfirmedDemoAccess: boolean } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ROLE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.activeRoleId) {
          return parsed;
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    activeRoleId: 'TRAFFIC_POLICE_COMMANDER',
    hasConfirmedDemoAccess: false,
  };
}

const initialRoleState = loadInitialRole();

export const useAuthorityAuthStore = create<AuthorityAuthState>((set, get) => ({
  activeRoleId: initialRoleState.activeRoleId,
  hasConfirmedDemoAccess: initialRoleState.hasConfirmedDemoAccess,

  selectDemoRole: (roleId) => {
    const next = { activeRoleId: roleId, hasConfirmedDemoAccess: true };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // Ignore storage errors
    }
    set(next);
  },

  lockDemoSession: () => {
    const next = { activeRoleId: get().activeRoleId, hasConfirmedDemoAccess: false };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // Ignore storage errors
    }
    set(next);
  },

  getActiveRoleProfile: () => {
    const id = get().activeRoleId;
    return (
      AUTHORITY_ROLE_PROFILES.find((r) => r.id === id) || AUTHORITY_ROLE_PROFILES[0]
    );
  },
}));

