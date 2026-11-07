import { CanonicalMobilityState } from '@/data/baselineState';
import { GhatDestination, SupportedLanguage } from '@/types';
import {
  ConciergeMapLink,
  ConciergeMessageResponse,
  IAIServiceAdapter,
} from '../interfaces/IAIServiceAdapter';

/**
 * Context-aware Local Domain AI Engine.
 *
 * Security Compliance (QA-01):
 * - Never accesses or exposes any VITE_ API key or secret in frontend code.
 * - Operates 100% independently by analyzing the live shared CanonicalMobilityState
 *   (current ghat occupancy, wait times, road closures, parking spaces, shuttle ETAs,
 *   and active incidents) in English, Telugu, and Hindi.
 * - Optional external LLM integration is strictly isolated behind a server-side proxy
 *   endpoint contract (/api/ai/concierge) when a backend proxy is deployed.
 */
export class LocalDomainAIEngine implements IAIServiceAdapter {
  private detectIntent(
    query: string
  ): ConciergeMessageResponse['intentDetected'] {
    const q = query.toLowerCase();

    if (
      q.includes('senior') ||
      q.includes('elder') ||
      q.includes('wheelchair') ||
      q.includes('old') ||
      q.includes('ramp') ||
      q.includes('accessibility') ||
      q.includes('వృద్ధ') ||
      q.includes('దివ్యాంగ') ||
      q.includes('వీల్‌చైర్') ||
      q.includes('वरिष्ठ') ||
      q.includes('बुजुर्ग') ||
      q.includes('व्हीलचेयर')
    ) {
      return 'SENIOR_AND_ACCESSIBILITY';
    }

    if (
      q.includes('park') ||
      q.includes('car') ||
      q.includes('vehicle') ||
      q.includes('morampudi') ||
      q.includes('lalacheruvu') ||
      q.includes('arts college') ||
      q.includes('పార్కింగ్') ||
      q.includes('కారు') ||
      q.includes('మోరంపూడి') ||
      q.includes('पार्किंग') ||
      q.includes('कार') ||
      q.includes('मोरमपुडी')
    ) {
      return 'PARKING_RECOMMENDATION';
    }

    if (
      q.includes('shuttle') ||
      q.includes('bus') ||
      q.includes('s1') ||
      q.includes('s2') ||
      q.includes('s3') ||
      q.includes('s4') ||
      q.includes('s5') ||
      q.includes('s6') ||
      q.includes('షటిల్') ||
      q.includes('బస్సు') ||
      q.includes('शटल') ||
      q.includes('बस')
    ) {
      return 'SHUTTLE_TIMING';
    }

    if (
      q.includes('road') ||
      q.includes('bridge') ||
      q.includes('closed') ||
      q.includes('diversion') ||
      q.includes('traffic') ||
      q.includes('రోడ్') ||
      q.includes('వంతెన') ||
      q.includes('ట్రాఫిక్') ||
      q.includes('सड़क') ||
      q.includes('पुल') ||
      q.includes('ट्रैफिक')
    ) {
      return 'ROAD_CLOSURE_AND_TRAFFIC';
    }

    if (
      q.includes('emergency') ||
      q.includes('medical') ||
      q.includes('doctor') ||
      q.includes('ambulance') ||
      q.includes('lost') ||
      q.includes('help') ||
      q.includes('అత్యవసర') ||
      q.includes('వైద్య') ||
      q.includes('आपातकाल') ||
      q.includes('चिकित्सा')
    ) {
      return 'EMERGENCY_AND_MEDICAL';
    }

    if (
      q.includes('plan') ||
      q.includes('route') ||
      q.includes('how to reach') ||
      q.includes('railway') ||
      q.includes('kovvur') ||
      q.includes('ప్రయాణ') ||
      q.includes('మార్గం') ||
      q.includes('यात्रा') ||
      q.includes('रास्ता')
    ) {
      return 'JOURNEY_PLANNING_SUMMARY';
    }

    return 'CROWD_AND_GHAT_ADVICE';
  }

  private findMentionedGhat(query: string, ghats: GhatDestination[]): GhatDestination | undefined {
    const q = query.toLowerCase();
    return ghats.find(
      (g) =>
        q.includes(g.id.replace('ghat-', '')) ||
        q.includes(g.name.en.toLowerCase().split(' ')[0]) ||
        q.includes(g.name.te) ||
        q.includes(g.name.hi)
    );
  }

