import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accessibility,
  CheckCircle2,
  Eye,
  HeartPulse,
  LifeBuoy,
  Navigation,
  PhoneCall,
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/design-system';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { IncidentCategory, IncidentPriority } from '@/types';

export const SafetyAndAccessibilityPage: React.FC = () => {
  const { state, createIncident } = useMobilityStore();
  const {
    seniorCitizenMode,
    highContrastMode,
    reducedMotionMode,
    toggleSeniorCitizenMode,
    toggleHighContrastMode,
    toggleReducedMotionMode,
  } = useAccessibilityStore();
  const { t } = useTranslation();

  // Assistance Request Form State
  const [pilgrimName, setPilgrimName] = useState('');
  const [selectedGhatId, setSelectedGhatId] = useState('ghat-saraswati');
  const [requestType, setRequestType] = useState<'WHEELCHAIR_BUGGY' | 'LOST_ELDERLY' | 'MEDICAL_FIRST_AID'>('WHEELCHAIR_BUGGY');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittedIncidentCode, setSubmittedIncidentCode] = useState<string | null>(null);

  const handleAssistanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGhat =
      state.ghats.find((g) => g.id === selectedGhatId) || state.ghats[0];

    const categoryMap: Record<typeof requestType, IncidentCategory> = {
      WHEELCHAIR_BUGGY: 'LOST_PILGRIM_ELDERLY',
      LOST_ELDERLY: 'LOST_PILGRIM_ELDERLY',
      MEDICAL_FIRST_AID: 'MEDICAL_ASSISTANCE',
    };

    const priorityMap: Record<typeof requestType, IncidentPriority> = {
      WHEELCHAIR_BUGGY: 'MEDIUM',
      LOST_ELDERLY: 'HIGH',
      MEDICAL_FIRST_AID: 'HIGH',
    };

    const titleByType = {
      WHEELCHAIR_BUGGY: {
        en: `Senior / Wheelchair Electric Buggy Pickup Request at ${targetGhat.name.en}`,
        te: `${targetGhat.name.te} వద్ద వృద్ధులు / వీల్‌చైర్ ఎలక్ట్రిక్ బగ్గీ సహాయ అభ్యర్థన`,
        hi: `${targetGhat.name.hi} पर वरिष्ठ / व्हीलचेयर इलेक्ट्रिक बग्गी सहायता अनुरोध`,
      },
      LOST_ELDERLY: {
        en: `Lost Family / Elderly Pilgrim Reunion Alert at ${targetGhat.name.en}`,
        te: `${targetGhat.name.te} వద్ద తప్పిపోయిన కుటుంబ సభ్యులు / వృద్ధ యాత్రికుని సమాచారం`,
        hi: `${targetGhat.name.hi} पर खोए हुए वरिष्ठ श्रद्धालु की सूचना`,
      },
      MEDICAL_FIRST_AID: {
        en: `Pilgrim Medical First-Aid Assistance Request at ${targetGhat.name.en}`,
        te: `${targetGhat.name.te} వద్ద భక్తునికి అత్యవసర వైద్య సహాయ అభ్యర్థన`,
        hi: `${targetGhat.name.hi} पर श्रद्धालु प्राथमिक चिकित्सा सहायता अनुरोध`,
      },
    }[requestType];

    const callerLabel = pilgrimName.trim() || 'Pilgrim Portal User';
    const nextCode = `INC-2026-${100 + state.incidents.length + 1}`;

    createIncident({
      title: titleByType,
      category: categoryMap[requestType],
      priority: priorityMap[requestType],
      locationName: targetGhat.name,
      linkedGhatId: targetGhat.id,
      assignedTeamId: 'team-med-3',
      description: {
        en: `Requested by ${callerLabel}: ${
          requestNotes.trim() || 'Immediate ground volunteer / buggy escort requested via Pilgrim Safety Hub.'
        }`,
        te: `${callerLabel} అభ్యర్థన: ${
          requestNotes.trim() || 'పిల్గ్రిమ్ సేఫ్టీ హబ్ ద్వారా తక్షణ వాలంటీర్ / బగ్గీ సహాయం కోరబడింది.'
        }`,
        hi: `${callerLabel} द्वारा अनुरोध: ${
          requestNotes.trim() || 'पिलग्रिम सेफ्टी हब के माध्यम से तत्काल स्वयंसेवक / बग्गी सहायता का अनुरोध।'
        }`,
      },
      actorName: `${callerLabel} (Pilgrim Portal)`,
    });

    setSubmittedIncidentCode(nextCode);
    setRequestNotes('');
  };

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="safety-accessibility-page"
    >
      {/* Emergency Helpline Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-900 via-red-800 to-[#1E3A8A] p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-100">
              <LifeBuoy className="h-4 w-4 text-amber-300" />
              {t({
                en: '24x7 Pilgrim Safety, Medical & Accessibility Command Hub',
                te: '24x7 భక్తుల భద్రత, వైద్య & వృద్ధుల సహాయ కేంద్రం',
                hi: '24x7 श्रद्धालु सुरक्षा, चिकित्सा और सुगम्यता सहायता केंद्र',
              })}
            </div>
            <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">
              {t({
                en: 'Emergency Helplines, Senior Citizen Mode & Wheelchair Buggy Dispatch',
                te: 'అత్యవసర హెల్ప్‌లైన్లు, వృద్ధుల మోడ్ & వీల్‌చైర్ బగ్గీ సేవలు',
                hi: 'आपातकालीन हेल्पलाइन, वरिष्ठ नागरिक मोड और व्हीलचेयर बग्गी सेवा',
              })}
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              {t({
                en: 'Every ghat is staffed with 24x7 DM&HO Medical Camps, NDRF river rescue boats, and free Sevadal electric buggies for elderly and differently-abled pilgrims.',
                te: 'ప్రతి ఘాట్ వద్ద 24x7 వైద్య శిబిరాలు, NDRF బోట్లు మరియు వృద్ధులు/దివ్యాంగుల కోసం ఉచిత ఎలక్ట్రిక్ బగ్గీలు అందుబాటులో ఉన్నాయి.',
                hi: 'प्रत्येक घाट पर 24x7 चिकित्सा शिविर, NDRF बचाव नौकाएँ और बुजुर्गों के लिए निःशुल्क इलेक्ट्रिक बग्गी उपलब्ध हैं।',
              })}
            </p>
          </div>

          {/* Emergency Numbers */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                num: '1902',
                label: { en: 'Pushkaralu Helpline', te: 'పుష్కర హెల్ప్‌లైన్', hi: 'पुष्करालु हेल्पलाइन' },
              },
              {
                num: '108',
                label: { en: 'Medical / Ambulance', te: 'అంబులెన్స్ / వైద్యం', hi: 'एम्बुलेंस / चिकित्सा' },
              },
              {
                num: '112',
                label: { en: 'Police & NDRF Rescue', te: 'పోలీస్ & NDRF', hi: 'पुलिस और NDRF' },
              },
            ].map((item) => (
              <div
                key={item.num}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-xs"
              >
                <div className="flex items-center justify-center gap-1.5 font-mono text-2xl font-extrabold text-amber-300">
                  <PhoneCall className="h-5 w-5" />
                  {item.num}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-white">
                  {t(item.label)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Accessibility & Senior Citizen Mode Controls */}
      <Card variant="pilgrim" padding="lg">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-[#1E3A8A]" />
              {t({
                en: 'Visual & Physical Accessibility Controls',
                te: 'দృశ్య & వృద్ధుల సౌకర్య సెట్టింగ్‌లు',
                hi: 'दृश्य और वरिष्ठ नागरिक सुगम्यता नियंत्रण',
              })}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t({
                en: 'Activate Senior Citizen Mode to enlarge all portal typography to 115%, expand touch targets to 48px+, and automatically prioritize zero-step ramped ghats in the Journey Planner.',
                te: 'అక్షరాలను 115% పెద్దవిగా చేయడానికి మరియు మెట్లు లేని ర్యాంప్ ఘాట్‌లకు ప్రాధాన్యత ఇవ్వడానికి వృద్ధుల మోడ్‌ను ఆన్ చేయండి.',
                hi: 'फ़ॉन्ट आकार को 115% तक बढ़ाने और बिना सीढ़ी वाले रैंप घाटों को प्राथमिकता देने के लिए वरिष्ठ नागरिक मोड सक्रिय करें।',
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Senior Citizen Mode Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              seniorCitizenMode
                ? 'border-2 border-[#1E3A8A] bg-blue-50/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold text-slate-900">
                {t({
                  en: 'Senior Citizen Mode',
                  te: 'వృద్ధుల మోడ్ (Senior Mode)',
                  hi: 'वरिष्ठ नागरिक मोड',
                })}
              </span>
              <Badge variant={seniorCitizenMode ? 'success' : 'neutral'}>
                {seniorCitizenMode ? 'ACTIVE' : 'OFF'}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              {t({
                en: '115% larger text, 48px minimum buttons, and automatic S3 Priority Shuttle routing.',
                te: '115% పెద్ద అక్షరాలు, పెద్ద బటన్లు మరియు S3 ప్రత్యేక షటిల్ మార్గం.',
                hi: '115% बड़ा टेक्स्ट, बड़े बटन और S3 प्राथमिकता शटल रूटिंग।',
              })}
            </p>
            <Button
              variant={seniorCitizenMode ? 'primary' : 'outline'}
              size="sm"
              fullWidth
              className="mt-3"
              onClick={toggleSeniorCitizenMode}
              data-testid="safety-toggle-senior-mode-btn"
            >
              {seniorCitizenMode
                ? t({ en: '✓ Senior Citizen Mode Enabled', te: '✓ వృద్ధుల మోడ్ ఆన్‌లో ఉంది', hi: '✓ वरिष्ठ मोड सक्रिय है' })
                : t({ en: 'Enable Senior Citizen Mode', te: 'వృద్ధుల మోడ్ ఆన్ చేయండి', hi: 'वरिष्ठ मोड चालू करें' })}
            </Button>
          </div>

          {/* High Contrast Mode Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              highContrastMode
                ? 'border-2 border-[#1E3A8A] bg-blue-50/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-teal-700" />
                {t({
                  en: 'Sunlight High Contrast',
                  te: 'అధిక కాంట్రాస్ట్ (ఎండలో స్పష్టత)',
                  hi: 'उच्च कंट्रास्ट मोड',
                })}
              </span>
              <Badge variant={highContrastMode ? 'success' : 'neutral'}>
                {highContrastMode ? 'ACTIVE' : 'OFF'}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              {t({
                en: 'Sharpens borders and contrast for bright outdoor riverfront sunlight.',
                te: 'నదీ తీరంలో ఎండలో కూడా స్క్రీన్ స్పష్టంగా కనిపించేలా చేస్తుంది.',
                hi: 'तेज धूप में नदी तट पर स्पष्ट पठनीयता के लिए।',
              })}
            </p>
            <Button
              variant={highContrastMode ? 'primary' : 'outline'}
              size="sm"
              fullWidth
              className="mt-3"
              onClick={toggleHighContrastMode}
              data-testid="safety-toggle-contrast-btn"
            >
              {highContrastMode
                ? t({ en: '✓ High Contrast Enabled', te: '✓ హై కాంట్రాస్ట్ ఆన్', hi: '✓ हाई कंट्रास्ट सक्रिय' })
                : t({ en: 'Enable High Contrast', te: 'హై కాంట్రాస్ట్ ఆన్ చేయండి', hi: 'हाई कंट्रास्ट चालू करें' })}
            </Button>
          </div>

          {/* Reduced Motion Mode Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              reducedMotionMode
                ? 'border-2 border-[#1E3A8A] bg-blue-50/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold text-slate-900">
                {t({
                  en: 'Reduced Motion Mode',
                  te: 'యానిమేషన్ తగ్గింపు',
                  hi: 'कम एनीमेशन मोड',
                })}
              </span>
              <Badge variant={reducedMotionMode ? 'success' : 'neutral'}>
                {reducedMotionMode ? 'ACTIVE' : 'OFF'}
              </Badge>
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              {t({
                en: 'Disables pulsing map rings and smooth transitions for vestibular comfort.',
                te: 'మ్యాప్ పల్స్ మరియు యానిమేషన్లను నిలిపివేస్తుంది.',
                hi: 'मानचित्र पल्स और एनीमेशन को शांत करता है।',
              })}
            </p>
            <Button
              variant={reducedMotionMode ? 'primary' : 'outline'}
              size="sm"
              fullWidth
              className="mt-3"
              onClick={toggleReducedMotionMode}
              data-testid="safety-toggle-motion-btn"
            >
              {reducedMotionMode
                ? t({ en: '✓ Reduced Motion Enabled', te: '✓ యానిమేషన్ తగ్గింపు ఆన్', hi: '✓ कम एनीमेशन सक्रिय' })
                : t({ en: 'Enable Reduced Motion', te: 'యానిమేషన్ తగ్గింపు ఆన్ చేయండి', hi: 'कम एनीमेशन चालू करें' })}
            </Button>
          </div>
        </div>
      </Card>

      {/* Two-Column Section: Request Buggy/Medical Assistance Form + Accessible Ghat Directory */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 6 Cols: Interactive Pilgrim Assistance Dispatch Form (Syncs to Command Centre!) */}
        <Card
          variant="pilgrim"
          padding="lg"
          className="lg:col-span-6 border-teal-200"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
            <Sparkles className="h-3.5 w-3.5" />
            {t({
              en: 'Live Sync with Authority Command Centre',
              te: 'కమాండ్ సెంటర్‌తో ప్రత్యక్ష అనుసంధానం',
              hi: 'कमांड सेंटर के साथ लाइव सिंक',
            })}
          </div>
          <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
            {t({
              en: 'Request Wheelchair Buggy, Lost Family Help or First-Aid',
              te: 'వీల్‌చైర్ బగ్గీ, తప్పిపోయిన వారి సహాయం లేదా ప్రథమ చికిత్స కోరండి',
              hi: 'व्हीलचेयर बग्गी, खोए परिवार की सहायता या प्राथमिक चिकित्सा का अनुरोध करें',
            })}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {t({
              en: 'Submitting this form creates a live operational incident in the shared store and alerts the nearest Sevadal / Medical Response Unit.',
              te: 'ఈ ఫారమ్ సమర్పించిన వెంటనే కమాండ్ సెంటర్‌లో ప్రత్యక్ష అలర్ట్ నమోదై సమీప వాలంటీర్ బృందానికి సమాచారం వెళ్తుంది.',
              hi: 'इस फॉर्म को सबमिट करने से कमांड सेंटर में तुरंत लाइव अलर्ट दर्ज होता है और निकटतम सहायता टीम को सूचित किया जाता है।',
            })}
          </p>

          {submittedIncidentCode && (
            <div
              className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950"
              data-testid="assistance-submitted-alert"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t({
                  en: `Assistance Logged (${submittedIncidentCode}) — Dispatched to Command Centre`,
                  te: `సహాయ అభ్యర్థన నమోదైంది (${submittedIncidentCode}) — కమాండ్ సెంటర్‌కు పంపబడింది`,
                  hi: `सहायता अनुरोध दर्ज (${submittedIncidentCode}) — कमांड सेंटर को भेजा गया`,
                })}
              </div>
              <p className="mt-1">
                {t({
                  en: 'Medical & Senior Assistance Unit (MED-3) has been alerted. Open the Authority Command Centre in another tab to view or manage this request live.',
                  te: 'వైద్య & వృద్ధుల సహాయ బృందం (MED-3) అప్రమత్తమైంది. అథారిటీ కమాండ్ సెంటర్ ట్యాబ్‌లో దీనిని ప్రత్యక్షంగా చూడవచ్చు.',
                  hi: 'चिकित्सा एवं वरिष्ठ सहायता इकाई (MED-3) को सूचित कर दिया गया है। कमांड सेंटर टैब में इसे लाइव देखें।',
                })}
              </p>
            </div>
          )}

          <form onSubmit={handleAssistanceSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="assist-pilgrim-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                {t({
                  en: 'Pilgrim / Family Contact Name',
                  te: 'భక్తుని పేరు / కుటుంబ సభ్యుని పేరు',
                  hi: 'श्रद्धालु / परिवार संपर्क नाम',
                })}
              </label>
              <input
                id="assist-pilgrim-name"
                type="text"
                value={pilgrimName}
                onChange={(e) => setPilgrimName(e.target.value)}
                placeholder={t({
                  en: 'e.g., Sri Venkata Rao (Senior Citizen, Age 72)',
                  te: 'ఉదా: శ్రీ వెంకట రావు (72 సం.)',
                  hi: 'उदा: श्री वेंकट राव (72 वर्ष)',
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
                data-testid="assist-name-input"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="assist-ghat-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {t({ en: 'Ghat Location', te: 'ఘాట్ ప్రదేశం', hi: 'घाट स्थान' })}
                </label>
                <select
                  id="assist-ghat-select"
                  value={selectedGhatId}
                  onChange={(e) => setSelectedGhatId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
                  data-testid="assist-ghat-select"
                >
                  {state.ghats.map((ghat) => (
                    <option key={ghat.id} value={ghat.id}>
                      {t(ghat.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assist-type-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {t({ en: 'Assistance Type', te: 'సహాయ రకం', hi: 'सहायता का प्रकार' })}
                </label>
                <select
                  id="assist-type-select"
                  value={requestType}
                  onChange={(e) =>
                    setRequestType(
                      e.target.value as
                        | 'WHEELCHAIR_BUGGY'
                        | 'LOST_ELDERLY'
                        | 'MEDICAL_FIRST_AID'
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
                  data-testid="assist-type-select"
                >
                  <option value="WHEELCHAIR_BUGGY">
                    {t({
                      en: 'Wheelchair / Electric Buggy Escort',
                      te: 'వీల్‌చైర్ / ఎలక్ట్రిక్ బగ్గీ సహాయం',
                      hi: 'व्हीलचेयर / इलेक्ट्रिक बग्गी सहायता',
                    })}
                  </option>
                  <option value="LOST_ELDERLY">
                    {t({
                      en: 'Lost Elderly / Child Family Reunion',
                      te: 'తప్పిపోయిన వృద్ధులు / పిల్లల ఆచూకీ',
                      hi: 'खोए हुए बुजुर्ग / बच्चे की तलाश',
                    })}
                  </option>
                  <option value="MEDICAL_FIRST_AID">
                    {t({
                      en: 'Medical First-Aid / Heat Exhaustion',
                      te: 'వైద్య ప్రథమ చికిత్స సహాయం',
                      hi: 'प्राथमिक चिकित्सा सहायता',
                    })}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="assist-notes"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                {t({
                  en: 'Landmark / Additional Details',
                  te: 'గుర్తు / అదనపు వివరాలు',
                  hi: 'लैंडमार्क / अतिरिक्त विवरण',
                })}
              </label>
              <textarea
                id="assist-notes"
                rows={2}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder={t({
                  en: 'Waiting near Gate 2 drinking water kiosk; need wheelchair ramp buggy...',
                  te: 'గేట్ 2 త్రాగునీటి కేంద్రం వద్ద ఉన్నాము, వీల్‌చైర్ బగ్గీ కావాలి...',
                  hi: 'गेट 2 पेयजल केंद्र के पास प्रतीक्षा कर रहे हैं, व्हीलचेयर बग्गी चाहिए...',
                })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900"
                data-testid="assist-notes-input"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              leftIcon={<Send className="h-4 w-4" />}
              data-testid="submit-assistance-request-btn"
            >
              {t({
                en: 'Dispatch Assistance Request to Command Centre',
                te: 'సహాయ అభ్యర్థనను కమాండ్ సెంటర్‌కు పంపండి',
                hi: 'कमांड सेंटर को सहायता अनुरोध भेजें',
              })}
            </Button>
          </form>
        </Card>

        {/* Right 6 Cols: Wheelchair-Accessible Ghats & Medical Camp Directory */}
        <Card variant="pilgrim" padding="lg" className="lg:col-span-6">
          <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-red-600" />
            {t({
              en: 'Ghat Accessibility Score, Ramps & Medical Camps',
              te: 'ఘాట్ వారీగా వీల్‌చైర్ ర్యాంప్‌లు & వైద్య శిబిరాల జాబితా',
              hi: 'घाट सुगम्यता स्कोर, रैंप और चिकित्सा शिविर सूची',
            })}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {t({
              en: 'Saraswati Ghat (GH-03), Kotilingala Ghat (GH-02), and Goshpada Kshetram (GH-06) offer the highest accessibility ratings (5/5) for senior citizens.',
              te: 'సరస్వతి ఘాట్ (GH-03), కోటిలింగాల ఘాట్ (GH-02) మరియు గోష్పాద క్షేత్రం (GH-06) వృద్ధులకు అత్యుత్తమ సౌకర్యాలను (5/5) కలిగి ఉన్నాయి.',
              hi: 'सरस्वती घाट (GH-03), कोटिलिंगाला घाट (GH-02) और गोष्पाद क्षेत्रम (GH-06) वरिष्ठ नागरिकों के लिए सर्वोच्च सुगम्यता (5/5) प्रदान करते हैं।',
            })}
          </p>

          <div className="mt-4 space-y-2.5">
            {state.ghats.map((ghat) => (
              <div
                key={ghat.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {ghat.code} — {t(ghat.name)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant={ghat.accessibilityScore >= 4 ? 'success' : 'neutral'}>
                      Access {ghat.accessibilityScore}/5
                    </Badge>
                    {ghat.wheelchairRampAvailable && (
                      <Badge variant="info">
                        {t({ en: 'Wheelchair Ramp', te: 'వీల్‌చైర్ ర్యాంప్', hi: 'व्हीलचेयर रैंप' })}
                      </Badge>
                    )}
                    {ghat.seniorPriorityLane && (
                      <Badge variant="success">
                        <UserCheck className="h-3 w-3" />
                        {t({ en: 'Senior Lane', te: 'వృద్ధుల లైన్', hi: 'वरिष्ठ लेन' })}
                      </Badge>
                    )}
                    {ghat.medicalCampActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700">
                        <ShieldAlert className="h-3 w-3" />
                        24x7 Medical Camp
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/journey-planner?destination=${ghat.id}&mode=ACCESSIBILITY_PRIORITY_TRANSIT`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Navigation className="h-3.5 w-3.5" />}
                  >
                    {t({ en: 'Senior Route', te: 'వృద్ధుల రూట్', hi: 'वरिष्ठ मार्ग' })}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
