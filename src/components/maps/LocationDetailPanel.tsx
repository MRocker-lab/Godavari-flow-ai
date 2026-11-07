import React from 'react';
import {
  Accessibility,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Ban,
  Bus,
  Clock,
  Compass,
  ParkingSquare,
  X,
} from 'lucide-react';
import { SelectedMapFeature } from './mapTypes';
import {
  Button,
  Card,
  MetricCapacityBar,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';

export interface LocationDetailPanelProps {
  portal: 'pilgrim' | 'command';
  selectedFeature: SelectedMapFeature | null;
  onClose: () => void;
  onSelectFeature: (feature: SelectedMapFeature) => void;
  onSelectGhatForJourney?: (ghatId: string) => void;
  enableOperatorControls?: boolean;
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  portal,
  selectedFeature,
  onClose,
  onSelectFeature,
  onSelectGhatForJourney,
  enableOperatorControls = portal === 'command',
}) => {
  const state = useMobilityStore((s) => s.state);
  const setRoadStatus = useMobilityStore((s) => s.setRoadStatus);
  const updateParkingOccupancy = useMobilityStore((s) => s.updateParkingOccupancy);
  const updateShuttleService = useMobilityStore((s) => s.updateShuttleService);
  const updateGhatCrowdLevel = useMobilityStore((s) => s.updateGhatCrowdLevel);
  const updateIncidentStatus = useMobilityStore((s) => s.updateIncidentStatus);

  const { t, language } = useTranslation();

  if (!selectedFeature) {
    return (
      <Card
        portal={portal}
        data-testid="location-detail-empty"
        className="h-full flex flex-col justify-center items-center text-center p-6"
      >
        <Compass className="w-9 h-9 opacity-45 mb-2.5" aria-hidden="true" />
        <h4 className="text-sm font-bold">
          {language === 'te'
            ? 'మ్యాప్‌లో ఏదైనా ప్రదేశాన్ని ఎంచుకోండి'
            : language === 'hi'
            ? 'मानचित्र पर कोई स्थान चुनें'
            : 'Select a Location on the Map'}
        </h4>
        <p className="text-xs opacity-75 mt-1 max-w-xs">
          {language === 'te'
            ? 'ఘాట్, పార్కింగ్ హబ్, షటిల్ రూట్, రోడ్డు కారిడార్ లేదా సంఘటనపై క్లిక్ చేసి పూర్తి వివరాలు చూడండి.'
            : language === 'hi'
            ? 'विस्तृत जानकारी देखने के लिए किसी भी घाट, पार्किंग हब, शटल रूट, सड़क या घटना पर क्लिक करें।'
            : 'Click any ghat, parking hub, shuttle route, road corridor, or incident marker to inspect live details.'}
        </p>
      </Card>
    );
  }

  // 1. GHAT DETAIL VIEW
  if (selectedFeature.type === 'GHAT') {
    const ghat = state.ghats.find((g) => g.id === selectedFeature.id);
    if (!ghat) return null;

    const occupancyPct = Math.round(
      (ghat.currentOccupancyCount / ghat.maxCapacityCount) * 100
    );
    const linkedParkings = state.parkingHubs.filter((p) =>
      ghat.nearestParkingIds.includes(p.id)
    );
    const linkedShuttles = state.shuttles.filter((s) =>
      ghat.connectedShuttleIds.includes(s.id)
    );

    return (
      <Card portal={portal} data-testid="location-detail-panel" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono opacity-65">{ghat.code}</span>
              <SimulationBadge
                source={ghat.provenance.source}
                portal={portal}
                compact
              />
            </div>
            <h3 className="text-base font-bold mt-1">{t(ghat.name)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="p-1.5 rounded-lg hover:bg-slate-500/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusIndicator level={ghat.crowdLevel} portal={portal} />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10">
            <Clock className="w-3.5 h-3.5" />
            <span>
              ~{ghat.estimatedBathingWaitMinutes}{' '}
              {language === 'te' ? 'ని. నిరీక్షణ' : language === 'hi' ? 'मिनट प्रतीक्षा' : 'mins wait'}
            </span>
          </span>
        </div>

        <p className="text-xs leading-relaxed opacity-85">{t(ghat.description)}</p>

        <MetricCapacityBar
          portal={portal}
          label={
            language === 'te'
              ? 'ప్రస్తుత ఘాట్ సామర్థ్యం'
              : language === 'hi'
              ? 'वर्तमान घाट क्षमता'
              : 'Ghat Crowd Occupancy'
          }
          valuePercent={occupancyPct}
          valueLabel={`${ghat.currentOccupancyCount.toLocaleString()} / ${ghat.maxCapacityCount.toLocaleString()} (${occupancyPct}%)`}
        />

        {/* Accessibility & Safety Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl border border-current/10 flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-teal-500 shrink-0" />
            <span>
              {ghat.wheelchairRampAvailable
                ? language === 'te'
                  ? 'వీల్‌చైర్ ర్యాంప్ ఉంది'
                  : language === 'hi'
                  ? 'व्हीलचेयर रैंप उपलब्ध'
                  : 'Wheelchair Ramp Active'
                : 'Standard Steps'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-current/10 flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {language === 'te'
                ? '24x7 వైద్య శిబిరం'
                : language === 'hi'
                ? '24x7 मेडिकल कैंप'
                : '24x7 Medical Camp'}
            </span>
          </div>
        </div>

        {ghat.activeAdvisory && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              portal === 'command'
                ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t(ghat.activeAdvisory)}</span>
          </div>
        )}

        {/* Connected Shuttles & Parking */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">
            {language === 'te'
              ? 'అనుసంధానమైన షటిల్స్ & పార్కింగ్'
              : language === 'hi'
              ? 'जुड़े हुए शटल एवं पार्किंग'
              : 'Connected Shuttles & Parking'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {linkedShuttles.map((sh) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => onSelectFeature({ type: 'SHUTTLE', id: sh.id })}
                className="px-2.5 py-1 rounded-lg border border-current/15 text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-500/10"
              >
                <Bus className="w-3 h-3 text-cyan-500" />
                <span>
                  {sh.routeCode} ({sh.estimatedArrivalMinutes}m)
                </span>
              </button>
            ))}
            {linkedParkings.map((pk) => (
              <button
                key={pk.id}
                type="button"
                onClick={() => onSelectFeature({ type: 'PARKING', id: pk.id })}
                className="px-2.5 py-1 rounded-lg border border-current/15 text-xs font-semibold inline-flex items-center gap-1 hover:bg-slate-500/10"
              >
                <ParkingSquare className="w-3 h-3 text-blue-500" />
                <span>
                  {pk.code} ({pk.availableSpaces} free)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Pilgrim CTA */}
        {onSelectGhatForJourney && (
          <Button
            portal={portal}
            variant="primary"
            className="w-full"
            onClick={() => onSelectGhatForJourney(ghat.id)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {language === 'te'
              ? 'ఈ ఘాట్‌కు ప్రయాణం ప్లాన్ చేయండి'
              : language === 'hi'
              ? 'इस घाट के लिए यात्रा योजना बनाएं'
              : 'Plan Journey to This Ghat'}
          </Button>
        )}

        {/* Authority Command Operator Controls */}
        {enableOperatorControls && (
          <div className="pt-3 border-t border-current/10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Authority Crowd Status Override (Syncs to Pilgrim Portal)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                portal={portal}
                variant="secondary"
                size="sm"
                data-testid="detail-ghat-set-low"
                onClick={() => updateGhatCrowdLevel(ghat.id, 'LOW', 10)}
              >
                Set Low (10m)
              </Button>
              <Button
                portal={portal}
                variant="secondary"
                size="sm"
                data-testid="detail-ghat-set-moderate"
                onClick={() => updateGhatCrowdLevel(ghat.id, 'MODERATE', 22)}
              >
                Set Moderate (22m)
              </Button>
              <Button
                portal={portal}
                variant="saffron"
                size="sm"
                data-testid="detail-ghat-set-high"
                onClick={() => updateGhatCrowdLevel(ghat.id, 'HIGH', 42)}
              >
                Set High (42m)
              </Button>
              <Button
                portal={portal}
                variant="danger"
                size="sm"
                data-testid="detail-ghat-set-critical"
                onClick={() => updateGhatCrowdLevel(ghat.id, 'CRITICAL', 65)}
              >
                Set Critical (65m)
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // 2. ROAD CORRIDOR DETAIL VIEW
  if (selectedFeature.type === 'ROAD') {
    const road = state.roads.find((r) => r.id === selectedFeature.id);
    if (!road) return null;

    return (
      <Card portal={portal} data-testid="location-detail-panel" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono opacity-65">{road.code}</span>
              <SimulationBadge
                source={road.provenance.source}
                portal={portal}
                compact
              />
            </div>
            <h3 className="text-base font-bold mt-1">{t(road.name)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="p-1.5 rounded-lg hover:bg-slate-500/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusIndicator level={road.status} portal={portal} />
          {road.isEmergencyRoute && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Ambulance className="w-3.5 h-3.5" />
              <span>Emergency Corridor</span>
            </span>
          )}
        </div>

        <MetricCapacityBar
          portal={portal}
          label="Corridor Congestion Index"
          valuePercent={road.congestionIndex}
          valueLabel={`${road.congestionIndex}/100 • ${road.speedKmh} km/h • ${road.monitoredVehicleCountPerHour}/hr`}
        />

        {road.closureReason && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5 text-red-500" />
              <span>Active Corridor Restriction</span>
            </div>
            <p className="mt-1 opacity-90">{t(road.closureReason)}</p>
          </div>
        )}

        {enableOperatorControls && (
          <div className="pt-3 border-t border-current/10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Corridor Traffic Control (Syncs to Pilgrim Journey Planner)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                portal={portal}
                variant="success"
                size="sm"
                data-testid="detail-road-open"
                onClick={() => setRoadStatus(road.id, 'OPEN')}
              >
                Set Open
              </Button>
              <Button
                portal={portal}
                variant="saffron"
                size="sm"
                data-testid="detail-road-divert"
                onClick={() => setRoadStatus(road.id, 'DIVERTED')}
              >
                Set Diverted
              </Button>
              <Button
                portal={portal}
                variant="danger"
                size="sm"
                className="col-span-2"
                data-testid="detail-road-close"
                onClick={() => setRoadStatus(road.id, 'CLOSED')}
              >
                Close Road to Private Vehicles
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // 3. PARKING HUB DETAIL VIEW
  if (selectedFeature.type === 'PARKING') {
    const hub = state.parkingHubs.find((p) => p.id === selectedFeature.id);
    if (!hub) return null;

    return (
      <Card portal={portal} data-testid="location-detail-panel" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono opacity-65">{hub.code}</span>
              <SimulationBadge
                source={hub.provenance.source}
                portal={portal}
                compact
              />
            </div>
            <h3 className="text-base font-bold mt-1">{t(hub.name)}</h3>
            <p className="text-xs opacity-70">{t(hub.zone)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="p-1.5 rounded-lg hover:bg-slate-500/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <StatusIndicator level={hub.status} portal={portal} />

        <MetricCapacityBar
          portal={portal}
          label="Parking Occupancy"
          valuePercent={hub.occupancyPercent}
          valueLabel={`${hub.availableSpaces.toLocaleString()} free / ${hub.totalCapacity.toLocaleString()} total (${hub.occupancyPercent}%)`}
        />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl border border-current/10">
            <div className="opacity-65">Distance to Ghat</div>
            <div className="font-bold mt-0.5">{hub.distanceToDestinationKm} km</div>
          </div>
          <div className="p-2.5 rounded-xl border border-current/10">
            <div className="opacity-65">Walking Distance</div>
            <div className="font-bold mt-0.5">
              {hub.walkingDistanceMeters}m (~{hub.walkingDurationMinutes} mins)
            </div>
          </div>
        </div>

        <p className="text-xs opacity-85">{t(hub.recommendationReason)}</p>

        {enableOperatorControls && (
          <div className="pt-3 border-t border-current/10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Parking Capacity Control
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                portal={portal}
                variant="success"
                size="sm"
                data-testid="detail-parking-available"
                onClick={() => updateParkingOccupancy(hub.id, 45, 'AVAILABLE')}
              >
                45% Open
              </Button>
              <Button
                portal={portal}
                variant="saffron"
                size="sm"
                data-testid="detail-parking-filling"
                onClick={() => updateParkingOccupancy(hub.id, 88, 'FILLING_FAST')}
              >
                88% Fast
              </Button>
              <Button
                portal={portal}
                variant="danger"
                size="sm"
                data-testid="detail-parking-full"
                onClick={() => updateParkingOccupancy(hub.id, 99, 'FULL')}
              >
                99% Full
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // 4. SHUTTLE CORRIDOR DETAIL VIEW
  if (selectedFeature.type === 'SHUTTLE') {
    const shuttle = state.shuttles.find((s) => s.id === selectedFeature.id);
    if (!shuttle) return null;

    return (
      <Card portal={portal} data-testid="location-detail-panel" className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono opacity-65">{shuttle.routeCode}</span>
              <SimulationBadge
                source={shuttle.provenance.source}
                portal={portal}
                compact
              />
            </div>
            <h3 className="text-base font-bold mt-1">{t(shuttle.name)}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="p-1.5 rounded-lg hover:bg-slate-500/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <StatusIndicator level={shuttle.status} portal={portal} />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl border border-current/10">
            <div className="opacity-65">Next Arrival (ETA)</div>
            <div className="font-bold mt-0.5">
              {shuttle.estimatedArrivalMinutes} mins (Every {shuttle.frequencyMinutes}m)
            </div>
          </div>
          <div className="p-2.5 rounded-xl border border-current/10">
            <div className="opacity-65">Available Seats</div>
            <div className="font-bold mt-0.5">
              {shuttle.availableCapacitySeats} seats ({shuttle.activeBusesCount} buses)
            </div>
          </div>
        </div>

        <MetricCapacityBar
          portal={portal}
          label="Fleet Occupancy"
          valuePercent={shuttle.occupancyPercent}
          valueLabel={`${shuttle.occupancyPercent}% occupied`}
        />

        <p className="text-xs opacity-85">{t(shuttle.advisoryNote)}</p>

        {enableOperatorControls && (
          <div className="pt-3 border-t border-current/10 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Shuttle Fleet Dispatch Control
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                portal={portal}
                variant="primary"
                size="sm"
                data-testid="detail-shuttle-boost"
                onClick={() =>
                  updateShuttleService(
                    shuttle.id,
                    2,
                    shuttle.activeBusesCount + 6,
                    'FREQUENT'
                  )
                }
              >
                Boost Fleet (+6 Buses, 2m)
              </Button>
              <Button
                portal={portal}
                variant="secondary"
                size="sm"
                data-testid="detail-shuttle-normal"
                onClick={() =>
                  updateShuttleService(shuttle.id, 5, 20, 'MODERATE_WAIT')
                }
              >
                Standard Schedule (5m)
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // 5. INCIDENT DETAIL VIEW
  const incident = state.incidents.find((i) => i.id === selectedFeature.id);
  if (!incident) return null;

  return (
    <Card portal={portal} data-testid="location-detail-panel" className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono opacity-65">{incident.code}</span>
            <SimulationBadge
              source={incident.provenance.source}
              portal={portal}
              compact
            />
          </div>
          <h3 className="text-base font-bold mt-1">{t(incident.title)}</h3>
          <p className="text-xs opacity-70">{t(incident.locationName)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="p-1.5 rounded-lg hover:bg-slate-500/15"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          {incident.priority}
        </span>
        <span className="px-2.5 py-1 rounded-full font-semibold bg-slate-500/15">
          Status: {incident.status}
        </span>
      </div>

      <p className="text-xs opacity-85">{t(incident.description)}</p>

      {enableOperatorControls && incident.status !== 'CLOSED' && (
        <div className="pt-3 border-t border-current/10 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Quick Incident Lifecycle Action
          </div>
          <div className="flex flex-wrap gap-2">
            {incident.status !== 'RESPONDING' && incident.status !== 'RESOLVED' && (
              <Button
                portal={portal}
                variant="primary"
                size="sm"
                data-testid="detail-incident-responding"
                onClick={() =>
                  updateIncidentStatus(
                    incident.id,
                    'RESPONDING',
                    'Map Operator',
                    'Response unit active on scene.'
                  )
                }
              >
                Mark Responding
              </Button>
            )}
            {incident.status !== 'RESOLVED' && (
              <Button
                portal={portal}
                variant="success"
                size="sm"
                data-testid="detail-incident-resolve"
                onClick={() =>
                  updateIncidentStatus(
                    incident.id,
                    'RESOLVED',
                    'Map Operator',
                    'Verified resolved from operational map.'
                  )
                }
              >
                Resolve Incident
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
