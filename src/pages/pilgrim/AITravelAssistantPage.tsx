import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bot,
  Globe,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/design-system';
import { MobilityMapWorkspace } from '@/components/maps';
import { defaultAIService } from '@/adapters/ai/LocalDomainAIEngine';
import { ConciergeMessageResponse } from '@/adapters/interfaces/IAIServiceAdapter';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useTranslation } from '@/i18n/useTranslation';
import { SupportedLanguage } from '@/types';

interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  aiPayload?: ConciergeMessageResponse;
}

export const AITravelAssistantPage: React.FC = () => {
  const { state } = useMobilityStore();
  const { seniorCitizenMode } = useAccessibilityStore();
  const { t, language, setLanguage } = useTranslation();
  const [searchParams] = useSearchParams();

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ConversationTurn[]>([]);
  const processedInitialParamRef = useRef<string | null>(null);

  const sendQuery = useCallback(
    async (queryText: string, langOverride?: SupportedLanguage) => {
      const trimmed = queryText.trim();
      if (!trimmed) return;

      const activeLang = langOverride || language;
      const nowTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userTurn: ConversationTurn = {
        id: `usr-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: nowTime,
      };

      setMessages((prev) => [...prev, userTurn]);
      setInputQuery('');
      setIsGenerating(true);

      try {
        const reply = await defaultAIService.generateConciergeReply(
          trimmed,
          activeLang,
          useMobilityStore.getState().state,
          seniorCitizenMode
        );
        const aiTurn: ConversationTurn = {
          id: reply.id,
          role: 'assistant',
          text: reply.replyText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          aiPayload: reply,
        };
        setMessages((prev) => [...prev, aiTurn]);
      } finally {
        setIsGenerating(false);
      }
    },
    [language, seniorCitizenMode]
  );

  // Initialize welcome message or process ?q= param
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam && processedInitialParamRef.current !== queryParam) {
      processedInitialParamRef.current = queryParam;
      void sendQuery(queryParam, language);
      return;
    }

    if (messages.length === 0) {
      void (async () => {
        const defaultPrompt =
          language === 'te'
            ? 'ప్రస్తుతం ఏ ఘాట్ వద్ద రద్దీ తక్కువగా ఉంది?'
            : language === 'hi'
            ? 'अभी किस घाट पर सबसे कम भीड़ है?'
            : 'Which ghat has the lowest crowd right now?';
        const initialReply = await defaultAIService.generateConciergeReply(
          defaultPrompt,
          language,
          state,
          seniorCitizenMode
        );
        setMessages([
          {
            id: 'welcome-turn',
            role: 'assistant',
            text: initialReply.replyText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            aiPayload: initialReply,
          },
        ]);
      })();
    }
  }, [searchParams, language, state, seniorCitizenMode, messages.length, sendQuery]);

  const suggestedStarterQuestions: Record<SupportedLanguage, string[]> = {
    en: [
      'Which ghat has the lowest crowd right now?',
      'Best route and ghat for senior citizens & wheelchair access?',
      'Where should I park my car coming from NH-16?',
      'Which roads are closed and what is the shuttle wait time?',
      'Where is the nearest medical camp and emergency helpline?',
    ],
    te: [
      'ప్రస్తుతం ఏ ఘాట్ వద్ద రద్దీ తక్కువగా ఉంది?',
      'వృద్ధులు మరియు వీల్‌చైర్ భక్తులకు ఏ ఘాట్ ఉత్తమం?',
      'NH-16 నుండి వచ్చే వాహనాలకు ఎక్కడ పార్కింగ్ ఖాళీగా ఉంది?',
      'ఏ రోడ్లు మూసివేయబడ్డాయి మరియు షటిల్ బస్సు సమయం ఎంత?',
      'వైద్య శిబిరం మరియు అత్యవసర హెల్ప్‌లైన్ వివరాలు చెప్పండి?',
    ],
    hi: [
      'अभी किस घाट पर सबसे कम भीड़ है?',
      'वरिष्ठ नागरिकों और व्हीलचेयर के लिए सबसे अच्छा घाट कौन सा है?',
      'NH-16 से आने पर मुझे अपनी कार कहाँ पार्क करनी चाहिए?',
      'कौन सी सड़कें बंद हैं और शटल बस का प्रतीक्षा समय क्या है?',
      'निकटतम चिकित्सा शिविर और आपातकालीन हेल्पलाइन कहाँ है?',
    ],
  };

  const handleLanguageChange = (nextLang: SupportedLanguage) => {
    setLanguage(nextLang);
    const samplePrompt =
      nextLang === 'te'
        ? 'ప్రస్తుతం ఏ ఘాట్ వద్ద రద్దీ తక్కువగా ఉంది?'
        : nextLang === 'hi'
        ? 'अभी किस घाट पर सबसे कम भीड़ है?'
        : 'Which ghat has the lowest crowd right now?';
    void sendQuery(samplePrompt, nextLang);
  };

  return (
    <div
      className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6"
      data-testid="ai-travel-assistant-page"
    >
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1E3A8A]">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            {t({
              en: 'Trilingual Domain AI Travel Concierge (Offline-Ready)',
              te: 'త్రిభాషా AI ప్రయాణ సహాయకుడు (ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది)',
              hi: 'त्रिभाषी AI यात्रा सहायक (ऑफ़लाइन-सक्षम)',
            })}
          </div>
          <h1 className="mt-1.5 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {t({
              en: 'Godavari Pushkaralu AI Mobility & Ghat Concierge',
              te: 'గోదావరి పుష్కర AI ప్రయాణ & ఘాట్ మార్గదర్శి',
              hi: 'गोदावरी पुष्करालु AI यात्रा एवं घाट सहायक',
            })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t({
              en: 'Grounded in live shared corridor telemetry (Rev #' +
                state.metadata.stateRevision +
                '). Ask in English, తెలుగు, or हिंदी about ghat crowds, road closures, parking spaces, or senior citizen buggies.',
              te:
                'ప్రత్యక్ష కారిడార్ సమాచారం ఆధారంగా (Rev #' +
                state.metadata.stateRevision +
                ') ఘాట్ రద్దీ, రోడ్డు మూసివేతలు, పార్కింగ్ లేదా వృద్ధుల సౌకర్యాల గురించి తెలుగు, ఇంగ్లీష్ లేదా హిందీలో అడగండి.',
              hi:
                'लाइव कॉरिडोर डेटा (Rev #' +
                state.metadata.stateRevision +
                ') पर आधारित। घाट भीड़, सड़क बंदी, पार्किंग या वरिष्ठ नागरिक सुविधाओं के बारे में हिंदी, तेलुगु या अंग्रेजी में पूछें।',
            })}
          </p>
        </div>

        {/* Trilingual Switcher Pill */}
        <div className="flex flex-col items-start lg:items-end gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
            {t({
              en: 'Select Conversation Language',
              te: 'భాషను ఎంచుకోండి',
              hi: 'संवाद भाषा चुनें',
            })}
          </span>
          <div
            className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1"
            role="group"
            aria-label="AI Assistant Language Switcher"
          >
            {(
              [
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు (Telugu)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
              ] as const
            ).map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleLanguageChange(item.code)}
                data-testid={`ai-lang-btn-${item.code}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  language === item.code
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace: Chat Interface + Interactive Map Context */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 Columns: Conversational Assistant */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3A8A] text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {t({
                    en: 'Godavari Flow Local Domain AI Engine',
                    te: 'గోదావరి ఫ్లో AI ఇంజిన్',
                    hi: 'गोदावरी फ्लो डोमेन AI इंजन',
                  })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t({
                    en: 'Zero Frontend API Key Exposure • Synchronized with Command Centre',
                    te: 'సురక్షిత లోకల్ AI • కమాండ్ సెంటర్‌తో ప్రత్యక్ష అనుసంధానం',
                    hi: 'सुरक्षित लोकल AI • कमांड सेंटर के साथ लाइव सिंक',
                  })}
                </div>
              </div>
            </div>
            <Badge variant="info">Rev #{state.metadata.stateRevision}</Badge>
          </div>

          {/* Suggested Prompt Chips */}
          <div className="border-b border-slate-100 bg-blue-50/40 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              {t({
                en: 'Tap a Question to Ask Instantly:',
                te: 'ప్రశ్నను ఎంచుకోండి:',
                hi: 'तुरंत पूछने के लिए प्रश्न चुनें:',
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedStarterQuestions[language].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void sendQuery(prompt)}
                  data-testid={`suggested-prompt-btn-${idx}`}
                  className="rounded-full border border-blue-200 bg-white px-3 py-1 text-left text-xs font-semibold text-[#1E3A8A] transition-colors hover:bg-[#1E3A8A] hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div
            className="flex-1 space-y-4 overflow-y-auto p-4 max-h-[520px]"
            data-testid="ai-conversation-history"
          >
            {messages.map((turn) => (
              <div
                key={turn.id}
                data-testid={`chat-turn-${turn.role}`}
                className={`flex gap-3 ${
                  turn.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {turn.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-sm ${
                    turn.role === 'user'
                      ? 'bg-[#1E3A8A] text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-75">
                    <span className="font-bold">
                      {turn.role === 'user'
                        ? t({ en: 'You', te: 'మీరు', hi: 'आप' })
                        : t({
                            en: 'Godavari AI Concierge',
                            te: 'గోదావరి AI సహాయకుడు',
                            hi: 'गोदावरी AI सहायक',
                          })}
                    </span>
                    <span>{turn.timestamp}</span>
                  </div>

                  {/* Formatted Reply Text */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {turn.text}
                  </div>

                  {/* Interactive Map-Linked Entities */}
                  {turn.aiPayload && turn.aiPayload.mapLinks.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-slate-200/80 pt-3">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {t({
                          en: 'Interactive Map & Route Links:',
                          te: 'మ్యాప్ & రూట్ లింకులు:',
                          hi: 'इंटरएक्टिव मानचित्र और मार्ग लिंक:',
                        })}
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {turn.aiPayload.mapLinks.map((mLink) => (
                          <Link
                            key={mLink.entityId}
                            to={mLink.routeHref}
                            data-testid={`ai-map-link-${mLink.entityId}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:border-[#1E3A8A] hover:bg-blue-50/40"
                          >
                            <span className="flex items-center gap-1.5 truncate pr-2">
                              <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{t(mLink.label)}</span>
                            </span>
                            <span className="rounded bg-teal-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-800 shrink-0">
                              {mLink.statusBadge}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-Ups */}
                  {turn.aiPayload && turn.aiPayload.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2">
                      {turn.aiPayload.suggestedFollowUps.map((followUp, fIdx) => (
                        <button
                          key={fIdx}
                          type="button"
                          onClick={() => void sendQuery(followUp)}
                          className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-left text-[11px] font-semibold text-teal-900 hover:bg-teal-100"
                        >
                          → {followUp}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {turn.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 mt-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="text-xs font-semibold text-slate-500 animate-pulse px-2">
                {t({
                  en: 'Analyzing live ghat occupancy, road closures, and shuttle corridors...',
                  te: 'ప్రత్యక్ష ఘాట్ రద్దీ మరియు షటిల్ మార్గాలను విశ్లేషిస్తోంది...',
                  hi: 'लाइव घाट भीड़ और शटल गलियारों का विश्लेषण किया जा रहा है...',
                })}
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendQuery(inputQuery);
            }}
            className="border-t border-slate-200 bg-slate-50 p-3 flex items-center gap-2"
          >
            <MessageSquare className="h-5 w-5 text-slate-400 ml-1 shrink-0" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t({
                en: 'Ask anything about ghats, crowd wait time, parking, shuttles, or senior access...',
                te: 'ఘాట్‌లు, రద్దీ, పార్కింగ్, షటిల్ బస్సులు లేదా వృద్ధుల సౌకర్యాల గురించి అడగండి...',
                hi: 'घाट, भीड़, पार्किंग, शटल या वरिष्ठ सुविधाओं के बारे में कुछ भी पूछें...',
              })}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#1E3A8A] focus:outline-none"
              data-testid="ai-chat-input"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              rightIcon={<Send className="h-4 w-4" />}
              data-testid="ai-chat-send-btn"
            >
              {t({ en: 'Send', te: 'పంపండి', hi: 'भेजें' })}
            </Button>
          </form>
        </div>

        {/* Right 5 Columns: Live Corridor Map & Quick Destination Cards */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="pilgrim" padding="sm">
            <div className="px-2 py-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {t({
                  en: 'Live Riverfront Context Map',
                  te: 'ప్రత్యక్ష నదీ తీర మ్యాప్',
                  hi: 'लाइव नदी तट मानचित्र',
                })}
              </span>
              <Link
                to="/journey-planner"
                className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <Navigation className="h-3 w-3" />
                {t({ en: '5-Step Planner', te: 'ప్రయాణ ప్లానర్', hi: 'यात्रा प्लानर' })}
              </Link>
            </div>
            <MobilityMapWorkspace
              portalMode="pilgrim"
              initialEngine="OFFLINE_SVG"
              heightClass="h-[360px]"
            />
          </Card>

          <Card variant="pilgrim" padding="md">
            <h2 className="font-display text-sm font-bold text-slate-900">
              {t({
                en: 'Live Corridor Situation Summary',
                te: 'ప్రస్తుత కారిడార్ సారాంశం',
                hi: 'वर्तमान कॉरिडोर स्थिति सारांश',
              })}
            </h2>
            <p
              className="mt-1.5 text-xs text-slate-600 leading-relaxed"
              data-testid="ai-corridor-summary-text"
            >
              {defaultAIService.generateSituationSummary(state, language)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