  public async generateConciergeReply(
    userQuery: string,
    language: SupportedLanguage,
    liveState: CanonicalMobilityState,
    seniorModeActive: boolean
  ): Promise<ConciergeMessageResponse> {
    const intent = this.detectIntent(userQuery);
    const mentionedGhat = this.findMentionedGhat(userQuery, liveState.ghats);

    const sortedByLowestWait = [...liveState.ghats].sort(
      (a, b) => a.estimatedBathingWaitMinutes - b.estimatedBathingWaitMinutes
    );
    const calmestGhat = sortedByLowestWait[0];
    const secondCalmestGhat = sortedByLowestWait[1] || sortedByLowestWait[0];
    const busiestGhat = [...liveState.ghats].sort(
      (a, b) => b.currentOccupancyCount / b.maxCapacityCount - a.currentOccupancyCount / a.maxCapacityCount
    )[0];

    const seniorFriendlyGhats = liveState.ghats.filter(
      (g) => g.wheelchairRampAvailable && g.seniorPriorityLane && g.crowdLevel !== 'CRITICAL'
    );
    const bestSeniorGhat = seniorFriendlyGhats.sort(
      (a, b) => a.estimatedBathingWaitMinutes - b.estimatedBathingWaitMinutes
    )[0] || calmestGhat;

    const availableParking = [...liveState.parkingHubs]
      .filter((p) => p.status === 'AVAILABLE')
      .sort((a, b) => b.availableSpaces - a.availableSpaces);
    const topParking = availableParking[0] || liveState.parkingHubs[0];
    const secondParking = availableParking[1] || liveState.parkingHubs[1];

    const closedOrDivertedRoads = liveState.roads.filter(
      (r) => r.status === 'CLOSED' || r.status === 'DIVERTED'
    );
    const congestedRoads = liveState.roads.filter(
      (r) => r.status === 'CONGESTED' || r.congestionIndex >= 70
    );

    const bestShuttles = [...liveState.shuttles].sort(
      (a, b) => a.estimatedArrivalMinutes - b.estimatedArrivalMinutes
    );
    const fastestShuttle = bestShuttles[0];

    let replyText = '';
    const mapLinks: ConciergeMapLink[] = [];

    if (intent === 'SENIOR_AND_ACCESSIBILITY') {
      const s3Shuttle = liveState.shuttles.find((s) => s.id === 'shuttle-s3') || fastestShuttle;
      const rjyParking = liveState.parkingHubs.find((p) => p.id === 'park-rjy-railway') || topParking;

      if (language === 'te') {
        replyText = `వృద్ధులు మరియు దివ్యాంగుల కోసం ప్రస్తుతం **${bestSeniorGhat.name.te}** అత్యంత అనుకూలంగా ఉంది (ప్రస్తుత రద్దీ: ${bestSeniorGhat.crowdLevel}, స్నాన నిరీక్షణ సమయం సుమారు **${bestSeniorGhat.estimatedBathingWaitMinutes} నిమిషాలు** మాత్రమే). అక్కడ మెట్లు లేని వీల్‌చైర్ ర్యాంపులు, ఎలక్ట్రిక్ బగ్గీలు మరియు 24x7 వైద్య శిబిరం అందుబాటులో ఉన్నాయి. మీరు **${rjyParking.name.te}** (${rjyParking.availableSpaces} ఖాళీలు) వద్ద వాహనం నిలిపి, ప్రతి ${s3Shuttle.frequencyMinutes} నిమిషాలకు నడిచే లో-ఫ్లోర్ **${s3Shuttle.routeCode}** షటిల్ ద్వారా నేరుగా చేరుకోవచ్చు.`;
      } else if (language === 'hi') {
        replyText = `वरिष्ठ नागरिकों और दिव्यांग श्रद्धालुओं के लिए वर्तमान में **${bestSeniorGhat.name.hi}** सबसे उपयुक्त है (वर्तमान भीड़ स्तर: ${bestSeniorGhat.crowdLevel}, अनुमानित स्नान प्रतीक्षा समय केवल **${bestSeniorGhat.estimatedBathingWaitMinutes} मिनट**)। यहाँ जीरो-स्टेप व्हीलचेयर रैंप, इलेक्ट्रिक बग्गी और 24x7 मेडिकल कैंप उपलब्ध हैं। आप **${rjyParking.name.hi}** (${rjyParking.availableSpaces} स्थान खाली) पर पार्क करके हर ${s3Shuttle.frequencyMinutes} मिनट में चलने वाली लो-फ्लोर **${s3Shuttle.routeCode}** शटल ले सकते हैं।`;
      } else {
        replyText = `For senior citizens and wheelchair users, **${bestSeniorGhat.name.en}** is currently the best choice with **${bestSeniorGhat.crowdLevel}** crowd conditions and an estimated bathing wait of just **${bestSeniorGhat.estimatedBathingWaitMinutes} minutes**. It offers zero-step non-slip ramps, electric buggy transfers, and an active medical camp. Park at **${rjyParking.name.en}** (${rjyParking.availableSpaces.toLocaleString()} spaces open) and board the low-floor **${s3Shuttle.name.en}** (arriving in ${s3Shuttle.estimatedArrivalMinutes} mins).`;
      }

      mapLinks.push(
        {
          entityType: 'GHAT',
          entityId: bestSeniorGhat.id,
          label: bestSeniorGhat.name,
          statusBadge: `${bestSeniorGhat.estimatedBathingWaitMinutes}m wait • Ramp Active`,
          routeHref: `/explore?ghat=${bestSeniorGhat.id}`,
        },
        {
          entityType: 'SHUTTLE',
          entityId: s3Shuttle.id,
          label: s3Shuttle.name,
          statusBadge: `ETA ${s3Shuttle.estimatedArrivalMinutes}m • Wheelchair Lift`,
          routeHref: `/shuttles?route=${s3Shuttle.id}`,
        },
        {
          entityType: 'PARKING',
          entityId: rjyParking.id,
          label: rjyParking.name,
          statusBadge: `${rjyParking.availableSpaces} spaces free`,
          routeHref: `/parking?hub=${rjyParking.id}`,
        }
      );
    } else if (intent === 'PARKING_RECOMMENDATION') {
      const fullOrFilling = liveState.parkingHubs.filter(
        (p) => p.status === 'FULL' || p.status === 'FILLING_FAST' || p.status === 'RESERVED_ACCESSIBILITY'
      );
      const avoidNames = fullOrFilling.map((p) => p.name[language]).join(', ');

      if (language === 'te') {
        replyText = `ప్రస్తుత పార్కింగ్ సమాచారం ప్రకారం:\n• **${topParking.name.te}**: **${topParking.availableSpaces.toLocaleString()} స్థలాలు ఖాళీగా** ఉన్నాయి (${topParking.occupancyPercent}% నిండింది). అక్కడి నుండి ఘాట్‌కు ఎక్స్‌ప్రెస్ షటిల్ అందుబాటులో ఉంది.\n• **${secondParking.name.te}**: **${secondParking.availableSpaces.toLocaleString()} స్థలాలు ఖాళీగా** ఉన్నాయి (${secondParking.occupancyPercent}% నిండింది).\n${avoidNames ? `గమనిక: రద్దీ ఎక్కువగా ఉన్నందున సాధారణ వాహనాలు **${avoidNames}** వైపు వెళ్లవద్దని సూచించబడింది.` : ''}`;
      } else if (language === 'hi') {
        replyText = `वर्तमान लाइव सिम्युलेटेड पार्किंग स्थिति के अनुसार:\n• **${topParking.name.hi}**: **${topParking.availableSpaces.toLocaleString()} स्थान खाली** हैं (${topParking.occupancyPercent}% भरा हुआ) — सीधी एक्सप्रेस शटल सेवा उपलब्ध है।\n• **${secondParking.name.hi}**: **${secondParking.availableSpaces.toLocaleString()} स्थान खाली** हैं (${secondParking.occupancyPercent}% भरा हुआ)।\n${avoidNames ? `सलाह: अधिक भीड़ के कारण निजी वाहनों को **${avoidNames}** से बचने की सलाह दी जाती है।` : ''}`;
      } else {
        replyText = `Based on current corridor capacity:\n• **${topParking.name.en}** has **${topParking.availableSpaces.toLocaleString()} spaces available** (${topParking.occupancyPercent}% occupied) with direct express shuttle transfer.\n• **${secondParking.name.en}** has **${secondParking.availableSpaces.toLocaleString()} spaces available** (${secondParking.occupancyPercent}% occupied).\n${avoidNames ? `Advisory: Avoid driving private cars to **${avoidNames}** due to high saturation/accessibility restrictions.` : ''}`;
      }

      mapLinks.push(
        {
          entityType: 'PARKING',
          entityId: topParking.id,
          label: topParking.name,
          statusBadge: `${topParking.availableSpaces} free (${topParking.occupancyPercent}%)`,
          routeHref: `/parking?hub=${topParking.id}`,
        },
        {
          entityType: 'PARKING',
          entityId: secondParking.id,
          label: secondParking.name,
          statusBadge: `${secondParking.availableSpaces} free (${secondParking.occupancyPercent}%)`,
          routeHref: `/parking?hub=${secondParking.id}`,
        }
      );
    } else if (intent === 'SHUTTLE_TIMING') {
      const s1 = liveState.shuttles[0];
      const s2 = liveState.shuttles[1];
      const s3 = liveState.shuttles[2];

      if (language === 'te') {
        replyText = `ప్రస్తుత ఆర్టీసీ పుష్కర షటిల్ బస్సుల స్థితి:\n• **${s1.name.te}**: తదుపరి బస్సు **${s1.estimatedArrivalMinutes} నిమిషాల్లో** (ప్రతి ${s1.frequencyMinutes} ని.కు), ${s1.availableCapacitySeats} సీట్లు అందుబాటులో ఉన్నాయి.\n• **${s2.name.te}**: తదుపరి బస్సు **${s2.estimatedArrivalMinutes} నిమిషాల్లో**, ${s2.availableCapacitySeats} సీట్లు ఖాళీగా ఉన్నాయి.\n• **${s3.name.te}**: తదుపరి బస్సు **${s3.estimatedArrivalMinutes} నిమిషాల్లో** (100% వీల్‌చైర్ & వృద్ధుల ప్రాధాన్యత).`;
      } else if (language === 'hi') {
        replyText = `वर्तमान पुष्करालु शटल सेवा की स्थिति:\n• **${s1.name.hi}**: अगली बस **${s1.estimatedArrivalMinutes} मिनट** में (हर ${s1.frequencyMinutes} मिनट में), ${s1.availableCapacitySeats} सीटें उपलब्ध।\n• **${s2.name.hi}**: अगली बस **${s2.estimatedArrivalMinutes} मिनट** में, ${s2.availableCapacitySeats} सीटें उपलब्ध।\n• **${s3.name.hi}**: अगली बस **${s3.estimatedArrivalMinutes} मिनट** में (लो-फ्लोर व्हीलचेयर एवं वरिष्ठ प्राथमिकता)।`;
      } else {
        replyText = `Current Pushkaralu Shuttle Fleet Status:\n• **${s1.name.en}**: Next bus in **${s1.estimatedArrivalMinutes} mins** (every ${s1.frequencyMinutes}m) — ${s1.availableCapacitySeats} seats available.\n• **${s2.name.en}**: Next bus in **${s2.estimatedArrivalMinutes} mins** (every ${s2.frequencyMinutes}m) — ${s2.availableCapacitySeats} seats available.\n• **${s3.name.en}**: Next bus in **${s3.estimatedArrivalMinutes} mins** — 100% low-floor wheelchair & senior priority fleet.`;
      }

      mapLinks.push(
        {
          entityType: 'SHUTTLE',
          entityId: s1.id,
          label: s1.name,
          statusBadge: `ETA ${s1.estimatedArrivalMinutes}m • ${s1.availableCapacitySeats} seats`,
          routeHref: `/shuttles?route=${s1.id}`,
        },
        {
          entityType: 'SHUTTLE',
          entityId: s3.id,
          label: s3.name,
          statusBadge: `ETA ${s3.estimatedArrivalMinutes}m • Senior Priority`,
          routeHref: `/shuttles?route=${s3.id}`,
        }
      );
    } else if (intent === 'ROAD_CLOSURE_AND_TRAFFIC') {
      const closedList =
        closedOrDivertedRoads.length > 0
          ? closedOrDivertedRoads.map((r) => `${r.name[language]} (${r.status})`).join('; ')
          : language === 'te'
          ? 'ప్రస్తుతం పూర్తిగా మూసివేసిన రోడ్లు లేవు'
          : language === 'hi'
          ? 'वर्तमान में कोई सड़क पूरी तरह बंद नहीं है'
          : 'No roads are completely closed right now';

      const congestedList = congestedRoads
        .map((r) => `${r.name[language]} (Index: ${r.congestionIndex}/100)`)
        .join(', ');

      if (language === 'te') {
        replyText = `రాజమహేంద్రవరం–కొవ్వూరు ట్రాఫిక్ అప్‌డేట్:\n• **మూసివేతలు / మళ్లింపులు**: ${closedList}.\n• **అధిక ట్రాఫిక్ కారిడార్లు**: ${congestedList || 'సాధారణ ప్రవాహం'}.\nసూచన: ప్రైవేట్ వాహనాలను NH-16 శాటిలైట్ పార్కింగ్ (మోరంపూడి / లాలాచెరువు / కొవ్వూరు) వద్ద నిలిపి ప్రత్యేక గ్రీన్ లేన్ షటిల్ బస్సులను ఉపయోగించండి.`;
      } else if (language === 'hi') {
        replyText = `राजमहेंद्रवरम–कोव्वुर यातायात अपडेट:\n• **सड़क बंद / डायवर्जन**: ${closedList}।\n• **उच्च भीड़ वाले मार्ग**: ${congestedList || 'सामान्य प्रवाह'}।\nसलाह: निजी वाहनों को NH-16 सैटेलाइट पार्किंग (मोरमपुडी / लालाचेरुवु / कोव्वुर) पर पार्क करें और समर्पित शटल का उपयोग करें।`;
      } else {
        replyText = `Rajamahendravaram–Kovvur Corridor Traffic Update:\n• **Road Closures / Diversions**: ${closedList}.\n• **High Congestion Segments**: ${congestedList || 'All corridors flowing normally'}.\nRecommendation: Use NH-16 Outer Ring Satellite Parking (Morampudi, Lalacheruvu, or Kovvur) and board dedicated green-corridor shuttles.`;
      }

      const targetRoad = closedOrDivertedRoads[0] || congestedRoads[0] || liveState.roads[0];
      mapLinks.push({
        entityType: 'ROAD',
        entityId: targetRoad.id,
        label: targetRoad.name,
        statusBadge: `${targetRoad.status} • ${targetRoad.congestionIndex}/100`,
        routeHref: `/journey-planner`,
      });
    } else if (intent === 'EMERGENCY_AND_MEDICAL') {
      if (language === 'te') {
        replyText = `అత్యవసర & వైద్య సహాయ సమాచారం:\n• **పుష్కర కంట్రోల్ రూమ్ టోల్-ఫ్రీ**: **1902** / పోలీస్: **112** / అంబులెన్స్: **108**.\n• అన్ని 8 ప్రధాన ఘాట్ల వద్ద **24x7 వైద్య శిబిరాలు**, ఓఆర్ఎస్/మంచినీటి కేంద్రాలు మరియు తప్పిపోయిన వారి సమాచార కేంద్రాలు (Lost & Found) పనిచేస్తున్నాయి.\n• వృద్ధులకు తక్షణ వీల్‌చైర్ బగ్గీ సహాయం కోసం **సరస్వతి ఘాట్** లేదా **పుష్కర ఘాట్ గేట్ 1** హెల్ప్‌డెస్క్‌ను సంప్రదించండి.`;
      } else if (language === 'hi') {
        replyText = `आपातकालीन एवं चिकित्सा सहायता जानकारी:\n• **पुष्करालु कंट्रोल रूम हेल्पलाइन**: **1902** / पुलिस: **112** / एम्बुलेंस: **108**।\n• सभी 8 प्रमुख घाटों पर **24x7 चिकित्सा शिविर**, पेयजल/ओआरएस केंद्र और खोया-पाया (Lost & Found) सहायता डेस्क सक्रिय हैं।\n• तत्काल व्हीलचेयर या बग्गी सहायता के लिए **सरस्वती घाट** या **पुष्कर घाट गेट 1** हेल्पडेस्क से संपर्क करें।`;
      } else {
        replyText = `Emergency & Medical Support Information:\n• **Pushkaralu Unified Helpline**: **1902** | Emergency Police: **112** | Ambulance: **108**.\n• All 8 riverfront ghats have active **24x7 Medical Camps**, ORS hydration points, NDRF river rescue boats, and Lost & Found desks.\n• For immediate electric wheelchair buggy escort, visit the Accessibility Desk at **Saraswati Ghat** or **Pushkar Ghat Gate 1**.`;
      }

      mapLinks.push({
        entityType: 'GHAT',
        entityId: 'ghat-saraswati',
        label: bestSeniorGhat.name,
        statusBadge: '24x7 Medical Camp & Buggy Unit',
        routeHref: `/safety`,
      });
    } else if (mentionedGhat) {
      const occupancyPct = Math.round(
        (mentionedGhat.currentOccupancyCount / mentionedGhat.maxCapacityCount) * 100
      );
      const linkedRoadsClosed = liveState.roads.filter(
        (r) => mentionedGhat.approachRoadIds.includes(r.id) && r.status === 'CLOSED'
      );

      if (language === 'te') {
        replyText = `**${mentionedGhat.name.te}** ప్రస్తుత సమాచారం:\n• రద్దీ స్థాయి: **${mentionedGhat.crowdLevel}** (${occupancyPct}% నిండింది — సుమారు **${mentionedGhat.estimatedBathingWaitMinutes} నిమిషాల** స్నాన నిరీక్షణ సమయం).\n• సౌకర్యాలు: వీల్‌చైర్ ర్యాంప్ (${mentionedGhat.wheelchairRampAvailable ? 'ఉంది' : 'లేదు'}), 24x7 వైద్య శిబిరం.\n${
          linkedRoadsClosed.length > 0
            ? `• **ముఖ్య గమనిక**: ${linkedRoadsClosed[0].name.te} ప్రస్తుతం ప్రైవేట్ వాహనాలకు మూసివేయబడింది. దయచేసి షటిల్ బస్సును ఉపయోగించండి.`
            : ''
        }\n${
          mentionedGhat.crowdLevel === 'HIGH' || mentionedGhat.crowdLevel === 'CRITICAL'
            ? `సూచన: తక్కువ రద్దీ కోసం మీరు **${calmestGhat.name.te}** (${calmestGhat.estimatedBathingWaitMinutes} ని. నిరీక్షణ) కూడా పరిశీలించవచ్చు.`
            : ''
        }`;
      } else if (language === 'hi') {
        replyText = `**${mentionedGhat.name.hi}** की वर्तमान स्थिति:\n• भीड़ स्तर: **${mentionedGhat.crowdLevel}** (${occupancyPct}% भरा — अनुमानित स्नान प्रतीक्षा समय **${mentionedGhat.estimatedBathingWaitMinutes} मिनट**)।\n• सुविधाएं: व्हीलचेयर रैंप (${mentionedGhat.wheelchairRampAvailable ? 'उपलब्ध' : 'अनुपलब्ध'}), 24x7 मेडिकल कैंप।\n${
          linkedRoadsClosed.length > 0
            ? `• **महत्वपूर्ण सूचना**: ${linkedRoadsClosed[0].name.hi} निजी वाहनों के लिए बंद है। कृपया शटल सेवा का उपयोग करें।`
            : ''
        }\n${
          mentionedGhat.crowdLevel === 'HIGH' || mentionedGhat.crowdLevel === 'CRITICAL'
            ? `सुझाव: कम भीड़ के लिए आप **${calmestGhat.name.hi}** (${calmestGhat.estimatedBathingWaitMinutes} मिनट प्रतीक्षा) भी चुन सकते हैं।`
            : ''
        }`;
      } else {
        replyText = `Current status for **${mentionedGhat.name.en}**:\n• Crowd Condition: **${mentionedGhat.crowdLevel}** (${occupancyPct}% capacity, ~**${mentionedGhat.estimatedBathingWaitMinutes} mins** estimated bathing wait).\n• Accessibility: Wheelchair ramp ${mentionedGhat.wheelchairRampAvailable ? 'available' : 'unavailable'}, 24x7 medical camp active.\n${
          linkedRoadsClosed.length > 0
            ? `• **Active Road Closure**: ${linkedRoadsClosed[0].name.en} is closed to private vehicles. Please use the linked shuttle service.`
            : ''
        }\n${
          mentionedGhat.crowdLevel === 'HIGH' || mentionedGhat.crowdLevel === 'CRITICAL'
            ? `Tip: For a calmer experience right now, consider **${calmestGhat.name.en}** (${calmestGhat.estimatedBathingWaitMinutes} mins wait).`
            : ''
        }`;
      }

      mapLinks.push(
        {
          entityType: 'GHAT',
          entityId: mentionedGhat.id,
          label: mentionedGhat.name,
          statusBadge: `${mentionedGhat.crowdLevel} • ${mentionedGhat.estimatedBathingWaitMinutes}m wait`,
          routeHref: `/journey-planner?destination=${mentionedGhat.id}`,
        },
        {
          entityType: 'GHAT',
          entityId: calmestGhat.id,
          label: calmestGhat.name,
          statusBadge: `Calmer Option • ${calmestGhat.estimatedBathingWaitMinutes}m wait`,
          routeHref: `/journey-planner?destination=${calmestGhat.id}`,
        }
      );
    } else {
      // General Crowd & Best Ghat Recommendation grounded in live state
      const targetRecommended = seniorModeActive ? bestSeniorGhat : calmestGhat;
      const busyOccupancy = Math.round(
        (busiestGhat.currentOccupancyCount / busiestGhat.maxCapacityCount) * 100
      );

      if (language === 'te') {
        replyText = `ప్రస్తుత గోదావరి ఘాట్ల రద్దీ విశ్లేషణ ప్రకారం:\n• **అత్యంత ప్రశాంతమైన ఘాట్లు**: **${targetRecommended.name.te}** (నిరీక్షణ సమయం **${targetRecommended.estimatedBathingWaitMinutes} నిమిషాలు**, రద్దీ: ${targetRecommended.crowdLevel}) మరియు **${secondCalmestGhat.name.te}** (**${secondCalmestGhat.estimatedBathingWaitMinutes} నిమిషాలు**).\n• **అధిక రద్దీ ఉన్న ఘాట్**: **${busiestGhat.name.te}** ప్రస్తుతం ${busyOccupancy}% నిండి ఉంది (${busiestGhat.estimatedBathingWaitMinutes} నిమిషాల నిరీక్షణ).\n• ఉత్తమ పార్కింగ్: **${topParking.name.te}** (${topParking.availableSpaces.toLocaleString()} ఖాళీలు).`;
      } else if (language === 'hi') {
        replyText = `वर्तमान गोदावरी घाट भीड़ विश्लेषण के अनुसार:\n• **सबसे शांत और सुगम घाट**: **${targetRecommended.name.hi}** (प्रतीक्षा समय **${targetRecommended.estimatedBathingWaitMinutes} मिनट**, भीड़: ${targetRecommended.crowdLevel}) और **${secondCalmestGhat.name.hi}** (**${secondCalmestGhat.estimatedBathingWaitMinutes} मिनट**)।\n• **अधिक भीड़ वाला घाट**: **${busiestGhat.name.hi}** वर्तमान में ${busyOccupancy}% भरा है (${busiestGhat.estimatedBathingWaitMinutes} मिनट प्रतीक्षा)।\n• अनुशंसित पार्किंग: **${topParking.name.hi}** (${topParking.availableSpaces.toLocaleString()} स्थान खाली)।`;
      } else {
        replyText = `Based on current Godavari riverfront conditions:\n• **Best Recommended Ghats Right Now**: **${targetRecommended.name.en}** (**${targetRecommended.estimatedBathingWaitMinutes} mins** wait, ${targetRecommended.crowdLevel} crowd) and **${secondCalmestGhat.name.en}** (**${secondCalmestGhat.estimatedBathingWaitMinutes} mins** wait).\n• **Highest Crowd Density**: **${busiestGhat.name.en}** is currently at ${busyOccupancy}% capacity (~${busiestGhat.estimatedBathingWaitMinutes} mins wait).\n• **Best Satellite Parking**: **${topParking.name.en}** (${topParking.availableSpaces.toLocaleString()} spaces open).`;
      }

      mapLinks.push(
        {
          entityType: 'GHAT',
          entityId: targetRecommended.id,
          label: targetRecommended.name,
          statusBadge: `${targetRecommended.crowdLevel} • ${targetRecommended.estimatedBathingWaitMinutes}m wait`,
          routeHref: `/journey-planner?destination=${targetRecommended.id}`,
        },
        {
          entityType: 'GHAT',
          entityId: secondCalmestGhat.id,
          label: secondCalmestGhat.name,
          statusBadge: `${secondCalmestGhat.crowdLevel} • ${secondCalmestGhat.estimatedBathingWaitMinutes}m wait`,
          routeHref: `/journey-planner?destination=${secondCalmestGhat.id}`,
        },
        {
          entityType: 'PARKING',
          entityId: topParking.id,
          label: topParking.name,
          statusBadge: `${topParking.availableSpaces} spaces free`,
          routeHref: `/parking?hub=${topParking.id}`,
        }
      );
    }

    const followUpsByLang: Record<SupportedLanguage, string[]> = {
      en: [
        'Which ghat has the shortest wait time right now?',
        'Best ghat and shuttle for senior citizens with wheelchair?',
        'Where should I park if arriving from NH-16 or Vijayawada?',
        'Are any roads or bridges closed in Rajamahendravaram?',
      ],
      te: [
        'ప్రస్తుతం ఏ ఘాట్‌లో రద్దీ తక్కువగా ఉంది?',
        'వృద్ధులు మరియు వీల్‌చైర్ ఉన్నవారికి ఏ ఘాట్, షటిల్ ఉత్తమం?',
        'NH-16 లేదా విజయవాడ వైపు నుండి వస్తే ఎక్కడ పార్క్ చేయాలి?',
        'రాజమహేంద్రవరంలో ఏవైనా రోడ్లు మూసివేయబడ్డాయా?',
      ],
      hi: [
        'अभी किस घाट पर प्रतीक्षा समय सबसे कम है?',
        'वरिष्ठ नागरिकों और व्हीलचेयर के लिए सबसे अच्छा घाट और शटल कौन सा है?',
        'NH-16 या विजयवाड़ा की ओर से आने पर कार कहाँ पार्क करें?',
        'क्या राजमहेंद्रवरम में कोई सड़क या पुल बंद है?',
      ],
    };

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      replyText,
      language,
      intentDetected: intent,
      mapLinks,
      suggestedFollowUps: followUpsByLang[language],
      provenanceSource: 'LOCAL_DOMAIN_AI',
      generatedAt: new Date().toISOString(),
    };
  }

  public generateSituationSummary(
    liveState: CanonicalMobilityState,
    language: SupportedLanguage
  ): string {
    const activeIncidents = liveState.incidents.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
    );
    const closedRoads = liveState.roads.filter((r) => r.status === 'CLOSED');
    const avgCongestion = Math.round(
      liveState.roads.reduce((acc, r) => acc + r.congestionIndex, 0) / liveState.roads.length
    );
    const totalPilgrimsAtGhats = liveState.ghats.reduce(
      (acc, g) => acc + g.currentOccupancyCount,
      0
    );
    const busiestGhat = [...liveState.ghats].sort(
      (a, b) => b.currentOccupancyCount / b.maxCapacityCount - a.currentOccupancyCount / a.maxCapacityCount
    )[0];
    const pendingRecs = liveState.aiRecommendations.filter(
      (r) => r.decisionStatus === 'PENDING_REVIEW'
    );

    if (language === 'te') {
      return `ప్రస్తుత కారిడార్ విశ్లేషణ (రివిజన్ #${liveState.metadata.stateRevision}): 8 ఘాట్లలో మొత్తం ${totalPilgrimsAtGhats.toLocaleString()} మంది భక్తులు ఉన్నారు. సగటు ట్రాఫిక్ రద్దీ సూచీ ${avgCongestion}/100. ${busiestGhat.name.te} వద్ద అత్యధిక రద్దీ (${busiestGhat.estimatedBathingWaitMinutes} ని. నిరీక్షణ) నమోదైంది. ${closedRoads.length} రోడ్లు మూసివేయబడ్డాయి, ${activeIncidents.length} చురుకైన సంఘటనలు మరియు ${pendingRecs.length} AI సిఫార్సులు అధికారుల సమీక్ష కోసం వేచి ఉన్నాయి.`;
    }
    if (language === 'hi') {
      return `वर्तमान कॉरिडोर सारांश (रिवीजन #${liveState.metadata.stateRevision}): सभी 8 घाटों पर कुल ${totalPilgrimsAtGhats.toLocaleString()} श्रद्धालु उपस्थित हैं। औसत यातायात भीड़ सूचकांक ${avgCongestion}/100 है। ${busiestGhat.name.hi} पर सर्वाधिक भीड़ (${busiestGhat.estimatedBathingWaitMinutes} मिनट प्रतीक्षा) है। वर्तमान में ${closedRoads.length} सड़कें बंद हैं, ${activeIncidents.length} सक्रिय घटनाएँ और ${pendingRecs.length} AI सिफारिशें समीक्षा हेतु लंबित हैं।`;
    }

    return `Corridor Intelligence Summary (Rev #${liveState.metadata.stateRevision}): ${totalPilgrimsAtGhats.toLocaleString()} pilgrims monitored across 8 ghats with an average corridor congestion index of ${avgCongestion}/100. Peak density is concentrated at ${busiestGhat.name.en} (${busiestGhat.estimatedBathingWaitMinutes}m wait). ${closedRoads.length} road segment(s) currently closed to private traffic, ${activeIncidents.length} active incident(s) in progress, and ${pendingRecs.length} AI operational recommendation(s) awaiting authority decision.`;
  }
}

export const defaultAIService = new LocalDomainAIEngine();

