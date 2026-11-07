import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  Dialog,
  ProvenanceBadge,
} from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useTranslation } from '@/i18n/useTranslation';
import {
  IncidentCategory,
  IncidentPriority,
  IncidentStatus,
} from '@/types';

const STATUS_SEQUENCE: IncidentStatus[] = [
  'NEW',
  'ASSIGNED',
  'RESPONDING',
  'RESOLVED',
  'CLOSED',
];

export const IncidentManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const state = useMobilityStore((s) => s.state);
  const createIncident = useMobilityStore((s) => s.createIncident);
  const updateIncidentStatus = useMobilityStore((s) => s.updateIncidentStatus);
  const activeRoleProfile = useAuthorityAuthStore((s) => s.getActiveRoleProfile());

  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Create Incident Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<IncidentCategory>('CROWD_SURGE');
  const [newPriority, setNewPriority] = useState<IncidentPriority>('HIGH');
  const [newGhatId, setNewGhatId] = useState('ghat-pushkar');
  const [newTeamId, setNewTeamId] = useState<string>('team-crowd-2');
  const [newDescription, setNewDescription] = useState('');

  // Operator notes per incident
  const [operatorNotes, setOperatorNotes] = useState<Record<string, string>>({});

  const filteredIncidents = state.incidents.filter((inc) => {
    if (statusFilter === 'ALL') return true;
    return inc.status === statusFilter;
  });

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const ghat = state.ghats.find((g) => g.id === newGhatId) || state.ghats[0];
    const titleText =
      newTitle.trim() || `Field Alert at ${ghat.name.en} (${newCategory})`;
    const descText =
      newDescription.trim() ||
      `Logged by ${activeRoleProfile.operatorName}. Field response unit dispatched for immediate containment.`;

    createIncident({
      title: {
        en: titleText,
        te: `${ghat.name.te} వద్ద ఫీల్డ్ అలర్ట్: ${titleText}`,
        hi: `${ghat.name.hi} पर फील्ड अलर्ट: ${titleText}`,
      },
      category: newCategory,
      priority: newPriority,
      locationName: ghat.name,
      linkedGhatId: ghat.id,
      assignedTeamId: newTeamId || null,
      description: {
        en: descText,
        te: descText,
        hi: descText,
      },
      actorName: `${activeRoleProfile.operatorName} (${activeRoleProfile.badgeCode})`,
    });

    setNewTitle('');
    setNewDescription('');
    setCreateModalOpen(false);
  };

  const handleTransitionStatus = (
    incidentId: string,
    nextStatus: IncidentStatus,
    assignedTeamId?: string | null
  ) => {
    const customNote =
      operatorNotes[incidentId]?.trim() ||
      `Transitioned to ${nextStatus} by ${activeRoleProfile.operatorName}`;
    updateIncidentStatus(
      incidentId,
      nextStatus,
      `${activeRoleProfile.operatorName} (${activeRoleProfile.badgeCode})`,
      customNote,
      assignedTeamId
    );
    setOperatorNotes((prev) => ({ ...prev, [incidentId]: '' }));
  };

  return (
    <div data-testid="incident-management-page" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-0.5 text-xs font-bold text-red-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            {t({
              en: '5-Stage Incident Lifecycle & Dispatch Management',
              te: '5-దశల సంఘటనల నిర్వహణ & డిస్పాచ్ కేంద్రం',
              hi: '5-चरणीय घटना जीवनचक्र एवं डिस्पैच प्रबंधन',
            })}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
            {t({
              en: 'Corridor Incident Log, Unit Assignment & Audit Timeline',
              te: 'కారిడార్ సంఘటనల లాగ్, బృందాల నియామకం & ఆడిట్ టైమ్‌లైన్',
              hi: 'कॉरिडोर घटना लॉग, इकाई आवंटन और ऑडिट टाइमलाइन',
            })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {t({
              en: 'Track every incident from NEW → ASSIGNED → RESPONDING → RESOLVED → CLOSED. Critical ghat incidents automatically post live advisories to the Pilgrim Portal.',
              te: 'NEW → ASSIGNED → RESPONDING → RESOLVED → CLOSED వరకు ప్రతి సంఘటనను ట్రాక్ చేయండి.',
              hi: 'NEW → ASSIGNED → RESPONDING → RESOLVED → CLOSED तक प्रत्येक घटना को ट्रैक करें।',
            })}
          </p>
        </div>

        <Button
          portal="command"
          variant="primary"
          size="md"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          data-testid="open-create-incident-modal-btn"
          onClick={() => setCreateModalOpen(true)}
        >
          {t({
            en: 'Log New Operational Incident',
            te: 'కొత్త సంఘటనను నమోదు చేయండి',
            hi: 'नई परिचालन घटना दर्ज करें',
          })}
        </Button>
      </div>

      {/* Lifecycle Stage Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          data-testid="incident-filter-ALL"
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-900 text-slate-300 border border-slate-700'
          }`}
        >
          ALL ({state.incidents.length})
        </button>
        {STATUS_SEQUENCE.map((st) => {
          const count = state.incidents.filter((i) => i.status === st).length;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              data-testid={`incident-filter-${st}`}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 border border-slate-700'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {filteredIncidents.map((inc) => {
          const currentIdx = STATUS_SEQUENCE.indexOf(inc.status);
          const nextStatus =
            currentIdx < STATUS_SEQUENCE.length - 1
              ? STATUS_SEQUENCE[currentIdx + 1]
              : null;

          return (
            <Card
              key={inc.id}
              portal="command"
              elevated
              data-testid={`incident-card-${inc.id}`}
              className="space-y-4"
            >
              {/* Top Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-amber-300">
                      {inc.code}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                        inc.priority === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : inc.priority === 'HIGH'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {inc.priority} PRIORITY
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                      {inc.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {t(inc.locationName)}
                    </span>
                  </div>
                  <h2 className="mt-1.5 font-display text-lg font-extrabold text-white">
                    {t(inc.title)}
                  </h2>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    data-testid={`incident-status-badge-${inc.id}`}
                    className="rounded-full border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 font-mono text-xs font-extrabold text-cyan-300"
                  >
                    {inc.status}
                  </span>
                  <ProvenanceBadge provenance={inc.provenance} portal="command" />
                </div>
              </div>

              {/* 5-Stage Visual Lifecycle Stepper */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-[11px] font-mono font-bold">
                {STATUS_SEQUENCE.map((stage, idx) => {
                  const isCurrent = inc.status === stage;
                  const isPassed = idx < currentIdx;
                  return (
                    <div
                      key={stage}
                      className={`rounded-lg py-1.5 border ${
                        isCurrent
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                          : isPassed
                          ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-500'
                      }`}
                    >
                      {idx + 1}. {stage}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {t(inc.description)}
              </p>

              {/* Resolution Summary if Resolved/Closed */}
              {inc.resolutionSummary && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Resolution Summary:</strong> {t(inc.resolutionSummary)}
                  </span>
                </div>
              )}

              {/* Team Assignment & Status Transition Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
                <div className="lg:col-span-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Assigned Unit:</span>
                  <select
                    aria-label={`Assign response team for ${inc.code}`}
                    value={inc.assignedTeamId || ''}
                    onChange={(e) =>
                      handleTransitionStatus(
                        inc.id,
                        inc.status === 'NEW' ? 'ASSIGNED' : inc.status,
                        e.target.value || null
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-cyan-300"
                  >
                    <option value="">Unassigned</option>
                    {state.policeTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.teamIdentifier} ({team.teamLeader})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-5">
                  <input
                    type="text"
                    value={operatorNotes[inc.id] || ''}
                    onChange={(e) =>
                      setOperatorNotes((prev) => ({
                        ...prev,
                        [inc.id]: e.target.value,
                      }))
                    }
                    placeholder={t({
                      en: 'Add operator audit note or field resolution summary...',
                      te: 'ఆపరేటర్ నోట్ లేదా పరిష్కార వివరాలు చేర్చండి...',
                      hi: 'ऑपरेटर ऑडिट नोट या समाधान विवरण जोड़ें...',
                    })}
                    data-testid={`incident-note-input-${inc.id}`}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div className="lg:col-span-3 flex justify-end gap-2">
                  {nextStatus && (
                    <Button
                      portal="command"
                      variant="primary"
                      size="sm"
                      data-testid={`advance-incident-${inc.id}`}
                      onClick={() => handleTransitionStatus(inc.id, nextStatus)}
                    >
                      Advance → {nextStatus}
                    </Button>
                  )}
                </div>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Timestamped Audit Timeline ({inc.timeline.length})</span>
                </div>
                <div className="space-y-1 pl-2 border-l-2 border-slate-800 text-xs">
                  {inc.timeline.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center gap-2 text-slate-300"
                    >
                      <span className="font-mono text-[11px] text-cyan-400">
                        [{entry.timestamp}]
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                        {entry.status}
                      </span>
                      <span className="font-semibold text-white">
                        {entry.actor}:
                      </span>
                      <span className="text-slate-400">{t(entry.note)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create New Incident Modal */}
      <Dialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        portal="command"
        title={t({
          en: 'Log New Operational Incident & Dispatch Team',
          te: 'కొత్త ఆపరేషనల్ సంఘటన నమోదు & బృందం నియామకం',
          hi: 'नई परिचालन घटना दर्ज करें और टीम तैनात करें',
        })}
        description={t({
          en: 'New incidents immediately synchronize across browser tabs and update Pilgrim Portal advisories.',
          te: 'కొత్త సంఘటనలు వెంటనే అన్ని ట్యాబ్‌లలో మరియు భక్తుల పోర్టల్‌లో సింక్ అవుతాయి.',
          hi: 'नई घटनाएँ तुरंत सभी टैब और पिलग्रिम पोर्टल पर सिंक हो जाती हैं।',
        })}
      >
        <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
          <div>
            <label
              htmlFor="new-inc-title"
              className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
            >
              Incident Headline
            </label>
            <input
              id="new-inc-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Queue Barricade Pressure at Pushkar Ghat Gate 3"
              data-testid="new-incident-title-input"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-inc-category"
                className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Category
              </label>
              <select
                id="new-inc-category"
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as IncidentCategory)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                <option value="CROWD_SURGE">CROWD_SURGE</option>
                <option value="TRAFFIC_BOTTLENECK">TRAFFIC_BOTTLENECK</option>
                <option value="MEDICAL_ASSISTANCE">MEDICAL_ASSISTANCE</option>
                <option value="SHUTTLE_DELAY">SHUTTLE_DELAY</option>
                <option value="BARRICADE_BREACH">BARRICADE_BREACH</option>
                <option value="LOST_PILGRIM_ELDERLY">LOST_PILGRIM_ELDERLY</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="new-inc-priority"
                className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Priority
              </label>
              <select
                id="new-inc-priority"
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as IncidentPriority)
                }
                data-testid="new-incident-priority-select"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-inc-ghat"
                className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Affected Ghat Location
              </label>
              <select
                id="new-inc-ghat"
                value={newGhatId}
                onChange={(e) => setNewGhatId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                {state.ghats.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} — {t(g.name)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="new-inc-team"
                className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
              >
                Assign Response Unit
              </label>
              <select
                id="new-inc-team"
                value={newTeamId}
                onChange={(e) => setNewTeamId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
              >
                <option value="">Leave Unassigned (NEW)</option>
                {state.policeTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamIdentifier} ({team.teamLeader})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="new-inc-desc"
              className="block font-bold uppercase tracking-wider text-slate-300 mb-1"
            >
              Operational Details & Dispatch Instructions
            </label>
            <textarea
              id="new-inc-desc"
              rows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Specify exact sector, required barricade control, or ambulance access route..."
              data-testid="new-incident-desc-input"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              portal="command"
              variant="ghost"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              portal="command"
              variant="primary"
              data-testid="submit-create-incident-btn"
            >
              Create & Broadcast Incident
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

