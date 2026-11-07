import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  HeartPulse,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, ProvenanceBadge } from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { OperationalLevel } from '@/types';

export const ExploreDestinationsPage: React.FC = () => {
  const { state } = useMobilityStore();
  const { t, language } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<'ALL' | 'EAST_RAJAMAHENDRAVARAM' | 'WEST_KOVVUR' | 'BARRAGE_SOUTH'>('ALL');
  const [selectedCrowdFilter, setSelectedCrowdFilter] = useState<'ALL' | 'LOW_ONLY' | 'LOW_AND_MODERATE'>('ALL');
  const [accessibilityOnly, setAccessibilityOnly] = useState(false);
  const [showInteractiveMap, setShowInteractiveMap] = useState(true);

  const filteredGhats = useMemo(() => {
    return state.ghats.filter((ghat) => {
      if (selectedBank !== 'ALL' && ghat.bank !== selectedBank) {
        return false;
      }
      if (selectedCrowdFilter === 'LOW_ONLY' && ghat.crowdLevel !== 'LOW') {
        return false;
      }
      if (
        selectedCrowdFilter === 'LOW_AND_MODERATE' &&
        ghat.crowdLevel !== 'LOW' &&
        ghat.crowdLevel !== 'MODERATE'
      ) {
        return false;
      }
      if (accessibilityOnly && (!ghat.wheelchairRampAvailable || !ghat.seniorPriorityLane)) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName =
          ghat.name.en.toLowerCase().includes(q) ||
          ghat.name.te.toLowerCase().includes(q) ||
          ghat.name.hi.toLowerCase().includes(q) ||
          ghat.code.toLowerCase().includes(q) ||
          ghat.description.en.toLowerCase().includes(q);
        if (!matchesName) return false;
      }
      return true;
    });
  }, [state.ghats, selectedBank, selectedCrowdFilter, accessibilityOnly, searchQuery]);

  const getLevelVariant = (level: OperationalLevel) => {
    switch (level) {
      case 'LOW':
        return 'low' as const;
      case 'MODERATE':
        return 'moderate' as const;
      case 'HIGH':
        return 'high' as const;
      case 'CRITICAL':
        return 'critical' as const;
    }
  };

  const getBankLabel = (bank: 'EAST_RAJAMAHENDRAVARAM' | 'WEST_KOVVUR' | 'BARRAGE_SOUTH') => {
    if (bank === 'EAST_RAJAMAHENDRAVARAM') {
      return t({
        en: 'East Bank — Rajamahendravaram',
        te: 'తూర్పు ఒడ్డు — రాజమహేంద్రవరం',
        hi: 'पूर्वी तट — राजमहेंद्रवरम',
      });
    }
    if (bank === 'WEST_KOVVUR') {
      return t({
        en: 'West Bank — Kovvur',
        te: 'పడమర ఒడ్డు — కొవ్వూరు',
        hi: 'पश्चिमी तट — कोव्वूरु',
      });
    }
    return t({
      en: 'South — Dowleswaram Barrage',
      te: 'దక్షిణ — ధవళేశ్వరం బ్యారేజ్',
      hi: 'दक्षिण — धवलेश्वरम बैराज',
    });
  };

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="explore-destinations-page"
    >
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">
            <Compass className="h-3.5 w-3.5 text-teal-600" />
            {t({
              en: '8 Sacred Ghats & Riverfront Destinations',
              te: '8 పవిత్ర స్నాన ఘాట్‌లు & నదీ తీర కేంద్రాలు',
              hi: '8 पवित्र स्नान घाट और नदी तट गंतव्य',
            })}
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {t({
              en: 'Explore Godavari Pushkaralu Ghats & Live Crowd Status',
              te: 'గోదావరి పుష్కర ఘాట్‌లు & ప్రత్యక్ష రద్దీ స్థితిని అన్వేషించండి',
              hi: 'गोदावरी पुष्करालु घाट और लाइव भीड़ स्थिति देखें',
            })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: 'Compare live crowd density, bathing queue wait times, wheelchair ramp availability, and direct shuttle connections before you depart.',
              te: 'బయలుదేరే ముందు ఘాట్‌ల రద్దీ, స్నాన నిరీక్షణ సమయం, వీల్‌చైర్ ర్యాంప్ మరియు షటిల్ బస్సు వివరాలను పోల్చి చూడండి.',
              hi: 'प्रस्थान से पहले लाइव भीड़ घनत्व, स्नान प्रतीक्षा समय, व्हीलचेयर रैंप और शटल कनेक्शन की तुलना करें।',
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant={showInteractiveMap ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={<MapPin className="h-4 w-4" />}
            onClick={() => setShowInteractiveMap((prev) => !prev)}
            data-testid="toggle-explore-map-btn"
          >
            {showInteractiveMap
              ? t({ en: 'Hide Riverfront Map', te: 'మ్యాప్ దాచండి', hi: 'मानचित्र छिपाएँ' })
              : t({ en: 'Show Riverfront Map', te: 'మ్యాప్ చూడండి', hi: 'मानचित्र दिखाएँ' })}
          </Button>
          <Link to="/journey-planner">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Navigation className="h-4 w-4" />}
            >
              {t({
                en: 'Open 5-Step Journey Planner',
                te: '5-దశల ప్రయాణ ప్లానర్',
                hi: '5-चरणीय यात्रा प्लानर खोलें',
              })}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <Card variant="pilgrim" padding="md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-center">
          <div className="md:col-span-4 relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t({
                en: 'Search ghat name (e.g., Pushkar, Saraswati, Kovvur)...',
                te: 'ఘాట్ పేరుతో వెతకండి (ఉదా: పుష్కర్, సరస్వతి, కొవ్వూరు)...',
                hi: 'घाट का नाम खोजें (जैसे पुष्कर, सरस्वती, कोव्वूरु)...',
              })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-[#1E3A8A] focus:bg-white focus:outline-none"
              data-testid="explore-search-input"
            />
          </div>

          {/* River Bank Filter */}
          <div className="md:col-span-4 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              {t({ en: 'Bank:', te: 'తీరం:', hi: 'तट:' })}
            </span>
            {(
              [
                { id: 'ALL', label: { en: 'All (8)', te: 'అన్నీ (8)', hi: 'सभी (8)' } },
                { id: 'EAST_RAJAMAHENDRAVARAM', label: { en: 'East RJY', te: 'తూర్పు RJY', hi: 'पूर्वी RJY' } },
                { id: 'WEST_KOVVUR', label: { en: 'West Kovvur', te: 'కొవ్వూరు', hi: 'कोव्वूरु' } },
                { id: 'BARRAGE_SOUTH', label: { en: 'Dowleswaram', te: 'ధవళేశ్వరం', hi: 'धवलेश्वरम' } },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedBank(item.id)}
                data-testid={`bank-filter-${item.id}`}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  selectedBank === item.id
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.label[language]}
              </button>
            ))}
          </div>

          {/* Crowd & Accessibility Quick Filters */}
          <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedCrowdFilter((prev) =>
                  prev === 'LOW_ONLY' ? 'ALL' : 'LOW_ONLY'
                )
              }
              data-testid="filter-low-crowd-btn"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedCrowdFilter === 'LOW_ONLY'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t({ en: 'Low Crowd Only', te: 'తక్కువ రద్దీ మాత్రమే', hi: 'केवल कम भीड़' })}
            </button>

            <button
              type="button"
              onClick={() => setAccessibilityOnly((prev) => !prev)}
              data-testid="filter-accessibility-btn"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                accessibilityOnly
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              <Accessibility className="h-3.5 w-3.5" />
              {t({
                en: 'Senior & Ramp Priority',
                te: 'వృద్ధులు & ర్యాంప్',
                hi: 'वरिष्ठ और रैंप',
              })}
            </button>
          </div>
        </div>
      </Card>

      {/* Interactive Map Section */}
      {showInteractiveMap && (
        <MobilityMapWorkspace
          portalMode="pilgrim"
          initialEngine="OFFLINE_SVG"
          heightClass="h-[380px] sm:h-[440px]"
        />
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>
          {t({
            en: `Showing ${filteredGhats.length} of ${state.ghats.length} Sacred Ghats`,
            te: `${state.ghats.length} లో ${filteredGhats.length} పవిత్ర ఘాట్‌లు చూపబడుతున్నాయి`,
            hi: `${state.ghats.length} में से ${filteredGhats.length} पवित्र घाट दिखाए जा रहे हैं`,
          })}
        </span>
        {(selectedBank !== 'ALL' || selectedCrowdFilter !== 'ALL' || accessibilityOnly || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedBank('ALL');
              setSelectedCrowdFilter('ALL');
              setAccessibilityOnly(false);
              setSearchQuery('');
            }}
            className="font-bold text-[#1E3A8A] underline"
          >
            {t({ en: 'Reset Filters', te: 'ఫిల్టర్లు రీసెట్', hi: 'फ़िल्टर रीसेट करें' })}
          </button>
        )}
      </div>

      {/* Destination Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredGhats.map((ghat) => {
          const occupancyPct = Math.round(
            (ghat.currentOccupancyCount / ghat.maxCapacityCount) * 100
          );
          const connectedParkings = state.parkingHubs.filter((p) =>
            ghat.nearestParkingIds.includes(p.id)
          );
          const connectedShuttles = state.shuttles.filter((s) =>
            ghat.connectedShuttleIds.includes(s.id)
          );
          const approachRoads = state.roads.filter((r) =>
            ghat.approachRoadIds.includes(r.id)
          );
          const closedRoad = approachRoads.find((r) => r.status === 'CLOSED');

          return (
            <Card
              key={ghat.id}
              variant="pilgrim"
              padding="md"
              className="flex flex-col justify-between border-slate-200 transition-shadow hover:shadow-md"
              data-testid={`destination-card-${ghat.id}`}
            >
              <div>
                {/* Top Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {ghat.code}
                      </span>
                      <span className="text-xs font-semibold text-teal-700">
                        {getBankLabel(ghat.bank)}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                      {t(ghat.name)}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getLevelVariant(ghat.crowdLevel)} pulse={ghat.crowdLevel === 'CRITICAL'}>
                      {ghat.crowdLevel}{' '}
                      {t({ en: 'CROWD', te: 'రద్దీ', hi: 'भीड़' })}
                    </Badge>
                    <ProvenanceBadge provenance={ghat.provenance} />
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {t(ghat.description)}
                </p>

                {/* Active Authority Advisory / Road Closure Notice */}
                {(ghat.activeAdvisory || closedRoad) && (
                  <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      {t({
                        en: 'Live Command Centre Mobility Advisory',
                        te: 'కమాండ్ సెంటర్ ప్రత్యక్ష ప్రయాణ సూచన',
                        hi: 'लाइव कमांड सेंटर यात्रा सलाह',
                      })}
                    </div>
                    <p className="mt-1">
                      {ghat.activeAdvisory
                        ? t(ghat.activeAdvisory)
                        : closedRoad?.closureReason
                        ? t(closedRoad.closureReason)
                        : ''}
                    </p>
                  </div>
                )}

                {/* Key Metrics Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-blue-700" />
                      {t({ en: 'Bathing Queue', te: 'స్నాన నిరీక్షణ', hi: 'स्नान कतार' })}
                    </div>
                    <div className="mt-0.5 font-mono text-base font-extrabold text-slate-900">
                      ~{ghat.estimatedBathingWaitMinutes}{' '}
                      <span className="text-xs font-normal">min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Users className="h-3.5 w-3.5 text-teal-700" />
                      {t({ en: 'Ghat Occupancy', te: 'ప్రస్తుత భక్తులు', hi: 'घाट क्षमता' })}
                    </div>
                    <div className="mt-0.5 font-mono text-base font-extrabold text-slate-900">
                      {occupancyPct}%{' '}
                      <span className="text-[11px] font-normal text-slate-500">
                        ({ghat.currentOccupancyCount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Accessibility className="h-3.5 w-3.5 text-emerald-700" />
                      {t({ en: 'Access Score', te: 'సౌకర్య స్కోరు', hi: 'सुगम्यता स्कोर' })}
                    </div>
                    <div className="mt-0.5 font-mono text-base font-extrabold text-emerald-700">
                      {ghat.accessibilityScore}/5
                    </div>
                  </div>
                </div>

                {/* Highlights & Facilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ghat.wheelchairRampAvailable && (
                    <Badge variant="success">
                      <Accessibility className="h-3 w-3" />
                      {t({ en: 'Wheelchair Ramp', te: 'వీల్‌చైర్ ర్యాంప్', hi: 'व्हीलचेयर रैंप' })}
                    </Badge>
                  )}
                  {ghat.seniorPriorityLane && (
                    <Badge variant="info">
                      <CheckCircle2 className="h-3 w-3" />
                      {t({ en: 'Senior Priority Lane', te: 'వృద్ధుల ప్రత్యేక లైన్', hi: 'वरिष्ठ प्राथमिकता लेन' })}
                    </Badge>
                  )}
                  {ghat.medicalCampActive && (
                    <Badge variant="neutral">
                      <HeartPulse className="h-3 w-3 text-red-600" />
                      {t({ en: '24x7 Medical Camp', te: '24x7 వైద్య శిబిరం', hi: '24x7 चिकित्सा शिविर' })}
                    </Badge>
                  )}
                  {ghat.highlights.map((hl, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                    >
                      {t(hl)}
                    </span>
                  ))}
                </div>

                {/* Connected Parking & Shuttles */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Car className="h-3.5 w-3.5 text-[#1E3A8A]" />
                      {t({ en: 'Nearest Parking Hubs', te: 'సమీప పార్కింగ్', hi: 'निकटतम पार्किंग' })}
                    </div>
                    <div className="mt-1 space-y-1">
                      {connectedParkings.map((park) => (
                        <div key={park.id} className="flex items-center justify-between text-slate-600">
                          <span className="truncate pr-2">{t(park.name).split('(')[0]}</span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            {park.availableSpaces} {t({ en: 'free', te: 'ఖాళీ', hi: 'खाली' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Bus className="h-3.5 w-3.5 text-teal-700" />
                      {t({ en: 'Connected Shuttles', te: 'అనుసంధాన షటిల్స్', hi: 'जुड़ी हुई शटल' })}
                    </div>
                    <div className="mt-1 space-y-1">
                      {connectedShuttles.map((sh) => (
                        <div key={sh.id} className="flex items-center justify-between text-slate-600">
                          <span className="font-mono font-bold text-teal-800">{sh.routeCode}</span>
                          <span className="font-mono text-slate-700">
                            {t({ en: 'Every', te: 'ప్రతి', hi: 'हर' })} {sh.frequencyMinutes}m (ETA {sh.estimatedArrivalMinutes}m)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Link
                  to={`/journey-planner?destination=${ghat.id}`}
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<Navigation className="h-4 w-4" />}
                    data-testid={`plan-to-ghat-${ghat.id}`}
                  >
                    {t({
                      en: 'Plan Best Route to This Ghat',
                      te: 'ఈ ఘాట్‌కు ఉత్తమ మార్గాన్ని ప్లాన్ చేయండి',
                      hi: 'इस घाट के लिए सर्वोत्तम मार्ग की योजना बनाएँ',
                    })}
                  </Button>
                </Link>
                <Link to={`/assistant?q=${encodeURIComponent(`Tell me about ${ghat.name.en}`)}`}>
                  <Button variant="outline" size="sm">
                    {t({ en: 'Ask AI', te: 'AI ని అడగండి', hi: 'AI से पूछें' })}
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
