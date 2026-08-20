import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  BarChart3, 
  Layers, 
  PieChart, 
  MapPin, 
  Package, 
  Boxes,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { MenuType, SubMenuType } from '../types';

interface SidebarProps {
  activeMenu: MenuType;
  activeSubMenu: SubMenuType;
  onSelect: (menu: MenuType, subMenu: SubMenuType) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  activeSubMenu,
  onSelect,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    {
      menu: 'SCM' as MenuType,
      label: 'SCM',
      badge: 'Supply Chain',
      items: [
        {
          id: 'forecasting' as SubMenuType,
          label: 'Forecasting',
          desc: 'Demand prediction & ROP',
          icon: TrendingUp
        },
        {
          id: 'sales_order' as SubMenuType,
          label: 'Sales Order',
          desc: 'Order pipeline & fulfillment',
          icon: ShoppingBag,
          badge: 'Live Status'
        }
      ]
    },
    {
      menu: 'Sales' as MenuType,
      label: 'SALES',
      badge: 'Analytics',
      items: [
        {
          id: 'quarterly_sales' as SubMenuType,
          label: 'JUMLAH PENJUALAN PER QUARTER (3 TAHUN)',
          desc: 'Quarterly trends & YoY comparison',
          icon: BarChart3
        },
        {
          id: 'city_distri_principal' as SubMenuType,
          label: 'JUMLAH PENJUALAN PER SEGMEN KOTA PER DISTRI PER PRINSIPAL',
          desc: 'Multi-tier matrix & drilldowns',
          icon: MapPin
        },
        {
          id: 'brand_volume' as SubMenuType,
          label: 'JUMLAH PENJUALAN PER BRAND PER VOLUME (3 TAHUN)',
          desc: '15ml, 30ml, 60ml & liter metrics',
          icon: Boxes
        },
        {
          id: 'product_percentage' as SubMenuType,
          label: 'Presentase per produk 3 tahun',
          desc: 'Pareto 80/20 & market share',
          icon: PieChart
        },
        {
          id: 'total_bottles' as SubMenuType,
          label: 'Total penjualan per botol 3 tahun',
          desc: '3.6M+ bottle volume & heatmaps',
          icon: Package
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-40 lg:z-10 h-screen lg:h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          {navItems.map((section) => (
            <div key={section.menu} className="space-y-1.5">
              
              {/* Section Heading */}
              <div className="px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {section.label}
                </span>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {section.badge}
                </span>
              </div>

              {/* Sub-menu items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubMenu === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => {
                        onSelect(section.menu, item.id);
                        onCloseMobile();
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-start gap-3 group relative cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/60'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`truncate font-semibold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                              isActive ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {item.desc}
                        </p>
                      </div>

                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Footer info card */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Year Dataset</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Data mencakup periode 2024 - 2026 dari Google Spreadsheet terintegrasi.
          </p>
        </div>
      </aside>
    </>
  );
};
