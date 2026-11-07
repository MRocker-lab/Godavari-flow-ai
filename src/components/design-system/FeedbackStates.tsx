import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Inbox,
  Radio,
  X,
} from 'lucide-react';
import { Button } from './Button';
import { useMobilityStore } from '@/store/useMobilityStore';
import { useTranslation } from '@/i18n/useTranslation';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  portal?: 'pilgrim' | 'command';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  portal = 'pilgrim',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed ${
        portal === 'command'
          ? 'bg-slate-900/50 border-slate-700 text-slate-300'
          : 'bg-[#FAF8F5] border-slate-300 text-slate-700'
      }`}
    >
      <Inbox className="w-10 h-10 mb-3 opacity-60" aria-hidden="true" />
      <h4 className="text-base font-bold">{title}</h4>
      <p className="text-sm mt-1 max-w-md opacity-80">{description}</p>
      {actionLabel && onAction && (
        <Button
          portal={portal}
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const LoadingSkeleton: React.FC<{
  lines?: number;
  portal?: 'pilgrim' | 'command';
}> = ({ lines = 3, portal = 'pilgrim' }) => {
  const barStyle =
    portal === 'command' ? 'bg-slate-800' : 'bg-slate-200';
  return (
    <div className="space-y-2.5 animate-pulse" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className={`h-4 rounded-lg ${barStyle} ${
            idx === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const ErrorState: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
  portal?: 'pilgrim' | 'command';
}> = ({ title, message, onRetry, portal = 'pilgrim' }) => {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 p-4 rounded-xl border ${
        portal === 'command'
          ? 'bg-red-950/60 border-red-500/40 text-red-200'
          : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-bold">{title}</h4>
        <p className="text-xs mt-1">{message}</p>
        {onRetry && (
          <Button
            portal={portal}
            variant="danger"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Live Cross-Tab Synchronization Banner that appears when another browser tab
 * (e.g., Authority Command Centre) updates the canonical state.
 */
export const CrossTabSyncBanner: React.FC<{ portal?: 'pilgrim' | 'command' }> = ({
  portal = 'pilgrim',
}) => {
  const notification = useMobilityStore((s) => s.lastSyncNotification);
  const dismiss = useMobilityStore((s) => s.dismissSyncNotification);
  const revision = useMobilityStore((s) => s.state.metadata.stateRevision);
  const { t, language } = useTranslation();

  if (!notification) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 sm:bottom-5 right-4 z-40 max-w-md flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border transition-all ${
        portal === 'command'
          ? 'bg-slate-900/95 border-cyan-500/50 text-cyan-100'
          : 'bg-[#0F172A] border-teal-500/50 text-white'
      }`}
    >
      <Radio className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 animate-pulse" />
      <div className="text-xs flex-1">
        <div className="font-bold flex items-center gap-2">
          <span>
            {language === 'te'
              ? 'లైవ్ క్రాస్-ట్యాబ్ సింక్ అప్‌డేట్'
              : language === 'hi'
              ? 'लाइव क्रॉस-टैब सिंक अपडेट'
              : 'Cross-Tab State Synchronized'}
          </span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10">
            Rev #{revision}
          </span>
        </div>
        <p className="mt-0.5 opacity-90">{t(notification)}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded hover:bg-white/10 text-slate-300"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ConfirmationBanner: React.FC<{
  message: string;
  portal?: 'pilgrim' | 'command';
}> = ({ message, portal = 'pilgrim' }) => (
  <div
    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium ${
      portal === 'command'
        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
    }`}
  >
    <CheckCircle2 className="w-4 h-4 shrink-0" />
    <span>{message}</span>
  </div>
);

