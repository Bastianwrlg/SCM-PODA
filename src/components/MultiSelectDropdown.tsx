import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface MultiSelectDropdownProps<T extends string | number> {
  label: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  renderLabel?: (option: T) => string;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'slate';
  enableSearch?: boolean;
}

export function MultiSelectDropdown<T extends string | number>({
  label,
  options,
  selected,
  onChange,
  placeholder,
  renderLabel = (opt) => String(opt),
  colorScheme = 'indigo',
  enableSearch = false
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = enableSearch || options.length > 6
    ? options.filter((opt) =>
        renderLabel(opt).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const toggleOption = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectAll = () => {
    onChange([...options]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const badgeColorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const activeColorMap = {
    indigo: 'bg-indigo-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-600 text-white',
    cyan: 'bg-cyan-600 text-white',
    slate: 'bg-slate-900 text-white'
  };

  const isAllSelected = options.length > 0 && selected.length === options.length;
  const isNoneSelected = selected.length === 0;

  return (
    <div className="relative inline-block w-full text-left" ref={containerRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer bg-white ${
          selected.length > 0
            ? 'border-indigo-300 ring-2 ring-indigo-50 text-slate-900 shadow-xs'
            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {isNoneSelected ? (
            <span className="text-slate-500 truncate">
              {placeholder || `Semua ${label}`}
            </span>
          ) : selected.length === 1 ? (
            <span className="font-semibold text-slate-900 truncate">
              {renderLabel(selected[0])}
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">
                {selected.length} {label}
              </span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold border ${badgeColorMap[colorScheme]}`}>
                {selected.length} dipilih
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selected.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 rounded hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              title="Hapus pilihan"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[200px] max-w-[280px] bg-white rounded-xl shadow-xl border border-slate-200 p-2 space-y-1.5 animate-in fade-in duration-100">
          {/* Search box if needed */}
          {(enableSearch || options.length > 6) && (
            <div className="relative mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Cari ${label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                autoFocus
              />
            </div>
          )}

          {/* Action Header: Select All & Reset */}
          <div className="flex items-center justify-between px-1 py-1 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
            >
              Pilih Semua ({options.length})
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-rose-600 cursor-pointer hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Options Checklist */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">
                Tidak ada opsi cocok
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option);
                return (
                  <button
                    type="button"
                    key={String(option)}
                    onClick={() => toggleOption(option)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-50/80 text-indigo-950 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? `${activeColorMap[colorScheme]} border-transparent`
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{renderLabel(option)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
