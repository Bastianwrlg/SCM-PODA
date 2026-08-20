import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Package, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Layers, 
  Droplet,
  Sparkles,
  Award
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getTotalBottlesMetrics } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface TotalBottlesViewProps {
  data: SalesRecord[];
}

export const TotalBottlesView: React.FC<TotalBottlesViewProps> = ({ data }) => {
  const metrics = useMemo(() => {
    return getTotalBottlesMetrics(data);
  }, [data]);

  // Peak month
  const peakMonth = useMemo(() => {
    return [...metrics.monthlyHeatmap].sort((a, b) => b.total - a.total)[0];
  }, [metrics.monthlyHeatmap]);

  const lowestMonth = useMemo(() => {
    return [...metrics.monthlyHeatmap].sort((a, b) => a.total - b.total)[0];
  }, [metrics.monthlyHeatmap]);

  const avgMonthlyBottles = Math.round(metrics.totalBottles / 36);
  const avgDailyBottles = Math.round(metrics.totalBottles / (36 * 30));

  const pieColors = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#64748b'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Sales Analytics
            </span>
            <h1 className="text-xl font-bold text-slate-900">Total Penjualan per Botol (3 Tahun)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Metrik volume kumulatif unit botol, tren penjualan bulanan 2024-2026, dan sebaran ukuran kemasan.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-tb-grandtotal"
          title="Grand Total Penjualan"
          value={`${metrics.totalBottles.toLocaleString()} Botol`}
          subtitle="Total agregat 36 bulan (2024 - 2026)"
          icon={Package}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-tb-avgmonth"
          title="Rata-rata per Bulan"
          value={`${avgMonthlyBottles.toLocaleString()} Botol/Bln`}
          subtitle={`~${avgDailyBottles.toLocaleString()} botol/hari (Run-rate)`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          id="kpi-tb-peak"
          title="Bulan Teramai (Peak)"
          value={peakMonth ? peakMonth.month : '-'}
          subtitle={peakMonth ? `${peakMonth.total.toLocaleString()} botol total` : ''}
          icon={Flame}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-tb-dominant"
          title="Ukuran Botol Terlaris"
          value={metrics.sizeDistribution[0]?.ukuran || '30ML'}
          subtitle={`${metrics.sizeDistribution[0]?.qty.toLocaleString()} btl (${metrics.sizeDistribution[0]?.pct.toFixed(1)}%)`}
          icon={Award}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
      </div>

      {/* Monthly Timeline Curve (36 Months) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Kurva Kecepatan Penjualan Botol Bulanan (2024 - 2026)
            </h2>
            <p className="text-xs text-slate-500">
              Trayektori volume botol per bulan selama rentang 3 tahun penuh
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.monthlyTimeline} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorBottles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748b' }} tickMargin={8} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(val: any) => [`${Number(val).toLocaleString()} botol`, 'Penjualan']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="qty" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBottles)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Heat Matrix (Jan-Dec x 2024, 2025, 2026) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Matriks Penjualan Bulanan per Tahun (Januari - Desember)
            </h2>
            <p className="text-xs text-slate-500">
              Rekapitulasi kuantitas botol per bulan untuk evaluasi tren musiman
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right font-mono">Tahun 2024</th>
                <th className="py-2.5 px-3 text-right font-mono">Tahun 2025</th>
                <th className="py-2.5 px-3 text-right font-mono">Tahun 2026</th>
                <th className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">Total 3 Tahun</th>
                <th className="py-2.5 px-3 text-right font-mono text-slate-600">Rata-rata/Thn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.monthlyHeatmap.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {row.month}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.year2024.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.year2025.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.year2026.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700 bg-indigo-50/30">
                    {row.total.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {row.avg.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
                <td className="py-3 px-3">Total Tahunan</td>
                <td className="py-3 px-3 text-right font-mono">
                  {metrics.yearlyTotals.find(y => y.year === 2024)?.qty.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {metrics.yearlyTotals.find(y => y.year === 2025)?.qty.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {metrics.yearlyTotals.find(y => y.year === 2026)?.qty.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-indigo-700 text-sm">
                  {metrics.totalBottles.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {Math.round(metrics.totalBottles / 3).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Distribution of Sizes and Liquid Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Size Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Distribusi Ukuran Kemasan Botol</h2>
          <p className="text-xs text-slate-500">Komparasi unit botol 15ML, 30ML, dan 60ML</p>

          <div className="space-y-3 pt-2">
            {metrics.sizeDistribution.map((item, idx) => (
              <div key={item.ukuran} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{item.ukuran}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.qty.toLocaleString()} botol <span className="text-slate-400 font-normal">({item.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.pct}%`,
                      backgroundColor: idx === 0 ? '#4f46e5' : idx === 1 ? '#06b6d4' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jenis/Category Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-800">Distribusi Jenis / Kategori Produk</h2>
          <p className="text-xs text-slate-500">Kuantitas botol berdasarkan formulasi likuid</p>

          <div className="space-y-3 pt-2">
            {metrics.jenisDistribution.map((item, idx) => (
              <div key={item.jenis} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800 font-semibold">{item.jenis}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.qty.toLocaleString()} botol <span className="text-slate-400 font-normal">({item.pct.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.pct}%`,
                      backgroundColor: idx === 0 ? '#4f46e5' : idx === 1 ? '#10b981' : '#f59e0b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
