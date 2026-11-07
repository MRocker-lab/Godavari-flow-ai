import { CanonicalMobilityState } from '@/data/baselineState';
import {
  DigitalTwinSimulationResult,
  GhatSimulationDelta,
  OperationalLevel,
  SimulationControls,
} from '@/types';

function levelFromPercent(pct: number): OperationalLevel {
  if (pct >= 88) return 'CRITICAL';
  if (pct >= 72) return 'HIGH';
  if (pct >= 45) return 'MODERATE';
  return 'LOW';
}

export function runDigitalTwinSimulation(
  scenarioId: string,
  controls: SimulationControls,
  state: CanonicalMobilityState
): DigitalTwinSimulationResult {
  const inflowRatio = controls.pilgrimInflowMultiplierPercent / 100;
  const shuttleReliefFactor = 1 - (controls.shuttleFrequencyBoostPercent / 100) * 0.28;
  const parkingDiversionRelief = (controls.parkingDiversionToSatellitePercent / 100) * 18;
  const approachClosureRelief = controls.closePushkarApproachRoad ? 14 : 0;
  const bridgeRestrictionRelief = controls.closeOldBridgeToPrivateVehicles ? 9 : 0;

  const avgRoadCongestionBaseline = Math.round(
    state.roads.reduce((sum, r) => sum + r.congestionIndex, 0) / state.roads.length
  );

  const rawCongestionWithoutIntervention = Math.min(
    98,
    Math.round(avgRoadCongestionBaseline * inflowRatio)
  );

  const simulatedCongestion = Math.max(
    24,
    Math.min(
      95,
      Math.round(
        rawCongestionWithoutIntervention * shuttleReliefFactor -
          parkingDiversionRelief * 0.65 -
          approachClosureRelief * 0.5 -
          bridgeRestrictionRelief * 0.4
      )
    )
  );

  const ghatComparisons: GhatSimulationDelta[] = state.ghats.map((ghat) => {
    const baseCrowdPct = Math.round(
      (ghat.currentOccupancyCount / ghat.maxCapacityCount) * 100
    );
    const surgedBaselinePct = Math.min(99, Math.round(baseCrowdPct * inflowRatio));
    const surgedBaselineWait = Math.round(ghat.estimatedBathingWaitMinutes * inflowRatio);

    let ghatReliefPct = (controls.shuttleFrequencyBoostPercent / 100) * 12;
    if (ghat.id === 'ghat-pushkar' && controls.closePushkarApproachRoad) {
      ghatReliefPct += 18;
    } else if (
      (ghat.id === 'ghat-saraswati' || ghat.id === 'ghat-gautami') &&
      controls.closePushkarApproachRoad
    ) {
      // Absorb diverted pilgrims safely within spare capacity
      ghatReliefPct -= 6;
    }

    if (ghat.id === 'ghat-kovvur-gospada' && controls.closeOldBridgeToPrivateVehicles) {
      ghatReliefPct += 8;
    }

    const simulatedCrowdPercent = Math.max(
      22,
      Math.min(96, Math.round(surgedBaselinePct - ghatReliefPct))
    );
    const simulatedWaitMinutes = Math.max(
      6,
      Math.round(surgedBaselineWait * (simulatedCrowdPercent / Math.max(1, surgedBaselinePct)))
    );

    return {
      ghatId: ghat.id,
      ghatName: ghat.name,
      baselineCrowdPercent: surgedBaselinePct,
      simulatedCrowdPercent,
      baselineWaitMinutes: surgedBaselineWait,
      simulatedWaitMinutes,
      baselineLevel: levelFromPercent(surgedBaselinePct),
      simulatedLevel: levelFromPercent(simulatedCrowdPercent),
    };
  });

  const avgWaitBaseline = Math.round(
    ghatComparisons.reduce((s, g) => s + g.baselineWaitMinutes, 0) / ghatComparisons.length
  );
  const avgWaitSimulated = Math.round(
    ghatComparisons.reduce((s, g) => s + g.simulatedWaitMinutes, 0) / ghatComparisons.length
  );

  const parkingSaturationBaselinePercent = Math.min(
    98,
    Math.round(78 * inflowRatio)
  );
  const parkingSaturationSimulatedPercent = Math.max(
    38,
    Math.round(
      parkingSaturationBaselinePercent - (controls.parkingDiversionToSatellitePercent / 100) * 28
    )
  );

  const shuttleWaitBaselineMinutes = Math.max(4, Math.round(9 * inflowRatio));
  const shuttleWaitSimulatedMinutes = Math.max(
    2,
    Math.round(
      shuttleWaitBaselineMinutes * (1 - (controls.shuttleFrequencyBoostPercent / 100) * 0.55)
    )
  );

  const emergencyCorridorClearanceScore = Math.min(
    99,
    Math.max(
      55,
      Math.round(
        72 +
          (controls.closePushkarApproachRoad ? 11 : 0) +
          (controls.enableDedicatedSeniorShuttleCorridor ? 8 : 0) +
          (controls.parkingDiversionToSatellitePercent / 100) * 8
      )
    )
  );

  const hours = ['06:00', '07:30', '09:00', '10:30', '12:00', '13:30'];
  const waveFactors = [0.78, 0.92, 1.08, 1.02, 0.88, 0.76];

  const hourlyProjectionSeries = hours.map((hourLabel, idx) => {
    const wf = waveFactors[idx];
    return {
      hourLabel,
      baselineCongestion: Math.min(99, Math.round(rawCongestionWithoutIntervention * wf)),
      interventionCongestion: Math.min(95, Math.round(simulatedCongestion * wf)),
      baselineCrowdLoad: Math.min(
        99,
        Math.round(ghatComparisons[0].baselineCrowdPercent * wf)
      ),
      interventionCrowdLoad: Math.min(
        95,
        Math.round(ghatComparisons[0].simulatedCrowdPercent * wf)
      ),
    };
  });

  return {
    scenarioId,
    controls,
    overallCongestionIndexBaseline: rawCongestionWithoutIntervention,
    overallCongestionIndexSimulated: simulatedCongestion,
    avgBathingWaitBaselineMinutes: avgWaitBaseline,
    avgBathingWaitSimulatedMinutes: avgWaitSimulated,
    parkingSaturationBaselinePercent,
    parkingSaturationSimulatedPercent,
    shuttleWaitBaselineMinutes,
    shuttleWaitSimulatedMinutes,
    emergencyCorridorClearanceScore,
    ghatComparisons,
    hourlyProjectionSeries,
    predictedConsequences: [
      {
        en: `Corridor congestion drops from ${rawCongestionWithoutIntervention}/100 to ${simulatedCongestion}/100 (${rawCongestionWithoutIntervention - simulatedCongestion} pt improvement).`,
        te: `కారిడార్ ట్రాఫిక్ రద్దీ ${rawCongestionWithoutIntervention}/100 నుండి ${simulatedCongestion}/100 కి తగ్గుతుంది (${rawCongestionWithoutIntervention - simulatedCongestion} పాయింట్ల మెరుగుదల).`,
        hi: `कॉरिडोर भीड़ सूचकांक ${rawCongestionWithoutIntervention}/100 से घटकर ${simulatedCongestion}/100 हो जाता है (${rawCongestionWithoutIntervention - simulatedCongestion} अंक सुधार)।`,
      },
      {
        en: `Average bathing queue wait across 8 ghats reduces from ${avgWaitBaseline} mins to ${avgWaitSimulated} mins.`,
        te: `8 ఘాట్లలో సగటు స్నాన నిరీక్షణ సమయం ${avgWaitBaseline} నిమిషాల నుండి ${avgWaitSimulated} నిమిషాలకు తగ్గుతుంది.`,
        hi: `सभी 8 घाटों पर औसत स्नान प्रतीक्षा समय ${avgWaitBaseline} मिनट से घटकर ${avgWaitSimulated} मिनट हो जाता है।`,
      },
      {
        en: `Emergency & ambulance corridor clearance score reaches ${emergencyCorridorClearanceScore}% across Stadium Road & J.N. Road.`,
        te: `స్టేడియం రోడ్ & జె.ఎన్. రోడ్ వెంబడి అత్యవసర అంబులెన్స్ మార్గం క్లియరెన్స్ స్కోరు ${emergencyCorridorClearanceScore}% కి చేరుకుంటుంది.`,
        hi: `स्टेडियम रोड और जे.एन. रोड पर आपातकालीन एम्बुलेंस कॉरिडोर निकासी स्कोर ${emergencyCorridorClearanceScore}% तक पहुँचता है।`,
      },
    ],
    whyChangedExplanation: {
      en: `At ${controls.pilgrimInflowMultiplierPercent}% pilgrim inflow, intercepting ${controls.parkingDiversionToSatellitePercent}% of highway vehicles at NH-16 satellite hubs and boosting APSRTC shuttle frequency by +${controls.shuttleFrequencyBoostPercent}% prevents inner-city gridlock while redistributing crowd load from Pushkar Ghat to Saraswati and Gautami Ghats.`,
      te: `${controls.pilgrimInflowMultiplierPercent}% భక్తుల ప్రవాహం ఉన్నప్పుడు, NH-16 శాటిలైట్ హబ్‌ల వద్ద ${controls.parkingDiversionToSatellitePercent}% వాహనాలను నిలిపివేసి, ఆర్టీసీ షటిల్ బస్సులను +${controls.shuttleFrequencyBoostPercent}% పెంచడం ద్వారా పుష్కర ఘాట్ నుండి సరస్వతి మరియు గౌతమి ఘాట్లకు రద్దీ సమతుల్యమవుతుంది.`,
      hi: `${controls.pilgrimInflowMultiplierPercent}% तीर्थयात्री प्रवाह पर, NH-16 सैटेलाइट हब पर ${controls.parkingDiversionToSatellitePercent}% वाहनों को रोकने और शटल आवृत्ति को +${controls.shuttleFrequencyBoostPercent}% बढ़ाने से आंतरिक शहर का जाम रुकता है और भीड़ संतुलित होती है।`,
    },
  };
}

