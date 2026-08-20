import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Database, Search, CheckCircle2, SlidersHorizontal, Info } from 'lucide-react';
import { GOOGLE_SHEET_URL } from '../data/dataService';
import { FilterState } from '../types';
import { PodaLogo } from './PodaLogo';

interface NavbarProps {
  totalRecords: number;
  filteredRecords: number;
  isSyncing: boolean;
  onSync: () => void;
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  lastSynced: Date | null;
  onOpenSyncModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalRecords,
  filteredRecords,
  isSyncing,
  onSync,
  filter,
  onFilterChange,
  lastSynced,
  onOpenSyncModal
}) => {
  const [searchValue, setSearchValue] = useState(filter.searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filter, searchQuery: searchValue });
  };

  const handleClearSearch = () => {
    setSearchValue('');
    onFilterChange({ ...filter, searchQuery: '' });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 shrink-0">
            <PodaLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">
                  SCM & Sales Analytics
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live Data
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                3-Year Performance & Supply Chain Intelligence (2024 - 2026)
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              id="global-search-input"
              type="text"
              placeholder="Cari produk, brand, distributor, kota..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs pl-9 pr-7 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </form>

          {/* Right Actions: Google Sheet Sync & External Link */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="sync-sheet-btn"
              onClick={onSync}
              disabled={isSyncing}
              title="Sync latest data from Google Spreadsheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
            </button>

            <button
              id="sheet-details-btn"
              onClick={onOpenSyncModal}
              title="View Google Sheet Source Details"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4" />
            </button>

            <a
              id="open-google-sheet-link"
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200/50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Google Sheet</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
