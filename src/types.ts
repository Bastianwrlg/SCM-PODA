export interface SalesRecord {
  bulan: string;
  tahun: number;
  distributor: string;
  kota: string;
  prinsipal: string;
  produk: string;
  brand: string;
  jenis: string;
  ukuran: string;
  qty: number;
  monthNum: number;
  quarter: string;
}

export type MenuType = 'SCM' | 'Sales';

export type SubMenuType = 
  | 'forecasting'
  | 'sales_order'
  | 'quarterly_sales'
  | 'city_distri_principal'
  | 'brand_volume'
  | 'product_percentage'
  | 'total_bottles';

export interface FilterState {
  years: number[];
  prinsipals: string[];
  brands: string[];
  jenisList: string[];
  ukuranList: string[];
  kotaList: string[];
  distributorList: string[];
  selectedKota?: string;
  selectedDistributor?: string;
  searchQuery: string;
}

export interface KPIStats {
  totalBottles: number;
  totalVolumeLiters: number;
  totalSKUs: number;
  totalDistributors: number;
  totalCities: number;
  avgMonthlyBottles: number;
  growthYoY: number;
  topBrand: string;
  topProduct: string;
  topCity: string;
}

export interface QuarterlySummary {
  quarter: string;
  year: number;
  period: string; // e.g. "2024 Q1"
  qty: number;
  yoyGrowth?: number;
  qoqGrowth?: number;
  brandBreakdown: Record<string, number>;
  jenisBreakdown: Record<string, number>;
}

export interface ProductShareItem {
  produk: string;
  brand: string;
  jenis: string;
  ukuran: string;
  totalQty: number;
  percentage: number;
  cumulativePercentage: number;
  paretoClass: 'A' | 'B' | 'C';
  yearlyQty: Record<number, number>;
}

export interface ForecastItem {
  period: string;
  actual?: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  isProjected: boolean;
}

export interface SafetyStockCalculation {
  product: string;
  brand: string;
  avgMonthlyDemand: number;
  dailyDemand: number;
  stdDevDemand: number;
  leadTimeDays: number;
  serviceLevel: number;
  zScore: number;
  safetyStock: number;
  reorderPoint: number;
  currentStockEstimate: number;
  stockStatus: 'Safe' | 'Warning' | 'Critical Reorder';
  runwayDays: number;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  bulan: string;
  tahun: number;
  distributor: string;
  kota: string;
  prinsipal: string;
  produk: string;
  brand: string;
  ukuran: string;
  qty: number;
  status: 'Delivered' | 'In-Transit' | 'Processing' | 'Scheduled';
}
