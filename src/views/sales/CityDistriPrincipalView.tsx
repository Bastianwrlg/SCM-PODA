import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Treemap 
} from 'recharts';
import { 
  MapPin, 
  Building2, 
  Layers, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  TrendingUp,
  Award
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getCityDistriPrincipalMatrix } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface CityDistriPrincipalViewProps {
  data: SalesRecord[];
}

export const CityDistriPrincipalView: React.FC<CityDistriPrincipalViewProps> = ({ data }) => {
  const [selectedPrincipalTab, setSelectedPrincipalTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDistri, setExpandedDistri] = useState<string | null>(null);

  const principalMatrix = useMemo(() => {
    return getCityDistriPrincipalMatrix(data);
  }, [data]);

  // Overall totals
  const totalVolume = useMemo(() => {
    return principalMatrix.reduce((acc, curr) => acc + curr.totalQty, 0);
  }, [principalMatrix]);

  // Filtered principal list for table/drilldown
  const activePrincipals = useMemo(() => {
    if (selectedPrincipalTab === 'All') return principalMatrix;
    return principalMatrix.filter(p => p.prinsipal === selectedPrincipalTab);
  }, [principalMatrix, selectedPrincipalTab]);

  // City Ranking aggregated
  const topCitiesOverall = useMemo(() => {
    const cityMap: Record<string, number> = {};
    data.forEach(item => {
      if (item.kota && item.kota !== 'Unassigned') {
        cityMap[item.kota] = (cityMap[item.kota] || 0) + item.qty;
      }
    });
    return Object.entries(cityMap)
      .map(([kota, qty]) => ({ kota, qty, pct: totalVolume > 0 ? (qty / totalVolume) * 100 : 0 }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [data, totalVolume]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Sales Analytics
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Kota, Distri & Prinsipal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarki multi-dimensi penjualan: Prinsipal (RAYS, PODA, FVS) $\rightarrow$ Jaringan Distributor $\rightarrow$ Sebaran Kota & Wilayah.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-cdp-total"
          title="Total Volume Tersebar"
          value={`${totalVolume.toLocaleString()} botol`}
          subtitle="Cakupan seluruh mitra & kota"
          icon={Layers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-cdp-prinsipal"
          title="Prinsipal Aktif"
          value={`${principalMatrix.length} Prinsipal`}
          subtitle="RAYS, PODA, FVS"
          icon={Award}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-cdp-distri"
          title="Distributor Terdaftar"
          value={`${new Set(data.filter(d => d.distributor !== 'Unassigned').map(d => d.distributor)).size} Mitra`}
          subtitle="Jaringan distribusi nasional"
          icon={Building2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          id="kpi-cdp-city"
          title="Kota & Wilayah Terjangkau"
          value={`${topCitiesOverall.length}+ Kota`}
          subtitle={`Top Kota: ${topCitiesOverall[0]?.kota || '-'}`}
          icon={MapPin}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
      </div>

      {/* Visual Principal Volume Share & Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Principal Overview Bar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Komparasi Volume per Prinsipal</h2>
              <p className="text-xs text-slate-500">Total penjualan botol dan jumlah distributor terdaftar</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={principalMatrix} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="prinsipal" tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} botol`, 'Total Penjualan']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="totalQty" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Cities Widget */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Top 5 Segmen Kota</h2>
            <p className="text-xs text-slate-500 mb-3">Pangsa pasar kota teratas</p>
            
            <div className="space-y-3">
              {topCitiesOverall.slice(0, 5).map((c, idx) => (
                <div key={c.kota} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {c.kota}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {c.qty.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">({c.pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, c.pct * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            5 kota di atas menyumbang mayoritas penetrasi pasar produk.
          </div>
        </div>

      </div>

      {/* Multi-tier Matrix Drilldown Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Matriks Prinsipal $\rightarrow$ Distributor $\rightarrow$ Kota
            </h2>
            <p className="text-xs text-slate-500">
              Klik nama distributor untuk melihat rincian breakdown kota-kota penyumbang penjualan
            </p>
          </div>

          {/* Principal Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedPrincipalTab('All')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                selectedPrincipalTab === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Semua Prinsipal
            </button>
            {principalMatrix.map(p => (
              <button
                key={p.prinsipal}
                onClick={() => setSelectedPrincipalTab(p.prinsipal)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedPrincipalTab === p.prinsipal ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {p.prinsipal}
              </button>
            ))}
          </div>
        </div>

        {/* Drilldown List */}
        <div className="space-y-4">
          {activePrincipals.map((pGroup) => (
            <div key={pGroup.prinsipal} className="border border-slate-200 rounded-xl overflow-hidden">
              
              {/* Principal Header Bar */}
              <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-wide">PRINSIPAL: {pGroup.prinsipal}</span>
                  <span className="bg-slate-800 text-indigo-300 text-[11px] px-2 py-0.5 rounded font-medium">
                    {pGroup.distributorCount} Distributor
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-medium">
                    {pGroup.cityCount} Kota
                  </span>
                </div>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  {pGroup.totalQty.toLocaleString()} Botol
                </div>
              </div>

              {/* Distributors under this Principal */}
              <div className="divide-y divide-slate-100 bg-white text-xs">
                {pGroup.distributors.slice(0, 10).map((dItem) => {
                  const isExpanded = expandedDistri === `${pGroup.prinsipal}-${dItem.distributor}`;
                  const distriShare = pGroup.totalQty > 0 ? (dItem.totalQty / pGroup.totalQty) * 100 : 0;

                  return (
                    <div key={dItem.distributor} className="transition-colors">
                      <div 
                        onClick={() => setExpandedDistri(isExpanded ? null : `${pGroup.prinsipal}-${dItem.distributor}`)}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-indigo-600' : ''}`} />
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{dItem.distributor}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({dItem.cities.length} Kota)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 text-[11px] font-mono">{distriShare.toFixed(1)}% Share</span>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {dItem.totalQty.toLocaleString()} <span className="font-normal text-slate-400">btl</span>
                          </span>
                        </div>
                      </div>

                      {/* Expanded Cities Breakdown */}
                      {isExpanded && (
                        <div className="px-10 py-3 bg-indigo-50/30 border-t border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Breakdown Kota untuk {dItem.distributor}:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {dItem.cities.map(c => (
                              <div key={c.kota} className="p-2 rounded bg-white border border-indigo-100/60 shadow-2xs">
                                <div className="font-semibold text-slate-800 text-xs">{c.kota}</div>
                                <div className="text-[11px] font-mono text-indigo-700 font-bold mt-0.5">
                                  {c.qty.toLocaleString()} botol
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {pGroup.distributors.length > 10 && (
                <div className="bg-slate-50 px-4 py-2 text-center text-xs text-slate-500 border-t border-slate-100">
                  + {pGroup.distributors.length - 10} distributor lainnya di bawah prinsipal {pGroup.prinsipal}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
