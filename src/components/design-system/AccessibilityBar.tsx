import React from 'react';
import { Eye, Globe, PersonStanding } from 'lucide-react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { SupportedLanguage } from '@/types';
import { useTranslation } from '@/i18n/useTranslation';
import { ResetBaselineTrigger } from './Dialog';

export interface AccessibilityBarProps {
  portal?: 'pilgrim' | 'command';
  showResetButton?: boolean;
}

const LANGUAGE_OPTIONS: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
];

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  portal = 'pilgrim',
  showResetButton = true,
}) => {
  const { language, setLanguage, ui } = useTranslation();
  const seniorCitizenMode = useAccessibilityStore((s) => s.seniorCitizenMode);
  const toggleSeniorCitizenMode = useAccessibilityStore(
    (s) => s.toggleSeniorCitizenMode
  );
  const highContrastMode = useAccessibilityStore((s) => s.highContrastMode);
  const toggleHighContrastMode = useAccessibilityStore(
    (s) => s.toggleHighContrastMode
  );

  const pillGroupClass =
    portal === 'command'
      ? 'bg-slate-900 border-slate-700 text-slate-200'
      : 'bg-[#F3EFEA] border-[#E5DFD5] text-[#0F172A]';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Prominent Trilingual Language Selector (EN / తెలుగు / हिन्दी) */}
      <div
        role="group"
        aria-label="Select Language"
        className={`inline-flex items-center p-0.5 rounded-xl border ${pillGroupClass}`}
      >
        <Globe
          className={`w-3.5 h-3.5 ml-2 mr-1 shrink-0 ${
            portal === 'command' ? 'text-cyan-400' : 'text-[#1E3A8A]'
          }`}
          aria-hidden="true"
        />
        {LANGUAGE_OPTIONS.map((opt) => {
          const isActive = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              aria-pressed={isActive}
              className={`min-h-[34px] px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? portal === 'command'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'bg-[#1E3A8A] text-white shadow-xs'
                  : portal === 'command'
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              {opt.native}
            </button>
          );
        })}
      </div>

      {/* Senior Citizen Mode Toggle */}
      <button
        type="button"
        onClick={toggleSeniorCitizenMode}
        aria-pressed={seniorCitizenMode}
        className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all ${
          seniorCitizenMode
            ? portal === 'command'
              ? 'bg-amber-500 text-slate-950 border-amber-400'
              : 'bg-[#D97706] text-white border-[#B45309]'
            : pillGroupClass
        }`}
        title="Enlarge text and prioritize ramps, buggies, and low-crowd ghats"
      >
        <PersonStanding className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{ui('seniorCitizenMode')}</span>
      </button>

      {/* High Contrast Mode Toggle */}
      <button
        type="button"
        onClick={toggleHighContrastMode}
        aria-pressed={highContrastMode}
        className={`min-h-[36px] hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
          highContrastMode
            ? portal === 'command'
              ? 'bg-white text-slate-950 border-white'
              : 'bg-slate-950 text-white border-slate-950'
            : pillGroupClass
        }`}
        title={ui('highContrast')}
      >
        <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden xl:inline">{ui('highContrast')}</span>
      </button>

      {showResetButton && <ResetBaselineTrigger portal={portal} compact />}
    </div>
  );
};

