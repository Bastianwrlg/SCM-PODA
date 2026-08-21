import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Boxes, 
  TrendingUp, 
  Droplet, 
  PieChart as PieIcon, 
  Layers,
  Award,
  Sparkles
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getBrandVolumeBreakdown } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface BrandVolumeViewProps {
  data: SalesRecord[];
}

export const BrandVolumeView: React.FC<BrandVolumeViewProps> = ({ data }) => {
  const [metricUnit, setMetricUnit] = useState<'bottles' | 'liters'>('bottles');

  const brandBreakdowns = useMemo(() => {
    return getBrandVolumeBreakdown(data);
  }, [data]);

  const grandTotals = useMemo(() => {
    let totalBottles = 0;
    let totalLiters = 0;
    const sizeMap: Record<string, { bottles: number; liters: number }> = {
      '15ML': { bottles: 0, liters: 0 },
      '30ML': { bottles: 0, liters: 0 },
      '60ML': { bottles: 0, liters: 0 }
    };

    brandBreakdowns.forEach(b => {
      totalBottles += b.totalBottles;
      totalLiters += b.totalLiters;
      b.volumeBreakdown.forEach(v => {
        if (!sizeMap[v.ukuran]) {
          sizeMap[v.ukuran] = { bottles: 0, liters: 0 };
        }
        sizeMap[v.ukuran].bottles += v.qty;
        sizeMap[v.ukuran].liters += v.liters;
      });
    });

    return { totalBottles, totalLiters, sizeMap };
  }, [brandBreakdowns]);

  // Brand comparison chart data
  const brandComparisonData = useMemo(() => {
    return brandBreakdowns.map(b => {
      const vol15 = b.volumeBreakdown.find(v => v.ukuran === '15ML')?.qty || 0;
      const vol30 = b.volumeBreakdown.find(v => v.ukuran === '30ML')?.qty || 0;
      const vol60 = b.volumeBreakdown.find(v => v.ukuran === '60ML')?.qty || 0;

      const lit15 = (vol15 * 15) / 1000;
      const lit30 = (vol30 * 30) / 1000;
      const lit60 = (vol60 * 60) / 1000;

      return {
        brand: b.brand,
        '15ML': metricUnit === 'bottles' ? vol15 : Math.round(lit15),
        '30ML': metricUnit === 'bottles' ? vol30 : Math.round(lit30),
        '60ML': metricUnit === 'bottles' ? vol60 : Math.round(lit60),
        total: metricUnit === 'bottles' ? b.totalBottles : b.totalLiters
      };
    });
  }, [brandBreakdowns, metricUnit]);

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
              Volume per Brand
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analisis preferensi kemasan volume botol (15ML, 30ML, 60ML) dan total liter cairan per brand.
          </p>
        </div>

        {/* Metric toggle: bottles vs liters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMetricUnit('bottles')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              metricUnit === 'bottles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satuan: Botol (Pcs)
          </button>
          <button
            onClick={() => setMetricUnit('liters')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              metricUnit === 'liters' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satuan: Liter (L)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-bv-total"
          title="Total Penjualan Botol"
          value={`${grandTotals.totalBottles.toLocaleString()} botol`}
          subtitle="Akumulasi seluruh brand"
          icon={Boxes}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-bv-liters"
          title="Total Volume Cairan"
          value={`${grandTotals.totalLiters.toLocaleString()} Liter`}
          subtitle="Setara total volume likuid terdistribusi"
          icon={Droplet}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
        />
        <MetricCard
          id="kpi-bv-topsize"
          title="Kemasan Paling Populer"
          value="30ML"
          subtitle={`${grandTotals.sizeMap['30ML']?.bottles.toLocaleString()} botol (${Math.round((grandTotals.sizeMap['30ML']?.bottles / grandTotals.totalBottles) * 100)}%)`}
          icon={Award}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-bv-brands"
          title="Brand Utama"
          value={`${brandBreakdowns.length} Brand`}
          subtitle={`Dominan: ${brandBreakdowns[0]?.brand || '-'}`}
          icon={Layers}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
      </div>

      {/* Chart: Brand by Size Volume */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Distribusi Volume Kemasan per Brand ({metricUnit === 'bottles' ? 'Jumlah Botol' : 'Total Liter'})
            </h2>
            <p className="text-xs text-slate-500">
              Komparasi proporsi botol 15ML, 30ML, dan 60ML untuk setiap brand
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={brandComparisonData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="brand" tick={{ fontSize: 12, fill: '#334155', fontWeight: 'bold' }} tickMargin={8} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(val: any, name: string) => [
                  `${Number(val).toLocaleString()} ${metricUnit === 'bottles' ? 'botol' : 'L'}`,
                  `Ukuran ${name}`
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="15ML" fill="#06b6d4" radius={[4, 4, 0, 0]} name="15ML" />
              <Bar dataKey="30ML" fill="#4f46e5" radius={[4, 4, 0, 0]} name="30ML" />
              <Bar dataKey="60ML" fill="#f59e0b" radius={[4, 4, 0, 0]} name="60ML" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand Cards with 3-Year Trend Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandBreakdowns.map((b) => (
          <div key={b.brand} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Brand Portfolio
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{b.brand}</h3>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {b.totalBottles.toLocaleString()} <span className="text-xs text-slate-400 font-normal">btl</span>
                </div>
                <div className="text-[11px] text-cyan-700 font-semibold font-mono">
                  {b.totalLiters.toLocaleString()} Liter
                </div>
              </div>
            </div>

            {/* Volume Breakdown Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {b.volumeBreakdown.map((v) => (
                <div key={v.ukuran} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[11px] font-bold text-slate-600">{v.ukuran}</div>
                  <div className="text-xs font-bold text-slate-900 font-mono mt-0.5">{v.qty.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{v.pct.toFixed(1)}% Share</div>
                </div>
              ))}
            </div>

            {/* Yearly Trend 2024-2026 */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Tren Tahunan (2024 - 2026)
              </span>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="py-1">Tahun</th>
                    <th className="py-1 text-right">15ML</th>
                    <th className="py-1 text-right">30ML</th>
                    <th className="py-1 text-right">60ML</th>
                    <th className="py-1 text-right font-bold text-slate-700">Total Botol</th>
                    <th className="py-1 text-right text-cyan-700 font-bold">Liter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-mono">
                  {b.yearlyTrends.map(yt => (
                    <tr key={yt.year} className="hover:bg-slate-50">
                      <td className="py-1 font-bold text-slate-800">{yt.year}</td>
                      <td className="py-1 text-right text-slate-600">{yt.vol15ml.toLocaleString()}</td>
                      <td className="py-1 text-right text-slate-600">{yt.vol30ml.toLocaleString()}</td>
                      <td className="py-1 text-right text-slate-600">{yt.vol60ml.toLocaleString()}</td>
                      <td className="py-1 text-right font-bold text-slate-900">{yt.totalQty.toLocaleString()}</td>
                      <td className="py-1 text-right text-cyan-700 font-semibold">{yt.totalLiters.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
