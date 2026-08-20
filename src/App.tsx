import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchSalesData, 
  filterSalesData, 
  computeKPIs, 
  getLastFetchTime 
} from './data/dataService';
import { 
  SalesRecord, 
  MenuType, 
  SubMenuType, 
  FilterState, 
  KPIStats 
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { SyncModal } from './components/SyncModal';

// Views
import { ForecastingView } from './views/scm/ForecastingView';
import { SalesOrderView } from './views/scm/SalesOrderView';
import { QuarterlySalesView } from './views/sales/QuarterlySalesView';
import { CityDistriPrincipalView } from './views/sales/CityDistriPrincipalView';
import { BrandVolumeView } from './views/sales/BrandVolumeView';
import { ProductPercentageView } from './views/sales/ProductPercentageView';
import { TotalBottlesView } from './views/sales/TotalBottlesView';

import { Menu, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function App() {
  const [allData, setAllData] = useState<SalesRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Navigation State - defaults to SCM -> forecasting or Sales -> Quarterly
  const [activeMenu, setActiveMenu] = useState<MenuType>('SCM');
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuType>('forecasting');

  // Filter State
  const [filter, setFilter] = useState<FilterState>({
    years: [],
    prinsipals: [],
    brands: [],
    jenisList: [],
    ukuranList: [],
    selectedKota: '',
    selectedDistributor: '',
    searchQuery: ''
  });

  // Initial Data Load
  const loadData = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsSyncing(true);
      else setIsLoading(true);
      setError(null);

      const records = await fetchSalesData(forceRefresh);
      setAllData(records);
      setLastSynced(getLastFetchTime());
    } catch (err: any) {
      console.error('Error loading sales data:', err);
      setError(err.message || 'Gagal memuat dataset penjualan.');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return filterSalesData(allData, filter);
  }, [allData, filter]);

  // Overall KPIs for quick stats
  const kpis = useMemo<KPIStats>(() => {
    return computeKPIs(filteredData);
  }, [filteredData]);

  // Available Filter Options
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allData.forEach(d => years.add(d.tahun));
    return Array.from(years).sort((a, b) => a - b);
  }, [allData]);

  const availablePrinsipals = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.prinsipal && d.prinsipal !== 'Unassigned') set.add(d.prinsipal);
    });
    return Array.from(set).sort();
  }, [allData]);

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.brand) set.add(d.brand);
    });
    return Array.from(set).sort();
  }, [allData]);

  const availableJenis = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.jenis) set.add(d.jenis);
    });
    return Array.from(set).sort();
  }, [allData]);

  const availableUkuran = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.ukuran) set.add(d.ukuran);
    });
    return Array.from(set).sort();
  }, [allData]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.kota && d.kota !== 'Unassigned') set.add(d.kota);
    });
    return Array.from(set).sort();
  }, [allData]);

  const availableDistributors = useMemo(() => {
    const set = new Set<string>();
    allData.forEach(d => {
      if (d.distributor && d.distributor !== 'Unassigned') set.add(d.distributor);
    });
    return Array.from(set).sort();
  }, [allData]);

  const handleSelectNav = (menu: MenuType, subMenu: SubMenuType) => {
    setActiveMenu(menu);
    setActiveSubMenu(subMenu);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render view based on activeSubMenu
  const renderActiveView = () => {
    switch (activeSubMenu) {
      // Menu: SCM
      case 'forecasting':
        return <ForecastingView data={filteredData} />;
      case 'sales_order':
        return <SalesOrderView data={filteredData} />;

      // Menu: Sales
      case 'quarterly_sales':
        return <QuarterlySalesView data={filteredData} />;
      case 'city_distri_principal':
        return <CityDistriPrincipalView data={filteredData} />;
      case 'brand_volume':
        return <BrandVolumeView data={filteredData} />;
      case 'product_percentage':
        return <ProductPercentageView data={filteredData} />;
      case 'total_bottles':
        return <TotalBottlesView data={filteredData} />;

      default:
        return <ForecastingView data={filteredData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        totalRecords={allData.length}
        filteredRecords={filteredData.length}
        isSyncing={isSyncing}
        onSync={() => loadData(true)}
        filter={filter}
        onFilterChange={setFilter}
        lastSynced={lastSynced}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Mobile Menu Button Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg"
        >
          <Menu className="w-4 h-4" />
          <span>Buka Menu Dashboard</span>
        </button>
        <span className="text-xs font-bold text-slate-800">
          {activeMenu} / {activeSubMenu.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Persistent Sidebar */}
        <Sidebar
          activeMenu={activeMenu}
          activeSubMenu={activeSubMenu}
          onSelect={handleSelectNav}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 space-y-6">
          
          {/* Global Dynamic Filter Bar */}
          <FilterBar
            filter={filter}
            onFilterChange={setFilter}
            availableYears={availableYears}
            availablePrinsipals={availablePrinsipals}
            availableBrands={availableBrands}
            availableJenis={availableJenis}
            availableUkuran={availableUkuran}
            availableCities={availableCities}
            availableDistributors={availableDistributors}
            totalCount={allData.length}
            filteredCount={filteredData.length}
          />

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Memuat Data Penjualan...</h3>
                <p className="text-xs text-slate-500 mt-1">Mengambil dan mengindeks {allData.length || '21,000+'} baris transaksi</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="font-bold text-rose-900 text-sm">Gagal Sinkronisasi Data</h3>
              <p className="text-xs text-rose-700">{error}</p>
              <button
                onClick={() => loadData(true)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer"
              >
                Coba Muat Ulang
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <Database className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Data Yang Sesuai Filter</h3>
              <p className="text-xs text-slate-500">
                Silakan ubah atau reset kombinasi filter tahun, brand, distributor, atau kata pencarian.
              </p>
              <button
                onClick={() => setFilter({
                  years: [],
                  prinsipals: [],
                  brands: [],
                  jenisList: [],
                  ukuranList: [],
                  selectedKota: '',
                  selectedDistributor: '',
                  searchQuery: ''
                })}
                className="px-4 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            renderActiveView()
          )}

        </main>
      </div>

      {/* Source Connection Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        lastSynced={lastSynced}
        totalRecords={allData.length}
        isSyncing={isSyncing}
        onSync={() => loadData(true)}
        kpis={kpis}
      />

    </div>
  );
}
