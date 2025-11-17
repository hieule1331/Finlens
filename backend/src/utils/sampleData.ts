/**
 * Sample data generator for Vietnamese stocks
 * Generates realistic sample data for testing and development
 */

export interface Stock {
  symbol: string;
  name: string;
  exchange: 'HOSE' | 'HNX' | 'UPCOM';
  industry: string;
  sector: string;
  listing_date: Date;
  outstanding_shares: number;
  market_cap: number;
}

export interface StockPrice {
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
}

// Vietnamese stock sectors
const SECTORS = {
  BDS: 'Real Estate',
  NGANHANG: 'Banking',
  CHUNGKHOAN: 'Securities',
  THEP: 'Steel',
  DAUKI: 'Oil & Gas',
  DIEN: 'Energy',
  THUCPHAM: 'Food & Beverage',
  CONGNGHE: 'Technology',
};

// Sample Vietnamese stocks by sector
const SAMPLE_STOCKS = [
  // Banking - NGANHANG
  {
    symbol: 'VCB',
    name: 'Vietcombank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'BLUECHIP',
  },
  {
    symbol: 'BID',
    name: 'BIDV',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'BLUECHIP',
  },
  {
    symbol: 'CTG',
    name: 'VietinBank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'BLUECHIP',
  },
  {
    symbol: 'TCB',
    name: 'Techcombank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'BLUECHIP',
  },
  {
    symbol: 'MBB',
    name: 'MB Bank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'BLUECHIP',
  },
  {
    symbol: 'ACB',
    name: 'Asia Commercial Bank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'MIDCAP',
  },
  {
    symbol: 'VPB',
    name: 'VPBank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'MIDCAP',
  },
  {
    symbol: 'TPB',
    name: 'TPBank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'MIDCAP',
  },

  // Real Estate - BDS
  {
    symbol: 'VHM',
    name: 'Vinhomes',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'BLUECHIP',
  },
  {
    symbol: 'VIC',
    name: 'Vingroup',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'BLUECHIP',
  },
  {
    symbol: 'NVL',
    name: 'Novaland',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'MIDCAP',
  },
  {
    symbol: 'VRE',
    name: 'Vincom Retail',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'MIDCAP',
  },
  {
    symbol: 'DXG',
    name: 'Dat Xanh Group',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'MIDCAP',
  },
  {
    symbol: 'PDR',
    name: 'Phat Dat Real Estate',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'PENNY',
  },
  {
    symbol: 'KDH',
    name: 'Khang Dien House',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'PENNY',
  },

  // Securities - CHUNGKHOAN
  {
    symbol: 'SSI',
    name: 'SSI Securities',
    exchange: 'HOSE' as const,
    sector: 'CHUNGKHOAN',
    type: 'MIDCAP',
  },
  {
    symbol: 'VND',
    name: 'VNDirect Securities',
    exchange: 'HOSE' as const,
    sector: 'CHUNGKHOAN',
    type: 'MIDCAP',
  },
  {
    symbol: 'HCM',
    name: 'Ho Chi Minh Securities',
    exchange: 'HOSE' as const,
    sector: 'CHUNGKHOAN',
    type: 'MIDCAP',
  },
  {
    symbol: 'VCI',
    name: 'Vietcap Securities',
    exchange: 'HOSE' as const,
    sector: 'CHUNGKHOAN',
    type: 'PENNY',
  },
  {
    symbol: 'FTS',
    name: 'FPT Securities',
    exchange: 'HOSE' as const,
    sector: 'CHUNGKHOAN',
    type: 'PENNY',
  },

  // Steel - THEP
  {
    symbol: 'HPG',
    name: 'Hoa Phat Group',
    exchange: 'HOSE' as const,
    sector: 'THEP',
    type: 'BLUECHIP',
  },
  {
    symbol: 'HSG',
    name: 'Hoa Sen Group',
    exchange: 'HOSE' as const,
    sector: 'THEP',
    type: 'MIDCAP',
  },
  {
    symbol: 'NKG',
    name: 'Nam Kim Steel',
    exchange: 'HOSE' as const,
    sector: 'THEP',
    type: 'MIDCAP',
  },
  {
    symbol: 'POM',
    name: 'Pomina Steel',
    exchange: 'HNX' as const,
    sector: 'THEP',
    type: 'PENNY',
  },

  // Oil & Gas - DAUKI
  {
    symbol: 'GAS',
    name: 'PetroVietnam Gas',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'BLUECHIP',
  },
  {
    symbol: 'PLX',
    name: 'Petrolimex',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'BLUECHIP',
  },
  {
    symbol: 'PVD',
    name: 'PetroVietnam Drilling',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'MIDCAP',
  },
  {
    symbol: 'PVS',
    name: 'PetroVietnam Technical Services',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'MIDCAP',
  },
  {
    symbol: 'PVT',
    name: 'PetroVietnam Transportation',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'PENNY',
  },

  // Energy - DIEN
  {
    symbol: 'POW',
    name: 'PetroVietnam Power',
    exchange: 'HOSE' as const,
    sector: 'DIEN',
    type: 'MIDCAP',
  },
  {
    symbol: 'NT2',
    name: 'Nhon Trach 2 Power',
    exchange: 'HOSE' as const,
    sector: 'DIEN',
    type: 'MIDCAP',
  },
  {
    symbol: 'REE',
    name: 'Refrigeration Electrical Engineering',
    exchange: 'HOSE' as const,
    sector: 'DIEN',
    type: 'MIDCAP',
  },
  {
    symbol: 'PC1',
    name: 'Power Construction No.1',
    exchange: 'HNX' as const,
    sector: 'DIEN',
    type: 'PENNY',
  },

  // Food & Beverage - THUCPHAM
  {
    symbol: 'VNM',
    name: 'Vinamilk',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'BLUECHIP',
  },
  {
    symbol: 'MSN',
    name: 'Masan Group',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'BLUECHIP',
  },
  {
    symbol: 'SAB',
    name: 'Sabeco',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'BLUECHIP',
  },
  {
    symbol: 'VHC',
    name: 'Vinhomes Commercial',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'MIDCAP',
  },
  {
    symbol: 'MCH',
    name: 'Masan Consumer Holdings',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'MIDCAP',
  },
  {
    symbol: 'KDC',
    name: 'Kinh Do Corporation',
    exchange: 'HOSE' as const,
    sector: 'THUCPHAM',
    type: 'PENNY',
  },

  // Technology - CONGNGHE
  {
    symbol: 'FPT',
    name: 'FPT Corporation',
    exchange: 'HOSE' as const,
    sector: 'CONGNGHE',
    type: 'BLUECHIP',
  },
  {
    symbol: 'CMG',
    name: 'CMC Corporation',
    exchange: 'HOSE' as const,
    sector: 'CONGNGHE',
    type: 'MIDCAP',
  },
  {
    symbol: 'VGI',
    name: 'VGI Holdings',
    exchange: 'UPCOM' as const,
    sector: 'CONGNGHE',
    type: 'MIDCAP',
  },
  {
    symbol: 'ELC',
    name: 'LILAMA Electro-Mechanical',
    exchange: 'HOSE' as const,
    sector: 'CONGNGHE',
    type: 'PENNY',
  },

  // Additional stocks to reach 50
  {
    symbol: 'MWG',
    name: 'Mobile World',
    exchange: 'HOSE' as const,
    sector: 'CONGNGHE',
    type: 'BLUECHIP',
  },
  {
    symbol: 'VJC',
    name: 'VietJet Air',
    exchange: 'HOSE' as const,
    sector: 'CONGNGHE',
    type: 'MIDCAP',
  },
  {
    symbol: 'GMD',
    name: 'Gemadept',
    exchange: 'HOSE' as const,
    sector: 'DAUKI',
    type: 'PENNY',
  },
  {
    symbol: 'HDB',
    name: 'HDBank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'MIDCAP',
  },
  {
    symbol: 'STB',
    name: 'Sacombank',
    exchange: 'HOSE' as const,
    sector: 'NGANHANG',
    type: 'PENNY',
  },
  {
    symbol: 'DIG',
    name: 'DIC Corp',
    exchange: 'HOSE' as const,
    sector: 'BDS',
    type: 'PENNY',
  },
];

