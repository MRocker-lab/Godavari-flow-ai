import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  Bus,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Users,
} from 'lucide-react';
import { Badge, Button, Card, ProvenanceBadge } from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { ShuttleOperationalStatus } from '@/types';

export const ShuttleTrackerPage: React.FC = () => {
  const { state } = useMobilityStore();
  const { t, language } = useTranslation();

  const [filterMode, setFilterMode] = useState<'ALL' | 'FREQUENT_ONLY' | 'WHEELCHAIR_PRIORITY'>('ALL');

  const filteredShuttles = useMemo(() => {
    return state.shuttles.filter((sh) => {
      if (filterMode === 'FREQUENT_ONLY' && sh.status !== 'FREQUENT') {
        return false;
      }
      if (
        filterMode === 'WHEELCHAIR_PRIORITY' &&
        (!sh.wheelchairAccessible || !sh.seniorCitizenPrioritySeats)
      ) {
        return false;
      }
      return true;
    });
  }, [state.shuttles, filterMode]);

  const totalActiveBuses = useMemo(
    () => state.shuttles.reduce((acc, s) => acc + s.activeBusesCount, 0),
    [state.shuttles]
  );

  const getShuttleStatusVariant = (status: ShuttleOperationalStatus) => {
    switch (status) {
      case 'FREQUENT':
        return 'low' as const;
      case 'MODERATE_WAIT':
        return 'moderate' as const;
      case 'HIGH_DEMAND':
        return 'high' as const;
      case 'DELAYED':
        return 'critical' as const;
    }
  };

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="shuttle-tracker-page"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            <Bus className="h-3.5 w-3.5 text-teal-600" />
            {t({
              en: 'APSRTC Pushkaralu Green-Corridor Shuttle Network',
              te: 'APSRTC పుష్కర గ్రీన్-కారిడార్ షటిల్ నెట్‌వర్క్',
              hi: 'APSRTC पुष्करालु ग्रीन-कॉरिडोर शटल नेटवर्क',
            })}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {t({
              en: 'Live Shuttle Corridors, Pickup Points, ETAs & Seat Capacity',
              te: 'ప్రత్యక్ష షటిల్ మార్గాలు, పికప్ పాయింట్లు, ETA & సీట్ల సామర్థ్యం',
              hi: 'लाइव शटल कॉरिडोर, पिकअप पॉइंट, ईटीए और सीट क्षमता',
            })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: `${totalActiveBuses} electric and low-floor shuttle buses operating across ${state.shuttles.length} dedicated corridors connecting satellite parking hubs to riverfront ghats.`,
              te: `శాటిలైట్ పార్కింగ్ హబ్‌లను నదీ తీర ఘాట్‌లతో కలుపుతూ ${state.shuttles.length} ప్రత్యేక మార్గాల్లో ${totalActiveBuses} బస్సులు నడుస్తున్నాయి.`,
              hi: `सैटेलाइट पार्किंग हब को नदी तट घाटों से जोड़ने वाले ${state.shuttles.length} समर्पित गलियारों में ${totalActiveBuses} बसें चल रही हैं।`,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'ALL', label: { en: 'All Corridors (6)', te: 'అన్ని మార్గాలు (6)', hi: 'सभी मार्ग (6)' } },
              { id: 'FREQUENT_ONLY', label: { en: 'Frequent (<5m)', te: 'తరచుగా వచ్చేవి (<5 ని.)', hi: 'लगातार (<5 मि.)' } },
              { id: 'WHEELCHAIR_PRIORITY', label: { en: 'Wheelchair & Senior', te: 'వీల్‌చైర్ & వృద్ధులు', hi: 'व्हीलचेयर और वरिष्ठ' } },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterMode(item.id)}
              data-testid={`shuttle-filter-${item.id}`}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                filterMode === item.id
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Map-First Shuttle Corridors Workspace */}
      <MobilityMapWorkspace
        portalMode="pilgrim"
        initialEngine="OFFLINE_SVG"
        heightClass="h-[390px]"
      />

      {/* Shuttle Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredShuttles.map((shuttle) => (
          <Card
            key={shuttle.id}
            variant="pilgrim"
            padding="md"
            data-testid={`shuttle-card-${shuttle.id}`}
            className="flex flex-col justify-between border-slate-200"
          >
            <div>
              {/* Top Row */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-teal-700 px-2.5 py-0.5 font-mono text-xs font-extrabold text-white">
                      {shuttle.routeCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {shuttle.activeBusesCount}{' '}
                      {t({ en: 'Active Buses', te: 'బస్సులు నడుస్తున్నాయి', hi: 'सक्रिय बसें' })}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                    {t(shuttle.name)}
                  </h2>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getShuttleStatusVariant(shuttle.status)}>
                    {shuttle.status.replace('_', ' ')}
                  </Badge>
                  <ProvenanceBadge provenance={shuttle.provenance} />
                </div>
              </div>

              {/* Pickup -> Destination Route Box */}
              <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">
                    <MapPin className="inline h-3.5 w-3.5 mr-1 text-blue-700" />
                    {t({ en: 'Pickup Point:', te: 'ఎక్కే స్థలం:', hi: 'पिकअप बिंदु:' })}
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {t(shuttle.pickupPointName)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">
                    <Navigation className="inline h-3.5 w-3.5 mr-1 text-teal-700" />
                    {t({ en: 'Destination Ghat:', te: 'దిగే ఘాట్:', hi: 'गंतव्य घाट:' })}
                  </span>
                  <span className="font-bold text-teal-900 text-right">
                    {t(shuttle.destinationName)}
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="mt-3 grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
                <div>
                  <div className="text-slate-500">
                    <Clock className="inline h-3.5 w-3.5 mr-1 text-teal-700" />
                    {t({ en: 'Next Arrival (ETA)', te: 'తదుపరి బస్సు', hi: 'अगली बस (ETA)' })}
                  </div>
                  <div className="mt-0.5 font-mono text-base font-extrabold text-teal-800">
                    {shuttle.estimatedArrivalMinutes} min
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {t({ en: 'Every', te: 'ప్రతి', hi: 'हर' })} {shuttle.frequencyMinutes}m
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">
                    <Users className="inline h-3.5 w-3.5 mr-1 text-blue-700" />
                    {t({ en: 'Occupancy %', te: 'ఆక్యుపెన్సీ %', hi: 'ऑक्यूपेंसी %' })}
                  </div>
                  <div className="mt-0.5 font-mono text-base font-extrabold text-slate-900">
                    {shuttle.occupancyPercent}%
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">
                    {t({ en: 'Available Capacity', te: 'ఖాళీ సీట్లు', hi: 'उपलब्ध सीटें' })}
                  </div>
                  <div className="mt-0.5 font-mono text-base font-extrabold text-emerald-700">
                    {shuttle.availableCapacitySeats} seats
                  </div>
                  <div className="text-[11px] text-slate-500">
                    / {shuttle.totalFleetSeatCapacity} fleet
                  </div>
                </div>
              </div>

              {/* Accessibility Badges & Advisory */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {shuttle.wheelchairAccessible && (
                  <Badge variant="success">
                    <Accessibility className="h-3 w-3" />
                    {t({ en: 'Hydraulic Wheelchair Lift', te: 'వీల్‌చైర్ లిఫ్ట్', hi: 'व्हीलचेयर लिफ्ट' })}
                  </Badge>
                )}
                {shuttle.seniorCitizenPrioritySeats && (
                  <Badge variant="info">
                    <CheckCircle2 className="h-3 w-3" />
                    {t({ en: 'Senior Priority Seating', te: 'వృద్ధుల ప్రత్యేక సీట్లు', hi: 'वरिष्ठ प्राथमिकता सीटें' })}
                  </Badge>
                )}
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                {t(shuttle.advisoryNote)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <Link
                to={`/journey-planner?destination=${shuttle.destinationGhatId}&mode=PUBLIC_SHUTTLE_DIRECT`}
                className="w-full"
              >
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  leftIcon={<Navigation className="h-3.5 w-3.5" />}
                >
                  {t({
                    en: `Plan Trip with ${shuttle.routeCode} Shuttle`,
                    te: `${shuttle.routeCode} షటిల్‌తో ప్రయాణం ప్లాన్ చేయండి`,
                    hi: `${shuttle.routeCode} शटल के साथ यात्रा प्लान करें`,
                  })}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

