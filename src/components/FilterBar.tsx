import React from 'react';
import { Filter, RotateCcw, X, Layers } from 'lucide-react';
import { FilterState } from '../types';
import { MultiSelectDropdown } from './MultiSelectDropdown';

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
    (filter.kotaList && filter.kotaList.length > 0) ||
    Boolean(filter.selectedKota) ||
    (filter.distributorList && filter.distributorList.length > 0) ||
    Boolean(filter.selectedDistributor) ||
    Boolean(filter.searchQuery);

  const resetFilters = () => {
    onFilterChange({
      years: [],
      prinsipals: [],
      brands: [],
      jenisList: [],
      ukuranList: [],
      kotaList: [],
      distributorList: [],
      selectedKota: '',
      selectedDistributor: '',
      searchQuery: ''
    });
  };

  const selectedKotaList = filter.kotaList || (filter.selectedKota ? [filter.selectedKota] : []);
  const selectedDistributorList = filter.distributorList || (filter.selectedDistributor ? [filter.selectedDistributor] : []);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3">
      
      {/* Slicer Header & Counts */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Slicer & Filter Data
          </span>
          {isFiltered && (
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Filter Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            <strong className="font-semibold text-slate-900">{filteredCount.toLocaleString()}</strong> dari {totalCount.toLocaleString()} data transaksi
          </span>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Slicer</span>
            </button>
          )}
        </div>
      </div>

      {/* Slicer Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        
        {/* 1. Tahun Dropdown */}
        <MultiSelectDropdown
          label="Tahun"
          placeholder="Semua Tahun"
          options={availableYears}
          selected={filter.years}
          onChange={(next) => onFilterChange({ ...filter, years: next })}
          colorScheme="indigo"
        />

        {/* 2. Prinsipal Dropdown */}
        <MultiSelectDropdown
          label="Prinsipal"
          placeholder="Semua Prinsipal"
          options={availablePrinsipals}
          selected={filter.prinsipals}
          onChange={(next) => onFilterChange({ ...filter, calculatedPrinsipals: next,  prinsipals: next } as any)}
          colorScheme="emerald"
        />

        {/* 3. Brand Dropdown */}
        <MultiSelectDropdown
          label="Brand"
          placeholder="Semua Brand"
          options={availableBrands}
          selected={filter.brands}
          onChange={(next) => onFilterChange({ ...filter, brands: next })}
          colorScheme="indigo"
        />

        {/* 4. Jenis Dropdown */}
        <MultiSelectDropdown
          label="Jenis"
          placeholder="Semua Jenis"
          options={availableJenis}
          selected={filter.jenisList}
          onChange={(next) => onFilterChange({ ...filter, jenisList: next })}
          colorScheme="amber"
        />

        {/* 5. Ukuran Dropdown */}
        <MultiSelectDropdown
          label="Ukuran"
          placeholder="Semua Ukuran"
          options={availableUkuran}
          selected={filter.ukuranList}
          onChange={(next) => onFilterChange({ ...filter, ukuranList: next })}
          colorScheme="cyan"
        />

        {/* 6. Kota Dropdown */}
        <MultiSelectDropdown
          label="Kota / Wilayah"
          placeholder="Semua Kota"
          options={availableCities}
          selected={selectedKotaList}
          onChange={(next) => onFilterChange({ ...filter, kotaList: next, selectedKota: '' })}
          colorScheme="slate"
          enableSearch={true}
        />

        {/* 7. Distributor Dropdown */}
        <MultiSelectDropdown
          label="Distributor"
          placeholder="Semua Distributor"
          options={availableDistributors}
          selected={selectedDistributorList}
          onChange={(next) => onFilterChange({ ...filter, distributorList: next, selectedDistributor: '' })}
          colorScheme="slate"
          enableSearch={true}
        />

      </div>

    </div>
  );
};