/**
 * Generate market cap based on type
 */
function generateMarketCap(type: string): number {
  switch (type) {
    case 'BLUECHIP':
      return Math.floor(Math.random() * 500000000000 + 100000000000); // 100B - 600B VND
    case 'MIDCAP':
      return Math.floor(Math.random() * 90000000000 + 10000000000); // 10B - 100B VND
    case 'PENNY':
      return Math.floor(Math.random() * 9000000000 + 1000000000); // 1B - 10B VND
    default:
      return 10000000000;
  }
}

/**
 * Generate outstanding shares based on market cap
 */
function generateOutstandingShares(marketCap: number): number {
  // Assume average price is 30,000 VND
  return Math.floor(marketCap / 30000);
}

/**
 * Generate random date within the last 5 years
 */
function generateListingDate(): Date {
  const now = new Date();
  const fiveYearsAgo = new Date(
    now.getFullYear() - 5,
    now.getMonth(),
    now.getDate()
  );
  const randomTime =
    fiveYearsAgo.getTime() +
    Math.random() * (now.getTime() - fiveYearsAgo.getTime());
  return new Date(randomTime);
}

/**
 * Generate 50 sample Vietnamese stocks
 */
export function generateSampleStocks(): Stock[] {
  return SAMPLE_STOCKS.map((stock) => {
    const marketCap = generateMarketCap(stock.type);
    return {
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      industry: SECTORS[stock.sector as keyof typeof SECTORS],
      sector: stock.sector,
      listing_date: generateListingDate(),
      outstanding_shares: generateOutstandingShares(marketCap),
      market_cap: marketCap,
    };
  });
}

