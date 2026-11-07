import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  portal?: 'pilgrim' | 'command';
  className?: string;
  ariaLabel?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  portal = 'pilgrim',
  className = '',
  ariaLabel,
}) => {
  const inputStyles =
    portal === 'command'
      ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20'
      : 'bg-white border-[#E5DFD5] text-[#0F172A] placeholder:text-slate-400 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]/20';

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className={`w-4 h-4 absolute left-3.5 pointer-events-none ${
          portal === 'command' ? 'text-slate-400' : 'text-slate-500'
        }`}
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        className={`w-full min-h-[44px] pl-10 pr-9 py-2 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 ${inputStyles}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className={`absolute right-2.5 p-1 rounded-md ${
            portal === 'command'
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-400 hover:text-slate-800'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  portal?: 'pilgrim' | 'command';
  className?: string;
  id?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  portal = 'pilgrim',
  className = '',
  id,
}) => {
  const selectStyles =
    portal === 'command'
      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-cyan-400'
      : 'bg-white border-[#E5DFD5] text-[#0F172A] focus:border-[#1E3A8A]';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-xs font-semibold ${
            portal === 'command' ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-[44px] px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 ${selectStyles}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  portal?: 'pilgrim' | 'command';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  portal = 'pilgrim',
}) => {
  const trackStyle = checked
    ? portal === 'command'
      ? 'bg-cyan-500'
      : 'bg-[#1E3A8A]'
    : portal === 'command'
    ? 'bg-slate-700'
    : 'bg-slate-300';

  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none py-1">
      <div>
        <div
          className={`text-sm font-semibold ${
            portal === 'command' ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          {label}
        </div>
        {description && (
          <div
            className={`text-xs mt-0.5 ${
              portal === 'command' ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${trackStyle}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-150 mt-0.5 ${
            checked ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
};

export interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  portal?: 'pilgrim' | 'command';
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 5,
  unit = '%',
  onChange,
  portal = 'command',
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className={portal === 'command' ? 'text-slate-200' : 'text-slate-800'}>
          {label}
        </span>
        <span
          className={`font-mono px-2 py-0.5 rounded ${
            portal === 'command'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
              : 'bg-blue-50 text-blue-900'
          }`}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500 cursor-pointer h-2 rounded-lg"
      />
      <div
        className={`flex justify-between text-[11px] font-mono ${
          portal === 'command' ? 'text-slate-500' : 'text-slate-500'
        }`}
      >
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
};

