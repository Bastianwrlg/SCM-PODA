import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Clock, 
  PackageCheck, 
  Sparkles,
  ArrowUpRight,
  Info,
  Calendar
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { calculateSCMForecast } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface ForecastingViewProps {
  data: SalesRecord[];
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({ data }) => {
  const [horizonMonths, setHorizonMonths] = useState<number>(6);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(14);
  const [serviceLevelPct, setServiceLevelPct] = useState<number>(95);
  const [alpha, setAlpha] = useState<number>(0.3);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  // Filter data by selected brand if any
  const filteredData = useMemo(() => {
    if (selectedBrand === 'All') return data;
    return data.filter(d => d.brand === selectedBrand);
  }, [data, selectedBrand]);

  const { timeline, safetyStockList, metrics } = useMemo(() => {
    return calculateSCMForecast(filteredData, horizonMonths, alpha, leadTimeDays, serviceLevelPct);
  }, [filteredData, horizonMonths, alpha, leadTimeDays, serviceLevelPct]);

  const brands = useMemo(() => {
    const bSet = new Set<string>();
    data.forEach(d => bSet.add(d.brand));
    return ['All', ...Array.from(bSet)];
  }, [data]);

  const filteredSafetyStock = useMemo(() => {
    if (filterStatus === 'All') return safetyStockList;
    return safetyStockList.filter(item => item.stockStatus === filterStatus);
  }, [safetyStockList, filterStatus]);

  // Total projected demand for horizon
  const projectedTotal = useMemo(() => {
    return timeline
      .filter(t => t.isProjected)
      .reduce((sum, item) => sum + item.forecast, 0);
  }, [timeline]);

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              SCM Module
            </span>
            <h1 className="text-xl font-bold text-slate-900">Demand Forecasting & Inventory Planning</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proyeksi kebutuhan stok, Safety Stock, dan Reorder Point (ROP) berbasis time-series historis.
          </p>
        </div>

        {/* Brand quick filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {brands.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'Semua Brand' : b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-forecast-projected"
          title={`Proyeksi (${horizonMonths} Bulan)`}
          value={`${projectedTotal.toLocaleString()} botol`}
          subtitle={`Rata-rata ${Math.round(projectedTotal / horizonMonths).toLocaleString()} / bln`}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-forecast-mape"
          title="Akurasi Forecast (MAPE)"
          value={`${metrics.mape}%`}
          subtitle={`MAD: ±${metrics.mad.toLocaleString()} botol/bln`}
          change={-metrics.mape}
          changeLabel="Tingkat Error"
          icon={ShieldCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          id="kpi-forecast-leadtime"
          title="Lead Time & Service Level"
          value={`${leadTimeDays} Hari`}
          subtitle={`Z-Score: ${serviceLevelPct}% Service Level`}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-forecast-reorder"
          title="Alert Reorder Kritis"
          value={`${metrics.reorderAlertCount} SKU`}
          subtitle="Membutuhkan PO pengadaan segera"
          change={metrics.reorderAlertCount > 0 ? metrics.reorderAlertCount : 0}
          changeLabel="SKU Perlu Restock"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      {/* Interactive SCM Parameter Configuration */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-800">SCM Parameter Tuning</h2>
          <span className="text-xs text-slate-400">Atur parameter lead time dan horizon prediksi secara real-time</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          
          {/* Horizon Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Forecast Horizon</span>
              <span className="font-bold text-indigo-600">{horizonMonths} Bulan ke depan</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="1"
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>3 Bln (Kuartal)</span>
              <span>6 Bln</span>
              <span>12 Bln (1 Tahun)</span>
            </div>
          </div>

          {/* Lead Time Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Supplier Lead Time</span>
              <span className="font-bold text-indigo-600">{leadTimeDays} Hari</span>
            </div>
            <input
              type="range"
              min="7"
              max="45"
              step="1"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>7 Hari (Lokal)</span>
              <span>14 Hari</span>
              <span>45 Hari (Import/Bulk)</span>
            </div>
          </div>

          {/* Service Level Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Service Level Target</span>
              <span className="font-bold text-indigo-600">{serviceLevelPct}% (Z: {serviceLevelPct === 90 ? '1.28' : serviceLevelPct === 95 ? '1.65' : '2.33'})</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[90, 95, 99].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setServiceLevelPct(lvl)}
                  className={`py-1 rounded font-medium transition-colors cursor-pointer ${
                    serviceLevelPct === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lvl}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Menentukan batas toleransi stockout risiko</p>
          </div>

          {/* Smoothing Alpha */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Smoothing Factor (Alpha)</span>
              <span className="font-bold text-indigo-600">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.10 (Stabil)</span>
              <span>0.30 (Standard)</span>
              <span>0.60 (Responsif)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Tren Historis & Kurva Proyeksi Kebutuhan (Bottles / Bulan)
            </h2>
            <p className="text-xs text-slate-500">
              Garis biru solid = data penjualan aktual, Garis putus-putus oranye = estimasi model dengan interval batas atas/bawah 95%
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
              <span className="w-3 h-0.5 bg-indigo-600 inline-block"></span> Aktual
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span> Forecast
            </span>
            <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
              <span className="w-3 h-2 bg-amber-100 inline-block rounded-xs"></span> Confidence Band
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeline} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  if (typeof value === 'number') {
                    return [`${value.toLocaleString()} botol`, name === 'actual' ? 'Aktual' : name === 'forecast' ? 'Forecast' : name];
                  }
                  return [value, name];
                }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="upperBound" 
                fill="#fef3c7" 
                stroke="none" 
                name="Batas Atas"
              />
              <Area 
                type="monotone" 
                dataKey="lowerBound" 
                fill="#ffffff" 
                stroke="none" 
                name="Batas Bawah"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#4f46e5" 
                strokeWidth={2.5} 
                dot={{ r: 3, fill: '#4f46e5' }}
                activeDot={{ r: 6 }}
                name="Aktual"
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#f59e0b' }}
                name="Forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Safety Stock & Reorder Point Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Safety Stock & Reorder Point (ROP) per Produk
            </h2>
            <p className="text-xs text-slate-500">
              Kalkulasi Reorder Point = (Daily Demand × Lead Time) + Safety Stock
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            {['All', 'Critical Reorder', 'Warning', 'Safe'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Produk & Brand</th>
                <th className="py-2.5 px-3 text-right">Avg Demand/Bln</th>
                <th className="py-2.5 px-3 text-right">Daily Demand</th>
                <th className="py-2.5 px-3 text-right">Safety Stock</th>
                <th className="py-2.5 px-3 text-right">Reorder Point (ROP)</th>
                <th className="py-2.5 px-3 text-right">Estimasi Stok</th>
                <th className="py-2.5 px-3 text-center">Runway (Hari)</th>
                <th className="py-2.5 px-3 text-center">Status SCM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSafetyStock.slice(0, 15).map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <div>{item.product}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.brand}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {item.avgMonthlyDemand.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.dailyDemand}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-indigo-600">
                    {item.safetyStock.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {item.reorderPoint.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {item.currentStockEstimate.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      item.runwayDays < 15
                        ? 'bg-rose-100 text-rose-800'
                        : item.runwayDays < 30
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.runwayDays} Hari
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.stockStatus === 'Critical Reorder'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : item.stockStatus === 'Warning'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                      {item.stockStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSafetyStock.length > 15 && (
          <div className="mt-3 text-center text-xs text-slate-400">
            Menampilkan 15 dari {filteredSafetyStock.length} SKU teratas. Gunakan filter untuk melihat spesifik.
          </div>
        )}
      </div>

    </div>
  );
};
