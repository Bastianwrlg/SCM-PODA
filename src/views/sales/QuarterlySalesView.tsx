import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getQuarterlySummary } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface QuarterlySalesViewProps {
  data: SalesRecord[];
}

export const QuarterlySalesView: React.FC<QuarterlySalesViewProps> = ({ data }) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked' | 'yoy_compare'>('grouped');

  const quarterlyData = useMemo(() => {
    return getQuarterlySummary(data);
  }, [data]);

  // Group by Quarter (Q1, Q2, Q3, Q4) comparing 2024, 2025, 2026
  const quarterComparison = useMemo(() => {
    const qtrs = ['Q1', 'Q2', 'Q3', 'Q4'];
    return qtrs.map(q => {
      const q24 = quarterlyData.find(d => d.year === 2024 && d.quarter === q)?.qty || 0;
      const q25 = quarterlyData.find(d => d.year === 2025 && d.quarter === q)?.qty || 0;
      const q26 = quarterlyData.find(d => d.year === 2026 && d.quarter === q)?.qty || 0;
      const yoy25 = q24 > 0 ? ((q25 - q24) / q24) * 100 : 0;
      const yoy26 = q25 > 0 ? ((q26 - q25) / q25) * 100 : 0;

      return {
        quarter: q,
        year2024: q24,
        year2025: q25,
        year2026: q26,
        total: q24 + q25 + q26,
        yoy25,
        yoy26
      };
    });
  }, [quarterlyData]);

  // Overall calculations
  const totalQuarterBottles = useMemo(() => {
    return quarterlyData.reduce((acc, curr) => acc + curr.qty, 0);
  }, [quarterlyData]);

  const bestQuarter = useMemo(() => {
    return [...quarterlyData].sort((a, b) => b.qty - a.qty)[0];
  }, [quarterlyData]);

  const avgQuarter = Math.round(totalQuarterBottles / (quarterlyData.filter(d => d.qty > 0).length || 1));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Sales Analytics
            </span>
            <h1 className="text-xl font-bold text-slate-900">Jumlah Penjualan per Quarter (3 Tahun)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dinamika volume penjualan kuartalan 2024, 2025, dan 2026, analisis musiman, serta pertumbuhan YoY.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setChartMode('grouped')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              chartMode === 'grouped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timeline 12 Kuartal
          </button>
          <button
            onClick={() => setChartMode('yoy_compare')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              chartMode === 'yoy_compare' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komparasi Q1 - Q4
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-qtr-total"
          title="Total Penjualan 3 Tahun"
          value={`${totalQuarterBottles.toLocaleString()} botol`}
          subtitle="Akumulasi 12 Kuartal (2024-2026)"
          icon={BarChart3}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-qtr-avg"
          title="Rata-rata per Kuartal"
          value={`${avgQuarter.toLocaleString()} botol`}
          subtitle="Benchmark kuartalan"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          id="kpi-qtr-peak"
          title="Kuartal Tertinggi (Peak)"
          value={bestQuarter ? bestQuarter.period : '-'}
          subtitle={bestQuarter ? `${bestQuarter.qty.toLocaleString()} botol` : ''}
          change={bestQuarter?.qoqGrowth}
          changeLabel="QoQ Surge"
          icon={Sparkles}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-qtr-active"
          title="Periode Terdata"
          value="12 Kuartal"
          subtitle="2024 Q1 s/d 2026 Q4"
          icon={Calendar}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
      </div>

      {/* Main Quarterly Charts */}
      {chartMode === 'grouped' ? (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Grafik Penjualan Kuartalan Berjalan (2024 - 2026)
              </h2>
              <p className="text-xs text-slate-500">
                Volume botol per periode kuartal dengan indikator tren
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={8} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any, name: string) => [`${Number(val).toLocaleString()} botol`, 'Penjualan']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="qty" 
                  fill="#4f46e5" 
                  radius={[6, 6, 0, 0]}
                  name="Volume Penjualan"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Komparasi Antar Kuartal (Q1, Q2, Q3, Q4) Antar Tahun
              </h2>
              <p className="text-xs text-slate-500">
                Evaluasi performa kuartal yang sama di tahun 2024, 2025, dan 2026
              </p>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterComparison} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }} tickMargin={8} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(val: any, name: string) => {
                    const label = name === 'year2024' ? 'Tahun 2024' : name === 'year2025' ? 'Tahun 2025' : 'Tahun 2026';
                    return [`${Number(val).toLocaleString()} botol`, label];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend 
                  formatter={(value) => (value === 'year2024' ? '2024' : value === 'year2025' ? '2025' : '2026')}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="year2024" fill="#94a3b8" radius={[4, 4, 0, 0]} name="year2024" />
                <Bar dataKey="year2025" fill="#4f46e5" radius={[4, 4, 0, 0]} name="year2025" />
                <Bar dataKey="year2026" fill="#06b6d4" radius={[4, 4, 0, 0]} name="year2026" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comprehensive Quarterly Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Tabel Rincian Penjualan Kuartalan (3 Tahun)</h2>
            <p className="text-xs text-slate-500">Data kuartal, volume botol, pertumbuhan QoQ & YoY</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Periode Kuartal</th>
                <th className="py-2.5 px-3">Tahun</th>
                <th className="py-2.5 px-3 text-right">Total Penjualan (Botol)</th>
                <th className="py-2.5 px-3 text-right">Kontribusi Share (%)</th>
                <th className="py-2.5 px-3 text-right">Pertumbuhan QoQ</th>
                <th className="py-2.5 px-3 text-right">Pertumbuhan YoY</th>
                <th className="py-2.5 px-3">Top Brand di Kuartal Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quarterlyData.map((item, idx) => {
                const sharePct = totalQuarterBottles > 0 ? (item.qty / totalQuarterBottles) * 100 : 0;
                const topBrandName = Object.entries(item.brandBreakdown).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '-';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {item.period}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {item.year}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {item.qty.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {sharePct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.qoqGrowth !== undefined ? (
                        <span className={`inline-flex items-center gap-0.5 font-semibold ${
                          item.qoqGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {item.qoqGrowth >= 0 ? '+' : ''}{item.qoqGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {item.yoyGrowth !== undefined ? (
                        <span className={`inline-flex items-center gap-0.5 font-semibold ${
                          item.yoyGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {item.yoyGrowth >= 0 ? '+' : ''}{item.yoyGrowth.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                        {topBrandName}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
