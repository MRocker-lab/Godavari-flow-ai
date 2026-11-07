import React from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Bot,
  Bus,
  Compass,
  Home,
  Navigation,
  ParkingSquare,
  PhoneCall,
  ShieldCheck,
  SlidersHorizontal,
  Waves,
} from 'lucide-react';
import { AccessibilityBar, CrossTabSyncBanner, SimulationBadge } from '@/components/design-system';
import { useTranslation } from '@/i18n/useTranslation';
import { useMobilityStore } from '@/store/useMobilityStore';

export const PilgrimLayout: React.FC = () => {
  const { ui, language } = useTranslation();
  const location = useLocation();
  const revision = useMobilityStore((s) => s.state.metadata.stateRevision);

  const navItems = [
    {
      to: '/',
      label: ui('navHome'),
      icon: <Home className="w-4 h-4" aria-hidden="true" />,
      exact: true,
    },
    {
      to: '/explore',
      label: ui('navExplore'),
      icon: <Compass className="w-4 h-4" aria-hidden="true" />,
    },
    {
      to: '/journey-planner',
      label: ui('navPlanJourney'),
      icon: <Navigation className="w-4 h-4" aria-hidden="true" />,
    },
    {
      to: '/parking',
      label: ui('navParking'),
      icon: <ParkingSquare className="w-4 h-4" aria-hidden="true" />,
    },
    {
      to: '/shuttles',
      label: ui('navShuttles'),
      icon: <Bus className="w-4 h-4" aria-hidden="true" />,
    },
    {
      to: '/assistant',
      label: ui('navAIAssistant'),
      icon: <Bot className="w-4 h-4" aria-hidden="true" />,
    },
    {
      to: '/safety',
      label: ui('navSafety'),
      icon: <ShieldCheck className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  return (
    <div
      data-portal="pilgrim"
      data-testid="pilgrim-portal-shell"
      className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0F172A] pb-20 lg:pb-0"
    >
      <CrossTabSyncBanner portal="pilgrim" />

      {/* Top Emergency & Simulation Transparency Strip */}
      <div className="bg-[#0F172A] text-slate-200 border-b border-slate-800 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-300">
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {language === 'te'
                  ? 'పుష్కర హెల్ప్‌లైన్: 1902 | పోలీస్: 112 | అంబులెన్స్: 108'
                  : language === 'hi'
                  ? 'पुष्करालु हेल्पलाइन: 1902 | पुलिस: 112 | एम्बुलेंस: 108'
                  : 'Pushkaralu Helpline: 1902 | Police: 112 | Ambulance: 108'}
              </span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              {ui('simulatedNoticeShort')} (Rev #{revision})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/command"
              data-testid="switch-to-command-link"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
              <span>{ui('switchToCommandCentre')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 1, 2, 3, 4: Premium Navigation Header */}
      <header
        data-testid="pilgrim-header"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5DFD5] shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#0D9488] flex items-center justify-center text-white shadow-sm">
              <Waves className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-[#1E3A8A]">
                  GODAVARI FLOW AI
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                  Pushkaralu
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                {ui('brandSubtitlePilgrim')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Pilgrim Portal Primary Navigation"
            className="hidden lg:flex items-center gap-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-[#F3EFEA] hover:text-[#1E3A8A]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Prominent Language Selector, Senior Citizen Mode & Reset Control */}
          <AccessibilityBar portal="pilgrim" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Section 13: Well-Designed Footer */}
      <footer
        data-testid="pilgrim-footer"
        className="bg-white border-t border-[#E5DFD5] mt-16 py-10 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white">
                <Waves className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-[#1E3A8A]">
                GODAVARI FLOW AI
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              {language === 'te'
                ? 'రాజమహేంద్రవరం మరియు కొవ్వూరు గోదావరి పుష్కరాల భక్తుల సౌకర్యార్థం రూపొందించబడిన స్మార్ట్ మొబిలిటీ, ట్రాఫిక్ & ప్రయాణ మార్గదర్శక ప్లాట్‌ఫారమ్.'
                : language === 'hi'
                ? 'राजमहेंद्रवरम और कोव्वुर गोदावरी पुष्करालु श्रद्धालुओं के लिए स्मार्ट गतिशीलता, पार्किंग, शटल और यात्रा सहायता मंच।'
                : 'Intelligent pilgrim mobility, accessible route planning, satellite parking, and riverfront crowd guidance platform for Godavari Pushkaralu across Rajamahendravaram & Kovvur.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <SimulationBadge source="SIMULATED_BASELINE" portal="pilgrim" />
              <SimulationBadge source="LOCAL_DOMAIN_AI" portal="pilgrim" compact />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {language === 'te'
                ? 'ప్రయాణ సేవలు'
                : language === 'hi'
                ? 'यात्रा सेवाएं'
                : 'Pilgrim Mobility'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li>
                <Link to="/explore" className="hover:text-[#1E3A8A]">
                  {ui('navExplore')} (8 Ghats)
                </Link>
              </li>
              <li>
                <Link to="/journey-planner" className="hover:text-[#1E3A8A]">
                  5-Step {ui('navPlanJourney')}
                </Link>
              </li>
              <li>
                <Link to="/parking" className="hover:text-[#1E3A8A]">
                  Satellite {ui('navParking')} (8 Hubs)
                </Link>
              </li>
              <li>
                <Link to="/shuttles" className="hover:text-[#1E3A8A]">
                  APSRTC Express {ui('navShuttles')} (S1–S6)
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-[#1E3A8A]">
                  Trilingual {ui('navAIAssistant')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {language === 'te'
                ? 'అత్యవసర & వృద్ధుల సహాయం'
                : language === 'hi'
                ? 'आपातकालीन एवं वरिष्ठ सहायता'
                : 'Emergency & Accessibility'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
              <li>Pushkaralu Control Room: 1902</li>
              <li>Police Emergency: 112 | Ambulance: 108</li>
              <li>
                <Link to="/safety" className="text-[#0D9488] font-bold hover:underline">
                  Request Senior / Wheelchair Buggy Escort →
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  to="/command"
                  className="text-[#1E3A8A] font-bold hover:underline"
                >
                  Open Authority Command Centre →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Mobile Touch-Friendly Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="pilgrim-mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-[#E5DFD5] shadow-lg px-2 py-1.5"
      >
        <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto">
          {[
            { to: '/', label: ui('navHome'), icon: <Home className="w-4 h-4" /> },
            {
              to: '/explore',
              label: ui('navExplore'),
              icon: <Compass className="w-4 h-4" />,
            },
            {
              to: '/journey-planner',
              label: language === 'en' ? 'Plan' : ui('navPlanJourney'),
              icon: <Navigation className="w-4 h-4" />,
            },
            {
              to: '/parking',
              label: ui('navParking'),
              icon: <ParkingSquare className="w-4 h-4" />,
            },
            {
              to: '/shuttles',
              label: ui('navShuttles'),
              icon: <Bus className="w-4 h-4" />,
            },
            {
              to: '/assistant',
              label: 'AI',
              icon: <Bot className="w-4 h-4" />,
            },
          ].map((item) => {
            const active =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`min-h-[46px] flex flex-col items-center justify-center rounded-xl px-1 py-1 text-[10px] font-bold transition-colors ${
                  active
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-slate-600 hover:bg-[#F3EFEA]'
                }`}
              >
                {item.icon}
                <span className="truncate max-w-full mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

