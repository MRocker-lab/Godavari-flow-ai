import React, { useEffect } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  portal?: 'pilgrim' | 'command';
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  portal = 'pilgrim',
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panelClasses =
    portal === 'command'
      ? 'bg-[#0F172A] border border-slate-700 text-slate-100'
      : 'bg-white border border-[#E5DFD5] text-[#0F172A]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${panelClasses}`}
      >
        <div
          className={`flex items-start justify-between gap-4 px-6 py-4 border-b ${
            portal === 'command' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div>
            <h2 id="dialog-title" className="text-lg font-bold">
              {title}
            </h2>
            {description && (
              <p
                className={`mt-1 text-sm ${
                  portal === 'command' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-2 rounded-lg transition-colors ${
              portal === 'command'
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children && <div className="px-6 py-5">{children}</div>}

        {footer && (
          <div
            className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
              portal === 'command'
                ? 'border-slate-800 bg-slate-900/60'
                : 'border-slate-100 bg-slate-50'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export interface ResetBaselineDialogProps {
  portal?: 'pilgrim' | 'command';
  compact?: boolean;
}

export const ResetBaselineTrigger: React.FC<ResetBaselineDialogProps> = ({
  portal = 'pilgrim',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const resetDemoDataToBaseline = useMobilityStore((s) => s.resetDemoDataToBaseline);
  const revision = useMobilityStore((s) => s.state.metadata.stateRevision);
  const { language, ui } = useTranslation();

  const handleConfirmReset = () => {
    resetDemoDataToBaseline();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        portal={portal}
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        title={ui('resetBaselineBtn')}
      >
        {compact
          ? language === 'te'
            ? 'రీసెట్'
            : language === 'hi'
            ? 'रीसेट'
            : 'Reset Demo'
          : ui('resetBaselineBtn')}
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        portal={portal}
        title={
          language === 'te'
            ? 'డెమో డేటాను ప్రాథమిక స్థితికి రీసెట్ చేయాలా?'
            : language === 'hi'
            ? 'क्या डेमो डेटा को बेसलाइन स्थिति में रीसेट करें?'
            : 'Reset Demo Data to Canonical Baseline?'
        }
        description={
          language === 'te'
            ? 'ఈ చర్య కమాండ్ సెంటర్ మరియు భక్తుల పోర్టల్‌లో చేసిన అన్ని మార్పులను (రోడ్డు మూసివేతలు, పార్కింగ్, షటిల్, సంఘటనలు) ప్రారంభ స్థితికి మారుస్తుంది.'
            : language === 'hi'
            ? 'यह क्रिया कमांड सेंटर और तीर्थयात्री पोर्टल में किए गए सभी परिवर्तनों (सड़क बंद, पार्किंग, शटल, घटनाएँ) को प्रारंभिक बेसलाइन पर रीसेट कर देगी।'
            : 'This will restore all ghat crowd levels, road closures, parking capacities, shuttle schedules, incidents, and AI recommendations across all open browser tabs to the initial Rajamahendravaram–Kovvur baseline.'
        }
        footer={
          <>
            <Button portal={portal} variant="ghost" onClick={() => setIsOpen(false)}>
              {language === 'te' ? 'రద్దు చేయండి' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </Button>
            <Button
              portal={portal}
              variant="danger"
              onClick={handleConfirmReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {language === 'te'
                ? 'అవును, బేస్‌లైన్‌కు రీసెట్ చేయండి'
                : language === 'hi'
                ? 'हाँ, बेसलाइन पर रीसेट करें'
                : 'Confirm Baseline Reset'}
            </Button>
          </>
        }
      >
        <div
          className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs ${
            portal === 'command'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {language === 'te'
                ? `ప్రస్తుత స్టేట్ రివిజన్: #${revision}`
                : language === 'hi'
                ? `वर्तमान स्टेट रिवीजन: #${revision}`
                : `Current State Revision: #${revision}`}
            </p>
            <p className="mt-1 opacity-90">
              {language === 'te'
                ? 'తెరిచి ఉన్న అన్ని బ్రౌజర్ విండోలు/ట్యాబ్‌లు తక్షణమే సింక్రొనైజ్ చేయబడతాయి.'
                : language === 'hi'
                ? 'सभी खुले ब्राउज़र विंडो और टैब तुरंत सिंक्रनाइज़ हो जाएंगे।'
                : 'All open Pilgrim Portal and Authority Command Centre browser windows will synchronize immediately via BroadcastChannel.'}
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

