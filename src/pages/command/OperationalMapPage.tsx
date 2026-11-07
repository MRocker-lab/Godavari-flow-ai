import React, { useState } from 'react';
import {
  Bus,
  Car,
  Map,
  ParkingSquare,
  Sliders,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  ProvenanceBadge,
  StatusIndicator,
} from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import {
  OperationalLevel,
  ParkingOperationalStatus,
  RoadOperationalStatus,
} from '@/types';

export const OperationalMapPage: React.FC = () => {
  const { t } = useTranslation();
  const state = useMobilityStore((s) => s.state);
  const setRoadStatus = useMobilityStore((s) => s.setRoadStatus);
  const updateParkingOccupancy = useMobilityStore((s) => s.updateParkingOccupancy);
  const updateShuttleService = useMobilityStore((s) => s.updateShuttleService);
  const updateGhatCrowdLevel = useMobilityStore((s) => s.updateGhatCrowdLevel);

  const [activeControlTab, setActiveControlTab] = useState<
    'ROADS' | 'PARKING' | 'SHUTTLES' | 'GHATS'
  >('ROADS');

  return (
    <div data-testid="operational-map-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-300">
            <Map className="w-3.5 h-3.5" />
            {t({
              en: '7-Layer Tactical Riverfront & Corridor Workspace',
              te: '7-లేయర్ టాక్టికల్ నదీ తీర & కారిడార్ వర్క్‌స్పేస్',
              hi: '7-लेयर सामरिक नदी तट एवं कॉरिडोर कार्यक्षेत्र',
            })}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
            {t({
              en: 'Full-Workspace Operational Map & Direct Corridor Control Matrix',
              te: 'ఆపరేషనల్ మ్యాప్ & కారిడార్ ప్రత్యక్ష నియంత్రణ కేంద్రం',
              hi: 'परिचालन मानचित्र और प्रत्यक्ष कॉरिडोर नियंत्रण मैट्रिक्स',
            })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {t({
              en: 'Toggle any of the 7 layers on the map or use the Direct Corridor Control Matrix below to close roads, redirect parking, boost shuttles, or adjust ghat crowd levels.',
              te: 'మ్యాప్‌లోని 7 లేయర్‌లను మార్చండి లేదా క్రింది కంట్రోల్ మ్యాట్రిక్స్ ద్వారా రోడ్లు, పార్కింగ్, షటిల్ మరియు ఘాట్ రద్దీని నియంత్రించండి.',
              hi: 'मानचित्र पर 7 परतों को टॉगल करें या सड़क बंद करने, पार्किंग बदलने, शटल बढ़ाने या भीड़ स्तर बदलने के लिए नीचे दिए गए नियंत्रण मैट्रिक्स का उपयोग करें।',
            })}
          </p>
        </div>
      </div>

      {/* Full 7-Layer Interactive Map Workspace */}
      <MobilityMapWorkspace
        portal="command"
        enableOperatorControls={true}
      />

      {/* Direct Corridor Control Matrix */}
      <Card portal="command" className="space-y-4" data-testid="corridor-control-matrix">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="font-display text-base font-extrabold text-white">
              {t({
                en: 'Direct Corridor Control Matrix (Instant Cross-Tab Sync to Pilgrim Portal)',
                te: 'కారిడార్ ప్రత్యక్ష నియంత్రణ మ్యాట్రిక్స్ (పిల్గ్రిమ్ పోర్టల్‌కు తక్షణ సింక్)',
                hi: 'प्रत्यक्ष कॉरिडोर नियंत्रण मैट्रिक्स (पिलग्रिम पोर्टल के साथ तत्काल सिंक)',
              })}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5" role="tablist">
            {(
              [
                {
                  id: 'ROADS',
                  icon: <Car className="w-3.5 h-3.5" />,
                  label: `Roads & Bridges (${state.roads.length})`,
                },
                {
                  id: 'PARKING',
                  icon: <ParkingSquare className="w-3.5 h-3.5" />,
                  label: `Parking Hubs (${state.parkingHubs.length})`,
                },
                {
                  id: 'SHUTTLES',
                  icon: <Bus className="w-3.5 h-3.5" />,
                  label: `Shuttles (${state.shuttles.length})`,
                },
                {
                  id: 'GHATS',
                  icon: <Users className="w-3.5 h-3.5" />,
                  label: `Ghat Crowds (${state.ghats.length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeControlTab === tab.id}
                onClick={() => setActiveControlTab(tab.id)}
                data-testid={`matrix-tab-${tab.id}`}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  activeControlTab === tab.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Road & Bridge Corridors */}
        {activeControlTab === 'ROADS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {state.roads.map((road) => (
              <div
                key={road.id}
                data-testid={`matrix-road-${road.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      {road.code} • {road.corridorType}
                    </span>
                    <div className="font-bold text-white mt-0.5">{t(road.name)}</div>
                  </div>
                  <StatusIndicator level={road.status} portal="command" size="sm" />
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>
                    Congestion: <strong className="text-white">{road.congestionIndex}/100</strong>
                  </span>
                  <span>
                    Flow: <strong className="text-white">{road.monitoredVehicleCountPerHour}/hr</strong>
                  </span>
                  <ProvenanceBadge provenance={road.provenance} portal="command" />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(
                    ['OPEN', 'CONGESTED', 'DIVERTED', 'CLOSED'] as RoadOperationalStatus[]
                  ).map((st) => (
                    <Button
                      key={st}
                      portal="command"
                      variant={road.status === st ? 'primary' : 'secondary'}
                      size="sm"
                      data-testid={`set-road-${road.id}-${st}`}
                      onClick={() => setRoadStatus(road.id, st)}
                    >
                      {st}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Parking Hubs */}
        {activeControlTab === 'PARKING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {state.parkingHubs.map((hub) => (
              <div
                key={hub.id}
                data-testid={`matrix-parking-${hub.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      {hub.code}
                    </span>
                    <div className="font-bold text-white mt-0.5">{t(hub.name)}</div>
                  </div>
                  <StatusIndicator level={hub.status} portal="command" size="sm" />
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Occupancy: <strong className="text-cyan-300">{hub.occupancyPercent}%</strong> ({hub.availableSpaces} free / {hub.totalCapacity})
                  </span>
                  <ProvenanceBadge provenance={hub.provenance} portal="command" />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(
                    [
                      { pct: 45, status: 'AVAILABLE' as ParkingOperationalStatus, label: '45% (Available)' },
                      { pct: 86, status: 'FILLING_FAST' as ParkingOperationalStatus, label: '86% (Filling)' },
                      { pct: 99, status: 'FULL' as ParkingOperationalStatus, label: '99% (Full)' },
                      { pct: 75, status: 'RESERVED_ACCESSIBILITY' as ParkingOperationalStatus, label: 'Senior Permit Only' },
                    ]
                  ).map((preset) => (
                    <Button
                      key={preset.label}
                      portal="command"
                      variant={hub.status === preset.status ? 'primary' : 'secondary'}
                      size="sm"
                      data-testid={`set-parking-${hub.id}-${preset.status}`}
                      onClick={() =>
                        updateParkingOccupancy(hub.id, preset.pct, preset.status)
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Shuttle Fleet Corridors */}
        {activeControlTab === 'SHUTTLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {state.shuttles.map((sh) => (
              <div
                key={sh.id}
                data-testid={`matrix-shuttle-${sh.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      {sh.routeCode}
                    </span>
                    <div className="font-bold text-white mt-0.5">{t(sh.name)}</div>
                  </div>
                  <StatusIndicator level={sh.status} portal="command" size="sm" />
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Every <strong className="text-cyan-300">{sh.frequencyMinutes}m</strong> •{' '}
                    <strong className="text-white">{sh.activeBusesCount}</strong> buses •{' '}
                    {sh.availableCapacitySeats} seats open
                  </span>
                  <ProvenanceBadge provenance={sh.provenance} portal="command" />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button
                    portal="command"
                    variant="primary"
                    size="sm"
                    data-testid={`boost-shuttle-${sh.id}`}
                    onClick={() =>
                      updateShuttleService(
                        sh.id,
                        Math.max(2, sh.frequencyMinutes - 1),
                        sh.activeBusesCount + 4,
                        'FREQUENT'
                      )
                    }
                  >
                    Boost Fleet (+4 Buses / Faster ETA)
                  </Button>
                  <Button
                    portal="command"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      updateShuttleService(
                        sh.id,
                        sh.frequencyMinutes + 2,
                        Math.max(8, sh.activeBusesCount - 4),
                        'HIGH_DEMAND'
                      )
                    }
                  >
                    Simulate High Demand Delay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Ghat Crowd Levels */}
        {activeControlTab === 'GHATS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {state.ghats.map((ghat) => (
              <div
                key={ghat.id}
                data-testid={`matrix-ghat-${ghat.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-cyan-400">
                      {ghat.code}
                    </span>
                    <div className="font-bold text-white mt-0.5">{t(ghat.name)}</div>
                  </div>
                  <StatusIndicator
                    level={ghat.crowdLevel}
                    portal="command"
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Wait: <strong className="text-amber-300">~{ghat.estimatedBathingWaitMinutes}m</strong> •{' '}
                    {ghat.currentOccupancyCount.toLocaleString()} / {ghat.maxCapacityCount.toLocaleString()}
                  </span>
                  <ProvenanceBadge provenance={ghat.provenance} portal="command" />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(
                    [
                      { level: 'LOW' as OperationalLevel, wait: 10 },
                      { level: 'MODERATE' as OperationalLevel, wait: 22 },
                      { level: 'HIGH' as OperationalLevel, wait: 42 },
                      { level: 'CRITICAL' as OperationalLevel, wait: 65 },
                    ]
                  ).map((item) => (
                    <Button
                      key={item.level}
                      portal="command"
                      variant={ghat.crowdLevel === item.level ? 'primary' : 'secondary'}
                      size="sm"
                      data-testid={`set-ghat-${ghat.id}-${item.level}`}
                      onClick={() =>
                        updateGhatCrowdLevel(ghat.id, item.level, item.wait)
                      }
                    >
                      {item.level} ({item.wait}m)
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

