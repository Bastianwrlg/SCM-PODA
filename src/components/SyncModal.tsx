import React from 'react';
import { X, Database, CheckCircle2, ExternalLink, RefreshCw, Layers, MapPin, Building2, Package } from 'lucide-react';
import { GOOGLE_SHEET_URL } from '../data/dataService';
import { KPIStats } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastSynced: Date | null;
  totalRecords: number;
  isSyncing: boolean;
  onSync: () => void;
  kpis: KPIStats;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  lastSynced,
  totalRecords,
  isSyncing,
  onSync,
  kpis
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Google Sheets Data Connection</h3>
              <p className="text-xs text-slate-500">Live synchronization with source spreadsheet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Status Alert */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Connection Active & Healthy</p>
              <p className="mt-0.5 text-emerald-700 leading-relaxed">
                Successfully indexed {totalRecords.toLocaleString()} rows spanning 2024 to 2026.
              </p>
            </div>
          </div>

          {/* Source Link details */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Source Document Link</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 break-all font-mono">
              <span className="truncate flex-1">{GOOGLE_SHEET_URL}</span>
              <a
                href={GOOGLE_SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 shrink-0 font-sans font-medium flex items-center gap-1"
              >
                Open <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900">{kpis.totalSKUs} Produk</div>
                <div className="text-slate-500">Unique SKUs</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900">{kpis.totalDistributors} Distributor</div>
                <div className="text-slate-500">Mitra Distribusi</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900">{kpis.totalCities} Kota / Region</div>
                <div className="text-slate-500">Cakupan Area</div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-slate-500" />
              <div>
                <div className="font-semibold text-slate-900">{kpis.totalBottles.toLocaleString()} Botol</div>
                <div className="text-slate-500">Total 3 Tahun</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Last refreshed: {lastSynced ? lastSynced.toLocaleTimeString('id-ID') : 'Just now'}</span>
            <span>Tab: GID 2105431595</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onSync();
              onClose();
            }}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Sekarang'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