/**
 * Generate base price for a stock based on type
 */
function generateBasePrice(type: string): number {
  switch (type) {
    case 'BLUECHIP':
      return Math.floor(Math.random() * 100000 + 50000); // 50k - 150k VND
    case 'MIDCAP':
      return Math.floor(Math.random() * 40000 + 10000); // 10k - 50k VND
    case 'PENNY':
      return Math.floor(Math.random() * 9000 + 1000); // 1k - 10k VND
    default:
      return 20000;
  }
}

/**
 * Generate 20 days of historical prices for a stock
 */
export function generateStockPrices(
  symbol: string,
  days: number = 20
): StockPrice[] {
  const prices: StockPrice[] = [];
  const stockData = SAMPLE_STOCKS.find((s) => s.symbol === symbol);
  const basePrice = generateBasePrice(stockData?.type || 'MIDCAP');

  let currentPrice = basePrice;
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Generate daily price movement (-3% to +3%)
    const priceChange = 1 + (Math.random() * 0.06 - 0.03);
    currentPrice = Math.floor(currentPrice * priceChange);

    // Generate OHLC data
    const open = currentPrice;
    const volatility = 0.02; // 2% intraday volatility
    const high = Math.floor(open * (1 + Math.random() * volatility));
    const low = Math.floor(open * (1 - Math.random() * volatility));
    const close = Math.floor(low + Math.random() * (high - low));

    // Generate volume
    const baseVolume = 1000000;
    const volume = Math.floor(baseVolume + Math.random() * baseVolume * 2);

    prices.push({
      symbol,
      date,
      open: open / 1000, // Convert to thousands for decimal storage
      high: high / 1000,
      low: low / 1000,
      close: close / 1000,
      volume,
      adjusted_close: close / 1000,
    });

    currentPrice = close;
  }

  return prices;
}

/**
 * Generate all sample data
 */
export function generateAllSampleData(): {
  stocks: Stock[];
  prices: StockPrice[];
} {
  const stocks = generateSampleStocks();
  const prices: StockPrice[] = [];

  stocks.forEach((stock) => {
    const stockPrices = generateStockPrices(stock.symbol);
    prices.push(...stockPrices);
  });

  return { stocks, prices };
}
