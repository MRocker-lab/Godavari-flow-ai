import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  MapPin,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  Dialog,
  ProvenanceBadge,
  SimulationBadge,
  StatusIndicator,
} from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAuthorityAuthStore } from '@/store/useAuthorityAuthStore';
import { useTranslation } from '@/i18n/useTranslation';
import { AIAuthorityRecommendation } from '@/types';

export const AIDecisionCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const state = useMobilityStore((s) => s.state);
  const approveAIRecommendation = useMobilityStore((s) => s.approveAIRecommendation);
  const rejectAIRecommendation = useMobilityStore((s) => s.rejectAIRecommendation);
  const markAIRecommendationSimulated = useMobilityStore(
    (s) => s.markAIRecommendationSimulated
  );
  const activeRoleProfile = useAuthorityAuthStore((s) => s.getActiveRoleProfile());

  const [confirmingRec, setConfirmingRec] =
    useState<AIAuthorityRecommendation | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING_ONLY'>('ALL');

  const filteredRecs = state.aiRecommendations.filter((rec) => {
    if (filterStatus === 'PENDING_ONLY') {
      return rec.decisionStatus === 'PENDING_REVIEW' || rec.decisionStatus === 'SIMULATED_IN_TWIN';
    }
    return true;
  });

  const handleConfirmApprove = () => {
    if (!confirmingRec) return;
    approveAIRecommendation(confirmingRec.id, activeRoleProfile.operatorName);
    setConfirmingRec(null);
  };

  return (
    <div data-testid="ai-decision-centre-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0F172A] p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              {t({
                en: 'AI Operational Decision Centre',
                te: 'AI ఆపరేషనల్ డెసిషన్ సెంటర్',
                hi: 'AI परिचालन निर्णय केंद्र',
              })}
            </span>
            <SimulationBadge source="LOCAL_DOMAIN_AI" portal="command" compact />
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-white">
            {t({
              en: 'Predictive Corridor Advisories & Human-in-the-Loop Execution',
              te: 'ముందస్తు కారిడార్ సూచనలు & అధికారుల ఆమోదంతో అమలు',
              hi: 'पूर्वानुमानित कॉरिडोर सलाह और प्राधिकरण अनुमोदन निष्पादन',
            })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {t({
              en: 'Each recommendation explains the detected condition, predicted consequence, reasoning, and expected impact. Approving executes the operational intervention across both portals.',
              te: 'ప్రతి సిఫార్సు సమస్య, ఊహించిన పరిణామాలు, కారణం మరియు ప్రభావాన్ని వివరిస్తుంది. ఆమోదించిన వెంటనే రెండు పోర్టల్స్‌లో అమలు చేయబడుతుంది.',
              hi: 'प्रत्येक सिफारिश स्थिति, संभावित परिणाम, तर्क और अपेक्षित प्रभाव को स्पष्ट करती है। स्वीकृत करने पर दोनों पोर्टलों पर तुरंत लागू होती है।',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              filterStatus === 'ALL'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-700'
            }`}
          >
            {t({
              en: `All Recommendations (${state.aiRecommendations.length})`,
              te: `అన్ని సిఫార్సులు (${state.aiRecommendations.length})`,
              hi: `सभी सिफारिशें (${state.aiRecommendations.length})`,
            })}
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('PENDING_ONLY')}
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              filterStatus === 'PENDING_ONLY'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-700'
            }`}
          >
            {t({
              en: 'Pending Review Only',
              te: 'పెండింగ్ మాత్రమే',
              hi: 'केवल लंबित समीक्षा',
            })}
          </button>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isApproved = rec.decisionStatus === 'APPROVED_APPLIED';
          const isRejected = rec.decisionStatus === 'REJECTED';

          return (
            <Card
              key={rec.id}
              portal="command"
              elevated
              data-testid={`ai-decision-card-${rec.id}`}
              className="space-y-4"
            >
              {/* Top Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 font-mono text-xs font-extrabold text-cyan-300">
                      {rec.code}
                    </span>
                    <StatusIndicator
                      level={rec.severity}
                      portal="command"
                      size="sm"
                    />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {t(rec.affectedLocationName)}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-extrabold text-white">
                    {t(rec.recommendedAction)}
                  </h2>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    data-testid={`rec-status-${rec.id}`}
                    className={`rounded-full px-3 py-1 font-mono text-xs font-extrabold ${
                      isApproved
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : isRejected
                        ? 'bg-red-950 text-red-300 border border-red-500/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                    }`}
                  >
                    {rec.decisionStatus}
                  </span>
                  <ProvenanceBadge provenance={rec.provenance} portal="command" />
                </div>
              </div>

              {/* 4-Quadrant Analytical Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-amber-300">
                    {t({
                      en: '1. Detected Corridor Condition',
                      te: '1. గుర్తించిన పరిస్థితి',
                      hi: '1. पहचानी गई कॉरिडोर स्थिति',
                    })}
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {t(rec.detectedCondition)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-red-300">
                    {t({
                      en: '2. Predicted Consequences (If Unaddressed)',
                      te: '2. ఊహించిన పరిణామాలు',
                      hi: '2. पूर्वानुमानित परिणाम (यदि अनदेखा किया गया)',
                    })}
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {t(rec.predictedConsequences)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-cyan-300">
                    {t({
                      en: '3. AI Operational Reasoning',
                      te: '3. AI విశ్లేషణ & కారణం',
                      hi: '3. AI परिचालन तर्क',
                    })}
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {t(rec.reasoning)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-1">
                  <div className="font-bold uppercase tracking-wider text-emerald-300">
                    {t({
                      en: '4. Expected Quantified Impact',
                      te: '4. ఆశించిన సానుకూల ప్రభావం',
                      hi: '4. अपेक्षित परिमाणात्मक प्रभाव',
                    })}
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {t(rec.expectedImpact)}
                  </p>
                </div>
              </div>

              {/* Action Footer: Simulate, Reject, Approve */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>
                    {t({
                      en: `Authorizing Role: ${activeRoleProfile.operatorName} (${activeRoleProfile.badgeCode})`,
                      te: `అధికారి: ${activeRoleProfile.operatorName} (${activeRoleProfile.badgeCode})`,
                      hi: `अधिकृत अधिकारी: ${activeRoleProfile.operatorName} (${activeRoleProfile.badgeCode})`,
                    })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    portal="command"
                    variant="outline"
                    size="sm"
                    leftIcon={<Cpu className="w-4 h-4" />}
                    data-testid={`simulate-rec-btn-${rec.id}`}
                    onClick={() => {
                      markAIRecommendationSimulated(rec.id);
                      navigate(
                        `/command/digital-twin?scenario=${rec.linkedDigitalTwinScenarioId}`
                      );
                    }}
                  >
                    {t({
                      en: 'Simulate in Digital Twin',
                      te: 'డిజిటల్ ట్విన్‌లో పరీక్షించండి',
                      hi: 'डिजिटल ट्विन में सिम्युलेट करें',
                    })}
                  </Button>

                  <Button
                    portal="command"
                    variant="danger"
                    size="sm"
                    disabled={isRejected}
                    leftIcon={<XCircle className="w-4 h-4" />}
                    data-testid={`reject-rec-btn-${rec.id}`}
                    onClick={() =>
                      rejectAIRecommendation(rec.id, activeRoleProfile.operatorName)
                    }
                  >
                    {isRejected
                      ? t({ en: 'Rejected', te: 'తిరస్కరించబడింది', hi: 'अस्वीकृत' })
                      : t({ en: 'Reject Advisory', te: 'తిరస్కరించు', hi: 'अस्वीकार करें' })}
                  </Button>

                  <Button
                    portal="command"
                    variant={isApproved ? 'success' : 'primary'}
                    size="sm"
                    disabled={isApproved}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    data-testid={`approve-rec-btn-${rec.id}`}
                    onClick={() => setConfirmingRec(rec)}
                  >
                    {isApproved
                      ? t({
                          en: '✓ Approved & Synced to Pilgrim Portal',
                          te: '✓ ఆమోదించబడింది & సింక్ అయింది',
                          hi: '✓ स्वीकृत एवं पिलग्रिम पोर्टल पर सिंक',
                        })
                      : t({
                          en: 'Approve & Execute Action',
                          te: 'ఆమోదించు & అమలు చేయి',
                          hi: 'स्वीकृत और निष्पादित करें',
                        })}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog for Consequential Operational Approval */}
      {confirmingRec && (
        <Dialog
          isOpen={Boolean(confirmingRec)}
          onClose={() => setConfirmingRec(null)}
          portal="command"
          title={t({
            en: `Confirm Authority Execution: ${confirmingRec.code}`,
            te: `అధికారిక చర్యను నిర్ధారించండి: ${confirmingRec.code}`,
            hi: `प्राधिकरण निष्पादन की पुष्टि करें: ${confirmingRec.code}`,
          })}
          description={t(confirmingRec.recommendedAction)}
          footer={
            <>
              <Button
                portal="command"
                variant="ghost"
                onClick={() => setConfirmingRec(null)}
              >
                {t({ en: 'Cancel', te: 'రద్దు చేయండి', hi: 'रद्द करें' })}
              </Button>
              <Button
                portal="command"
                variant="primary"
                data-testid="confirm-approve-rec-modal-btn"
                onClick={handleConfirmApprove}
              >
                {t({
                  en: 'Confirm & Broadcast to Pilgrim Portal',
                  te: 'నిర్ధారించండి & భక్తుల పోర్టల్‌కు పంపండి',
                  hi: 'पुष्टि करें और पिलग्रिम पोर्टल पर प्रसारित करें',
                })}
              </Button>
            </>
          }
        >
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3 text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {t({
                  en: 'This action immediately updates the canonical shared mobility store and broadcasts live route/parking/shuttle changes to all open Pilgrim Portal windows.',
                  te: 'ఈ చర్య వెంటనే షేర్డ్ స్టోర్‌ను అప్‌డేట్ చేసి, తెరిచి ఉన్న అన్ని భక్తుల పోర్టల్ విండోలకు ప్రత్యక్ష మార్పులను పంపుతుంది.',
                  hi: 'यह कार्रवाई तुरंत साझा मोबिलिटी स्टोर को अपडेट करती है और सभी खुले पिलग्रिम पोर्टल विंडो पर लाइव परिवर्तन प्रसारित करती है।',
                })}
              </span>
            </div>
            <p>
              <strong>Expected Impact:</strong> {t(confirmingRec.expectedImpact)}
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
