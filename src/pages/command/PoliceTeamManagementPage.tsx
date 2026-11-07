import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  ProvenanceBadge,
  SimulationBadge,
} from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { PoliceResponseTeam } from '@/types';

export const PoliceTeamManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const state = useMobilityStore((s) => s.state);
  const assignPoliceTeam = useMobilityStore((s) => s.assignPoliceTeam);

  const [searchQuery, setSearchQuery] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState<
    'ALL' | PoliceResponseTeam['unitType']
  >('ALL');

  const filteredTeams = useMemo(() => {
    return state.policeTeams.filter((team) => {
      if (unitTypeFilter !== 'ALL' && team.unitType !== unitTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          team.teamIdentifier.toLowerCase().includes(q) ||
          team.teamLeader.toLowerCase().includes(q) ||
          team.contactCallsign.toLowerCase().includes(q) ||
          team.assignedLocationName.en.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [state.policeTeams, unitTypeFilter, searchQuery]);

  const totalPersonnel = useMemo(
    () => state.policeTeams.reduce((acc, t) => acc + t.personnelStrength, 0),
    [state.policeTeams]
  );

  return (
    <div data-testid="police-team-management-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-300">
              <Users className="w-3.5 h-3.5" />
              {t({
                en: 'Police, NDRF, Traffic & Medical Rapid Response Roster',
                te: 'పోలీస్, NDRF, ట్రాఫిక్ & వైద్య ప్రతిస్పందన బృందాల జాబితా',
                hi: 'पुलिस, NDRF, ट्रैफिक और चिकित्सा त्वरित प्रतिक्रिया रोस्टर',
              })}
            </span>
            <SimulationBadge source="SIMULATED_BASELINE" portal="command" />
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
            {t({
              en: 'Field Unit Assignments, Radio Callsigns & Incident Dispatch',
              te: 'ఫీల్డ్ బృందాల అసైన్‌మెంట్‌లు, రేడియో కాల్‌సైన్లు & డిస్పాచ్',
              hi: 'फील्ड यूनिट असाइनमेंट, रेडियो कॉलसाइन और घटना डिस्पैच',
            })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {t({
              en: `${state.policeTeams.length} simulated response units (${totalPersonnel} total personnel) deployed across Rajamahendravaram & Kovvur sectors. All unit assignments are simulated for demonstration.`,
              te: `రాజమహేంద్రవరం & కొవ్వూరు సెక్టార్లలో ${state.policeTeams.length} అనుకరించిన ప్రతిస్పందన బృందాలు (${totalPersonnel} సిబ్బంది) మోహరించబడ్డాయి.`,
              hi: `राजमहेंद्रवरम और कोव्वूरु सेक्टरों में ${state.policeTeams.length} सिम्युलेटेड प्रतिक्रिया इकाइयाँ (${totalPersonnel} कुल कर्मी) तैनात हैं।`,
            })}
          </p>
        </div>
      </div>

      {/* Search & Unit Type Filter Bar */}
      <Card portal="command" padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team ID (e.g., TRF-1, NDRF-4), leader name, callsign, or ghat..."
              data-testid="police-team-search-input"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-10 pr-4 text-xs text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'ALL', label: `All Units (${state.policeTeams.length})` },
                { id: 'TRAFFIC_ENFORCEMENT', label: 'Traffic Enforcement' },
                { id: 'CROWD_MANAGEMENT', label: 'Crowd Control' },
                { id: 'MEDICAL_RAPID_RESPONSE', label: 'Medical Response' },
                { id: 'RIVER_PATROL_NDRF', label: 'NDRF River Patrol' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setUnitTypeFilter(f.id)}
                data-testid={`team-filter-${f.id}`}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  unitTypeFilter === f.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-300 border border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map((team) => {
          const linkedIncident = state.incidents.find(
            (i) => i.id === team.associatedIncidentId
          );

          return (
            <Card
              key={team.id}
              portal="command"
              elevated
              data-testid={`police-team-card-${team.id}`}
              className="flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-cyan-300">
                        {team.teamIdentifier}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                        {team.unitType}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-extrabold text-white">
                      {team.teamLeader}
                    </h2>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1 font-mono text-cyan-300">
                        <Radio className="w-3.5 h-3.5" />
                        {team.contactCallsign}
                      </span>
                      <span>• {team.personnelStrength} Personnel</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      data-testid={`team-status-${team.id}`}
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-extrabold ${
                        team.status === 'DEPLOYED_ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : team.status === 'EN_ROUTE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {team.status}
                    </span>
                    <ProvenanceBadge provenance={team.provenance} portal="command" />
                  </div>
                </div>

                {/* Location & Assignment */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      Assigned Sector:
                    </span>
                    <span className="font-bold text-white">
                      {t(team.assignedLocationName)}
                    </span>
                  </div>
                  <div className="text-slate-300 pt-1 border-t border-slate-800/80">
                    <strong className="text-cyan-300">Simulated Assignment: </strong>
                    {t(team.currentAssignment)}
                  </div>
                  {linkedIncident && (
                    <div className="text-amber-300 font-mono text-[11px] pt-1">
                      Linked Incident: {linkedIncident.code} — {t(linkedIncident.title)}
                    </div>
                  )}
                </div>
              </div>

              {/* Dispatch / Reassignment Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <select
                    aria-label={`Assign incident for ${team.teamIdentifier}`}
                    value={team.associatedIncidentId || ''}
                    data-testid={`assign-team-select-${team.id}`}
                    onChange={(e) => {
                      const incId = e.target.value || null;
                      assignPoliceTeam(team.id, incId);
                    }}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-cyan-300"
                  >
                    <option value="">Standby / Patrol Sector Only</option>
                    {state.incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        Dispatch to {inc.code}: {inc.title.en.slice(0, 38)}...
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  portal="command"
                  variant="secondary"
                  size="sm"
                  data-testid={`quick-dispatch-btn-${team.id}`}
                  onClick={() => {
                    const firstOpen =
                      state.incidents.find(
                        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
                      ) || state.incidents[0];
                    if (firstOpen) {
                      assignPoliceTeam(team.id, firstOpen.id);
                    }
                  }}
                >
                  {t({
                    en: 'Dispatch to Priority Alert',
                    te: 'అత్యవసర అలర్ట్‌కు పంపండి',
                    hi: 'प्राथमिकता अलर्ट पर भेजें',
                  })}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
