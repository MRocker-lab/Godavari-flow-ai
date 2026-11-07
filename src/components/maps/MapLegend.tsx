import React from 'react';
import {
  AlertTriangle,
  Ambulance,
  Ban,
  Bus,
  CheckCircle2,
  Compass,
  ParkingSquare,
} from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export interface MapLegendProps {
  portal: 'pilgrim' | 'command';
  closedRoadCount: number;
  activeIncidentCount: number;
}

/**
 * Accessible Map Legend that pairs shape, line pattern, icon, and text label
 * (never relying on color alone).
 */
export const MapLegend: React.FC<MapLegendProps> = ({
  portal,
  closedRoadCount,
  activeIncidentCount,
}) => {
  const { language } = useTranslation();

  const containerStyle =
    portal === 'command'
      ? 'bg-[#0F172A]/95 border-slate-800 text-slate-300'
      : 'bg-white/95 border-[#E5DFD5] text-slate-700';

  return (
    <div
      data-testid="map-legend"
      className={`rounded-2xl border px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-3 ${containerStyle}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="font-bold uppercase tracking-wider opacity-75">
          {language === 'te'
            ? 'మ్యాప్ సూచిక (లెజెండ్):'
            : language === 'hi'
            ? 'मानचित्र संकेत (लेजेंड):'
            : 'Map Legend:'}
        </span>

        {/* Ghat Crowd Levels */}
        <div className="inline-flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-teal-500" aria-hidden="true" />
          <span className="font-semibold">
            {language === 'te'
              ? 'ఘాట్లు (8)'
              : language === 'hi'
              ? 'घाट (8)'
              : 'Ghats (8)'}
          </span>
        </div>

        {/* Traffic / Road Status */}
        <div className="inline-flex items-center gap-1.5">
          <span
            className="w-5 h-1 rounded bg-emerald-500 inline-block"
            aria-hidden="true"
          />
          <CheckCircle2 className="w-3 h-3 text-emerald-500" aria-hidden="true" />
          <span>
            {language === 'te'
              ? 'సాధారణ రోడ్డు'
              : language === 'hi'
              ? 'खुला मार्ग'
              : 'Open Corridor'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <span
            className="w-5 h-1 rounded bg-amber-500 inline-block"
            aria-hidden="true"
          />
          <span>
            {language === 'te'
              ? 'అధిక ట్రాఫిక్'
              : language === 'hi'
              ? 'भीड़भाड़'
              : 'Congested'}
          </span>
        </div>

        {/* Road Closure Overlay */}
        <div className="inline-flex items-center gap-1.5">
          <span
            className="w-5 h-0.5 border-b-2 border-dashed border-red-500 inline-block"
            aria-hidden="true"
          />
          <Ban className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
          <span className="font-semibold">
            {language === 'te'
              ? `మూసివేత (${closedRoadCount})`
              : language === 'hi'
              ? `सड़क बंद (${closedRoadCount})`
              : `Road Closed (${closedRoadCount})`}
          </span>
        </div>

        {/* Emergency Route */}
        <div className="inline-flex items-center gap-1.5">
          <Ambulance className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
          <span>
            {language === 'te'
              ? 'గ్రీన్ అంబులెన్స్ కారిడార్'
              : language === 'hi'
              ? 'ग्रीन एम्बुलेंस मार्ग'
              : 'Emergency Route'}
          </span>
        </div>

        {/* Parking & Shuttles */}
        <div className="inline-flex items-center gap-1.5">
          <ParkingSquare className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
          <span>
            {language === 'te' ? 'పార్కింగ్ (8)' : language === 'hi' ? 'पार्किंग (8)' : 'Parking (8)'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />
          <span>
            {language === 'te' ? 'షటిల్ (6)' : language === 'hi' ? 'शटल (6)' : 'Shuttles (6)'}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
          <span>
            {language === 'te'
              ? `సంఘటనలు (${activeIncidentCount})`
              : language === 'hi'
              ? `सक्रिय घटनाएँ (${activeIncidentCount})`
              : `Active Incidents (${activeIncidentCount})`}
          </span>
        </div>
      </div>
    </div>
  );
};
