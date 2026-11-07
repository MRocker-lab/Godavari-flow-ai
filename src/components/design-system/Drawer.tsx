import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  portal?: 'pilgrim' | 'command';
  side?: 'right' | 'bottom';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  portal = 'pilgrim',
  side = 'right',
  children,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const surfaceClass =
    portal === 'command'
      ? 'bg-[#0F172A] border-slate-700 text-slate-100'
      : 'bg-white border-[#E5DFD5] text-[#0F172A]';

  const positionClass =
    side === 'bottom'
      ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t'
      : 'inset-y-0 right-0 w-full max-w-md border-l';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`fixed ${positionClass} ${surfaceClass} shadow-2xl flex flex-col overflow-hidden`}
      >
        <div
          className={`flex items-start justify-between gap-4 px-5 py-4 border-b ${
            portal === 'command' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            {subtitle && (
              <p
                className={`text-xs mt-0.5 ${
                  portal === 'command' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className={`p-2 rounded-lg ${
              portal === 'command'
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

