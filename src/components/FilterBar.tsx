import React from 'react';
import { Filter, RotateCcw, Building2, Layers, Check, ChevronDown } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  availableYears: number[];
  availablePrinsipals: string[];
  availableBrands: string[];
  availableJenis: string[];
  availableUkuran: string[];
  availableCities: string[];
  availableDistributors: string[];
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  availableYears,
  availablePrinsipals,
  availableBrands,
  availableJenis,
  availableUkuran,
  availableCities,
  availableDistributors,
  totalCount,
  filteredCount
}) => {
  const isFiltered = 
    filter.years.length > 0 ||
    filter.prinsipals.length > 0 ||
    filter.brands.length > 0 ||
    filter.jenisList.length > 0 ||
    filter.ukuranList.length > 0 ||
    Boolean(filter.selectedKota) ||
    Boolean(filter.selectedDistributor) ||
    Boolean(filter.searchQuery);

  const resetFilters = () => {
    onFilterChange({
      years: [],
      prinsipals: [],
      brands: [],
      jenisList: [],
      ukuranList: [],
      selectedKota: '',
      selectedDistributor: '',
      searchQuery: ''
    });
  };

  const toggleYear = (year: number) => {
    const nextYears = filter.years.includes(year)
      ? filter.years.filter(y => y !== year)
      : [...filter.years, year];
    onFilterChange({ ...filter, years: nextYears });
  };

  const togglePrincipal = (p: string) => {
    const next = filter.prinsipals.includes(p)
      ? filter.prinsipals.filter(item => item !== p)
      : [...filter.prinsipals, p];
    onFilterChange({ ...filter, computedPrinsipals: next,  prinsipals: next });
  };

  const toggleBrand = (b: string) => {
    const next = filter.brands.includes(b)
      ? filter.brands.filter(item => item !== b)
      : [...filter.brands, b];
    onFilterChange({ ...filter, brands: next });
  };

  const toggleJenis = (j: string) => {
    const next = filter.jenisList.includes(j)
      ? filter.jenisList.filter(item => item !== j)
      : [...filter.jenisList, j];
    onFilterChange({ ...filter, jenisList: next });
  };

  const toggleUkuran = (u: string) => {
    const next = filter.ukuranList.includes(u)
      ? filter.ukuranList.filter(item => item !== u)
      : [...filter.ukuranList, u];
    onFilterChange({ ...filter, ukuranList: next });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-3">
      
      {/* Top row: Years pills, Principal pills, Brands pills, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Years Selection */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Tahun:</span>
          <button
            onClick={() => onFilterChange({ ...filter, years: [] })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter.years.length === 0
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            Semua (3 Tahun)
          </button>
          {availableYears.map(year => {
            const isSelected = filter.years.includes(year);
            return (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>

        {/* Principals Selection */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Prinsipal:</span>
          {availablePrinsipals.map(p => {
            const isSelected = filter.prinsipals.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePrincipal(p)}
                className={`px-2 py-0.8 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Reset button & filtered count */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-slate-500 hidden sm:inline">
            <strong className="font-semibold text-slate-800">{filteredCount.toLocaleString()}</strong> dari {totalCount.toLocaleString()} baris
          </span>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

      </div>

      {/* Secondary filter row: Brands, Jenis, Ukuran, Kota, Distributor dropdowns */}
      <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
        
        {/* Brand Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Brand</label>
          <div className="flex flex-wrap gap-1">
            {availableBrands.slice(0, 4).map(b => {
              const isSelected = filter.brands.includes(b);
              return (
                <button
                  key={b}
                  onClick={() => toggleBrand(b)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>

        {/* Jenis Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Jenis</label>
          <div className="flex flex-wrap gap-1">
            {availableJenis.map(j => {
              const isSelected = filter.jenisList.includes(j);
              return (
                <button
                  key={j}
                  onClick={() => toggleJenis(j)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {j}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ukuran Filter */}
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Ukuran</label>
          <div className="flex flex-wrap gap-1">
            {availableUkuran.map(u => {
              const isSelected = filter.ukuranList.includes(u);
              return (
                <button
                  key={u}
                  onClick={() => toggleUkuran(u)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kota Select */}
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Kota / Wilayah</label>
          <select
            value={filter.selectedKota}
            onChange={(e) => onFilterChange({ ...filter, selectedKota: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Semua Kota ({availableCities.length})</option>
            {availableCities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Distributor Select */}
        <div>
          <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">Distributor</label>
          <select
            value={filter.selectedDistributor}
            onChange={(e) => onFilterChange({ ...filter, selectedDistributor: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">Semua Distributor ({availableDistributors.length})</option>
            {availableDistributors.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
};
