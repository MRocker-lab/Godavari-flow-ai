import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  Bus,
  Car,
  CheckCircle2,
  Footprints,
  MapPin,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { Badge, Button, Card, ProvenanceBadge } from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ParkingOperationalStatus } from '@/types';

export const ParkingFinderPage: React.FC = () => {
  const { state } = useMobilityStore();
  const { t, language } = useTranslation();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE_ONLY' | 'RECOMMENDED_ONLY'>('ALL');
  const [selectedGhatId, setSelectedGhatId] = useState<string>('ALL');

  const filteredParkingHubs = useMemo(() => {
    return state.parkingHubs.filter((hub) => {
      if (statusFilter === 'AVAILABLE_ONLY' && hub.status !== 'AVAILABLE') {
        return false;
      }
      if (statusFilter === 'RECOMMENDED_ONLY' && !hub.isRecommended) {
        return false;
      }
      if (selectedGhatId !== 'ALL' && hub.primaryGhatId !== selectedGhatId) {
        return false;
      }
      return true;
    });
  }, [state.parkingHubs, statusFilter, selectedGhatId]);

  const totalAvailableSpaces = useMemo(
    () => state.parkingHubs.reduce((acc, p) => acc + p.availableSpaces, 0),
    [state.parkingHubs]
  );

  const getStatusBadgeVariant = (status: ParkingOperationalStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'low' as const;
      case 'FILLING_FAST':
        return 'moderate' as const;
      case 'FULL':
        return 'critical' as const;
      case 'RESERVED_ACCESSIBILITY':
        return 'info' as const;
    }
  };

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="parking-finder-page"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">
            <Car className="h-3.5 w-3.5 text-teal-600" />
            {t({
              en: 'Map-First Satellite Parking & Park-and-Ride Finder',
              te: 'శాటిలైట్ పార్కింగ్ & పార్క్-అండ్-రైడ్ సమాచారం',
              hi: 'सैटेलाइट पार्किंग और पार्क-एंड-राइड खोजक',
            })}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {t({
              en: 'Live Parking Occupancy, Walking Distances & Shuttle Links',
              te: 'ప్రత్యక్ష పార్కింగ్ ఖాళీలు, నడక దూరం & షటిల్ బస్సు కనెక్షన్లు',
              hi: 'लाइव पार्किंग क्षमता, पैदल दूरी और शटल लिंक',
            })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: `${totalAvailableSpaces.toLocaleString()} total spaces currently available across ${state.parkingHubs.length} managed parking hubs in Rajamahendravaram & Kovvur.`,
              te: `రాజమహేంద్రవరం & కొవ్వూరులోని ${state.parkingHubs.length} పార్కింగ్ హబ్‌లలో ప్రస్తుతం ${totalAvailableSpaces.toLocaleString()} ఖాళీ స్థలాలు అందుబాటులో ఉన్నాయి.`,
              hi: `राजमहेंद्रवरम और कोव्वूरु के ${state.parkingHubs.length} पार्किंग हब में वर्तमान में ${totalAvailableSpaces.toLocaleString()} स्थान उपलब्ध हैं।`,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'ALL', label: { en: 'All Hubs (8)', te: 'అన్నీ (8)', hi: 'सभी हब (8)' } },
              { id: 'AVAILABLE_ONLY', label: { en: 'Available Now', te: 'ఖాళీగా ఉన్నవి', hi: 'अभी उपलब्ध' } },
              { id: 'RECOMMENDED_ONLY', label: { en: 'AI Recommended', te: 'AI సిఫార్సు', hi: 'AI अनुशंसित' } },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              data-testid={`parking-filter-${item.id}`}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                statusFilter === item.id
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label[language]}
            </button>
          ))}

          <select
            aria-label="Filter parking by destination ghat"
            value={selectedGhatId}
            onChange={(e) => setSelectedGhatId(e.target.value)}
            data-testid="parking-ghat-select"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">
              {t({ en: 'All Destination Ghats', te: 'అన్ని ఘాట్‌లు', hi: 'सभी गंतव्य घाट' })}
            </option>
            {state.ghats.map((g) => (
              <option key={g.id} value={g.id}>
                {t(g.name)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map-First Interactive Workspace */}
      <MobilityMapWorkspace
        portalMode="pilgrim"
        initialEngine="OFFLINE_SVG"
        heightClass="h-[400px]"
      />

      {/* Parking Hub Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredParkingHubs.map((hub) => {
          const primaryGhat = state.ghats.find((g) => g.id === hub.primaryGhatId);
          const linkedShuttles = state.shuttles.filter((s) =>
            hub.connectedShuttleIds.includes(s.id)
          );

          return (
            <Card
              key={hub.id}
              variant="pilgrim"
              padding="md"
              data-testid={`parking-card-${hub.id}`}
              className={`flex flex-col justify-between ${
                hub.isRecommended
                  ? 'border-emerald-300 ring-1 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700">
                        {hub.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {t(hub.zone)}
                      </span>
                      {hub.isRecommended && (
                        <Badge variant="success">
                          <Sparkles className="h-3 w-3" />
                          {t({ en: 'Recommended', te: 'సిఫార్సు', hi: 'अनुशंसित' })}
                        </Badge>
                      )}
                    </div>
                    <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                      {t(hub.name)}
                    </h2>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusBadgeVariant(hub.status)}>
                      {hub.status.replace('_', ' ')}
                    </Badge>
                    <ProvenanceBadge provenance={hub.provenance} />
                  </div>
                </div>

                {/* Occupancy Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-800">
                      {hub.availableSpaces.toLocaleString()}{' '}
                      {t({ en: 'spaces available', te: 'ఖాళీ స్థలాలు', hi: 'स्थान खाली' })}
                    </span>
                    <span className="font-mono text-slate-600">
                      {hub.occupancyPercent}%{' '}
                      {t({ en: 'Occupied', te: 'నిండింది', hi: 'भरा हुआ' })} (
                      {hub.totalCapacity.toLocaleString()} total)
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hub.occupancyPercent >= 90
                          ? 'bg-red-600'
                          : hub.occupancyPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${hub.occupancyPercent}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
                  <div>
                    <div className="text-slate-500">
                      <MapPin className="inline h-3.5 w-3.5 mr-1 text-blue-700" />
                      {t({ en: 'Distance to Ghat', te: 'ఘాట్ దూరం', hi: 'घाट की दूरी' })}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                      {hub.distanceToDestinationKm} km
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">
                      <Footprints className="inline h-3.5 w-3.5 mr-1 text-teal-700" />
                      {t({ en: 'Walking Distance', te: 'నడక దూరం', hi: 'पैदल दूरी' })}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                      {hub.walkingDistanceMeters}m (~{hub.walkingDurationMinutes}m)
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">
                      {t({ en: 'Approach Traffic', te: 'ట్రాఫిక్ స్థితి', hi: 'ट्रैफिक स्थिति' })}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-extrabold text-slate-900">
                      {hub.trafficCondition}
                    </div>
                  </div>
                </div>

                {/* Accessibility & Shuttle Links */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="info">
                    <Accessibility className="h-3 w-3" />
                    {hub.wheelchairAccessibleBays}{' '}
                    {t({ en: 'Accessible Bays', te: 'దివ్యాంగ బేలు', hi: 'दिव्यांग बे' })}
                  </Badge>
                  {hub.seniorDropOffAvailable && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3" />
                      {t({ en: 'Senior Drop-Off Zone', te: 'వృద్ధుల డ్రాప్-ఆఫ్', hi: 'वरिष्ठ ड्रॉप-ऑफ' })}
                    </Badge>
                  )}
                  {linkedShuttles.map((sh) => (
                    <span
                      key={sh.id}
                      className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 font-mono text-xs font-bold text-teal-800 border border-teal-200"
                    >
                      <Bus className="h-3 w-3" />
                      {sh.routeCode} (ETA {sh.estimatedArrivalMinutes}m)
                    </span>
                  ))}
                </div>

                {/* Recommendation Reason */}
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 mr-1">
                    {t({ en: 'Guidance:', te: 'సూచన:', hi: 'मार्गदर्शन:' })}
                  </span>
                  {t(hub.recommendationReason)}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {t({ en: 'Primary Ghat:', te: 'ప్రధాన ఘాట్:', hi: 'मुख्य घाट:' })}{' '}
                  <strong className="text-slate-800">
                    {primaryGhat ? t(primaryGhat.name) : hub.primaryGhatId}
                  </strong>
                </span>
                <Link to={`/journey-planner?destination=${hub.primaryGhatId}`}>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Navigation className="h-3.5 w-3.5" />}
                  >
                    {t({ en: 'Route via Hub', te: 'ఈ హబ్ ద్వారా రూట్', hi: 'हब से मार्ग' })}
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
