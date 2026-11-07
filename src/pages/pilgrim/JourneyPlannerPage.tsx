import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bus,
  Car,
  CheckCircle2,
  Clock,
  Footprints,
  MapPin,
  Navigation,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { computeJourneyOptions } from '@/services/journeyPlannerEngine';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import {
  JourneyOriginId,
  JourneyPlannerRequest,
  JourneyTravelMode,
  OperationalLevel,
} from '@/types';

export const JourneyPlannerPage: React.FC = () => {
  const { state } = useMobilityStore();
  const { seniorCitizenMode } = useAccessibilityStore();
  const { t, language } = useTranslation();
  const [searchParams] = useSearchParams();

  const initialOrigin = (searchParams.get('origin') as JourneyOriginId) || 'NH16_MORAMPUDI_ENTRY';
  const initialDest = searchParams.get('destination') || 'ghat-pushkar';
  const initialMode = (searchParams.get('mode') as JourneyTravelMode) || 'CAR_PLUS_SHUTTLE';

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [originId, setOriginId] = useState<JourneyOriginId>(initialOrigin);
  const [destinationGhatId, setDestinationGhatId] = useState<string>(initialDest);
  const [travelMode, setTravelMode] = useState<JourneyTravelMode>(initialMode);
  const [groupSize, setGroupSize] = useState<'SOLO_COUPLE' | 'FAMILY_GROUP' | 'LARGE_GROUP'>('FAMILY_GROUP');
  const [withSeniorCitizens, setWithSeniorCitizens] = useState<boolean>(seniorCitizenMode);
  const [wheelchairRequired, setWheelchairRequired] = useState<boolean>(false);
  const [withYoungChildren, setWithYoungChildren] = useState<boolean>(false);
  const [preferMinimalWalking, setPreferMinimalWalking] = useState<boolean>(seniorCitizenMode);
  const [avoidHighCrowds, setAvoidHighCrowds] = useState<boolean>(true);

  useEffect(() => {
    if (seniorCitizenMode) {
      setWithSeniorCitizens(true);
      setPreferMinimalWalking(true);
    }
  }, [seniorCitizenMode]);

  const request: JourneyPlannerRequest = useMemo(
    () => ({
      originId,
      destinationGhatId,
      travelMode,
      preferences: {
        groupSize,
        withSeniorCitizens,
        wheelchairRequired,
        withYoungChildren,
        preferMinimalWalking,
        avoidHighCrowds,
      },
    }),
    [
      originId,
      destinationGhatId,
      travelMode,
      groupSize,
      withSeniorCitizens,
      wheelchairRequired,
      withYoungChildren,
      preferMinimalWalking,
      avoidHighCrowds,
    ]
  );

  // Live recomputation whenever canonical shared state changes (e.g. Command Centre closes a road)
  const routeOptions = useMemo(
    () => computeJourneyOptions(request, state),
    [request, state]
  );

  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    routeOptions[0]?.id || ''
  );

  useEffect(() => {
    if (routeOptions.length > 0 && !routeOptions.some((o) => o.id === selectedOptionId)) {
      setSelectedOptionId(routeOptions[0].id);
    }
  }, [routeOptions, selectedOptionId]);

  const activeRouteOption =
    routeOptions.find((o) => o.id === selectedOptionId) || routeOptions[0];

  const steps = [
    {
      step: 1 as const,
      title: { en: '1. Starting Point', te: '1. బయలుదేరే స్థానం', hi: '1. प्रस्थान बिंदु' },
    },
    {
      step: 2 as const,
      title: { en: '2. Destination Ghat', te: '2. గమ్యస్థాన ఘాట్', hi: '2. गंतव्य घाट' },
    },
    {
      step: 3 as const,
      title: { en: '3. Travel Mode', te: '3. ప్రయాణ విధానం', hi: '3. यात्रा मोड' },
    },
    {
      step: 4 as const,
      title: { en: '4. Family & Access', te: '4. కుటుంబ ప్రాధాన్యతలు', hi: '4. परिवार और सुगम्यता' },
    },
    {
      step: 5 as const,
      title: { en: '5. Route Comparison', te: '5. మార్గాల పోలిక', hi: '5. मार्ग तुलना' },
    },
  ];

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

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="journey-planner-page"
    >
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">
              <Navigation className="h-3.5 w-3.5 text-teal-600" />
              {t({
                en: '5-Step Guided Multi-Modal Journey Planner',
                te: '5-దశల మల్టీ-మోడల్ ప్రయాణ ప్లానర్',
                hi: '5-चरणीय मल्टी-मॉडल यात्रा प्लानर',
              })}
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {t({
                en: 'Plan Your Sacred Ghat Journey with Live Crowd & Road Sync',
                te: 'ప్రత్యక్ష రద్దీ & రోడ్డు సమాచారంతో మీ పుష్కర ప్రయాణాన్ని ప్లాన్ చేసుకోండి',
                hi: 'लाइव भीड़ और सड़क समन्वय के साथ अपनी पवित्र घाट यात्रा की योजना बनाएँ',
              })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveStep(5)}
              data-testid="jump-to-results-btn"
            >
              {t({
                en: 'View 3 Side-by-Side Routes Now',
                te: '3 మార్గాల పోలికను ఇప్పుడే చూడండి',
                hi: 'अभी 3 मार्गों की तुलना देखें',
              })}
            </Button>
          </div>
        </div>

        {/* 5-Step Progress Stepper */}
        <div
          className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5"
          role="tablist"
          aria-label="Journey Planner Steps"
        >
          {steps.map((item) => {
            const isCurrent = activeStep === item.step;
            const isCompleted = activeStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => setActiveStep(item.step)}
                data-testid={`planner-step-btn-${item.step}`}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                  isCurrent
                    ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-sm'
                    : isCompleted
                    ? 'border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{item.title[language]}</span>
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Starting Location */}
      {activeStep === 1 && (
        <Card variant="pilgrim" padding="lg" data-testid="planner-step-1-panel">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t({
              en: 'Step 1: Select Your Arrival / Starting Point',
              te: 'దశ 1: మీరు బయలుదేరే / చేరుకున్న ప్రదేశాన్ని ఎంచుకోండి',
              hi: 'चरण 1: अपना आगमन / प्रस्थान बिंदु चुनें',
            })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: 'Choose your railway station, bus complex, highway entry corridor, or airport arrival point.',
              te: 'మీ రైల్వే స్టేషన్, బస్ కాంప్లెక్స్, హైవే ఎంట్రీ లేదా ఎయిర్‌పోర్ట్ పాయింట్‌ను ఎంచుకోండి.',
              hi: 'अपना रेलवे स्टेशन, बस कॉम्प्लेक्स, हाईवे एंट्री या एयरपोर्ट चुनें।',
            })}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.origins.map((origin) => {
              const isSelected = originId === origin.id;
              return (
                <button
                  key={origin.id}
                  type="button"
                  onClick={() => setOriginId(origin.id)}
                  data-testid={`origin-option-${origin.id}`}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-2 border-[#1E3A8A] bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <Badge variant={isSelected ? 'info' : 'neutral'}>
                      {origin.type.replace('_', ' ')}
                    </Badge>
                    <div className="mt-2 font-display text-base font-bold text-slate-900">
                      {t(origin.name)}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#1E3A8A]">
                    <span>
                      {isSelected
                        ? t({ en: 'Selected Origin', te: 'ఎంచుకోబడింది', hi: 'चयनित प्रस्थान' })
                        : t({ en: 'Tap to Select', te: 'ఎంచుకోండి', hi: 'चुनने के लिए टैप करें' })}
                    </span>
                    <MapPin className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setActiveStep(2)}
              data-testid="step-1-next-btn"
            >
              {t({
                en: 'Continue to Step 2: Destination Ghat',
                te: 'దశ 2 కు కొనసాగండి: గమ్యస్థాన ఘాట్',
                hi: 'चरण 2 पर जाएँ: गंतव्य घाट',
              })}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Select Destination Ghat */}
      {activeStep === 2 && (
        <Card variant="pilgrim" padding="lg" data-testid="planner-step-2-panel">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t({
              en: 'Step 2: Select Your Sacred Destination Ghat',
              te: 'దశ 2: మీ గమ్యస్థాన పుష్కర ఘాట్‌ను ఎంచుకోండి',
              hi: 'चरण 2: अपना पवित्र गंतव्य घाट चुनें',
            })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: 'Live crowd density and bathing wait times are shown below. Even if you choose a crowded ghat, our planner will also show a low-crowd alternative in Step 5.',
              te: 'ప్రత్యక్ష రద్దీ మరియు స్నాన నిరీక్షణ సమయాలు క్రింద ఇవ్వబడ్డాయి. రద్దీగా ఉన్న ఘాట్ ఎంచుకున్నా, 5వ దశలో ప్రత్యామ్నాయ ఘాట్ కూడా చూపబడుతుంది.',
              hi: 'लाइव भीड़ घनत्व और स्नान प्रतीक्षा समय नीचे दिए गए हैं। चरण 5 में कम भीड़ वाला विकल्प भी दिखाया जाएगा।',
            })}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {state.ghats.map((ghat) => {
              const isSelected = destinationGhatId === ghat.id;
              return (
                <button
                  key={ghat.id}
                  type="button"
                  onClick={() => setDestinationGhatId(ghat.id)}
                  data-testid={`dest-option-${ghat.id}`}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-2 border-[#1E3A8A] bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {ghat.code}
                      </span>
                      <Badge variant={getLevelVariant(ghat.crowdLevel)}>
                        {ghat.crowdLevel}
                      </Badge>
                    </div>
                    <div className="mt-1.5 font-display text-sm font-bold text-slate-900">
                      {t(ghat.name)}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                      <span>
                        <Clock className="inline h-3.5 w-3.5 mr-1 text-blue-700" />
                        ~{ghat.estimatedBathingWaitMinutes}m wait
                      </span>
                      <span>
                        <Accessibility className="inline h-3.5 w-3.5 mr-1 text-teal-700" />
                        {ghat.accessibilityScore}/5
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-[#1E3A8A]">
                    {isSelected
                      ? t({ en: '✓ Selected Destination', te: '✓ ఎంచుకున్న ఘాట్', hi: '✓ चयनित घाट' })
                      : t({ en: 'Select Ghat', te: 'ఎంచుకోండి', hi: 'घाट चुनें' })}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setActiveStep(1)}
            >
              {t({ en: 'Back to Step 1', te: 'వెనుకకు (దశ 1)', hi: 'वापस (चरण 1)' })}
            </Button>
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setActiveStep(3)}
              data-testid="step-2-next-btn"
            >
              {t({
                en: 'Continue to Step 3: Travel Mode',
                te: 'దశ 3 కు కొనసాగండి: ప్రయాణ విధానం',
                hi: 'चरण 3 पर जाएँ: यात्रा मोड',
              })}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Select Travel Mode */}
      {activeStep === 3 && (
        <Card variant="pilgrim" padding="lg" data-testid="planner-step-3-panel">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t({
              en: 'Step 3: Choose Your Preferred Travel Mode',
              te: 'దశ 3: మీ ప్రయాణ విధానాన్ని ఎంచుకోండి',
              hi: 'चरण 3: अपना पसंदीदा यात्रा मोड चुनें',
            })}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                {
                  mode: 'CAR_PLUS_SHUTTLE' as const,
                  icon: <Car className="h-5 w-5 text-[#1E3A8A]" />,
                  title: {
                    en: 'Private Vehicle + Satellite Parking + Shuttle',
                    te: 'సొంత వాహనం + శాటిలైట్ పార్కింగ్ + షటిల్ బస్సు',
                    hi: 'निजी वाहन + सैटेलाइट पार्किंग + शटल बस',
                  },
                  desc: {
                    en: 'Best for families arriving by car/SUV. Park at an outer ring hub and take a dedicated green-corridor shuttle.',
                    te: 'కారు/SUV లో వచ్చే కుటుంబాలకు ఉత్తమం. శాటిలైట్ పార్కింగ్‌లో ఆపి ప్రత్యేక షటిల్ బస్సులో ఘాట్ చేరుకోండి.',
                    hi: 'कार/एसयूवी से आने वाले परिवारों के लिए सर्वोत्तम। आउटर हब पर पार्क करें और शटल लें।',
                  },
                },
                {
                  mode: 'PUBLIC_SHUTTLE_DIRECT' as const,
                  icon: <Bus className="h-5 w-5 text-teal-700" />,
                  title: {
                    en: 'Direct APSRTC Pushkar Shuttle / Public Transit',
                    te: 'నేరుగా APSRTC పుష్కర షటిల్ బస్సు',
                    hi: 'सीधी APSRTC पुष्कर शटल / सार्वजनिक परिवहन',
                  },
                  desc: {
                    en: 'Ideal for pilgrims arriving at Rajamahendravaram/Godavari Railway Stations or Gokavaram Bus Complex.',
                    te: 'రైల్వే స్టేషన్ లేదా బస్ కాంప్లెక్స్ నుండి నేరుగా ఉచిత షటిల్ బస్సు ద్వారా వెళ్లే భక్తులకు అనుకూలం.',
                    hi: 'रेलवे स्टेशन या बस कॉम्प्लेक्स पर आने वाले श्रद्धालुओं के लिए आदर्श।',
                  },
                },
                {
                  mode: 'ACCESSIBILITY_PRIORITY_TRANSIT' as const,
                  icon: <Accessibility className="h-5 w-5 text-emerald-700" />,
                  title: {
                    en: 'Senior Citizen & Wheelchair Priority Transit (S3 + Electric Buggy)',
                    te: 'వృద్ధులు & దివ్యాంగుల ప్రత్యేక రవాణా (S3 + ఎలక్ట్రిక్ బగ్గీ)',
                    hi: 'वरिष्ठ नागरिक एवं व्हीलचेयर प्राथमिकता ट्रांजिट (S3 + इलेक्ट्रिक बग्गी)',
                  },
                  desc: {
                    en: 'Uses hydraulic low-floor buses and free last-mile electric buggies to zero-step ghat ramps (<120m walk).',
                    te: 'హైడ్రాలిక్ లో-ఫ్లోర్ బస్సులు మరియు ఉచిత ఎలక్ట్రిక్ బగ్గీల ద్వారా 120 మీ. లోపు నడకతో ఘాట్ ర్యాంప్ చేరుకోండి.',
                    hi: 'हाइड्रोलिक लो-फ्लोर बसों और मुफ्त इलेक्ट्रिक बग्गी का उपयोग (<120 मीटर पैदल)।',
                  },
                },
                {
                  mode: 'WALKING_NEARBY' as const,
                  icon: <Footprints className="h-5 w-5 text-amber-700" />,
                  title: {
                    en: 'Pedestrian / Walking Corridor from Inner City',
                    te: 'పాదచారుల నడక మార్గం (ఇన్నర్ సిటీ నుండి)',
                    hi: 'शहर के भीतर से पैदल यात्री गलियारा',
                  },
                  desc: {
                    en: 'Shaded pedestrian barricade corridors with drinking water kiosks every 150 meters.',
                    te: 'ప్రతి 150 మీటర్లకు త్రాగునీటి కేంద్రాలతో కూడిన ప్రత్యేక పాదచారుల మార్గం.',
                    hi: 'हर 150 मीटर पर पेयजल केंद्रों के साथ छायादार पैदल गलियारा।',
                  },
                },
              ] as const
            ).map((item) => {
              const isSelected = travelMode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setTravelMode(item.mode)}
                  data-testid={`mode-option-${item.mode}`}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-2 border-[#1E3A8A] bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="rounded-xl bg-slate-100 p-3 shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-display text-base font-bold text-slate-900">
                      {item.title[language]}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {item.desc[language]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setActiveStep(2)}
            >
              {t({ en: 'Back to Step 2', te: 'వెనుకకు (దశ 2)', hi: 'वापस (चरण 2)' })}
            </Button>
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => setActiveStep(4)}
              data-testid="step-3-next-btn"
            >
              {t({
                en: 'Continue to Step 4: Preferences',
                te: 'దశ 4 కు కొనసాగండి: ప్రాధాన్యతలు',
                hi: 'चरण 4 पर जाएँ: प्राथमिकताएँ',
              })}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Family, Group & Accessibility Preferences */}
      {activeStep === 4 && (
        <Card variant="pilgrim" padding="lg" data-testid="planner-step-4-panel">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t({
              en: 'Step 4: Family Group & Accessibility Preferences',
              te: 'దశ 4: కుటుంబం & వృద్ధుల సౌకర్య ప్రాధాన్యతలు',
              hi: 'चरण 4: परिवार समूह और सुगम्यता प्राथमिकताएँ',
            })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: 'Customize your route ranking for senior citizens, wheelchair access, young children, or crowd avoidance.',
              te: 'వృద్ధులు, వీల్‌చైర్ అవసరాలు, చిన్న పిల్లలు లేదా తక్కువ రద్దీ కోసం మీ ప్రాధాన్యతలను ఎంచుకోండి.',
              hi: 'वरिष्ठ नागरिकों, व्हीलचेयर पहुंच, छोटे बच्चों या भीड़ से बचने के लिए अपनी प्राथमिकताएँ चुनें।',
            })}
          </p>

          {/* Group Size */}
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              <Users className="inline h-3.5 w-3.5 mr-1" />
              {t({ en: 'Group Size', te: 'బృందం పరిమాణం', hi: 'समूह का आकार' })}
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(
                [
                  { id: 'SOLO_COUPLE', label: { en: 'Solo / Couple (1–2)', te: 'ఒకరు / దంపతులు (1–2)', hi: 'अकेले / दंपति (1–2)' } },
                  { id: 'FAMILY_GROUP', label: { en: 'Family Group (3–6)', te: 'కుటుంబం (3–6)', hi: 'परिवार समूह (3–6)' } },
                  { id: 'LARGE_GROUP', label: { en: 'Extended Group (7+)', te: 'పెద్ద బృందం (7+)', hi: 'बड़ा समूह (7+)' } },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroupSize(g.id)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                    groupSize === g.id
                      ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {g.label[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Checkboxes */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                id: 'senior',
                checked: withSeniorCitizens,
                onChange: setWithSeniorCitizens,
                label: {
                  en: 'Traveling with Senior Citizens (Age 60+)',
                  te: 'వృద్ధులతో (60+ సం.) ప్రయాణిస్తున్నాము',
                  hi: 'वरिष्ठ नागरिकों (60+ वर्ष) के साथ यात्रा',
                },
              },
              {
                id: 'wheelchair',
                checked: wheelchairRequired,
                onChange: setWheelchairRequired,
                label: {
                  en: 'Require Wheelchair Ramp & Hydraulic Lift Shuttle',
                  te: 'వీల్‌చైర్ ర్యాంప్ & లిఫ్ట్ బస్సు అవసరం',
                  hi: 'व्हीलचेयर रैंप और लिफ्ट शटल की आवश्यकता',
                },
              },
              {
                id: 'children',
                checked: withYoungChildren,
                onChange: setWithYoungChildren,
                label: {
                  en: 'Traveling with Young Children / Infants',
                  te: 'చిన్న పిల్లలతో ప్రయాణిస్తున్నాము',
                  hi: 'छोटे बच्चों / शिशुओं के साथ यात्रा',
                },
              },
              {
                id: 'walking',
                checked: preferMinimalWalking,
                onChange: setPreferMinimalWalking,
                label: {
                  en: 'Prefer Minimal Walking (< 200m to Ghat Steps)',
                  te: 'కనీస నడక దూరం (< 200 మీ.) కావాలి',
                  hi: 'न्यूनतम पैदल दूरी (< 200 मीटर) पसंद करें',
                },
              },
              {
                id: 'crowds',
                checked: avoidHighCrowds,
                onChange: setAvoidHighCrowds,
                label: {
                  en: 'Automatically Prioritize Low-Crowd Ghats',
                  te: 'తక్కువ రద్దీ గల ఘాట్‌లకు ప్రాధాన్యత ఇవ్వండి',
                  hi: 'कम भीड़ वाले घाटों को प्राथमिकता दें',
                },
              },
            ].map((pref) => (
              <label
                key={pref.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-colors ${
                  pref.checked
                    ? 'border-teal-600 bg-teal-50/70 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="text-sm font-semibold pr-3">{pref.label[language]}</span>
                <input
                  type="checkbox"
                  checked={pref.checked}
                  onChange={(e) => pref.onChange(e.target.checked)}
                  data-testid={`pref-checkbox-${pref.id}`}
                  className="h-5 w-5 rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => setActiveStep(3)}
            >
              {t({ en: 'Back to Step 3', te: 'వెనుకకు (దశ 3)', hi: 'वापस (चरण 3)' })}
            </Button>
            <Button
              variant="primary"
              rightIcon={<Sparkles className="h-4 w-4" />}
              onClick={() => setActiveStep(5)}
              data-testid="step-4-compute-btn"
            >
              {t({
                en: 'Generate Live Route Comparisons (Step 5)',
                te: 'మార్గాల పోలికను రూపొందించండి (దశ 5)',
                hi: 'लाइव मार्ग तुलना देखें (चरण 5)',
              })}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Side-by-Side Route Comparisons + Interactive Map */}
      {activeStep === 5 && (
        <div className="space-y-6" data-testid="planner-step-5-panel">
          {/* Summary Bar of Selected Inputs */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs text-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#1E3A8A]">
                {t({ en: 'Active Plan:', te: 'ప్రస్తుత ప్లాన్:', hi: 'सक्रिय योजना:' })}
              </span>
              <span className="rounded-lg bg-white px-2.5 py-1 font-semibold shadow-2xs">
                {t(
                  state.origins.find((o) => o.id === originId)?.name ||
                    state.origins[0].name
                )}
              </span>
              <span>→</span>
              <span className="rounded-lg bg-white px-2.5 py-1 font-semibold shadow-2xs">
                {t(
                  state.ghats.find((g) => g.id === destinationGhatId)?.name ||
                    state.ghats[0].name
                )}
              </span>
              {withSeniorCitizens && (
                <Badge variant="info">
                  {t({ en: 'Senior Priority', te: 'వృద్ధుల ప్రాధాన్యత', hi: 'वरिष्ठ प्राथमिकता' })}
                </Badge>
              )}
              {wheelchairRequired && (
                <Badge variant="success">
                  {t({ en: 'Wheelchair Ramp', te: 'వీల్‌చైర్ ర్యాంప్', hi: 'व्हीलचेयर रैंप' })}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="font-bold text-[#1E3A8A] underline"
            >
              {t({ en: 'Modify Inputs (Steps 1–4)', te: 'వివరాలు మార్చండి', hi: 'विवरण बदलें' })}
            </button>
          </div>

          {/* 3 Side-by-Side Route Comparison Cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {routeOptions.map((option, idx) => {
              const isSelected = activeRouteOption?.id === option.id;
              const parking = state.parkingHubs.find(
                (p) => p.id === option.recommendedParkingId
              );
              const shuttle = state.shuttles.find(
                (s) => s.id === option.recommendedShuttleId
              );

              return (
                <Card
                  key={option.id}
                  variant="pilgrim"
                  padding="md"
                  data-testid={`route-comparison-card-${idx}`}
                  className={`flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-2 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/15 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Rank Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          option.rank === 'RECOMMENDED_BEST'
                            ? 'info'
                            : option.rank === 'ACCESSIBILITY_OPTIMAL'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        <Sparkles className="h-3 w-3" />
                        {t(option.badgeLabel)}
                      </Badge>
                      {option.avoidedClosedRoadIds.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                          <ShieldAlert className="h-3 w-3" />
                          {t({
                            en: 'Bypasses Closed Road',
                            te: 'మూసిన రోడ్డును తప్పిస్తుంది',
                            hi: 'बंद सड़क से बचाव',
                          })}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2.5 font-display text-base font-bold text-slate-900">
                      {t(option.title)}
                    </h3>

                    {/* Key Comparison Metrics */}
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-slate-500 block">
                          {t({ en: 'Total Duration', te: 'మొత్తం సమయం', hi: 'कुल समय' })}
                        </span>
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {option.estimatedTotalDurationMinutes} min
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">
                          {t({ en: 'Walking Distance', te: 'నడక దూరం', hi: 'पैदल दूरी' })}
                        </span>
                        <span className="font-mono text-base font-extrabold text-teal-800">
                          {option.walkingDistanceMeters} m
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">
                          {t({ en: 'Traffic Condition', te: 'ట్రాఫిక్ స్థితి', hi: 'ट्रैफिक स्थिति' })}
                        </span>
                        <Badge variant={getLevelVariant(option.trafficCondition)} className="mt-0.5">
                          {option.trafficCondition}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-500 block">
                          {t({ en: 'Ghat Crowd Level', te: 'ఘాట్ రద్దీ', hi: 'घाट भीड़' })}
                        </span>
                        <Badge variant={getLevelVariant(option.crowdLevel)} className="mt-0.5">
                          {option.crowdLevel}
                        </Badge>
                      </div>
                    </div>

                    {/* Parking & Shuttle Recommendation */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      {parking && (
                        <div className="flex items-center justify-between rounded-lg bg-blue-50/70 px-2.5 py-1.5 text-slate-800">
                          <span className="flex items-center gap-1.5 font-semibold truncate pr-2">
                            <Car className="h-3.5 w-3.5 text-[#1E3A8A] shrink-0" />
                            {t(parking.name).split('(')[0]}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            {parking.availableSpaces} free
                          </span>
                        </div>
                      )}
                      {shuttle && (
                        <div className="flex items-center justify-between rounded-lg bg-teal-50/70 px-2.5 py-1.5 text-slate-800">
                          <span className="flex items-center gap-1.5 font-semibold truncate pr-2">
                            <Bus className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                            {shuttle.routeCode} ({t({ en: 'Every', te: 'ప్రతి', hi: 'हर' })} {shuttle.frequencyMinutes}m)
                          </span>
                          <span className="font-mono font-bold text-teal-800 shrink-0">
                            ETA {shuttle.estimatedArrivalMinutes}m
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Why Recommended */}
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700">
                      <div className="font-bold text-slate-900 mb-0.5">
                        {t({
                          en: 'Why Recommended:',
                          te: 'ఎందుకు సిఫార్సు చేయబడింది:',
                          hi: 'क्यों अनुशंसित है:',
                        })}
                      </div>
                      <p className="leading-relaxed">{t(option.recommendationReason)}</p>
                    </div>

                    {/* Authority Advisory if present */}
                    {option.authorityAdvisoryWarning && (
                      <div className="mt-2.5 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] text-amber-950 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{t(option.authorityAdvisoryWarning)}</span>
                      </div>
                    )}

                    {/* Step by Step Directions */}
                    <div className="mt-3 space-y-1 text-xs text-slate-600">
                      {option.stepByStepDirections.map((stepText, sIdx) => (
                        <div key={sIdx} className="leading-snug">
                          {t(stepText)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Route for Map Visualization */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Button
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      fullWidth
                      onClick={() => setSelectedOptionId(option.id)}
                      data-testid={`select-route-btn-${idx}`}
                    >
                      {isSelected
                        ? t({
                            en: '✓ Active on Riverfront Map Below',
                            te: '✓ క్రింది మ్యాప్‌లో చూపబడుతోంది',
                            hi: '✓ नीचे मानचित्र पर सक्रिय',
                          })
                        : t({
                            en: 'Preview Route on Map',
                            te: 'మ్యాప్‌లో ఈ మార్గాన్ని చూడండి',
                            hi: 'मानचित्र पर यह मार्ग देखें',
                          })}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Interactive Map Highlighting Selected Journey Option */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {t({
                  en: 'Interactive Route Corridor & Riverfront Map',
                  te: 'ఇంటరాక్టివ్ రూట్ కారిడార్ & నదీ తీర మ్యాప్',
                  hi: 'इंटरएक्टिव रूट कॉरिडोर और नदी तट मानचित्र',
                })}
              </h3>
              <Link
                to="/parking"
                className="text-xs font-bold text-[#1E3A8A] hover:underline"
              >
                {t({
                  en: 'Inspect All Parking Hubs →',
                  te: 'అన్ని పార్కింగ్ హబ్‌లను చూడండి →',
                  hi: 'सभी पार्किंग हब देखें →',
                })}
              </Link>
            </div>
            <MobilityMapWorkspace
              portalMode="pilgrim"
              initialEngine="OFFLINE_SVG"
              highlightedJourneyOption={activeRouteOption}
              heightClass="h-[440px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
