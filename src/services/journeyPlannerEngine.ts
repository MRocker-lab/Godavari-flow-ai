import { CanonicalMobilityState } from '@/data/baselineState';
import {
  ComputedJourneyOption,
  JourneyPlannerRequest,
  OperationalLevel,
} from '@/types';

/**
 * Multi-modal, accessibility-aware Journey Planner routing engine.
 * Dynamically inspects current ghat crowd levels, closed/diverted roads,
 * parking occupancy, and shuttle wait times from CanonicalMobilityState.
 */
export function computeJourneyOptions(
  request: JourneyPlannerRequest,
  state: CanonicalMobilityState
): ComputedJourneyOption[] {
  const origin =
    state.origins.find((o) => o.id === request.originId) || state.origins[0];
  const requestedGhat =
    state.ghats.find((g) => g.id === request.destinationGhatId) || state.ghats[0];

  // Check if any approach road to the requested ghat is CLOSED or DIVERTED
  const approachRoads = state.roads.filter((r) =>
    requestedGhat.approachRoadIds.includes(r.id)
  );
  const closedApproachRoads = approachRoads.filter(
    (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
  );

  // Pick optimal parking hub for requested ghat (prefer AVAILABLE hubs, avoid FULL/RESERVED unless accessibility requested)
  const candidateParkings = state.parkingHubs
    .filter((p) => requestedGhat.nearestParkingIds.includes(p.id))
    .sort((a, b) => {
      if (request.preferences.wheelchairRequired || request.preferences.withSeniorCitizens) {
        return b.wheelchairAccessibleBays - a.wheelchairAccessibleBays;
      }
      if (a.status === 'AVAILABLE' && b.status !== 'AVAILABLE') return -1;
      if (b.status === 'AVAILABLE' && a.status !== 'AVAILABLE') return 1;
      return b.availableSpaces - a.availableSpaces;
    });

  const bestParking =
    candidateParkings.find((p) => p.status === 'AVAILABLE') ||
    candidateParkings[0] ||
    state.parkingHubs[0];

  const connectedShuttle =
    state.shuttles.find((s) => requestedGhat.connectedShuttleIds.includes(s.id)) ||
    state.shuttles.find((s) => s.id === origin.defaultShuttleId) ||
    state.shuttles[0];

  const roadPenaltyMinutes =
    closedApproachRoads.length > 0 && request.travelMode === 'CAR_PLUS_SHUTTLE'
      ? 0 // Shuttle uses dedicated green corridor
      : approachRoads.some((r) => r.congestionIndex > 75)
      ? 12
      : 4;

  const primaryDuration =
    14 +
    connectedShuttle.estimatedArrivalMinutes +
    roadPenaltyMinutes +
    Math.round(requestedGhat.estimatedBathingWaitMinutes * 0.25);

  const primaryWalkingMeters =
    request.preferences.preferMinimalWalking ||
    request.preferences.withSeniorCitizens ||
    request.preferences.wheelchairRequired
      ? Math.min(180, bestParking.walkingDistanceMeters)
      : bestParking.walkingDistanceMeters;

  const option1: ComputedJourneyOption = {
    id: `jopt-primary-${requestedGhat.id}`,
    rank: 'RECOMMENDED_BEST',
    badgeLabel: {
      en: 'Recommended Fastest Route',
      te: 'సిఫార్సు చేయబడిన వేగవంతమైన మార్గం',
      hi: 'अनुशंसित सबसे तेज़ मार्ग',
    },
    title: {
      en: `${origin.name.en} → ${bestParking.name.en.split('(')[0].trim()} → ${connectedShuttle.routeCode} to ${requestedGhat.name.en}`,
      te: `${origin.name.te} → ${bestParking.name.te.split('(')[0].trim()} → ${connectedShuttle.routeCode} ద్వారా ${requestedGhat.name.te}`,
      hi: `${origin.name.hi} → ${bestParking.name.hi.split('(')[0].trim()} → ${connectedShuttle.routeCode} से ${requestedGhat.name.hi}`,
    },
    destinationGhatId: requestedGhat.id,
    isAlternateGhatSuggested: false,
    estimatedTotalDurationMinutes: primaryDuration,
    walkingDistanceMeters: primaryWalkingMeters,
    trafficCondition:
      closedApproachRoads.length > 0 ? 'MODERATE' : requestedGhat.trafficCondition,
    crowdLevel: requestedGhat.crowdLevel,
    recommendedParkingId: bestParking.id,
    recommendedShuttleId: connectedShuttle.id,
    activeRoadIdsUsed: connectedShuttle.primaryRoadIds,
    avoidedClosedRoadIds: closedApproachRoads.map((r) => r.id),
    routeCoordinates: [
      origin.coordinates,
      bestParking.coordinates,
      ...connectedShuttle.routePolyline,
      requestedGhat.coordinates,
    ],
    recommendationReason:
      closedApproachRoads.length > 0
        ? {
            en: `${closedApproachRoads[0].name.en} is closed to private vehicles by Command Centre order. This route parks at ${bestParking.name.en} (${bestParking.availableSpaces} spaces free) and uses the authorized ${connectedShuttle.routeCode} green shuttle lane.`,
            te: `కమాండ్ సెంటర్ ఆదేశాల మేరకు ${closedApproachRoads[0].name.te} ప్రైవేట్ వాహనాలకు మూసివేయబడింది. ఈ మార్గం ${bestParking.name.te} (${bestParking.availableSpaces} ఖాళీలు) వద్ద పార్క్ చేసి ${connectedShuttle.routeCode} ప్రత్యేక షటిల్ లేన్‌ను ఉపయోగిస్తుంది.`,
            hi: `कमांड सेंटर के आदेश से ${closedApproachRoads[0].name.hi} निजी वाहनों के लिए बंद है। यह मार्ग ${bestParking.name.hi} (${bestParking.availableSpaces} स्थान खाली) और अधिकृत ${connectedShuttle.routeCode} शटल लेन का उपयोग करता है।`,
          }
        : {
            en: `Balances ${bestParking.availableSpaces.toLocaleString()} open parking spaces at ${bestParking.name.en} with a ${connectedShuttle.estimatedArrivalMinutes}-minute shuttle wait and ${primaryWalkingMeters}m level walk.`,
            te: `${bestParking.name.te} వద్ద ${bestParking.availableSpaces.toLocaleString()} ఖాళీ పార్కింగ్ స్థలాలు, ${connectedShuttle.estimatedArrivalMinutes} నిమిషాల షటిల్ నిరీక్షణ మరియు ${primaryWalkingMeters} మీటర్ల నడకతో ఉత్తమ సమతుల్యత.`,
            hi: `${bestParking.name.hi} पर ${bestParking.availableSpaces.toLocaleString()} खाली पार्किंग स्थान, ${connectedShuttle.estimatedArrivalMinutes} मिनट शटल प्रतीक्षा और ${primaryWalkingMeters} मीटर पैदल दूरी का सर्वोत्तम संतुलन।`,
          },
    stepByStepDirections: [
      {
        en: `1. Arrive from ${origin.name.en} and proceed to ${bestParking.name.en}.`,
        te: `1. ${origin.name.te} నుండి బయలుదేరి ${bestParking.name.te} వద్దకు చేరుకోండి.`,
        hi: `1. ${origin.name.hi} से प्रस्थान करें और ${bestParking.name.hi} पर पहुँचें।`,
      },
      {
        en: `2. Board ${connectedShuttle.name.en} (next bus in ${connectedShuttle.estimatedArrivalMinutes} mins, ${connectedShuttle.availableCapacitySeats} seats open).`,
        te: `2. ${connectedShuttle.name.te} ఎక్కండి (తదుపరి బస్సు ${connectedShuttle.estimatedArrivalMinutes} నిమిషాల్లో, ${connectedShuttle.availableCapacitySeats} సీట్లు ఖాళీ).`,
        hi: `2. ${connectedShuttle.name.hi} पर सवार हों (अगली बस ${connectedShuttle.estimatedArrivalMinutes} मिनट में, ${connectedShuttle.availableCapacitySeats} सीटें उपलब्ध)।`,
      },
      {
        en: `3. Alight at ${requestedGhat.name.en} drop-off plaza (${primaryWalkingMeters}m walk to bathing steps; estimated bathing queue wait: ${requestedGhat.estimatedBathingWaitMinutes} mins).`,
        te: `3. ${requestedGhat.name.te} డ్రాప్-ఆఫ్ ప్లాజాలో దిగండి (స్నాన ఘట్టానికి ${primaryWalkingMeters} మీ. నడక; అంచనా వేచి ఉండే సమయం: ${requestedGhat.estimatedBathingWaitMinutes} నిమిషాలు).`,
        hi: `3. ${requestedGhat.name.hi} ड्रॉप-ऑफ प्लाज़ा पर उतरें (स्नान सीढ़ियों तक ${primaryWalkingMeters} मीटर पैदल; अनुमानित प्रतीक्षा: ${requestedGhat.estimatedBathingWaitMinutes} मिनट)।`,
      },
    ],
    accessibilityHighlights: [
      {
        en: requestedGhat.wheelchairRampAvailable
          ? 'Wheelchair ramp & priority lane active at destination ghat'
          : 'Standard stepped ghat access',
        te: requestedGhat.wheelchairRampAvailable
          ? 'గమ్యస్థాన ఘాట్ వద్ద వీల్‌చైర్ ర్యాంప్ & ప్రత్యేక వరుస అందుబాటులో ఉంది'
          : 'సాధారణ మెట్ల మార్గం',
        hi: requestedGhat.wheelchairRampAvailable
          ? 'गंतव्य घाट पर व्हीलचेयर रैंप और प्राथमिकता लेन सक्रिय'
          : 'मानक सीढ़ीदार घाट प्रवेश',
      },
      {
        en: 'Low-floor kneeling shuttle with onboard attendant',
        te: 'సహాయ సిబ్బందితో కూడిన లో-ఫ్లోర్ షటిల్ బస్సు',
        hi: 'सहायक कर्मचारियों के साथ लो-फ्लोर शटल बस',
      },
    ],
    authorityAdvisoryWarning: requestedGhat.activeAdvisory,
  };

  // Option 2: Accessibility & Senior Citizen Optimal Route (Saraswati Ghat / S3 Shuttle or Ramped Priority)
  const seniorGhat =
    state.ghats.find((g) => g.id === 'ghat-saraswati') || requestedGhat;
  const s3Shuttle =
    state.shuttles.find((s) => s.id === 'shuttle-s3') || connectedShuttle;
  const rjyParking =
    state.parkingHubs.find((p) => p.id === 'park-rjy-railway') || bestParking;

  const option2TargetGhat =
    requestedGhat.accessibilityScore === 5 && requestedGhat.crowdLevel === 'LOW'
      ? requestedGhat
      : seniorGhat;

  const option2: ComputedJourneyOption = {
    id: `jopt-access-${option2TargetGhat.id}`,
    rank: 'ACCESSIBILITY_OPTIMAL',
    badgeLabel: {
      en: 'Senior & Accessibility Priority',
      te: 'వృద్ధులు & దివ్యాంగుల ప్రాధాన్యత మార్గం',
      hi: 'वरिष्ठ नागरिक एवं सुगम्यता प्राथमिकता',
    },
    title: {
      en: `Zero-Step Priority Corridor via ${s3Shuttle.routeCode} → ${option2TargetGhat.name.en}`,
      te: `${s3Shuttle.routeCode} ద్వారా మెట్లు లేని ప్రత్యేక మార్గం → ${option2TargetGhat.name.te}`,
      hi: `${s3Shuttle.routeCode} द्वारा जीरो-स्टेप प्राथमिकता मार्ग → ${option2TargetGhat.name.hi}`,
    },
    destinationGhatId: option2TargetGhat.id,
    isAlternateGhatSuggested: option2TargetGhat.id !== requestedGhat.id,
    estimatedTotalDurationMinutes:
      15 + s3Shuttle.estimatedArrivalMinutes + Math.round(option2TargetGhat.estimatedBathingWaitMinutes * 0.2),
    walkingDistanceMeters: 120,
    trafficCondition: 'LOW',
    crowdLevel: option2TargetGhat.crowdLevel,
    recommendedParkingId: rjyParking.id,
    recommendedShuttleId: s3Shuttle.id,
    activeRoadIdsUsed: ['road-stadium-corridor'],
    avoidedClosedRoadIds: closedApproachRoads.map((r) => r.id),
    routeCoordinates: [
      origin.coordinates,
      rjyParking.coordinates,
      ...s3Shuttle.routePolyline,
    ],
    recommendationReason: {
      en: `Minimizes walking to 120m with electric buggy transfer, hydraulic wheelchair lift on ${s3Shuttle.routeCode}, and a ${option2TargetGhat.estimatedBathingWaitMinutes}-minute wait at ${option2TargetGhat.name.en}.`,
      te: `ఎలక్ట్రిక్ బగ్గీ సహాయంతో నడక దూరాన్ని 120 మీటర్లకు తగ్గిస్తుంది, ${s3Shuttle.routeCode} వీల్‌చైర్ లిఫ్ట్ మరియు ${option2TargetGhat.name.te} వద్ద కేవలం ${option2TargetGhat.estimatedBathingWaitMinutes} నిమిషాల వేచి ఉండే సమయం.`,
      hi: `इलेक्ट्रिक बग्गी के साथ पैदल दूरी को 120 मीटर तक सीमित करता है, ${s3Shuttle.routeCode} पर व्हीलचेयर लिफ्ट और केवल ${option2TargetGhat.estimatedBathingWaitMinutes} मिनट का प्रतीक्षा समय।`,
    },
    stepByStepDirections: [
      {
        en: `1. Park at ${rjyParking.name.en} Accessibility Priority Zone (${rjyParking.wheelchairAccessibleBays} accessible bays).`,
        te: `1. ${rjyParking.name.te} దివ్యాంగుల ప్రాధాన్యత జోన్‌లో పార్క్ చేయండి (${rjyParking.wheelchairAccessibleBays} ప్రత్యేక బేలు).`,
        hi: `1. ${rjyParking.name.hi} दिव्यांग प्राथमिकता ज़ोन में पार्क करें (${rjyParking.wheelchairAccessibleBays} आरक्षित बे)।`,
      },
      {
        en: `2. Board ${s3Shuttle.name.en} (arrives every ${s3Shuttle.frequencyMinutes} mins).`,
        te: `2. ${s3Shuttle.name.te} ఎక్కండి (ప్రతి ${s3Shuttle.frequencyMinutes} నిమిషాలకు).`,
        hi: `2. ${s3Shuttle.name.hi} पर सवार हों (हर ${s3Shuttle.frequencyMinutes} मिनट में)।`,
      },
      {
        en: `3. Transfer directly to ${option2TargetGhat.name.en} zero-step ramp via free electric buggy.`,
        te: `3. ఉచిత ఎలక్ట్రిక్ బగ్గీ ద్వారా నేరుగా ${option2TargetGhat.name.te} ర్యాంప్ వద్దకు చేరుకోండి.`,
        hi: `3. निःशुल्क इलेक्ट्रिक बग्गी द्वारा सीधे ${option2TargetGhat.name.hi} रैंप तक पहुँचें।`,
      },
    ],
    accessibilityHighlights: [
      {
        en: '120m maximum walk + Free Electric Buggy Escort',
        te: 'గరిష్టంగా 120 మీ. నడక + ఉచిత ఎలక్ట్రిక్ బగ్గీ సహాయం',
        hi: 'अधिकतम 120 मीटर पैदल + निःशुल्क इलेक्ट्रिक बग्गी एस्कॉर्ट',
      },
      {
        en: 'Dedicated Senior Citizen Bathing Enclosure & Medical Desk',
        te: 'వృద్ధుల ప్రత్యేక స్నాన విభాగం & వైద్య సహాయ కేంద్రం',
        hi: 'समर्पित वरिष्ठ नागरिक स्नान क्षेत्र एवं चिकित्सा डेस्क',
      },
    ],
  };

  // Option 3: Lowest Crowd Smart Alternative Ghat
  const calmestGhat = [...state.ghats]
    .filter((g) => g.id !== requestedGhat.id)
    .sort((a, b) => a.estimatedBathingWaitMinutes - b.estimatedBathingWaitMinutes)[0] || state.ghats[3];

  const calmParking =
    state.parkingHubs.find((p) => calmestGhat.nearestParkingIds.includes(p.id)) ||
    state.parkingHubs[7];
  const calmShuttle =
    state.shuttles.find((s) => calmestGhat.connectedShuttleIds.includes(s.id)) ||
    state.shuttles[5];

  const option3: ComputedJourneyOption = {
    id: `jopt-calm-${calmestGhat.id}`,
    rank: 'LOWEST_CROWD_ALTERNATIVE',
    badgeLabel: {
      en: 'Smart Low-Crowd Alternative',
      te: 'తక్కువ రద్దీ గల ప్రత్యామ్నాయ మార్గం',
      hi: 'कम भीड़ वाला स्मार्ट विकल्प',
    },
    title: {
      en: `Smart Crowd Bypass → ${calmestGhat.name.en} via ${calmShuttle.routeCode}`,
      te: `రద్దీ లేని ప్రత్యామ్నాయం → ${calmShuttle.routeCode} ద్వారా ${calmestGhat.name.te}`,
      hi: `स्मार्ट भीड़ बाईपास → ${calmShuttle.routeCode} द्वारा ${calmestGhat.name.hi}`,
    },
    destinationGhatId: calmestGhat.id,
    isAlternateGhatSuggested: true,
    estimatedTotalDurationMinutes:
      16 + calmShuttle.estimatedArrivalMinutes + Math.round(calmestGhat.estimatedBathingWaitMinutes * 0.2),
    walkingDistanceMeters: calmParking.walkingDistanceMeters,
    trafficCondition: calmestGhat.trafficCondition as OperationalLevel,
    crowdLevel: calmestGhat.crowdLevel,
    recommendedParkingId: calmParking.id,
    recommendedShuttleId: calmShuttle.id,
    activeRoadIdsUsed: calmShuttle.primaryRoadIds,
    avoidedClosedRoadIds: closedApproachRoads.map((r) => r.id),
    routeCoordinates: [
      origin.coordinates,
      calmParking.coordinates,
      ...calmShuttle.routePolyline,
    ],
    recommendationReason: {
      en: `Saves ${Math.max(5, requestedGhat.estimatedBathingWaitMinutes - calmestGhat.estimatedBathingWaitMinutes)} minutes of bathing queue wait compared to ${requestedGhat.name.en} (${calmestGhat.estimatedBathingWaitMinutes}m wait vs ${requestedGhat.estimatedBathingWaitMinutes}m wait).`,
      te: `${requestedGhat.name.te} (${requestedGhat.estimatedBathingWaitMinutes} ని. నిరీక్షణ) తో పోలిస్తే ${calmestGhat.name.te} (${calmestGhat.estimatedBathingWaitMinutes} ని. నిరీక్షణ) ఎంచుకోవడం ద్వారా క్యూలో ${Math.max(5, requestedGhat.estimatedBathingWaitMinutes - calmestGhat.estimatedBathingWaitMinutes)} నిమిషాల సమయం ఆదా అవుతుంది.`,
      hi: `${requestedGhat.name.hi} (${requestedGhat.estimatedBathingWaitMinutes} मिनट प्रतीक्षा) की तुलना में ${calmestGhat.name.hi} (${calmestGhat.estimatedBathingWaitMinutes} मिनट प्रतीक्षा) चुनकर कतार के समय में ${Math.max(5, requestedGhat.estimatedBathingWaitMinutes - calmestGhat.estimatedBathingWaitMinutes)} मिनट की बचत करें।`,
    },
    stepByStepDirections: [
      {
        en: `1. Proceed via outer ring corridor to ${calmParking.name.en} (${calmParking.availableSpaces.toLocaleString()} spaces open).`,
        te: `1. అవుటర్ రింగ్ మార్గం ద్వారా ${calmParking.name.te} (${calmParking.availableSpaces.toLocaleString()} ఖాళీలు) చేరుకోండి.`,
        hi: `1. आउटर रिंग मार्ग से ${calmParking.name.hi} (${calmParking.availableSpaces.toLocaleString()} स्थान खाली) पर पहुँचें।`,
      },
      {
        en: `2. Take ${calmShuttle.name.en} directly to ${calmestGhat.name.en}.`,
        te: `2. ${calmShuttle.name.te} ద్వారా నేరుగా ${calmestGhat.name.te} చేరుకోండి.`,
        hi: `2. ${calmShuttle.name.hi} से सीधे ${calmestGhat.name.hi} पहुँचें।`,
      },
    ],
    accessibilityHighlights: [
      {
        en: 'Calmest riverbank queue & spacious family changing halls',
        te: 'అతి తక్కువ క్యూ & విశాలమైన కుటుంబ దుస్తులు మార్చుకునే గదులు',
        hi: 'सबसे शांत कतार और विशाल पारिवारिक चेंजिंग हॉल',
      },
    ],
  };

  // If senior/wheelchair preferences are selected, promote Accessibility Optimal to first card
  if (
    request.preferences.withSeniorCitizens ||
    request.preferences.wheelchairRequired ||
    request.travelMode === 'ACCESSIBILITY_PRIORITY_TRANSIT'
  ) {
    return [option2, option1, option3];
  }

  // If user requested avoidHighCrowds and requestedGhat is HIGH/CRITICAL, promote Low Crowd Alternative
  if (
    request.preferences.avoidHighCrowds &&
    (requestedGhat.crowdLevel === 'HIGH' || requestedGhat.crowdLevel === 'CRITICAL')
  ) {
    return [option3, option1, option2];
  }

  return [option1, option2, option3];
}

