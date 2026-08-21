import Papa from 'papaparse';
import { SalesRecord, FilterState, KPIStats, QuarterlySummary, ProductShareItem, ForecastItem, SafetyStockCalculation, OrderItem } from '../types';

export const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1_Kxh3RVSltmTU__Kd_QamKgUo9Xcjl2fee9B9mBcH8w/edit?gid=2105431595#gid=2105431595";
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1_Kxh3RVSltmTU__Kd_QamKgUo9Xcjl2fee9B9mBcH8w/export?format=csv&gid=2105431595";
export const LOCAL_FALLBACK_CSV_URL = "/sales_data.csv";

export const MONTH_MAP: Record<string, number> = {
  'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
  'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
  'september': 9, 'oktober': 10, 'november': 11, 'desember': 12,
  'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
  'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
};

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

let cachedRecords: SalesRecord[] | null = null;
let lastFetchTime: Date | null = null;

export async function fetchSalesData(forceRefresh = false): Promise<SalesRecord[]> {
  if (cachedRecords && !forceRefresh) {
    return cachedRecords;
  }

  let csvText = '';
  let source = 'live';

  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    csvText = await res.text();
    if (!csvText || csvText.length < 100 || !csvText.includes('TAHUN')) {
      throw new Error('Invalid live spreadsheet response');
    }
  } catch (err) {
    console.warn('Live Google Sheet fetch failed, using local bundled CSV cache:', err);
    source = 'local';
    const fallbackRes = await fetch(LOCAL_FALLBACK_CSV_URL);
    csvText = await fallbackRes.text();
  }

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  const records: SalesRecord[] = [];

  for (const raw of parsed.data as any[]) {
    // Standardize column keys
    const getVal = (keyNames: string[]) => {
      for (const k of Object.keys(raw)) {
        const cleanK = k.trim().toUpperCase();
        for (const target of keyNames) {
          if (cleanK === target || cleanK.includes(target)) {
            return String(raw[k] || '').trim();
          }
        }
      }
      return '';
    };

    const bulanRaw = getVal(['BULAN', 'MONTH']);
    const tahunRaw = getVal(['TAHUN', 'YEAR']);
    const distri = getVal(['DISTRIBUTOR', 'DISTRI']) || 'Unassigned';
    const kota = getVal(['KOTA', 'CITY']) || 'Unassigned';
    const prinsipal = getVal(['PRINSIPAL', 'PRINCIPAL']) || 'Unassigned';
    const produk = getVal(['PRODUK', 'PRODUCT']);
    const brand = getVal(['BRAND']) || 'Other';
    const jenis = getVal(['JENIS', 'TYPE']) || 'Other';
    const ukuran = getVal(['UKURAN', 'SIZE', 'VOLUME']) || '30ML';
    const qtyStr = getVal(['QTY', 'QUANTITY', 'JUMLAH']);

    const qty = parseInt(qtyStr.replace(/[^0-9-]/g, '')) || 0;
    const tahun = parseInt(tahunRaw) || 2024;
    const bulanNormalized = bulanRaw.charAt(0).toUpperCase() + bulanRaw.slice(1).toLowerCase();
    const monthNum = MONTH_MAP[bulanRaw.toLowerCase()] || 1;
    const quarter = `Q${Math.ceil(monthNum / 3)}`;

    if (qty > 0 && produk) {
      records.push({
        bulan: bulanNormalized || MONTH_NAMES[monthNum - 1],
        tahun,
        distributor: distri,
        kota,
        prinsipal,
        produk,
        brand,
        jenis,
        ukuran: ukuran.toUpperCase(),
        qty,
        monthNum,
        quarter
      });
    }
  }

  cachedRecords = records;
  lastFetchTime = new Date();
  console.log(`Loaded ${records.length} records successfully from ${source} source.`);
  return records;
}

export function getLastFetchTime(): Date | null {
  return lastFetchTime;
}

