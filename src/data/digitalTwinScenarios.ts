import { DigitalTwinScenarioPreset } from '@/types';

export const DIGITAL_TWIN_SCENARIOS: DigitalTwinScenarioPreset[] = [
  {
    id: 'scenario-pushkar-surge',
    code: 'DT-SCEN-01',
    name: {
      en: 'Peak Muhurtham Surge at Pushkar Ghat & Old Town Closure',
      te: 'పుష్కర ఘాట్ ముహూర్త రద్దీ & ఓల్డ్ టౌన్ వాహనాల మళ్లింపు',
      hi: 'पुष्कर घाट मुहूर्त भीड़ एवं ओल्ड टाउन डायवर्जन',
    },
    summary: {
      en: 'Simulates a +45% morning pilgrim surge at Pushkar Ghat while closing Pushkar Approach Road to private cars and boosting Shuttle S1 & S3 frequency by 50%.',
      te: 'పుష్కర ఘాట్ వద్ద +45% భక్తుల రద్దీని అనుకరిస్తూ, అప్రోచ్ రోడ్డును ప్రైవేట్ కార్లకు మూసివేసి S1 & S3 షటిల్ బస్సులను 50% పెంచినప్పుడు కలిగే ఫలితాలు.',
      hi: 'पुष्कर घाट पर +45% भीड़ उछाल का सिमुलेशन, निजी कारों के लिए एप्रोच रोड बंद करना और S1 व S3 शटल आवृत्ति को 50% बढ़ाना।',
    },
    triggerCondition: {
      en: 'Auspicious Pushkaralu Snanam Muhurtham window (06:00 AM – 10:30 AM)',
      te: 'పవిత్ర పుష్కర స్నాన ముహూర్త సమయం (ఉదయం 06:00 – 10:30)',
      hi: 'शुभ पुष्करालु स्नान मुहूर्त समय (सुबह 06:00 – 10:30)',
    },
    defaultControls: {
      pilgrimInflowMultiplierPercent: 145,
      shuttleFrequencyBoostPercent: 50,
      parkingDiversionToSatellitePercent: 75,
      closePushkarApproachRoad: true,
      closeOldBridgeToPrivateVehicles: false,
      enableDedicatedSeniorShuttleCorridor: true,
    },
    highlightedRoadIds: ['road-pushkar-approach', 'road-main-fort', 'road-stadium-corridor'],
    highlightedGhatIds: ['ghat-pushkar', 'ghat-saraswati', 'ghat-gautami'],
  },
  {
    id: 'scenario-bridge-diversion',
    code: 'DT-SCEN-02',
    name: {
      en: 'Road-cum-Rail Bridge Private Vehicle Restriction & West Bank Balancing',
      te: 'రోడ్-కమ్-రైల్ వంతెనపై ప్రైవేట్ వాహనాల నియంత్రణ & పశ్చిమ తీర సమతుల్యత',
      hi: 'रोड-कम-रेल ब्रिज पर निजी वाहन प्रतिबंध एवं पश्चिमी तट संतुलन',
    },
    summary: {
      en: 'Restricts the historic Road-cum-Rail Bridge to APSRTC shuttles and emergency ambulances only, routing West Godavari cars to Kovvur Gospada Ghat or the 4th Godavari Bridge.',
      te: 'చారిత్రాత్మక రోడ్-కమ్-రైల్ వంతెనను ఆర్టీసీ షటిల్స్ మరియు అంబులెన్స్‌లకు మాత్రమే పరిమితం చేసి, పశ్చిమ గోదావరి వాహనాలను కొవ్వూరు గోష్పాద ఘాట్ లేదా 4వ వంతెనకు మళ్లించడం.',
      hi: 'रोड-कम-रेल ब्रिज को केवल आरटीसी शटल और एम्बुलेंस के लिए सीमित करना और पश्चिमी गोदावरी के वाहनों को कोव्वुर घाट या चौथे पुल पर मोड़ना।',
    },
    triggerCondition: {
      en: 'Cross-river traffic congestion exceeding 75/100 on Road-cum-Rail Bridge',
      te: 'రోడ్-కమ్-రైల్ వంతెనపై ట్రాఫిక్ రద్దీ 75/100 దాటినప్పుడు',
      hi: 'रोड-कम-रेल ब्रिज पर यातायात भीड़ 75/100 से अधिक होने पर',
    },
    defaultControls: {
      pilgrimInflowMultiplierPercent: 120,
      shuttleFrequencyBoostPercent: 40,
      parkingDiversionToSatellitePercent: 80,
      closePushkarApproachRoad: true,
      closeOldBridgeToPrivateVehicles: true,
      enableDedicatedSeniorShuttleCorridor: true,
    },
    highlightedRoadIds: ['road-rail-cum-road-bridge', 'road-fourth-bridge-nh16', 'road-kovvur-gospada'],
    highlightedGhatIds: ['ghat-kovvur-gospada', 'ghat-pushkar', 'ghat-kotilingala'],
  },
  {
    id: 'scenario-parking-overflow',
    code: 'DT-SCEN-03',
    name: {
      en: 'NH-16 Highway Arrival Wave & Outer Ring Satellite Interception',
      te: 'NH-16 హైవే వాహనాల ప్రవాహం & అవుటర్ రింగ్ శాటిలైట్ పార్కింగ్ మళ్లింపు',
      hi: 'NH-16 हाईवे वाहन प्रवाह एवं आउटर रिंग सैटेलाइट पार्किंग इंटरसेप्शन',
    },
    summary: {
      en: 'Models a +60% highway vehicle inflow from Visakhapatnam and Vijayawada intercepted 90% at Morampudi, Lalacheruvu, and Dowleswaram outer hubs.',
      te: 'విశాఖపట్నం మరియు విజయవాడ వైపు నుండి +60% హైవే వాహనాల రాకను మోరంపూడి, లాలాచెరువు, ధవళేశ్వరం శాటిలైట్ హబ్‌ల వద్ద 90% నిలిపివేసే నమూనా.',
      hi: 'विशाखापत्तनम और विजयवाड़ा से +60% राजमार्ग वाहन प्रवाह को मोरमपुडी, लालाचेरुवु और धवलेश्वरम हब पर 90% रोकने का मॉडल।',
    },
    triggerCondition: {
      en: 'Weekend highway convoy surge on NH-16 East & North approaches',
      te: 'వారాంతంలో NH-16 తూర్పు & ఉత్తర మార్గాల్లో వాహనాల రద్దీ',
      hi: 'सप्ताहांत में NH-16 पूर्वी और उत्तरी मार्गों पर वाहनों का उछाल',
    },
    defaultControls: {
      pilgrimInflowMultiplierPercent: 160,
      shuttleFrequencyBoostPercent: 75,
      parkingDiversionToSatellitePercent: 90,
      closePushkarApproachRoad: true,
      closeOldBridgeToPrivateVehicles: false,
      enableDedicatedSeniorShuttleCorridor: true,
    },
    highlightedRoadIds: ['road-nh16-morampudi', 'road-jn-road', 'road-dowleswaram-bypass'],
    highlightedGhatIds: ['ghat-kotilingala', 'ghat-gautami', 'ghat-dowleswaram'],
  },
  {
    id: 'scenario-senior-priority',
    code: 'DT-SCEN-04',
    name: {
      en: 'Senior Citizen & Accessibility Green Corridor Activation',
      te: 'వృద్ధులు & దివ్యాంగుల ప్రత్యేక గ్రీన్ కారిడార్ అమలు',
      hi: 'वरिष्ठ नागरिक एवं दिव्यांग ग्रीन कॉरिडोर सक्रियण',
    },
    summary: {
      en: 'Prioritizes low-floor S3 & S6 shuttles, reserves central parking exclusively for elderly/wheelchair permits, and routes families to ramped ghats.',
      te: 'లో-ఫ్లోర్ S3 & S6 షటిల్ బస్సులకు ప్రాధాన్యతనిస్తూ, సెంట్రల్ పార్కింగ్‌ను వృద్ధులు/దివ్యాంగులకే కేటాయించి ర్యాంప్ ఉన్న ఘాట్లకు మళ్లించే విధానం.',
      hi: 'लो-फ्लोर S3 और S6 शटल को प्राथमिकता देना, सेंट्रल पार्किंग को वरिष्ठ/दिव्यांग पास के लिए आरक्षित करना और रैंप वाले घाटों पर भेजना।',
    },
    triggerCondition: {
      en: 'Afternoon Senior Citizen & Differently-Abled Darshan / Snanam Slot',
      te: 'మధ్యాహ్నం వృద్ధులు & దివ్యాంగుల ప్రత్యేక పుష్కర స్నాన సమయం',
      hi: 'दोपहर वरिष्ठ नागरिक एवं दिव्यांग विशेष स्नान स्लॉट',
    },
    defaultControls: {
      pilgrimInflowMultiplierPercent: 105,
      shuttleFrequencyBoostPercent: 60,
      parkingDiversionToSatellitePercent: 85,
      closePushkarApproachRoad: false,
      closeOldBridgeToPrivateVehicles: false,
      enableDedicatedSeniorShuttleCorridor: true,
    },
    highlightedRoadIds: ['road-stadium-corridor', 'road-dowleswaram-bypass'],
    highlightedGhatIds: ['ghat-saraswati', 'ghat-iskcon', 'ghat-gautami'],
  },
];

