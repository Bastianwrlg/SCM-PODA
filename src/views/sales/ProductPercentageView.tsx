import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  PieChart as PieIcon, 
  Award, 
  TrendingUp, 
  Search, 
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { SalesRecord } from '../../types';
import { getProductPercentage } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface ProductPercentageViewProps {
  data: SalesRecord[];
}

export const ProductPercentageView: React.FC<ProductPercentageViewProps> = ({ data }) => {
  const [selectedClass, setSelectedClass] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'totalQty' | 'percentage' | 'produk'>('totalQty');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const { products, paretoSummary } = useMemo(() => {
    return getProductPercentage(data);
  }, [data]);

  const grandTotal = useMemo(() => {
    return products.reduce((acc, p) => acc + p.totalQty, 0);
  }, [products]);

  // Top 10 products for Pareto Chart
  const top10Data = useMemo(() => {
    return products.slice(0, 10).map(p => ({
      name: p.produk.length > 15 ? p.produk.slice(0, 14) + '..' : p.produk,
      fullName: p.produk,
      brand: p.brand,
      qty: p.totalQty,
      percentage: p.percentage,
      cumulative: p.cumulativePercentage
    }));
  }, [products]);

  // Filtered and sorted products for table
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        if (selectedClass !== 'ALL' && p.paretoClass !== selectedClass) return false;
        if (searchFilter) {
          const q = searchFilter.toLowerCase();
          return (
            p.produk.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.jenis.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'totalQty') diff = b.totalQty - a.totalQty;
        else if (sortBy === 'percentage') diff = b.percentage - a.percentage;
        else diff = a.produk.localeCompare(b.produk);
        return sortAsc ? -diff : diff;
      });
  }, [products, selectedClass, searchFilter, sortBy, sortAsc]);

  const handleSort = (field: 'totalQty' | 'percentage' | 'produk') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const paretoPieData = useMemo(() => {
    return [
      { name: `Kelas A (${paretoSummary.classA.count} SKU)`, value: paretoSummary.classA.qty, color: '#4f46e5' },
      { name: `Kelas B (${paretoSummary.classB.count} SKU)`, value: paretoSummary.classB.qty, color: '#f59e0b' },
      { name: `Kelas C (${paretoSummary.classC.count} SKU)`, value: paretoSummary.classC.qty, color: '#94a3b8' }
    ];
  }, [paretoSummary]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Sales Analytics
            </span>
            <h1 className="text-xl font-bold text-slate-900">Presentase Produk</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analisis kontribusi pangsa pasar produk, rasio Pareto (80/20), dan peringkat volume per SKU.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-pp-total"
          title="Total Portofolio SKU"
          value={`${products.length} Produk`}
          subtitle="Katalog aktif terdaftar"
          icon={Layers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-pp-classA"
          title="Produk Kelas A (Top 80%)"
          value={`${paretoSummary.classA.count} SKU (${paretoSummary.classA.pct.toFixed(0)}%)`}
          subtitle="Penyumbang 80% omset volume utama"
          icon={Award}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-pp-top1"
          title="Produk #1 Terlaris"
          value={products[0]?.produk || '-'}
          subtitle={`${products[0]?.totalQty.toLocaleString()} botol (${products[0]?.percentage.toFixed(1)}% Share)`}
          icon={Sparkles}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <MetricCard
          id="kpi-pp-classBC"
          title="Produk Kelas B & C"
          value={`${paretoSummary.classB.count + paretoSummary.classC.count} SKU`}
          subtitle="Produk varian sekunder & niche"
          icon={PieIcon}
          iconColor="text-slate-600"
          iconBg="bg-slate-100"
        />
      </div>

      {/* Visual Pareto Chart (Bar + Cumulative Line) & Class Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pareto Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Grafik Pareto Top 10 Produk & Kurva Kumulatif (%)
              </h2>
              <p className="text-xs text-slate-500">
                Batang biru = Volume Penjualan, Garis Oranye = Persentase Kumulatif
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={top10Data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#475569' }} 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#f59e0b' }} 
                  tickFormatter={(v) => `${v}%`} 
                />
                <Tooltip 
                  formatter={(val: any, name: string) => {
                    if (name === 'Volume') return [`${Number(val).toLocaleString()} botol`, 'Penjualan'];
                    if (name === 'Kumulatif') return [`${val}%`, 'Kumulatif Share'];
                    return [val, name];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar yAxisId="left" dataKey="qty" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Volume" />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Kumulatif" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto ABC Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Klasifikasi Pareto ABC</h2>
            <p className="text-xs text-slate-500 mb-3">Distribusi volume berdasarkan klasifikasi</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paretoPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paretoPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${Number(val).toLocaleString()} botol`, 'Total']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Kelas A (Top 80%)
              </span>
              <span className="font-mono font-bold text-slate-800">{paretoSummary.classA.count} SKU ({paretoSummary.classA.pct.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kelas B (Next 15%)
              </span>
              <span className="font-mono font-bold text-slate-800">{paretoSummary.classB.count} SKU ({paretoSummary.classB.pct.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Kelas C (Tail 5%)
              </span>
              <span className="font-mono font-bold text-slate-800">{paretoSummary.classC.count} SKU ({paretoSummary.classC.pct.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Full Product Ranking Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Peringkat & Persentase Kontribusi per Produk
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredProducts.length} produk terdaftar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pareto Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {['ALL', 'A', 'B', 'C'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls as any)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls === 'ALL' ? 'Semua Kelas' : `Kelas ${cls}`}
                </button>
              ))}
            </div>

            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                <th 
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('produk')}
                >
                  <div className="flex items-center gap-1">
                    Nama Produk <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3">Jenis & Ukuran</th>
                <th className="py-2.5 px-3 text-right font-mono">2024</th>
                <th className="py-2.5 px-3 text-right font-mono">2025</th>
                <th className="py-2.5 px-3 text-right font-mono">2026</th>
                <th 
                  className="py-2.5 px-3 text-right font-mono cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('totalQty')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total Penjualan <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  className="py-2.5 px-3 text-right font-mono cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort('percentage')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Share (%) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right font-mono">Kumulatif (%)</th>
                <th className="py-2.5 px-3 text-center">Pareto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.slice(0, 20).map((prod, idx) => (
                <tr key={prod.produk} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {prod.produk}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800">
                      {prod.brand}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {prod.jenis} · {prod.ukuran}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {prod.yearlyQty[2024]?.toLocaleString() || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {prod.yearlyQty[2025]?.toLocaleString() || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {prod.yearlyQty[2026]?.toLocaleString() || 0}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {prod.totalQty.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">
                    {prod.percentage.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {prod.cumulativePercentage.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.paretoClass === 'A'
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : prod.paretoClass === 'B'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      Kelas {prod.paretoClass}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 20 && (
          <div className="text-center text-xs text-slate-400 pt-1">
            Menampilkan 20 teratas dari total {filteredProducts.length} produk.
          </div>
        )}

      </div>

    </div>
  );
};