export function filterSalesData(data: SalesRecord[], filter: FilterState): SalesRecord[] {
  return data.filter(item => {
    if (filter.years?.length > 0 && !filter.years.includes(item.tahun)) return false;
    if (filter.prinsipals?.length > 0 && !filter.prinsipals.includes(item.prinsipal)) return false;
    if (filter.brands?.length > 0 && !filter.brands.includes(item.brand)) return false;
    if (filter.jenisList?.length > 0 && !filter.jenisList.includes(item.jenis)) return false;
    if (filter.ukuranList?.length > 0 && !filter.ukuranList.includes(item.ukuran)) return false;
    if (filter.kotaList?.length > 0 && !filter.kotaList.includes(item.kota)) return false;
    if (filter.selectedKota && item.kota !== filter.selectedKota) return false;
    if (filter.distributorList?.length > 0 && !filter.distributorList.includes(item.distributor)) return false;
    if (filter.selectedDistributor && item.distributor !== filter.selectedDistributor) return false;
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      const match = 
        item.produk.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.distributor.toLowerCase().includes(q) ||
        item.kota.toLowerCase().includes(q) ||
        item.prinsipal.toLowerCase().includes(q) ||
        item.jenis.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function computeKPIs(data: SalesRecord[]): KPIStats {
  let totalBottles = 0;
  let totalVolumeLiters = 0;
  const skus = new Set<string>();
  const distris = new Set<string>();
  const cities = new Set<string>();
  const brandQty: Record<string, number> = {};
  const productQty: Record<string, number> = {};
  const cityQty: Record<string, number> = {};
  const yearQty: Record<number, number> = {};

  for (const item of data) {
    totalBottles += item.qty;
    
    // Volume calculation: 15ML -> 0.015L, 30ML -> 0.03L, 60ML -> 0.06L
    let ml = 30;
    if (item.ukuran.includes('15')) ml = 15;
    else if (item.ukuran.includes('60')) ml = 60;
    totalVolumeLiters += (item.qty * ml) / 1000;

    skus.add(item.produk);
    if (item.distributor !== 'Unassigned') distris.add(item.distributor);
    if (item.kota !== 'Unassigned') cities.add(item.kota);

    brandQty[item.brand] = (brandQty[item.brand] || 0) + item.qty;
    productQty[item.produk] = (productQty[item.produk] || 0) + item.qty;
    if (item.kota !== 'Unassigned') {
      cityQty[item.kota] = (cityQty[item.kota] || 0) + item.qty;
    }
    yearQty[item.tahun] = (yearQty[item.tahun] || 0) + item.qty;
  }

  const topBrand = Object.entries(brandQty).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const topProduct = Object.entries(productQty).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
  const topCity = Object.entries(cityQty).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Calculate YoY growth if data has 2024 and 2025
  const q24 = yearQty[2024] || 0;
  const q25 = yearQty[2025] || 0;
  const growthYoY = q24 > 0 ? ((q25 - q24) / q24) * 100 : 0;

  return {
    totalBottles,
    totalVolumeLiters: Math.round(totalVolumeLiters),
    totalSKUs: skus.size,
    totalDistributors: distris.size,
    totalCities: cities.size,
    avgMonthlyBottles: Math.round(totalBottles / 36), // 3 years = 36 months
    growthYoY,
    topBrand,
    topProduct,
    topCity
  };
}

// 1. QUARTERLY SUMMARY (3 YEARS)
export function getQuarterlySummary(data: SalesRecord[]): QuarterlySummary[] {
  const quartersMap: Record<string, {
    year: number;
    quarter: string;
    qty: number;
    brandBreakdown: Record<string, number>;
    jenisBreakdown: Record<string, number>;
  }> = {};

  const years = [2024, 2025, 2026];
  const qtrs = ['Q1', 'Q2', 'Q3', 'Q4'];

  for (const y of years) {
    for (const q of qtrs) {
      const key = `${y} ${q}`;
      quartersMap[key] = {
        year: y,
        quarter: q,
        qty: 0,
        brandBreakdown: {},
        jenisBreakdown: {}
      };
    }
  }

  for (const item of data) {
    const key = `${item.tahun} ${item.quarter}`;
    if (!quartersMap[key]) {
      quartersMap[key] = {
        year: item.tahun,
        quarter: item.quarter,
        qty: 0,
        brandBreakdown: {},
        jenisBreakdown: {}
      };
    }
    quartersMap[key].qty += item.qty;
    quartersMap[key].brandBreakdown[item.brand] = (quartersMap[key].brandBreakdown[item.brand] || 0) + item.qty;
    quartersMap[key].jenisBreakdown[item.jenis] = (quartersMap[key].jenisBreakdown[item.jenis] || 0) + item.qty;
  }

  const result: QuarterlySummary[] = [];
  const sortedKeys = Object.keys(quartersMap).sort((a, b) => {
    const [yA, qA] = a.split(' ');
    const [yB, qB] = b.split(' ');
    if (yA !== yB) return parseInt(yA) - parseInt(yB);
    return qA.localeCompare(qB);
  });

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const item = quartersMap[key];
    const prevQKey = i > 0 ? sortedKeys[i - 1] : null;
    const prevYearKey = `${item.year - 1} ${item.quarter}`;

    const prevQQty = prevQKey ? quartersMap[prevQKey]?.qty : 0;
    const prevYearQty = quartersMap[prevYearKey]?.qty;

    const qoqGrowth = prevQQty && prevQQty > 0 ? ((item.qty - prevQQty) / prevQQty) * 100 : undefined;
    const yoyGrowth = prevYearQty && prevYearQty > 0 ? ((item.qty - prevYearQty) / prevYearQty) * 100 : undefined;

    result.push({
      period: key,
      year: item.year,
      quarter: item.quarter,
      qty: item.qty,
      qoqGrowth,
      yoyGrowth,
      brandBreakdown: item.brandBreakdown,
      jenisBreakdown: item.jenisBreakdown
    });
  }

  return result;
}

// 2. CITY x DISTRIBUTOR x PRINCIPAL BREAKDOWN
export interface PrincipalMatrix {
  prinsipal: string;
  totalQty: number;
  distributorCount: number;
  cityCount: number;
  distributors: {
    distributor: string;
    totalQty: number;
    cities: { kota: string; qty: number }[];
  }[];
  topCities: { kota: string; qty: number }[];
}

export function getCityDistriPrincipalMatrix(data: SalesRecord[]): PrincipalMatrix[] {
  const map: Record<string, {
    totalQty: number;
    distris: Record<string, {
      totalQty: number;
      cities: Record<string, number>;
    }>;
    cities: Record<string, number>;
  }> = {};

  for (const item of data) {
    const p = item.prinsipal || 'Unassigned';
    const d = item.distributor || 'Unassigned';
    const k = item.kota || 'Unassigned';

    if (!map[p]) {
      map[p] = { totalQty: 0, distris: {}, cities: {} };
    }
    map[p].totalQty += item.qty;
    map[p].cities[k] = (map[p].cities[k] || 0) + item.qty;

    if (!map[p].distris[d]) {
      map[p].distris[d] = { totalQty: 0, cities: {} };
    }
    map[p].distris[d].totalQty += item.qty;
    map[p].distris[d].cities[k] = (map[p].distris[d].cities[k] || 0) + item.qty;
  }

  return Object.entries(map).map(([prinsipal, pData]) => {
    const distributors = Object.entries(pData.distris)
      .map(([distributor, dData]) => ({
        distributor,
        totalQty: dData.totalQty,
        cities: Object.entries(dData.cities)
          .map(([kota, qty]) => ({ kota, qty }))
          .sort((a, b) => b.qty - a.qty)
      }))
      .sort((a, b) => b.totalQty - a.totalQty);

    const topCities = Object.entries(pData.cities)
      .map(([kota, qty]) => ({ kota, qty }))
      .sort((a, b) => b.qty - a.qty);

    return {
      prinsipal,
      totalQty: pData.totalQty,
      distributorCount: distributors.length,
      cityCount: topCities.length,
      distributors,
      topCities
    };
  }).sort((a, b) => b.totalQty - a.totalQty);
}

// 3. BRAND PER VOLUME (3 YEARS)
export interface BrandVolumeBreakdown {
  brand: string;
  totalBottles: number;
  totalLiters: number;
  volumeBreakdown: {
    ukuran: string;
    qty: number;
    liters: number;
    pct: number;
  }[];
  yearlyTrends: {
    year: number;
    vol15ml: number;
    vol30ml: number;
    vol60ml: number;
    totalQty: number;
    totalLiters: number;
  }[];
}

export function getBrandVolumeBreakdown(data: SalesRecord[]): BrandVolumeBreakdown[] {
  const brandMap: Record<string, {
    totalBottles: number;
    volumes: Record<string, number>;
    yearly: Record<number, Record<string, number>>;
  }> = {};

  for (const item of data) {
    const b = item.brand;
    const u = item.ukuran;
    const y = item.tahun;

    if (!brandMap[b]) {
      brandMap[b] = { totalBottles: 0, volumes: {}, yearly: { 2024: {}, 2025: {}, 2026: {} } };
    }
    brandMap[b].totalBottles += item.qty;
    brandMap[b].volumes[u] = (brandMap[b].volumes[u] || 0) + item.qty;

    if (!brandMap[b].yearly[y]) {
      brandMap[b].yearly[y] = {};
    }
    brandMap[b].yearly[y][u] = (brandMap[b].yearly[y][u] || 0) + item.qty;
  }

  return Object.entries(brandMap).map(([brand, bData]) => {
    let totalLiters = 0;
    const volumeBreakdown = Object.entries(bData.volumes).map(([ukuran, qty]) => {
      let ml = 30;
      if (ukuran.includes('15')) ml = 15;
      else if (ukuran.includes('60')) ml = 60;
      const liters = (qty * ml) / 1000;
      totalLiters += liters;
      const pct = bData.totalBottles > 0 ? (qty / bData.totalBottles) * 100 : 0;
      return { ukuran, qty, liters, pct };
    }).sort((a, b) => b.qty - a.qty);

    const yearlyTrends = [2024, 2025, 2026].map(year => {
      const yearVols = bData.yearly[year] || {};
      const vol15ml = yearVols['15ML'] || 0;
      const vol30ml = yearVols['30ML'] || 0;
      const vol60ml = yearVols['60ML'] || 0;
      const totalQty = vol15ml + vol30ml + vol60ml;
      const yLiters = (vol15ml * 15 + vol30ml * 30 + vol60ml * 60) / 1000;
      return {
        year,
        vol15ml,
        vol30ml,
        vol60ml,
        totalQty,
        totalLiters: Math.round(yLiters)
      };
    });

    return {
      brand,
      totalBottles: bData.totalBottles,
      totalLiters: Math.round(totalLiters),
      volumeBreakdown,
      yearlyTrends
    };
  }).sort((a, b) => b.totalBottles - a.totalBottles);
}

// 4. PRODUCT PERCENTAGE & PARETO ANALYSIS (3 YEARS)
export function getProductPercentage(data: SalesRecord[]): {
  products: ProductShareItem[];
  paretoSummary: {
    classA: { count: number; qty: number; pct: number };
    classB: { count: number; qty: number; pct: number };
    classC: { count: number; qty: number; pct: number };
  };
} {
  const prodMap: Record<string, {
    brand: string;
    jenis: string;
    ukuran: string;
    totalQty: number;
    yearlyQty: Record<number, number>;
  }> = {};

  let grandTotal = 0;

  for (const item of data) {
    grandTotal += item.qty;
    if (!prodMap[item.produk]) {
      prodMap[item.produk] = {
        brand: item.brand,
        jenis: item.jenis,
        ukuran: item.ukuran,
        totalQty: 0,
        yearlyQty: { 2024: 0, 2025: 0, 2026: 0 }
      };
    }
    prodMap[item.produk].totalQty += item.qty;
    prodMap[item.produk].yearlyQty[item.tahun] = (prodMap[item.produk].yearlyQty[item.tahun] || 0) + item.qty;
  }

  const sorted = Object.entries(prodMap)
    .map(([produk, pData]) => ({
      produk,
      brand: pData.brand,
      jenis: pData.jenis,
      ukuran: pData.ukuran,
      totalQty: pData.totalQty,
      percentage: grandTotal > 0 ? (pData.totalQty / grandTotal) * 100 : 0,
      yearlyQty: pData.yearlyQty
    }))
    .sort((a, b) => b.totalQty - a.totalQty);

  let cumulative = 0;
  let classAQty = 0, classBQty = 0, classCQty = 0;
  let classACount = 0, classBCount = 0, classCCount = 0;

  const products: ProductShareItem[] = sorted.map(item => {
    cumulative += item.percentage;
    let paretoClass: 'A' | 'B' | 'C' = 'C';
    if (cumulative <= 80 || (cumulative - item.percentage < 80)) {
      paretoClass = 'A';
      classAQty += item.totalQty;
      classACount++;
    } else if (cumulative <= 95 || (cumulative - item.percentage < 95)) {
      paretoClass = 'B';
      classBQty += item.totalQty;
      classBCount++;
    } else {
      paretoClass = 'C';
      classCQty += item.totalQty;
      classCCount++;
    }

    return {
      ...item,
      cumulativePercentage: Math.min(100, Math.round(cumulative * 100) / 100),
      paretoClass
    };
  });

  return {
    products,
    paretoSummary: {
      classA: { count: classACount, qty: classAQty, pct: grandTotal > 0 ? (classAQty / grandTotal) * 100 : 0 },
      classB: { count: classBCount, qty: classBQty, pct: grandTotal > 0 ? (classBQty / grandTotal) * 100 : 0 },
      classC: { count: classCCount, qty: classCQty, pct: grandTotal > 0 ? (classCQty / grandTotal) * 100 : 0 }
    }
  };
}

// 5. TOTAL BOTTLES METRICS (3 YEARS)
export interface BottleSalesMetric {
  totalBottles: number;
  yearlyTotals: { year: number; qty: number; sharePct: number; yoyGrowth?: number }[];
  monthlyHeatmap: {
    month: string;
    monthNum: number;
    year2024: number;
    year2025: number;
    year2026: number;
    total: number;
    avg: number;
  }[];
  sizeDistribution: { ukuran: string; qty: number; pct: number }[];
  jenisDistribution: { jenis: string; qty: number; pct: number }[];
  monthlyTimeline: { period: string; year: number; month: string; qty: number }[];
}

export function getTotalBottlesMetrics(data: SalesRecord[]): BottleSalesMetric {
  let totalBottles = 0;
  const yearlyMap: Record<number, number> = { 2024: 0, 2025: 0, 2026: 0 };
  const matrix: Record<number, Record<number, number>> = { 2024: {}, 2025: {}, 2026: {} };
  const sizeMap: Record<string, number> = {};
  const jenisMap: Record<string, number> = {};

  for (let m = 1; m <= 12; m++) {
    matrix[2024][m] = 0;
    matrix[2025][m] = 0;
    matrix[2026][m] = 0;
  }

  for (const item of data) {
    totalBottles += item.qty;
    yearlyMap[item.tahun] = (yearlyMap[item.tahun] || 0) + item.qty;
    if (matrix[item.tahun]) {
      matrix[item.tahun][item.monthNum] = (matrix[item.tahun][item.monthNum] || 0) + item.qty;
    }
    sizeMap[item.ukuran] = (sizeMap[item.ukuran] || 0) + item.qty;
    jenisMap[item.jenis] = (jenisMap[item.jenis] || 0) + item.qty;
  }

  const yearlyTotals = [2024, 2025, 2026].map((year, idx, arr) => {
    const qty = yearlyMap[year] || 0;
    const sharePct = totalBottles > 0 ? (qty / totalBottles) * 100 : 0;
    const prevYearQty = idx > 0 ? yearlyMap[arr[idx - 1]] : 0;
    const yoyGrowth = prevYearQty && prevYearQty > 0 ? ((qty - prevYearQty) / prevYearQty) * 100 : undefined;
    return { year, qty, sharePct, yoyGrowth };
  });

  const monthlyHeatmap = MONTH_NAMES.map((month, idx) => {
    const mNum = idx + 1;
    const y24 = matrix[2024][mNum] || 0;
    const y25 = matrix[2025][mNum] || 0;
    const y26 = matrix[2026][mNum] || 0;
    const sum = y24 + y25 + y26;
    return {
      month,
      monthNum: mNum,
      year2024: y24,
      year2025: y25,
      year2026: y26,
      total: sum,
      avg: Math.round(sum / 3)
    };
  });

  const monthlyTimeline: { period: string; year: number; month: string; qty: number }[] = [];
  for (const y of [2024, 2025, 2026]) {
    for (let m = 1; m <= 12; m++) {
      const q = matrix[y][m] || 0;
      if (q > 0 || y < 2026 || m <= 8) {
        monthlyTimeline.push({
          period: `${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`,
          year: y,
          month: MONTH_NAMES[m - 1],
          qty: q
        });
      }
    }
  }

  const sizeDistribution = Object.entries(sizeMap).map(([ukuran, qty]) => ({
    ukuran,
    qty,
    pct: totalBottles > 0 ? (qty / totalBottles) * 100 : 0
  })).sort((a, b) => b.qty - a.qty);

  const jenisDistribution = Object.entries(jenisMap).map(([jenis, qty]) => ({
    jenis,
    qty,
    pct: totalBottles > 0 ? (qty / totalBottles) * 100 : 0
  })).sort((a, b) => b.qty - a.qty);

  return {
    totalBottles,
    yearlyTotals,
    monthlyHeatmap,
    sizeDistribution,
    jenisDistribution,
    monthlyTimeline
  };
}

// 6. SCM FORECASTING & SAFETY STOCK ENGINE
export function calculateSCMForecast(
  data: SalesRecord[],
  horizonMonths = 6,
  alpha = 0.3, // smoothing factor
  leadTimeDays = 14,
  serviceLevelPct = 95
): {
  timeline: ForecastItem[];
  safetyStockList: SafetyStockCalculation[];
  metrics: { mape: number; mad: number; trackingSignal: number; reorderAlertCount: number };
} {
  // Aggregate historical monthly demand
  const monthlyTotals: { period: string; year: number; monthNum: number; qty: number }[] = [];
  const years = [2024, 2025, 2026];

  for (const y of years) {
    for (let m = 1; m <= 12; m++) {
      let q = 0;
      for (const item of data) {
        if (item.tahun === y && item.monthNum === m) {
          q += item.qty;
        }
      }
      monthlyTotals.push({
        period: `${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`,
        year: y,
        monthNum: m,
        qty: q
      });
    }
  }

  // Filter out any trailing zeros in future months
  const validHistory = monthlyTotals.filter(x => x.qty > 0);
  if (validHistory.length === 0) {
    return {
      timeline: [],
      safetyStockList: [],
      metrics: { mape: 0, mad: 0, trackingSignal: 0, reorderAlertCount: 0 }
    };
  }

  // Exponential Smoothing & Linear Trend Holt Method
  let level = validHistory[0].qty;
  let trend = (validHistory[Math.min(5, validHistory.length - 1)].qty - validHistory[0].qty) / Math.min(5, validHistory.length - 1);
  const beta = 0.15;

  const timeline: ForecastItem[] = [];
  let sumAbsError = 0;
  let sumPctError = 0;
  let sumError = 0;
  let errorCount = 0;

  for (let i = 0; i < validHistory.length; i++) {
    const actual = validHistory[i].qty;
    const forecastVal = Math.round(level + trend);
    const error = actual - forecastVal;

    if (i > 2) {
      sumAbsError += Math.abs(error);
      sumPctError += Math.abs(error) / (actual || 1);
      sumError += error;
      errorCount++;
    }

    const prevLevel = level;
    level = alpha * actual + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;

    timeline.push({
      period: validHistory[i].period,
      actual,
      forecast: forecastVal,
      lowerBound: Math.max(0, Math.round(forecastVal * 0.88)),
      upperBound: Math.round(forecastVal * 1.12),
      isProjected: false
    });
  }

  const mad = errorCount > 0 ? sumAbsError / errorCount : 0;
  const mape = errorCount > 0 ? (sumPctError / errorCount) * 100 : 0;
  const trackingSignal = mad > 0 ? sumError / mad : 0;

  // Project future months
  const lastItem = validHistory[validHistory.length - 1];
  let curYear = lastItem.year;
  let curMonth = lastItem.monthNum;

  for (let step = 1; step <= horizonMonths; step++) {
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }

    const futureForecast = Math.max(1000, Math.round(level + step * trend));
    const uncertaintyFactor = 0.08 + step * 0.02;

    timeline.push({
      period: `${MONTH_NAMES[curMonth - 1].slice(0, 3)} ${curYear}`,
      forecast: futureForecast,
      lowerBound: Math.max(0, Math.round(futureForecast * (1 - uncertaintyFactor))),
      upperBound: Math.round(futureForecast * (1 + uncertaintyFactor)),
      isProjected: true
    });
  }

  // Safety Stock & Reorder Point Calculation per Top Product
  const zScoreMap: Record<number, number> = { 90: 1.28, 95: 1.645, 99: 2.33 };
  const zScore = zScoreMap[serviceLevelPct] || 1.645;

  const productMonthly: Record<string, { brand: string; monthly: number[] }> = {};
  for (const item of data) {
    if (!productMonthly[item.produk]) {
      productMonthly[item.produk] = { brand: item.brand, monthly: new Array(36).fill(0) };
    }
    const idx = (item.tahun - 2024) * 12 + (item.monthNum - 1);
    if (idx >= 0 && idx < 36) {
      productMonthly[item.produk].monthly[idx] += item.qty;
    }
  }

  const safetyStockList: SafetyStockCalculation[] = Object.entries(productMonthly).map(([product, pInfo]) => {
    const nonZero = pInfo.monthly.filter(v => v > 0);
    const avgMonthlyDemand = nonZero.length > 0 ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    const dailyDemand = avgMonthlyDemand / 30;

    // Variance & StdDev
    const variance = nonZero.length > 1
      ? nonZero.reduce((acc, val) => acc + Math.pow(val - avgMonthlyDemand, 2), 0) / (nonZero.length - 1)
      : 0;
    const stdDevMonthly = Math.sqrt(variance);
    const stdDevDaily = stdDevMonthly / Math.sqrt(30);

    // Safety Stock = Z * sqrt(LeadTime) * StdDevDaily
    const safetyStock = Math.round(zScore * Math.sqrt(leadTimeDays) * stdDevDaily);
    // ROP = (Daily Demand * Lead Time) + Safety Stock
    const reorderPoint = Math.round((dailyDemand * leadTimeDays) + safetyStock);
    
    // Simulated current inventory
    const randomMultiplier = 0.6 + ((product.charCodeAt(0) * 17) % 100) / 100;
    const currentStockEstimate = Math.round(avgMonthlyDemand * randomMultiplier);
    const runwayDays = dailyDemand > 0 ? Math.round(currentStockEstimate / dailyDemand) : 999;

    let stockStatus: 'Safe' | 'Warning' | 'Critical Reorder' = 'Safe';
    if (currentStockEstimate <= safetyStock) {
      stockStatus = 'Critical Reorder';
    } else if (currentStockEstimate <= reorderPoint) {
      stockStatus = 'Warning';
    }

    return {
      product,
      brand: pInfo.brand,
      avgMonthlyDemand: Math.round(avgMonthlyDemand),
      dailyDemand: Math.round(dailyDemand),
      stdDevDemand: Math.round(stdDevDaily),
      leadTimeDays,
      serviceLevel: serviceLevelPct,
      zScore,
      safetyStock,
      reorderPoint,
      currentStockEstimate,
      stockStatus,
      runwayDays
    };
  }).filter(p => p.avgMonthlyDemand > 50).sort((a, b) => {
    // Sort critical first, then by demand
    if (a.stockStatus === 'Critical Reorder' && b.stockStatus !== 'Critical Reorder') return -1;
    if (b.stockStatus === 'Critical Reorder' && a.stockStatus !== 'Critical Reorder') return 1;
    return b.avgMonthlyDemand - a.avgMonthlyDemand;
  });

  const reorderAlertCount = safetyStockList.filter(x => x.stockStatus !== 'Safe').length;

  return {
    timeline,
    safetyStockList,
    metrics: {
      mape: Math.round(mape * 10) / 10,
      mad: Math.round(mad),
      trackingSignal: Math.round(trackingSignal * 100) / 100,
      reorderAlertCount
    }
  };
}

// 7. SCM SALES ORDER MANAGEMENT & FULFILLMENT
export function generateSalesOrders(data: SalesRecord[]): {
  orders: OrderItem[];
  orderMetrics: {
    totalOrders: number;
    avgOrderQty: number;
    deliveredCount: number;
    inTransitCount: number;
    processingCount: number;
    topDistributors: { distributor: string; orderCount: number; totalQty: number }[];
    fulfillmentRate: number;
  };
} {
  // Sample realistic order batch representation from transaction dataset
  const orders: OrderItem[] = [];
  const statusOptions: ('Delivered' | 'In-Transit' | 'Processing' | 'Scheduled')[] = [
    'Delivered', 'Delivered', 'Delivered', 'In-Transit', 'Processing', 'Scheduled'
  ];

  // Group top transactions into structured Sales Orders
  const distriOrderMap: Record<string, { count: number; qty: number }> = {};
  let totalOrderQty = 0;
  let deliveredCount = 0;
  let inTransitCount = 0;
  let processingCount = 0;

  // Select key orders with rich detail
  const recentItems = data.slice(0, 120);

  recentItems.forEach((item, idx) => {
    const day = (idx % 28) + 1;
    const dateStr = `${item.tahun}-${String(item.monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const orderNo = `SO-${item.tahun}${String(item.monthNum).padStart(2, '0')}-${String(1000 + idx)}`;
    const status = item.tahun < 2026 ? 'Delivered' : statusOptions[idx % statusOptions.length];

    if (status === 'Delivered') deliveredCount++;
    else if (status === 'In-Transit') inTransitCount++;
    else processingCount++;

    totalOrderQty += item.qty;
    if (!distriOrderMap[item.distributor]) {
      distriOrderMap[item.distributor] = { count: 0, qty: 0 };
    }
    distriOrderMap[item.distributor].count++;
    distriOrderMap[item.distributor].qty += item.qty;

    orders.push({
      id: `ord-${idx}`,
      orderNumber: orderNo,
      date: dateStr,
      bulan: item.bulan,
      tahun: item.tahun,
      distributor: item.distributor,
      kota: item.kota,
      prinsipal: item.prinsipal,
      produk: item.produk,
      brand: item.brand,
      ukuran: item.ukuran,
      qty: item.qty,
      status
    });
  });

  const topDistributors = Object.entries(distriOrderMap)
    .filter(([name]) => name !== 'Unassigned')
    .map(([distributor, stats]) => ({
      distributor,
      orderCount: stats.count,
      totalQty: stats.qty
    }))
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 10);

  return {
    orders,
    orderMetrics: {
      totalOrders: orders.length,
      avgOrderQty: orders.length > 0 ? Math.round(totalOrderQty / orders.length) : 0,
      deliveredCount,
      inTransitCount,
      processingCount,
      topDistributors,
      fulfillmentRate: Math.round(((deliveredCount + inTransitCount) / (orders.length || 1)) * 100)
    }
  };
}
