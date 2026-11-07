import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Bot,
  Bus,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  MapPin,
  Navigation,
  ParkingSquare,
  PhoneCall,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  Button,
  Card,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/i18n/useTranslation';

export const PilgrimHomePage: React.FC = () => {
  const navigate = useNavigate();
  const state = useMobilityStore((s) => s.state);
  const seniorMode = useAccessibilityStore((s) => s.seniorCitizenMode);
  const toggleSeniorMode = useAccessibilityStore((s) => s.toggleSeniorCitizenMode);
  const { t, ui, language } = useTranslation();

  const [quickPrompt, setQuickPrompt] = useState('');
  const [showInlineMap, setShowInlineMap] = useState(false);

  const calmestGhat = [...state.ghats].sort(
    (a, b) => a.estimatedBathingWaitMinutes - b.estimatedBathingWaitMinutes
  )[0];

  const totalAvailableParkingSpaces = state.parkingHubs.reduce(
    (sum, hub) => sum + hub.availableSpaces,
    0
  );

  const totalActiveShuttleBuses = state.shuttles.reduce(
    (sum, sh) => sum + sh.activeBusesCount,
    0
  );

  const closedOrDivertedRoads = state.roads.filter(
    (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
  );

  const featuredGhats = state.ghats.slice(0, 4);

  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query =
      quickPrompt.trim() ||
      'Which ghat has the shortest wait time right now?';
    navigate(`/assistant?q=${encodeURIComponent(query)}`);
  };

  return (
    <div data-testid="pilgrim-home-page" className="space-y-12 pb-8">
      {/* SECTIONS 5, 6, 7: Godavari Riverfront Hero Visual + Headline + Primary Actions */}
      <section
        data-testid="home-hero-section"
        className="relative overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#1E3A8A] to-[#0F172A] text-white"
      >
        {/* Curated Riverfront Photography Backdrop with Warm Editorial Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1800&q=80")',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#1E3A8A]/85 to-[#0F172A]/75"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-200">
              <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span>
                {language === 'te'
                  ? 'పవిత్ర గోదావరి పుష్కరాలు • రాజమహేంద్రవరం & కొవ్వూరు కారిడార్'
                  : language === 'hi'
                  ? 'पवित्र गोदावरी पुष्करालु • राजमहेंद्रवरम और कोव्वुर कॉरिडोर'
                  : 'Sacred Godavari Pushkaralu • Rajamahendravaram & Kovvur Corridor'}
              </span>
            </div>

            {/* Section 6: Main Headline */}
            <h1
              data-testid="home-main-headline"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
            >
              {ui('heroHeadline')}
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
              {ui('heroSubheadline')}
            </p>

            {/* Section 7: Two Prominent Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                portal="pilgrim"
                variant="saffron"
                size="lg"
                data-testid="hero-cta-plan-journey"
                onClick={() => navigate('/journey-planner')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {ui('ctaPlanJourney')}
              </Button>
              <Button
                portal="pilgrim"
                variant="secondary"
                size="lg"
                data-testid="hero-cta-explore-destinations"
                onClick={() => navigate('/explore')}
                leftIcon={<Compass className="w-4 h-4" />}
              >
                {ui('ctaExploreDestinations')}
              </Button>
            </div>

            {/* Quick Highlights Strip */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-xl text-xs">
              <div>
                <div className="text-amber-300 font-extrabold text-base">
                  8 Sacred Ghats
                </div>
                <div className="text-slate-300">
                  {language === 'te'
                    ? 'లైవ్ క్యూ సమయాలు'
                    : language === 'hi'
                    ? 'लाइव प्रतीक्षा समय'
                    : 'Live Queue Wait Estimates'}
                </div>
              </div>
              <div>
                <div className="text-teal-300 font-extrabold text-base">
                  {totalAvailableParkingSpaces.toLocaleString()} Free Bays
                </div>
                <div className="text-slate-300">
                  {language === 'te'
                    ? '8 శాటిలైట్ పార్కింగ్ హబ్‌లు'
                    : language === 'hi'
                    ? '8 सैटेलाइट पार्किंग हब'
                    : 'Across 8 Satellite Hubs'}
                </div>
              </div>
              <div>
                <div className="text-cyan-300 font-extrabold text-base">
                  {totalActiveShuttleBuses} Express Buses
                </div>
                <div className="text-slate-300">
                  {language === 'te'
                    ? 'వీల్‌చైర్ & వృద్ధుల ప్రాధాన్యత'
                    : language === 'hi'
                    ? 'व्हीलचेयर व वरिष्ठ प्राथमिकता'
                    : 'Wheelchair & Senior Priority'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 Visual Card: Godavari Riverfront Hero Showcase + Section 8 AI Travel Assistant Entry Point */}
          <div className="lg:col-span-5">
            <div
              data-testid="home-ai-entry-card"
              className="rounded-3xl bg-white text-[#0F172A] p-6 shadow-2xl border border-[#E5DFD5] space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-[#0F172A]">
                      {language === 'te'
                        ? 'AI ప్రయాణ సహాయకుడు (కన్సియర్జ్)'
                        : language === 'hi'
                        ? 'AI यात्रा सहायक (कंसियर्ज)'
                        : 'AI Travel Concierge'}
                    </h2>
                    <p className="text-xs text-slate-600">
                      {language === 'te'
                        ? 'తెలుగు, హిందీ & ఇంగ్లీష్‌లో తక్షణ మార్గదర్శకత్వం'
                        : language === 'hi'
                        ? 'हिंदी, तेलुगु और अंग्रेजी में तत्काल मार्गदर्शन'
                        : 'Instant guidance in English, Telugu & Hindi'}
                    </p>
                  </div>
                </div>
                <SimulationBadge source="LOCAL_DOMAIN_AI" portal="pilgrim" compact />
              </div>

              <form onSubmit={handleConciergeSubmit} className="space-y-2.5">
                <label htmlFor="home-concierge-input" className="sr-only">
                  Ask the AI Travel Assistant
                </label>
                <div className="flex gap-2">
                  <input
                    id="home-concierge-input"
                    type="text"
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    placeholder={
                      language === 'te'
                        ? 'ఉదా: ప్రస్తుతం ఏ ఘాట్‌లో రద్దీ తక్కువగా ఉంది?'
                        : language === 'hi'
                        ? 'उदा: अभी किस घाट पर भीड़ सबसे कम है?'
                        : 'Ask e.g., Which ghat is calmest for seniors right now?'
                    }
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <Button
                    type="submit"
                    portal="pilgrim"
                    variant="primary"
                    data-testid="home-ai-submit-btn"
                  >
                    {language === 'te' ? 'అడగండి' : language === 'hi' ? 'पूछें' : 'Ask AI'}
                  </Button>
                </div>
              </form>

              {/* Suggested Concierge Prompts */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {language === 'te'
                    ? 'త్వరిత ప్రశ్నలు:'
                    : language === 'hi'
                    ? 'त्वरित प्रश्न:'
                    : 'Popular Pilgrim Questions:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      en: 'Best ghat for senior citizens & wheelchair?',
                      te: 'వృద్ధులు మరియు వీల్‌చైర్ ఉన్నవారికి ఏ ఘాట్ ఉత్తమం?',
                      hi: 'वरिष्ठ नागरिकों और व्हीलचेयर के लिए सबसे अच्छा घाट कौन सा है?',
                    },
                    {
                      en: 'Where to park arriving from NH-16?',
                      te: 'NH-16 వైపు నుండి వస్తే ఎక్కడ పార్క్ చేయాలి?',
                      hi: 'NH-16 से आने पर कार कहाँ पार्क करें?',
                    },
                    {
                      en: 'Are any roads closed today?',
                      te: 'రాజమహేంద్రవరంలో ఏవైనా రోడ్లు మూసివేయబడ్డాయా?',
                      hi: 'क्या आज कोई सड़क बंद है?',
                    },
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        navigate(`/assistant?q=${encodeURIComponent(q[language])}`)
                      }
                      className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFEA] border border-[#E5DFD5] text-[#1E3A8A] font-semibold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#D97706] shrink-0" />
                      <span>{q[language]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* SECTION 9: Compact Mobility Status Section (Live-Synced with Authority Command Centre) */}
        <section
          data-testid="home-mobility-status-section"
          aria-labelledby="mobility-status-heading"
        >
          <Card portal="pilgrim" elevated className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                  <h2
                    id="mobility-status-heading"
                    className="text-base sm:text-lg font-extrabold text-[#0F172A]"
                  >
                    {language === 'te'
                      ? 'ప్రస్తుత గోదావరి కారిడార్ మొబిలిటీ స్థితి'
                      : language === 'hi'
                      ? 'वर्तमान गोदावरी कॉरिडोर गतिशीलता स्थिति'
                      : 'Corridor Mobility Status Snapshot'}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'te'
                    ? `కమాండ్ సెంటర్‌తో సింక్రొనైజ్ చేయబడింది (రివిజన్ #${state.metadata.stateRevision})`
                    : language === 'hi'
                    ? `कमांड सेंटर के साथ सिंक्रनाइज़ (रिवीजन #${state.metadata.stateRevision})`
                    : `Synchronized with Authority Command Centre (Revision #${state.metadata.stateRevision})`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <SimulationBadge source={state.ghats[0].provenance.source} portal="pilgrim" compact />
                <Button
                  portal="pilgrim"
                  variant="outline"
                  size="sm"
                  data-testid="toggle-home-inline-map-btn"
                  onClick={() => setShowInlineMap((v) => !v)}
                >
                  {showInlineMap
                    ? language === 'te'
                      ? 'మ్యాప్‌ను దాచు'
                      : language === 'hi'
                      ? 'मानचित्र छिपाएँ'
                      : 'Hide Corridor Map'
                    : language === 'te'
                    ? 'ఇంటరాక్టివ్ మ్యాప్ చూడండి'
                    : language === 'hi'
                    ? 'इंटरैक्टिव मानचित्र देखें'
                    : 'Open Interactive Corridor Map'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Calmest Ghat Right Now */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'te'
                    ? 'అతి తక్కువ నిరీక్షణ గల ఘాట్'
                    : language === 'hi'
                    ? 'सबसे कम प्रतीक्षा वाला घाट'
                    : 'Calmest Recommended Ghat'}
                </div>
                <div className="text-sm font-extrabold text-[#0F172A]">
                  {t(calmestGhat.name)}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <StatusIndicator
                    level={calmestGhat.crowdLevel}
                    portal="pilgrim"
                    size="sm"
                  />
                  <span className="text-xs font-mono font-bold text-[#0D9488]">
                    ~{calmestGhat.estimatedBathingWaitMinutes}m wait
                  </span>
                </div>
              </div>

              {/* Satellite Parking Spaces */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'te'
                    ? 'అందుబాటులో ఉన్న పార్కింగ్ స్థలాలు'
                    : language === 'hi'
                    ? 'उपलब्ध पार्किंग स्थान'
                    : 'Available Satellite Parking'}
                </div>
                <div className="text-lg font-extrabold text-[#1E3A8A]">
                  {totalAvailableParkingSpaces.toLocaleString()} Spaces Free
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Morampudi, Lalacheruvu, Kovvur</span>
                  <button
                    type="button"
                    onClick={() => navigate('/parking')}
                    className="font-bold text-[#1E3A8A] hover:underline"
                  >
                    View →
                  </button>
                </div>
              </div>

              {/* Shuttle Fleet */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'te'
                    ? 'ఆర్టీసీ షటిల్ బస్సులు'
                    : language === 'hi'
                    ? 'एपीएसआरटीसी शटल सेवा'
                    : 'APSRTC Shuttle Corridors'}
                </div>
                <div className="text-lg font-extrabold text-[#0D9488]">
                  6 Routes • Every 3–6 mins
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>{totalActiveShuttleBuses} electric & express buses</span>
                  <button
                    type="button"
                    onClick={() => navigate('/shuttles')}
                    className="font-bold text-[#0D9488] hover:underline"
                  >
                    Track →
                  </button>
                </div>
              </div>

              {/* Corridor Advisories / Road Closures */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'te'
                    ? 'ట్రాఫిక్ & రోడ్డు సమాచారం'
                    : language === 'hi'
                    ? 'यातायात एवं सड़क सूचना'
                    : 'Traffic & Road Advisories'}
                </div>
                {closedOrDivertedRoads.length > 0 ? (
                  <>
                    <div className="text-sm font-extrabold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {closedOrDivertedRoads.length} Road Restriction(s) Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 truncate">
                      {t(closedOrDivertedRoads[0].name)} ({closedOrDivertedRoads[0].status})
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>All Major Bridges & Ring Roads Open</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Inner Pushkar Ghat perimeter restricted to shuttles.
                    </p>
                  </>
                )}
              </div>
            </div>

            {showInlineMap && (
              <div className="pt-3 border-t border-[#E5DFD5]">
                <MobilityMapWorkspace
                  portal="pilgrim"
                  enableOperatorControls={false}
                  onSelectGhatForJourney={(ghatId) =>
                    navigate(`/journey-planner?destination=${ghatId}`)
                  }
                  compactHeight
                />
              </div>
            )}
          </Card>
        </section>

        {/* SECTION 10: Featured Destination Cards */}
        <section
          data-testid="home-featured-destinations-section"
          aria-labelledby="featured-destinations-heading"
          className="space-y-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                {language === 'te'
                  ? 'పవిత్ర స్నాన ఘట్టాలు'
                  : language === 'hi'
                  ? 'पवित्र स्नान घाट'
                  : 'Sacred Riverfront Destinations'}
              </span>
              <h2
                id="featured-destinations-heading"
                className="text-2xl font-extrabold text-[#0F172A] mt-1"
              >
                {language === 'te'
                  ? 'ప్రముఖ గోదావరి పుష్కర ఘాట్లు'
                  : language === 'hi'
                  ? 'प्रमुख गोदावरी पुष्करालु घाट'
                  : 'Featured Godavari Pushkaralu Ghats'}
              </h2>
            </div>
            <Button
              portal="pilgrim"
              variant="outline"
              size="sm"
              onClick={() => navigate('/explore')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'te'
                ? 'అన్ని 8 ఘాట్లను చూడండి'
                : language === 'hi'
                ? 'सभी 8 घाट देखें'
                : 'View All 8 Destinations'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredGhats.map((ghat) => (
              <Card
                key={ghat.id}
                portal="pilgrim"
                padding="none"
                interactive
                className="overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-200 overflow-hidden">
                    <img
                      src={ghat.imageUrl}
                      alt={t(ghat.name)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusIndicator
                        level={ghat.crowdLevel}
                        portal="pilgrim"
                        size="sm"
                      />
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>~{ghat.estimatedBathingWaitMinutes}m wait</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 className="text-base font-extrabold text-[#0F172A] leading-snug">
                      {t(ghat.name)}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {t(ghat.description)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-semibold text-slate-700">
                      {ghat.wheelchairRampAvailable && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 border border-teal-200 inline-flex items-center gap-1">
                          <Accessibility className="w-3 h-3" />
                          <span>Ramp</span>
                        </span>
                      )}
                      {ghat.seniorPriorityLane && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          Senior Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                  <Button
                    portal="pilgrim"
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      navigate(`/journey-planner?destination=${ghat.id}`)
                    }
                    rightIcon={<Navigation className="w-3.5 h-3.5" />}
                  >
                    {language === 'te'
                      ? 'ఇక్కడికి ప్రయాణం ప్లాన్ చేయండి'
                      : language === 'hi'
                      ? 'यहाँ की यात्रा योजना बनाएं'
                      : 'Plan Journey Here'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* SECTION 11: Smart Travel Information */}
        <section
          data-testid="home-smart-travel-section"
          aria-labelledby="smart-travel-heading"
          className="space-y-5"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              {language === 'te'
                ? 'స్మార్ట్ ప్రయాణ సూచనలు'
                : language === 'hi'
                ? 'स्मार्ट यात्रा जानकारी'
                : 'Smart Travel Guide'}
            </span>
            <h2
              id="smart-travel-heading"
              className="text-2xl font-extrabold text-[#0F172A] mt-1"
            >
              {language === 'te'
                ? 'పుష్కరాలకు సులభంగా ఎలా ప్రయాణించాలి?'
                : language === 'hi'
                ? 'पुष्करालु में सुगम यात्रा कैसे करें?'
                : 'How to Move Smoothly During Godavari Pushkaralu'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card portal="pilgrim" className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <ParkingSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold">
                {language === 'te'
                  ? '1. NH-16 శాటిలైట్ పార్క్ & రైడ్ ఉపయోగించండి'
                  : language === 'hi'
                  ? '1. NH-16 सैटेलाइट पार्क-एंड-राइड अपनाएं'
                  : '1. Use NH-16 Outer Ring Park & Ride'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'te'
                  ? 'నగర కేంద్రంలోని ఇరుకైన వీధుల్లోకి ప్రైవేట్ కార్లను తీసుకురావద్దు. మోరంపూడి, లాలాచెరువు లేదా ధవళేశ్వరం హబ్‌లలో పార్క్ చేసి 4 నిమిషాల ఎక్స్‌ప్రెస్ షటిల్ ఎక్కండి.'
                  : language === 'hi'
                  ? 'शहर के संकरे मार्गों में निजी कारें न लाएं। मोरमपुडी, लालाचेरुवु या धवलेश्वरम हब पर पार्क करें और 4-मिनट एक्सप्रेस शटल लें।'
                  : 'Avoid inner-town traffic restrictions. Park at Morampudi, Lalacheruvu, or Dowleswaram satellite hubs and board 4-minute frequency green-corridor shuttles directly to the ghats.'}
              </p>
              <Button
                portal="pilgrim"
                variant="outline"
                size="sm"
                onClick={() => navigate('/parking')}
              >
                {language === 'te'
                  ? 'పార్కింగ్ హబ్‌లను చూడండి'
                  : language === 'hi'
                  ? 'पार्किंग हब देखें'
                  : 'Explore Parking Hubs'}
              </Button>
            </Card>

            <Card portal="pilgrim" className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold">
                {language === 'te'
                  ? '2. విజయవాడ / ఏలూరు భక్తులకు కొవ్వూరు ఘాట్'
                  : language === 'hi'
                  ? '2. विजयवाड़ा / एलुरु यात्रियों के लिए कोव्वुर घाट'
                  : '2. West Bank Arrivals: Use Kovvur Gospada Ghat'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'te'
                  ? 'పశ్చిమ గోదావరి వైపు నుండి వచ్చే భక్తులు వంతెన దాటకుండా కొవ్వూరు టోల్ ప్లాజా హబ్‌లో పార్క్ చేసి S5 షటిల్ ద్వారా గోష్పాద క్షేత్రం ఘాట్‌కు వేగంగా చేరుకోవచ్చు.'
                  : language === 'hi'
                  ? 'पश्चिम की ओर से आने वाले श्रद्धालु पुल पार किए बिना कोव्वुर टोल प्लाज़ा हब पर पार्क करके S5 शटल से सीधे गोष्पाद घाट पहुँच सकते हैं।'
                  : 'Arriving from Vijayawada, Eluru, or Hyderabad? Skip bridge crossings entirely by parking at Kovvur West Hub and taking Shuttle S5 to Gospada Kshetram Ghat.'}
              </p>
              <Button
                portal="pilgrim"
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate('/journey-planner?origin=KOVVUR_WEST_ENTRY&destination=ghat-kovvur-gospada')
                }
              >
                {language === 'te'
                  ? 'కొవ్వూరు మార్గం చూడండి'
                  : language === 'hi'
                  ? 'कोव्वुर मार्ग देखें'
                  : 'Plan West Bank Route'}
              </Button>
            </Card>

            <Card portal="pilgrim" className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold">
                {language === 'te'
                  ? '3. రైల్వే & బస్ ప్రయాణికులకు డైరెక్ట్ షటిల్స్'
                  : language === 'hi'
                  ? '3. रेलवे एवं बस यात्रियों के लिए सीधी शटल'
                  : '3. Direct Rail & Bus Terminal Feeder Shuttles'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'te'
                  ? 'రాజమండ్రి ప్రధాన రైల్వే స్టేషన్ నుండి S3 లో-ఫ్లోర్ షటిల్ మరియు గోకవరం బస్ స్టాండ్ నుండి S4 సర్క్యులర్ షటిల్ నిరంతరం నడుస్తున్నాయి.'
                  : language === 'hi'
                  ? 'राजमुंदरी रेलवे स्टेशन से S3 लो-फ्लोर शटल और गोकवरम बस स्टैंड से S4 सर्कुलर शटल निरंतर उपलब्ध हैं।'
                  : 'Arriving by train or APSRTC bus? Step straight onto Route S3 at Main Railway Station or Route S4 at Gokavaram Bus Complex for direct riverfront transfers.'}
              </p>
              <Button
                portal="pilgrim"
                variant="outline"
                size="sm"
                onClick={() => navigate('/shuttles')}
              >
                {language === 'te'
                  ? 'షటిల్ సమయాలు చూడండి'
                  : language === 'hi'
                  ? 'शटल समय देखें'
                  : 'Check Shuttle Timings'}
              </Button>
            </Card>
          </div>
        </section>

        {/* SECTION 12: Safety and Accessibility Information */}
        <section
          data-testid="home-safety-accessibility-section"
          aria-labelledby="safety-accessibility-heading"
        >
          <Card
            portal="pilgrim"
            className="bg-gradient-to-r from-[#FAF8F5] to-[#F3EFEA] border-2 border-[#E5DFD5]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold">
                  <HeartHandshake className="w-4 h-4 text-[#0D9488]" />
                  <span>
                    {language === 'te'
                      ? 'భద్రత, వైద్య సహాయం & వృద్ధుల ప్రత్యేక సేవలు'
                      : language === 'hi'
                      ? 'सुरक्षा, चिकित्सा एवं वरिष्ठ नागरिक विशेष सेवाएं'
                      : 'Safety, Medical Camps & Senior Citizen Priority'}
                  </span>
                </div>
                <h2
                  id="safety-accessibility-heading"
                  className="text-xl sm:text-2xl font-extrabold text-[#0F172A]"
                >
                  {language === 'te'
                    ? 'వృద్ధులు, దివ్యాంగులు మరియు కుటుంబాల కోసం ప్రత్యేక ఏర్పాట్లు'
                    : language === 'hi'
                    ? 'वरिष्ठ नागरिकों, दिव्यांगजनों और परिवारों के लिए समर्पित सुविधाएं'
                    : 'Designed for Senior Citizens, Families & Every Pilgrim'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
                  {language === 'te'
                    ? 'సరస్వతి ఘాట్ మరియు గౌతమి ఘాట్ వద్ద మెట్లు లేని ర్యాంపులు, ఉచిత ఎలక్ట్రిక్ బగ్గీ వాహనాలు, 24x7 వైద్య శిబిరాలు మరియు పెద్ద అక్షరాల కోసం సీనియర్ సిటిజన్ మోడ్ అందుబాటులో ఉన్నాయి.'
                    : language === 'hi'
                    ? 'सरस्वती घाट और गौतमी घाट पर जीरो-स्टेप व्हीलचेयर रैंप, निःशुल्क इलेक्ट्रिक बग्गी, 24x7 चिकित्सा शिविर और बड़े अक्षरों के लिए वरिष्ठ नागरिक मोड उपलब्ध हैं।'
                    : 'Enable Senior Citizen Mode for larger readable text and automatic low-walk routing. Free electric wheelchair buggies, shaded seating pavilions, and 24x7 medical camps operate across all ghats.'}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    portal="pilgrim"
                    variant={seniorMode ? 'saffron' : 'primary'}
                    size="md"
                    data-testid="home-toggle-senior-mode-btn"
                    onClick={toggleSeniorMode}
                    leftIcon={<Accessibility className="w-4 h-4" />}
                  >
                    {seniorMode
                      ? language === 'te'
                        ? 'వృద్ధుల మోడ్ ఆన్‌లో ఉంది (ఆఫ్ చేయండి)'
                        : language === 'hi'
                        ? 'वरिष्ठ मोड सक्रिय है (बंद करें)'
                        : 'Senior Citizen Mode Active (Turn Off)'
                      : language === 'te'
                      ? 'వృద్ధుల మోడ్ ఆన్ చేయండి'
                      : language === 'hi'
                      ? 'वरिष्ठ नागरिक मोड चालू करें'
                      : 'Enable Senior Citizen Mode'}
                  </Button>
                  <Button
                    portal="pilgrim"
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/safety')}
                    leftIcon={<Ambulance className="w-4 h-4" />}
                  >
                    {language === 'te'
                      ? 'అత్యవసర & బగ్గీ సహాయం కోరండి'
                      : language === 'hi'
                      ? 'आपातकालीन एवं बग्गी सहायता'
                      : 'Open Safety & Buggy Assistance Hub'}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-1">
                  <PhoneCall className="w-5 h-5 text-[#1E3A8A]" />
                  <div className="font-extrabold text-base text-[#0F172A]">1902</div>
                  <div className="text-slate-600">24x7 Pushkaralu Control Helpline</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-1">
                  <Ambulance className="w-5 h-5 text-emerald-600" />
                  <div className="font-extrabold text-base text-[#0F172A]">108 / 112</div>
                  <div className="text-slate-600">Medical & Police Rapid Response</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

