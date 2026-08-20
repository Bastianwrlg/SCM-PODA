import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Box, 
  Search, 
  Building2, 
  MapPin, 
  FileText,
  Filter
} from 'lucide-react';
import { SalesRecord, OrderItem } from '../../types';
import { generateSalesOrders } from '../../data/dataService';
import { MetricCard } from '../../components/MetricCard';

interface SalesOrderViewProps {
  data: SalesRecord[];
}

export const SalesOrderView: React.FC<SalesOrderViewProps> = ({ data }) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchOrder, setSearchOrder] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const { orders, orderMetrics } = useMemo(() => {
    return generateSalesOrders(data);
  }, [data]);

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      if (statusFilter !== 'All' && ord.status !== statusFilter) return false;
      if (searchOrder) {
        const q = searchOrder.toLowerCase();
        return (
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.distributor.toLowerCase().includes(q) ||
          ord.kota.toLowerCase().includes(q) ||
          ord.produk.toLowerCase().includes(q) ||
          ord.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, statusFilter, searchOrder]);

  const statusPieData = useMemo(() => {
    return [
      { name: 'Delivered', value: orderMetrics.deliveredCount, color: '#10b981' },
      { name: 'In-Transit', value: orderMetrics.inTransitCount, color: '#3b82f6' },
      { name: 'Processing', value: orderMetrics.processingCount, color: '#f59e0b' }
    ];
  }, [orderMetrics]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              SCM Module
            </span>
            <h1 className="text-xl font-bold text-slate-900">Sales Order & Fulfillment Pipeline</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen order penjualan distributor, monitoring status pengiriman, dan logistik batch delivery.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-so-total"
          title="Total Sales Orders"
          value={orders.length.toLocaleString()}
          subtitle={`Rata-rata ${orderMetrics.avgOrderQty.toLocaleString()} botol/order`}
          icon={ShoppingBag}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <MetricCard
          id="kpi-so-fulfillment"
          title="Fulfillment Rate"
          value={`${orderMetrics.fulfillmentRate}%`}
          subtitle="Pesanan terkirim & dalam perjalanan"
          change={orderMetrics.fulfillmentRate}
          changeLabel="Tingkat Pemenuhan"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          id="kpi-so-transit"
          title="Dalam Pengiriman (In-Transit)"
          value={`${orderMetrics.inTransitCount} Order`}
          subtitle="Dalam rute armada logistik"
          icon={Truck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <MetricCard
          id="kpi-so-processing"
          title="Antrian Packaging & Proses"
          value={`${orderMetrics.processingCount} Order`}
          subtitle="Proses batching di warehouse"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Visual Analytics Row: Top Ordering Distributors & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Ordering Distributors Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Top Distributor Pembelian Terbesar</h2>
              <p className="text-xs text-slate-500">Volume pesanan kumulatif mitra distributor</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderMetrics.topDistributors.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="distributor" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={110} />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString()} botol`, 'Total Order']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="totalQty" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fulfillment Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Distribusi Status Order</h2>
            <p className="text-xs text-slate-500 mb-3">Persentase status logistik pesanan</p>
            
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val} orders`, 'Jumlah']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value} order ({Math.round((item.value / orders.length) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Daftar Sales Orders & Dispatch Log</h2>
            <p className="text-xs text-slate-500">Record transaksi order keluar per distributor</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              {['All', 'Delivered', 'In-Transit', 'Processing'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'All' ? 'Semua Status' : st}
                </button>
              ))}
            </div>

            {/* Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari order..."
                value={searchOrder}
                onChange={(e) => setSearchOrder(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">No. Sales Order</th>
                <th className="py-2.5 px-3">Tanggal / Periode</th>
                <th className="py-2.5 px-3">Distributor</th>
                <th className="py-2.5 px-3">Kota</th>
                <th className="py-2.5 px-3">Prinsipal</th>
                <th className="py-2.5 px-3">Item Produk & Brand</th>
                <th className="py-2.5 px-3 text-right">Kuantitas</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.slice(0, 15).map((ord) => (
                <tr 
                  key={ord.id} 
                  onClick={() => setSelectedOrder(ord)}
                  className="hover:bg-indigo-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-indigo-700">
                    {ord.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {ord.date}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {ord.distributor}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {ord.kota}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {ord.prinsipal}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900">
                    <div className="font-medium">{ord.produk}</div>
                    <div className="text-[10px] text-slate-400">{ord.brand} · {ord.ukuran}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {ord.qty.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">btl</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : ord.status === 'In-Transit'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Menampilkan {Math.min(15, filteredOrders.length)} dari {filteredOrders.length} order</span>
          <span>Klik baris order untuk melihat detail pengiriman</span>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Distributor:</span>
                  <span className="font-bold text-slate-800">{selectedOrder.distributor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi Tujuan:</span>
                  <span className="font-medium text-slate-700">{selectedOrder.kota}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prinsipal:</span>
                  <span className="font-medium text-slate-700">{selectedOrder.prinsipal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Order:</span>
                  <span className="font-mono text-slate-700">{selectedOrder.date}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-900 font-medium">{selectedOrder.produk}</span>
                  <span className="text-indigo-700 font-bold font-mono">{selectedOrder.qty.toLocaleString()} Botol</span>
                </div>
                <div className="text-[11px] text-indigo-600">
                  Brand: {selectedOrder.brand} | Kemasan: {selectedOrder.ukuran} | Estimasi: {Math.ceil(selectedOrder.qty / 50)} Karton (@50 btl)
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status Pengiriman:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedOrder.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedOrder.status === 'In-Transit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
