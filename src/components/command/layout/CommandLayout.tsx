import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Cpu,
  ExternalLink,
  Layers,
  Lock,
  Map,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  AccessibilityBar,
  Button,
  ConfirmResetModal,
  CrossTabSyncBanner,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { AUTHORITY_ROLE_PROFILES } from '@/data/baselineState';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { AuthorityRoleId } from '@/types';

export const CommandLayout: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const state = useMobilityStore((s) => s.state);
  const lastSyncChannel = useMobilityStore((s) => s.lastSyncChannel);
  const setRoadStatus = useMobilityStore((s) => s.setRoadStatus);
  const updateParkingOccupancy = useMobilityStore((s) => s.updateParkingOccupancy);
  const updateShuttleService = useMobilityStore((s) => s.updateShuttleService);
  const updateGhatCrowdLevel = useMobilityStore((s) => s.updateGhatCrowdLevel);
  const resetDemoDataToBaseline = useMobilityStore((s) => s.resetDemoDataToBaseline);

  const activeRoleId = useAuthorityAuthStore((s) => s.activeRoleId);
  const hasConfirmedDemoAccess = useAuthorityAuthStore((s) => s.hasConfirmedDemoAccess);
  const selectDemoRole = useAuthorityAuthStore((s) => s.selectDemoRole);
  const lockDemoSession = useAuthorityAuthStore((s) => s.lockDemoSession);
  const activeRoleProfile = useAuthorityAuthStore((s) => s.getActiveRoleProfile());

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const openIncidents = useMemo(
    () =>
      state.incidents.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
      ),
    [state.incidents]
  );

  const pendingRecommendations = useMemo(
    () =>
      state.aiRecommendations.filter((r) => r.decisionStatus === 'PENDING_REVIEW'),
    [state.aiRecommendations]
  );

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      id: string;
      category: string;
      label: string;
      sublabel: string;
      targetRoute: string;
    }> = [];

    for (const ghat of state.ghats) {
      if (
        ghat.name.en.toLowerCase().includes(q) ||
        ghat.code.toLowerCase().includes(q)
      ) {
        results.push({
          id: ghat.id,
          category: 'GHAT',
          label: `${ghat.code} — ${t(ghat.name)}`,
          sublabel: `Crowd: ${ghat.crowdLevel} (~${ghat.estimatedBathingWaitMinutes}m wait)`,
          targetRoute: '/command/map',
        });
      }
    }
    for (const road of state.roads) {
      if (
        road.name.en.toLowerCase().includes(q) ||
        road.code.toLowerCase().includes(q)
      ) {
        results.push({
          id: road.id,
          category: 'ROAD',
          label: `${road.code} — ${t(road.name)}`,
          sublabel: `Status: ${road.status} (${road.congestionIndex}/100)`,
          targetRoute: '/command/map',
        });
      }
    }
    for (const inc of state.incidents) {
      if (
        inc.title.en.toLowerCase().includes(q) ||
        inc.code.toLowerCase().includes(q)
      ) {
        results.push({
          id: inc.id,
          category: 'INCIDENT',
          label: `${inc.code} — ${t(inc.title)}`,
          sublabel: `${inc.priority} • ${inc.status}`,
          targetRoute: '/command/incidents',
        });
      }
    }
    for (const team of state.policeTeams) {
      if (
        team.teamIdentifier.toLowerCase().includes(q) ||
        team.teamLeader.toLowerCase().includes(q)
      ) {
        results.push({
          id: team.id,
          category: 'TEAM',
          label: `${team.teamIdentifier} (${team.teamLeader})`,
          sublabel: `${team.unitType} • ${team.status}`,
          targetRoute: '/command/teams',
        });
      }
    }
    return results.slice(0, 8);
  }, [globalSearch, state.ghats, state.roads, state.incidents, state.policeTeams, t]);

  const navLinks = [
    {
      to: '/command',
      exact: true,
      icon: <Activity className="w-4 h-4 shrink-0" />,
      label: {
        en: 'Command Overview',
        te: 'కమాండ్ ఓవర్‌వ్యూ',
        hi: 'कमांड अवलोकन',
      },
      badge: null,
    },
    {
      to: '/command/map',
      icon: <Map className="w-4 h-4 shrink-0" />,
      label: {
        en: '7-Layer Tactical Map',
        te: '7-లేయర్ టాక్టికల్ మ్యాప్',
        hi: '7-लेयर सामरिक मानचित्र',
      },
      badge: '7 Layers',
    },
    {
      to: '/command/ai-decisions',
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      label: {
        en: 'AI Decision Centre',
        te: 'AI డెసిషన్ సెంటర్',
        hi: 'AI निर्णय केंद्र',
      },
      badge:
        pendingRecommendations.length > 0
          ? String(pendingRecommendations.length)
          : null,
    },
    {
      to: '/command/incidents',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      label: {
        en: 'Incident Lifecycle',
        te: 'సంఘటనల నిర్వహణ',
        hi: 'घटना प्रबंधन',
      },
      badge: openIncidents.length > 0 ? String(openIncidents.length) : null,
    },
    {
      to: '/command/teams',
      icon: <Users className="w-4 h-4 shrink-0" />,
      label: {
        en: 'Police & NDRF Roster',
        te: 'పోలీస్ & NDRF బృందాలు',
        hi: 'पुलिस और NDRF टीमें',
      },
      badge: String(state.policeTeams.length),
    },
    {
      to: '/command/digital-twin',
      icon: <Cpu className="w-4 h-4 shrink-0" />,
      label: {
        en: 'Digital Twin Simulator',
        te: 'డిజిటల్ ట్విన్ సిమ్యులేటర్',
        hi: 'डिजिटल ट्विन सिम्युलेटर',
      },
      badge: 'Sim',
    },
  ];

  const pushkarRoad = state.roads.find((r) => r.id === 'road-pushkar-approach')!;
  const artsParking = state.parkingHubs.find((p) => p.id === 'park-arts-college')!;
  const s1Shuttle = state.shuttles.find((s) => s.id === 'shuttle-s1')!;
  const pushkarGhat = state.ghats.find((g) => g.id === 'ghat-pushkar')!;

  return (
    <div
      data-portal="command"
      data-testid="authority-command-shell"
      className="min-h-screen flex flex-col bg-[#070D19] text-slate-100"
    >
      <CrossTabSyncBanner portal="command" />

      {/* PART 3: Event / Simulation Mode & Demo Role Disclosure Top Strip */}
      <div
        data-testid="command-simulation-mode-strip"
        className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 font-mono font-bold text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {t({
                en: 'EVENT MODE: GODAVARI PUSHKARALU CORRIDOR OPERATIONS',
                te: 'ఈవెంట్ మోడ్: గోదావరి పుష్కర కారిడార్ కార్యకలాపాలు',
                hi: 'इवेंट मोड: गोदावरी पुष्करालु कॉरिडोर संचालन',
              })}
            </span>
          </span>
          <SimulationBadge source="SIMULATED_BASELINE" portal="command" compact />
          <SimulationBadge source="DEMO_ROLE_ACCESS" portal="command" compact />
          <span
            data-testid="command-sync-revision-pill"
            className="font-mono text-[11px] text-slate-400"
          >
            Rev #{state.metadata.stateRevision} ({lastSyncChannel})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            data-testid="command-to-pilgrim-link"
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-950/60 px-2.5 py-1 text-xs font-bold text-teal-300 hover:bg-teal-900/70"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {t({
                en: 'Switch to Pilgrim Portal',
                te: 'పిల్గ్రిమ్ పోర్టల్‌కు వెళ్లండి',
                hi: 'पिलग्रिम पोर्टल पर जाएँ',
              })}
            </span>
          </Link>

          <Button
            portal="command"
            variant="danger"
            size="sm"
            onClick={() => setResetModalOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            data-testid="command-reset-baseline-btn"
          >
            {t({
              en: 'Reset Demo Data to Baseline',
              te: 'డేటాను రీసెట్ చేయండి',
              hi: 'डेमो डेटा रीसेट करें',
            })}
          </Button>
        </div>
      </div>

      {/* PART 2, 4, 5, 6: Top Command Header + Global Search + Notifications + Authority Role Switcher */}
      <header
        data-testid="command-top-header"
        className="bg-[#0F172A] border-b border-slate-800 px-4 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                  GODAVARI FLOW AI
                </span>
                <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  COMMAND CENTRE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t({
                  en: 'Rajamahendravaram & Kovvur Urban Mobility & Crowd Control Room',
                  te: 'రాజమహేంద్రవరం & కొవ్వూరు ట్రాఫిక్ & రద్దీ నియంత్రణ కేంద్రం',
                  hi: 'राजमहेंद्रवरम और कोव्वूरु शहरी गतिशीलता एवं भीड़ नियंत्रण कक्ष',
                })}
              </p>
            </div>
          </div>

          {/* PART 4: Global Search Input */}
          <div className="relative flex-1 max-w-md min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t({
                en: 'Global Search: ghats, road codes, incidents, police units...',
                te: 'ఘాట్‌లు, రోడ్లు, సంఘటనలు, పోలీస్ బృందాలను వెతకండి...',
                hi: 'घाट, सड़कें, घटनाएँ, पुलिस इकाइयाँ खोजें...',
              })}
              data-testid="command-global-search-input"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-2 pl-10 pr-8 text-xs text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
            {globalSearch && (
              <button
                type="button"
                aria-label="Clear global search"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {searchResults.length > 0 && (
              <div
                data-testid="command-global-search-results"
                className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-slate-700 bg-[#0F172A] p-2 shadow-2xl space-y-1"
              >
                {searchResults.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      navigate(res.targetRoute);
                      setGlobalSearch('');
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-100">{res.label}</div>
                      <div className="text-[11px] text-slate-400">{res.sublabel}</div>
                    </div>
                    <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                      {res.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PART 5 & 6: Notifications Drawer Trigger + Authority Role Switcher + Accessibility */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Notifications / Critical Alerts Button */}
            <button
              type="button"
              onClick={() => setAlertsDrawerOpen(true)}
              data-testid="command-alerts-drawer-btn"
              className="relative inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-500/50"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>
                {t({ en: 'Alerts', te: 'అలర్ట్‌లు', hi: 'अलर्ट' })}
              </span>
              <span className="rounded-full bg-red-600 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-white">
                {openIncidents.length + pendingRecommendations.length}
              </span>
            </button>

            {/* PART 6: Authority Profile & Demo Role Switcher */}
            <div className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-900 px-2.5 py-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                aria-label="Authority Demo Role Switcher"
                value={activeRoleId}
                onChange={(e) => selectDemoRole(e.target.value as AuthorityRoleId)}
                data-testid="command-role-select"
                className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
              >
                {AUTHORITY_ROLE_PROFILES.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                    className="bg-slate-900 text-slate-100"
                  >
                    {role.badgeCode}: {t(role.title)} (DEMO ROLE)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setRoleModalOpen(true)}
                data-testid="open-role-switcher-modal-btn"
                className="ml-1 rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/30"
              >
                {t({ en: 'Role Info', te: 'పాత్ర వివరాలు', hi: 'भूमिका विवरण' })}
              </button>
            </div>

            <AccessibilityBar portal="command" />
          </div>
        </div>
      </header>

      {/* CMD-01: Explicit Demo Role Access Banner / Gate if not yet confirmed or if Role Modal opened */}
      {(!hasConfirmedDemoAccess || roleModalOpen) && (
        <div
          data-testid="demo-role-access-panel"
          className="border-b border-amber-500/40 bg-slate-900/95 px-4 py-4"
        >
          <div className="mx-auto max-w-6xl rounded-2xl border border-cyan-500/40 bg-[#0F172A] p-5 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {t({
                      en: 'DEMO ROLE ACCESS ONLY — NOT PRODUCTION AUTHENTICATION OR AUTHORIZATION',
                      te: 'డెమో పాత్ర ప్రవేశం మాత్రమే — ప్రొడక్షన్ ఆథెంటికేషన్ కాదు',
                      hi: 'केवल डेमो भूमिका प्रवेश — प्रोडक्शन प्रमाणीकरण नहीं',
                    })}
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-extrabold text-white">
                  {t({
                    en: 'Select Simulated Command Centre Authority Role',
                    te: 'అథారిటీ కమాండ్ సెంటర్ పాత్రను ఎంచుకోండి (అనుకరణ)',
                    hi: 'सिम्युलेटेड कमांड सेंटर प्राधिकरण भूमिका चुनें',
                  })}
                </h2>
                <p className="mt-0.5 text-xs text-slate-300">
                  {t({
                    en: 'Switch between Traffic Police, Event Administration, and Emergency Response perspectives for demonstration. All mutations synchronize immediately with the Pilgrim Portal.',
                    te: 'ట్రాఫిక్ పోలీస్, ఈవెంట్ అడ్మినిస్ట్రేషన్ మరియు అత్యవసర ప్రతిస్పందన పాత్రల మధ్య మారండి. అన్ని మార్పులు పిల్గ్రిమ్ పోర్టల్‌తో తక్షణమే సింక్ అవుతాయి.',
                    hi: 'ट्रैफिक पुलिस, इवेंट प्रशासन और आपातकालीन समन्वयक भूमिकाओं के बीच स्विच करें। सभी परिवर्तन तुरंत पिलग्रिम पोर्टल के साथ सिंक होते हैं।',
                  })}
                </p>
              </div>
              {hasConfirmedDemoAccess && (
                <Button
                  portal="command"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoleModalOpen(false)}
                >
                  {t({ en: 'Close', te: 'మూసివేయి', hi: 'बंद करें' })}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {AUTHORITY_ROLE_PROFILES.map((profile) => {
                const isSelected = activeRoleId === profile.id;
                return (
                  <div
                    key={profile.id}
                    data-testid={`demo-role-card-${profile.id}`}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-cyan-400 bg-cyan-950/40'
                        : 'border-slate-700 bg-slate-900/80 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                          {profile.badgeCode}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-300">
                          Demo Role
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-sm font-bold text-white">
                        {t(profile.title)}
                      </h3>
                      <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                        {profile.operatorName} • {t(profile.department)}
                      </div>
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                        {t(profile.focusDescription)}
                      </p>
                    </div>

                    <Button
                      portal="command"
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      fullWidth
                      className="mt-4"
                      data-testid={`activate-demo-role-${profile.id}`}
                      onClick={() => {
                        selectDemoRole(profile.id);
                        setRoleModalOpen(false);
                      }}
                    >
                      {isSelected && hasConfirmedDemoAccess
                        ? t({ en: '✓ Active Demo Role', te: '✓ ప్రస్తుత పాత్ర', hi: '✓ सक्रिय डेमो भूमिका' })
                        : t({ en: 'Enter as This Demo Role', te: 'ఈ పాత్రలో ప్రవేశించండి', hi: 'इस डेमो भूमिका में प्रवेश करें' })}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main 3-Column Operational Body: Left Sidebar (Part 1) + Central Workspace (Part 7) + Right Inspection Panel (Part 8) */}
      <div className="flex-1 flex overflow-hidden">
        {/* PART 1: Collapsible Left Navigation Sidebar */}
        <aside
          data-testid="command-left-sidebar"
          className={`bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between transition-all duration-150 shrink-0 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3 space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1.5">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t({
                    en: 'Operational Modules',
                    te: 'ఆపరేషనల్ మాడ్యూల్స్',
                    hi: 'परिचालन मॉड्यूल',
                  })}
                </span>
              )}
              <button
                type="button"
                aria-label="Toggle Left Navigation Sidebar"
                onClick={() => setSidebarCollapsed((v) => !v)}
                data-testid="toggle-command-sidebar-btn"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            <nav aria-label="Authority Command Navigation" className="space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  data-testid={`cmd-nav-${item.to.replace('/command', 'root').replace('/', '-')}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label[language]}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="rounded-full bg-slate-900/90 px-2 py-0.5 font-mono text-[10px] font-extrabold text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Active Operator Role Footer in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-3 m-3 rounded-xl border border-slate-800 bg-slate-900/90 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-cyan-400">
                  {activeRoleProfile.badgeCode}
                </span>
                <button
                  type="button"
                  onClick={lockDemoSession}
                  className="text-[11px] text-amber-300 hover:underline"
                >
                  {t({ en: 'Switch Role', te: 'పాత్ర మార్చండి', hi: 'भूमिका बदलें' })}
                </button>
              </div>
              <div className="font-bold text-white truncate">
                {t(activeRoleProfile.title)}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {activeRoleProfile.operatorName}
              </div>
            </div>
          )}
        </aside>

        {/* PART 7: Central Operational Workspace */}
        <main
          data-testid="command-central-workspace"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6"
        >
          <Outlet />
        </main>

        {/* PART 8: Context-Sensitive Right-Side Inspection & Quick Override Panel */}
        <aside
          data-testid="command-right-inspection-panel"
          className={`bg-[#0F172A] border-l border-slate-800 transition-all duration-150 shrink-0 hidden xl:flex flex-col ${
            rightPanelOpen ? 'w-80' : 'w-12'
          }`}
        >
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            {rightPanelOpen && (
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {t({
                    en: 'Live Sync Quick Controls',
                    te: 'ప్రత్యక్ష నియంత్రణ ప్యానెల్',
                    hi: 'लाइव सिंक त्वरित नियंत्रण',
                  })}
                </span>
              </div>
            )}
            <button
              type="button"
              aria-label="Toggle Right Inspection Panel"
              onClick={() => setRightPanelOpen((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {rightPanelOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {rightPanelOpen && (
            <div className="p-4 space-y-4 overflow-y-auto text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="font-bold text-slate-200">
                  {t({
                    en: '1. Pushkar Approach Road (RD-03)',
                    te: '1. పుష్కర అప్రోచ్ రోడ్ (RD-03)',
                    hi: '1. पुष्कर एप्रोच रोड (RD-03)',
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator
                    level={pushkarRoad.status}
                    portal="command"
                    size="sm"
                  />
                  <span
                    data-testid="quick-road-status"
                    className="font-mono font-bold text-cyan-300"
                  >
                    {pushkarRoad.status}
                  </span>
                </div>
                <Button
                  portal="command"
                  variant={pushkarRoad.status === 'CLOSED' ? 'success' : 'danger'}
                  size="sm"
                  fullWidth
                  data-testid="quick-toggle-road-btn"
                  onClick={() =>
                    setRoadStatus(
                      'road-pushkar-approach',
                      pushkarRoad.status === 'CLOSED' ? 'CONGESTED' : 'CLOSED'
                    )
                  }
                >
                  {pushkarRoad.status === 'CLOSED'
                    ? t({
                        en: 'Reopen Road to Traffic',
                        te: 'రోడ్డును తిరిగి తెరవండి',
                        hi: 'सड़क यातायात हेतु खोलें',
                      })
                    : t({
                        en: 'Close Road & Divert Cars',
                        te: 'రోడ్డు మూసివేసి మళ్లించండి',
                        hi: 'सड़क बंद करें और डायवर्ट करें',
                      })}
                </Button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="font-bold text-slate-200">
                  {t({
                    en: '2. Arts College Parking (PK-03)',
                    te: '2. ఆర్ట్స్ కాలేజ్ పార్కింగ్ (PK-03)',
                    hi: '2. आर्ट्स कॉलेज पार्किंग (PK-03)',
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator
                    level={artsParking.status}
                    portal="command"
                    size="sm"
                  />
                  <span
                    data-testid="quick-parking-status"
                    className="font-mono font-bold text-cyan-300"
                  >
                    {artsParking.occupancyPercent}% ({artsParking.availableSpaces} free)
                  </span>
                </div>
                <Button
                  portal="command"
                  variant="secondary"
                  size="sm"
                  fullWidth
                  data-testid="quick-toggle-parking-btn"
                  onClick={() =>
                    updateParkingOccupancy(
                      'park-arts-college',
                      artsParking.occupancyPercent >= 96 ? 85 : 98,
                      artsParking.occupancyPercent >= 96 ? 'FILLING_FAST' : 'FULL'
                    )
                  }
                >
                  {artsParking.occupancyPercent >= 96
                    ? t({
                        en: 'Reopen Bays (Set 85%)',
                        te: 'పార్కింగ్ తెరవండి (85%)',
                        hi: 'पार्किंग खोलें (85%)',
                      })
                    : t({
                        en: 'Mark Lot Full (98%)',
                        te: 'పార్కింగ్ నిండింది (98%)',
                        hi: 'पार्किंग पूर्ण चिह्नित करें (98%)',
                      })}
                </Button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="font-bold text-slate-200">
                  {t({
                    en: '3. Shuttle S1 Express Fleet',
                    te: '3. షటిల్ S1 ఎక్స్‌ప్రెస్ బస్సులు',
                    hi: '3. शटल S1 एक्सप्रेस बेड़ा',
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator
                    level={s1Shuttle.status}
                    portal="command"
                    size="sm"
                  />
                  <span
                    data-testid="quick-shuttle-status"
                    className="font-mono font-bold text-cyan-300"
                  >
                    Every {s1Shuttle.frequencyMinutes}m ({s1Shuttle.activeBusesCount} buses)
                  </span>
                </div>
                <Button
                  portal="command"
                  variant="outline"
                  size="sm"
                  fullWidth
                  data-testid="quick-boost-shuttle-btn"
                  onClick={() =>
                    updateShuttleService(
                      'shuttle-s1',
                      s1Shuttle.frequencyMinutes === 2 ? 4 : 2,
                      s1Shuttle.activeBusesCount === 36 ? 28 : 36
                    )
                  }
                >
                  {s1Shuttle.frequencyMinutes === 2
                    ? t({
                        en: 'Restore Standard Fleet (4m)',
                        te: 'సాధారణ స్థాయికి మార్చండి (4 ని.)',
                        hi: 'मानक बेड़ा बहाल करें (4 मि.)',
                      })
                    : t({
                        en: 'Boost Fleet (+8 Buses, 2m)',
                        te: 'బస్సులను పెంచండి (+8 బస్సులు, 2 ని.)',
                        hi: 'बेड़ा बढ़ाएँ (+8 बसें, 2 मि.)',
                      })}
                </Button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                <div className="font-bold text-slate-200">
                  {t({
                    en: '4. Pushkar Ghat Crowd Density',
                    te: '4. పుష్కర ఘాట్ రద్దీ స్థాయి',
                    hi: '4. पुष्कर घाट भीड़ घनत्व',
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator
                    level={pushkarGhat.crowdLevel}
                    portal="command"
                    size="sm"
                  />
                  <span
                    data-testid="quick-crowd-status"
                    className="font-mono font-bold text-cyan-300"
                  >
                    {pushkarGhat.crowdLevel} ({pushkarGhat.estimatedBathingWaitMinutes}m)
                  </span>
                </div>
                <Button
                  portal="command"
                  variant="saffron"
                  size="sm"
                  fullWidth
                  data-testid="quick-toggle-crowd-btn"
                  onClick={() =>
                    updateGhatCrowdLevel(
                      'ghat-pushkar',
                      pushkarGhat.crowdLevel === 'CRITICAL' ? 'HIGH' : 'CRITICAL',
                      pushkarGhat.crowdLevel === 'CRITICAL' ? 42 : 65
                    )
                  }
                >
                  {pushkarGhat.crowdLevel === 'CRITICAL'
                    ? t({
                        en: 'Downgrade to High (42m)',
                        te: 'అధిక రద్దీకి తగ్గించండి (42 ని.)',
                        hi: 'उच्च स्तर पर लाएँ (42 मि.)',
                      })
                    : t({
                        en: 'Trigger Critical Surge (65m)',
                        te: 'క్రిటికల్ అలర్ట్ (65 ని.)',
                        hi: 'क्रिटिकल सर्ज ट्रिगर करें (65 मि.)',
                      })}
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* PART 5: Slide-Over Notifications & Critical Alerts Drawer */}
      {alertsDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Critical Alerts and Notifications Drawer"
          data-testid="command-alerts-drawer"
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-800 h-full flex flex-col justify-between p-5 text-slate-100 shadow-2xl">
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="font-display text-base font-extrabold">
                    {t({
                      en: 'Critical Corridor Alerts & AI Advisories',
                      te: 'ముఖ్య కారిడార్ అలర్ట్‌లు & AI సూచనలు',
                      hi: 'क्रिटिकल कॉरिडोर अलर्ट और AI सलाह',
                    })}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t({
                    en: `Open Operational Incidents (${openIncidents.length})`,
                    te: `చురుకైన సంఘటనలు (${openIncidents.length})`,
                    hi: `सक्रिय घटनाएँ (${openIncidents.length})`,
                  })}
                </div>
                {openIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-300">
                        {inc.code} • {inc.priority}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                        {inc.status}
                      </span>
                    </div>
                    <div className="font-bold text-white">{t(inc.title)}</div>
                    <p className="text-slate-400">{t(inc.description)}</p>
                    <Button
                      portal="command"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertsDrawerOpen(false);
                        navigate('/command/incidents');
                      }}
                    >
                      {t({
                        en: 'Manage Incident →',
                        te: 'సంఘటనను నిర్వహించండి →',
                        hi: 'घटना प्रबंधित करें →',
                      })}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t({
                    en: `Pending AI Recommendations (${pendingRecommendations.length})`,
                    te: `పెండింగ్ AI సిఫార్సులు (${pendingRecommendations.length})`,
                    hi: `लंबित AI सिफारिशें (${pendingRecommendations.length})`,
                  })}
                </div>
                {pendingRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs space-y-1.5"
                  >
                    <div className="font-mono font-bold text-cyan-300">
                      {rec.code} • {rec.severity}
                    </div>
                    <div className="font-bold text-white">
                      {t(rec.recommendedAction)}
                    </div>
                    <Button
                      portal="command"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setAlertsDrawerOpen(false);
                        navigate('/command/ai-decisions');
                      }}
                    >
                      {t({
                        en: 'Review in AI Decision Centre →',
                        te: 'AI డెసిషన్ సెంటర్‌లో చూడండి →',
                        hi: 'AI निर्णय केंद्र में देखें →',
                      })}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              portal="command"
              variant="secondary"
              fullWidth
              onClick={() => setAlertsDrawerOpen(false)}
            >
              {t({ en: 'Close Drawer', te: 'డ్రాయర్ మూసివేయి', hi: 'दराज बंद करें' })}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Resetting Demo Data to Baseline */}
      <ConfirmResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirm={() => {
          resetDemoDataToBaseline();
          setResetModalOpen(false);
        }}
        portal="command"
      />
    </div>
  );
};
