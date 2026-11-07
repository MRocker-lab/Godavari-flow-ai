import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { LocalizedText, SupportedLanguage } from '@/types';

export const UI_DICTIONARY = {
  brandSubtitlePilgrim: {
    en: 'Godavari Pushkaralu • Rajamahendravaram & Kovvur',
    te: 'గోదావరి పుష్కరాలు • రాజమహేంద్రవరం & కొవ్వూరు',
    hi: 'गोदावरी पुष्करालु • राजमहेंद्रवरम और कोव्वुर',
  },
  brandSubtitleCommand: {
    en: 'INTEGRATED MOBILITY & OPERATIONS COMMAND',
    te: 'ఇంటిగ్రేటెడ్ మొబిలిటీ & ఆపరేషన్స్ కమాండ్',
    hi: 'एकीकृत गतिशीलता एवं संचालन कमांड',
  },
  navHome: {
    en: 'Home',
    te: 'హోమ్',
    hi: 'होम',
  },
  navExplore: {
    en: 'Explore',
    te: 'ఘాట్లు & దర్శనం',
    hi: 'घाट खोजें',
  },
  navPlanJourney: {
    en: 'Plan Journey',
    te: 'ప్రయాణ ప్రణాళిక',
    hi: 'यात्रा योजना',
  },
  navParking: {
    en: 'Parking',
    te: 'పార్కింగ్',
    hi: 'पार्किंग',
  },
  navShuttles: {
    en: 'Shuttles',
    te: 'షటిల్ బస్సులు',
    hi: 'शटल बसें',
  },
  navAIAssistant: {
    en: 'AI Assistant',
    te: 'AI సహాయకుడు',
    hi: 'AI सहायक',
  },
  navSafety: {
    en: 'Safety & Accessibility',
    te: 'భద్రత & వృద్ధుల సేవలు',
    hi: 'सुरक्षा एवं सुगम्यता',
  },
  heroHeadline: {
    en: 'Discover Godavari. Experience Pushkaralu Smarter.',
    te: 'గోదావరిని దర్శించండి. పుష్కరాలను మరింత సులభంగా అనుభూతి చెందండి.',
    hi: 'गोदावरी का दर्शन करें। पुष्करालु का स्मार्ट अनुभव लें।',
  },
  heroSubheadline: {
    en: 'Plan accessible journeys across Rajamahendravaram and Kovvur ghats, find satellite parking with express shuttles, check crowd conditions, and receive multilingual AI travel assistance.',
    te: 'రాజమహేంద్రవరం మరియు కొవ్వూరు ఘాట్లలో సులభమైన ప్రయాణ ప్రణాళిక, ఎక్స్‌ప్రెస్ షటిల్ సదుపాయంతో శాటిలైట్ పార్కింగ్, రద్దీ వివరాలు మరియు AI ప్రయాణ సహాయం పొందండి.',
    hi: 'राजमहेंद्रवरम और कोव्वुर घाटों के लिए सुगम यात्रा की योजना बनाएं, एक्सप्रेस शटल के साथ सैटेलाइट पार्किंग खोजें, भीड़ की स्थिति जानें और बहुभाषी AI सहायता प्राप्त करें।',
  },
  ctaPlanJourney: {
    en: 'Plan My Journey',
    te: 'నా ప్రయాణాన్ని ప్లాన్ చేయండి',
    hi: 'मेरी यात्रा की योजना बनाएं',
  },
  ctaExploreDestinations: {
    en: 'Explore Destinations',
    te: 'ఘాట్లను అన్వేషించండి',
    hi: 'गंतव्य खोजें',
  },
  seniorCitizenMode: {
    en: 'Senior Mode',
    te: 'వృద్ధుల మోడ్',
    hi: 'वरिष्ठ मोड',
  },
  highContrast: {
    en: 'High Contrast',
    te: 'హై కాంట్రాస్ట్',
    hi: 'उच्च कंट्रास्ट',
  },
  resetBaselineBtn: {
    en: 'Reset Demo Data to Baseline',
    te: 'డెమో డేటాను రీసెట్ చేయండి',
    hi: 'डेमो डेटा बेसलाइन पर रीसेट करें',
  },
  switchToCommandCentre: {
    en: 'Authority Command Centre',
    te: 'అథారిటీ కమాండ్ సెంటర్',
    hi: 'अथॉरिटी कमांड सेंटर',
  },
  switchToPilgrimPortal: {
    en: 'Pilgrim Portal',
    te: 'భక్తుల పోర్టల్',
    hi: 'तीर्थयात्री पोर्टल',
  },
  simulatedNoticeShort: {
    en: 'Simulated Operational Environment — Synchronized Across Browser Tabs',
    te: 'అనుకరించిన డెమో వాతావరణం — బ్రౌజర్ ట్యాబ్‌ల మధ్య సింక్రొనైజ్ చేయబడింది',
    hi: 'सिम्युलेटेड डेमो वातावरण — ब्राउज़र टैब के बीच सिंक्रनाइज़',
  },
} as const;

export function useTranslation() {
  const language = useAccessibilityStore((s) => s.language);
  const setLanguage = useAccessibilityStore((s) => s.setLanguage);

  const t = (textObj: LocalizedText | undefined | null): string => {
    if (!textObj) return '';
    return textObj[language] || textObj.en;
  };

  const ui = (key: keyof typeof UI_DICTIONARY): string => {
    const entry = UI_DICTIONARY[key];
    return entry[language] || entry.en;
  };

  return {
    language,
    setLanguage,
    t,
    ui,
  };
}

export function translateText(
  textObj: LocalizedText | undefined | null,
  lang: SupportedLanguage
): string {
  if (!textObj) return '';
  return textObj[lang] || textObj.en;
}

