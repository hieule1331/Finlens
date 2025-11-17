# Vietnamese Stock Market Analysis Web Application
## Comprehensive Technical Specification & Development Plan

**Based on:** Finlens StockApp 2.0 (Advanced)  
**Target Market:** Vietnamese Stock Market (HOSE, HNX, UPCOM)  
**Last Updated:** November 17, 2025

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Data Requirements & API Sources](#data-requirements--api-sources)
3. [Core Features & Calculations](#core-features--calculations)
4. [Dashboard Components](#dashboard-components)
5. [Technical Architecture](#technical-architecture)
6. [Development Phases](#development-phases)
7. [Deployment Strategy](#deployment-strategy)

---

## EXECUTIVE SUMMARY

This document outlines the complete development plan for a Vietnamese stock market analysis web application inspired by Finlens StockApp 2.0. The application will provide institutional-grade market analysis tools including multi-layer market strength comparison, volatility analysis, correlation tracking, and futures-underlying relationship monitoring.

### Key Features to Implement:
- **Market Inter-layer 5 Levels Matrix** (Liên Tầng Thị Trường 5 Cấp)
- **Range & Correlation Multi-day Chart** (Biên Độ & Tương Quan)
- **Daily Volatility Distribution Chart** (Biên Độ Chi Tiết)
- **Futures-Underlying Correlation Scatter Plot** (Phái Sinh vs Cơ Sở)
- **Matrix View with Strategy Analysis**
- **Deep Analysis with Individual Stock Details**

---

## DATA REQUIREMENTS & API SOURCES

### 1. MARKET DATA REQUIREMENTS

#### A. Index Data
**Required Data Points:**
- VN-INDEX (HOSE main index)
- VN30-INDEX (30 largest stocks)
- VN30F1M (VN30 futures front month)
- HNX-INDEX (Hanoi exchange)
- UPCOM-INDEX (Unlisted public companies)

**Data Fields:**
- Open, High, Low, Close prices
- Volume, Value
- Percent change (daily, weekly, monthly)
- Market capitalization
- Number of advancing/declining stocks

**API Sources:**
```
Primary Sources:
1. SSI iBoard API (https://iboard.ssi.com.vn)
   - Real-time market data
   - Historical OHLCV data
   - Endpoint: /api/v1/market/index

2. VNDIRECT Securities API
   - Market statistics
   - Index composition
   - Endpoint: https://finfo-api.vndirect.com.vn/

3. Vietnam Stock Exchange (VNX) Data
   - Official exchange data
   - End-of-day data
   - URL: https://www.vnx.vn/

Alternative/Backup:
4. FiinTrade API (Premium)
   - Institutional-grade data
   - Real-time streaming

5. TradingView Data Feed
   - Chart data
   - Technical indicators
```

#### B. Sector & Industry Classification
**Required Data:**
- Sector codes (BDS, Ngân Hàng, Chứng Khoán, etc.)
- Industry groups (ICB classification)
- Stock-to-sector mappings

**Vietnamese Market Sectors:**
```javascript
const SECTORS = {
  'BDS': 'Bất Động Sản - Real Estate',
  'NGANHANG': 'Ngân Hàng - Banking',
  'CHUNGKHOAN': 'Chứng Khoán - Securities',
  'THEP': 'Thép (HH) - Steel',
  'DAUKI': 'Dầu Khí (HH) - Oil & Gas',
  'DETMAY': 'Dệt May (HH) - Textile',
  'DIEN': 'Điện - Electricity',
  'THUCPHAM': 'Thực Phẩm - Food',
  'THUYSAN': 'Thủy Sản (TP) - Seafood',
  'NONGSAN': 'Nông Sản (TP) - Agriculture',
  'DAUTUCONG': 'Đầu Tư Công - Public Investment',
  'HOACHAT': 'Hóa Chất - Chemicals',
  'PHANBON': 'Phân Bón (HC) - Fertilizer',
  'CAOSU': 'Cao Su (HC) - Rubber',
  'NHUA': 'Nhựa (HC) - Plastic',
  'THAN': 'Than (HC) - Coal',
  'VANTAI': 'Vận Tải - Transportation',
  'DUOCPHAM': 'Dược Phẩm - Pharmaceuticals',
  'KCN': 'Bất Động Sản - Khu Công Nghiệp',
  'CONGNGHE': 'Công Nghệ - Technology'
};

const MARKET_CAP_TYPES = {
  'BLUECHIP': 'Blue Chip (Large Cap)',
  'MIDCAP': 'Mid Cap',
  'PENNY': 'Penny (Small Cap)',
  'INDEX': 'Index Stocks',
  'FUTURE': 'Futures'
};
```

**API Implementation:**
```javascript
// Sector mapping endpoint
GET /api/v1/sectors
Response: {
  sectors: [
    {
      code: 'BDS',
      name: 'Bất Động Sản',
      stocks: ['VHM', 'VIC', 'NVL', ...],
      strength: 2.43,  // Relative to market
      status: 'STRONG' // WEAK, MODERATE, STRONG, etc.
    }
  ]
}
```

#### C. Individual Stock Data
**Required Fields:**
- Ticker symbol
- Company name (Vietnamese & English)
- Real-time price (Open, High, Low, Close)
- Volume, Value
- Bid/Ask orders (top 10 levels)
- Foreign buy/sell volume
- Proprietary trading volumes
- RSI, MACD, Bollinger Bands
- Historical OHLCV (minimum 500 days)

**API Sources:**
```
Primary:
1. SSI FastConnect API
   - WebSocket for real-time data
   - ws://fc-data.ssi.com.vn/realtime

2. VNDIRECT Market Data API
   - REST API for quotes
   - GET /stocks/{symbol}/quote

3. VPS SmartOne API
   - Order book depth
   - Institutional flow data
```

#### D. Futures Market Data
**Required Data:**
- VN30F1M (Front month contract)
- VN30F2M (Second month)
- Open interest
- Basis (Futures - Spot)
- Volume, Value
- Settlement prices

**API Source:**
```
Vietnam Derivatives Exchange (VNX)
- Endpoint: https://www.vnx.vn/api/derivatives
- Real-time futures quotes
- Historical settlement data
```

#### E. Order Flow & Institutional Data
**Challenge:** This is the most difficult data to obtain reliably.

**Possible Sources:**
```
1. Proprietary Trading Data:
   - Member firm reports (limited public access)
   - Estimated from large block trades (>10k shares)
   
2. Foreign Investor Flow:
   - Daily foreign buy/sell reports
   - Available from exchanges (free)
   - Endpoint: /foreign-trading

3. Retail vs Institutional Estimation:
   - Algorithm-based classification
   - Order size analysis:
     * Retail: < 1,000 shares
     * Small Institution: 1,000 - 10,000 shares
     * Large Institution: > 10,000 shares
```

**Implementation Strategy:**
```javascript
// Classify trades by size
function classifyOrderFlow(trades) {
  const retail = trades.filter(t => t.volume < 1000);
  const institutional = trades.filter(t => t.volume >= 10000);
  
  return {
    retailBuyVolume: retail.filter(t => t.side === 'BUY').reduce(...),
    retailSellVolume: retail.filter(t => t.side === 'SELL').reduce(...),
    instBuyVolume: institutional.filter(t => t.side === 'BUY').reduce(...),
    instSellVolume: institutional.filter(t => t.side === 'SELL').reduce(...)
  };
}
```

### 2. DATA AGGREGATION & PROCESSING

#### Real-time Data Pipeline
```javascript
// WebSocket connection for real-time updates
const marketDataStream = new WebSocket('wss://your-api/stream');

marketDataStream.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Update Redis cache
  redis.set(`stock:${data.symbol}:quote`, JSON.stringify(data));
  
  // Push to connected clients
  io.emit('marketUpdate', data);
  
  // Trigger calculations
  calculateMarketStrength(data);
  updateVolatilityMetrics(data);
};
```

#### Historical Data Storage
```sql
-- PostgreSQL schema for OHLCV data
CREATE TABLE stock_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  open DECIMAL(10,2),
  high DECIMAL(10,2),
  low DECIMAL(10,2),
  close DECIMAL(10,2),
  volume BIGINT,
  value BIGINT,
  change_percent DECIMAL(5,2),
  UNIQUE(symbol, date)
);

CREATE INDEX idx_symbol_date ON stock_prices(symbol, date DESC);

-- Intraday tick data
CREATE TABLE stock_ticks (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2),
  volume INTEGER,
  side VARCHAR(4), -- 'BUY' or 'SELL'
  match_type VARCHAR(10) -- 'ATO', 'ATC', 'LO', 'MP'
);

CREATE INDEX idx_ticks_symbol_time ON stock_ticks(symbol, timestamp DESC);
```

---

## CORE FEATURES & CALCULATIONS

### FEATURE 1: Market Inter-layer 5 Levels Matrix
**(Liên Tầng Thị Trường 5 Cấp)**

#### Purpose:
Compare the strength of different market layers (Index, Futures, Market Cap types) against sectors/industries to identify where the strongest opportunities lie.

#### Visual Structure:
```
        ↕️ MARKET LAYERS (Vertical Axis)
        ┌────────────────────────────────┐
        │ PHÁI SINH (Futures)            │
        ├────────────────────────────────┤
        │ CHỈ SỐ (Index - VN-INDEX)      │
        ├────────────────────────────────┤
        │ BLUECHIP (Large Cap)           │
        ├────────────────────────────────┤
        │ MIDCAP (Mid Cap)               │
        ├────────────────────────────────┤
        │ PENNY (Small Cap)              │
        └────────────────────────────────┘

↔️ SECTORS/INDUSTRIES (Horizontal Axis)
BDS | NGÂN HÀNG | CHỨNG KHOÁN | THÉP | DẦU KHÍ | ... | CÔNG NGHỆ
```

#### Calculation Logic:

**Step 1: Calculate Layer Strength**
```javascript
// Calculate strength for each market layer
function calculateLayerStrength(layer, date) {
  // Get all stocks in this layer
  const stocks = getStocksByLayer(layer); // e.g., all Bluechip stocks
  
  // Calculate average % change
  const avgChange = stocks.reduce((sum, stock) => {
    return sum + stock.changePercent;
  }, 0) / stocks.length;
  
  // Calculate advance/decline ratio
  const advancers = stocks.filter(s => s.changePercent > 0).length;
  const decliners = stocks.filter(s => s.changePercent < 0).length;
  const adRatio = advancers / (advancers + decliners);
  
  // Composite strength score
  const strength = (avgChange * 0.6) + (adRatio - 0.5) * 10 * 0.4;
  
  return {
    layer: layer,
    strength: strength,
    avgChange: avgChange,
    advanceDeclineRatio: adRatio,
    status: getStrengthStatus(strength)
  };
}
```

**Step 2: Calculate Sector Strength**
```javascript
function calculateSectorStrength(sector, date) {
  const stocks = getStocksBySector(sector);
  
  // Same calculation as layer
  const avgChange = calculateAverage(stocks.map(s => s.changePercent));
  const adRatio = calculateADRatio(stocks);
  
  const strength = (avgChange * 0.6) + (adRatio - 0.5) * 10 * 0.4;
  
  return {
    sector: sector,
    strength: strength,
    avgChange: avgChange,
    status: getStrengthStatus(strength)
  };
}
```

**Step 3: Calculate Relative Strength (Matrix Cell Value)**
```javascript
function calculateRelativeStrength(layer, sector) {
  const layerStrength = calculateLayerStrength(layer);
  const sectorStrength = calculateSectorStrength(sector);
  
  // Get stocks that are in BOTH this layer AND this sector
  const intersectionStocks = getStocksByLayerAndSector(layer, sector);
  
  if (intersectionStocks.length === 0) {
    return null; // No stocks in this combination
  }
  
  // Calculate strength of intersection
  const intersectionStrength = calculateStrength(intersectionStocks);
  
  // Calculate relative strength
  // How many times stronger is this sector within this layer 
  // compared to the overall layer?
  const relativeStrength = intersectionStrength / layerStrength.strength;
  
  return {
    layer: layer,
    sector: sector,
    absoluteStrength: intersectionStrength,
    relativeStrength: relativeStrength,
    color: getColorCode(intersectionStrength, layerStrength.strength),
    label: formatRelativeLabel(relativeStrength)
    // e.g., "1.43" means 1.43 times stronger than layer average
  };
}
```

**Step 4: Color Coding Logic**
```javascript
function getColorCode(sectorLayerStrength, layerStrength) {
  const relativeStrength = sectorLayerStrength;
  const layerAvg = layerStrength;
  
  // Both sector and layer are positive
  if (sectorLayerStrength > 0 && layerStrength > 0) {
    if (relativeStrength > layerAvg * 1.2) return 'DARK_GREEN';  // Very strong
    if (relativeStrength > layerAvg) return 'GREEN';            // Strong
    return 'LIGHT_GREEN';                                       // Moderate
  }
  
  // Both negative
  if (sectorLayerStrength < 0 && layerStrength < 0) {
    if (relativeStrength < layerAvg * 1.2) return 'DARK_RED';   // Very weak
    if (relativeStrength < layerAvg) return 'RED';              // Weak
    return 'LIGHT_RED';                                         // Moderate weak
  }
  
  // Divergence (sector positive, layer negative or vice versa)
  if (sectorLayerStrength > 0 && layerStrength < 0) {
    return 'YELLOW';  // Warning - sector outperforming weak market
  }
  
  if (sectorLayerStrength < 0 && layerStrength > 0) {
    return 'ORANGE';  // Warning - sector underperforming strong market
  }
  
  return 'NEUTRAL';
}

const COLOR_MAP = {
  'DARK_GREEN': '#006400',   // Very bullish
  'GREEN': '#00A000',        // Bullish
  'LIGHT_GREEN': '#90EE90',  // Moderately bullish
  'YELLOW': '#FFFF00',       // Caution - divergence
  'ORANGE': '#FFA500',       // Caution - underperformance
  'LIGHT_RED': '#FFB6C1',    // Moderately bearish
  'RED': '#FF0000',          // Bearish
  'DARK_RED': '#8B0000'      // Very bearish
};
```

**Step 5: Display Numerical Values**
```javascript
function formatRelativeLabel(layer, sector, relativeStrength) {
  // Format: "1.43 times stronger than Midcap"
  // Or: "0.67 times weaker than Index"
  
  if (relativeStrength > 1) {
    return {
      value: relativeStrength.toFixed(2),
      sign: '+',
      description: `${relativeStrength.toFixed(2)}x stronger than ${layer}`
    };
  } else {
    return {
      value: relativeStrength.toFixed(2),
      sign: '-',
      description: `${(1/relativeStrength).toFixed(2)}x weaker than ${layer}`
    };
  }
}
```

#### API Endpoint Design:
```javascript
GET /api/v1/matrix/inter-layer

Response:
{
  "timestamp": "2025-11-17T07:39:54Z",
  "matrix": {
    "layers": ["FUTURE", "INDEX", "BLUECHIP", "MIDCAP", "PENNY"],
    "sectors": ["BDS", "NGANHANG", "CHUNGKHOAN", "THEP", ...],
    "cells": [
      {
        "layer": "BLUECHIP",
        "sector": "CHUNGKHOAN",
        "stocks": ["SSI", "VCI", "HCM"],
        "strength": 2.43,
        "relativeStrength": 1.43,
        "color": "GREEN",
        "status": "STRONG",
        "label": "1.43",
        "description": "1.43x stronger than Bluechip average"
      },
      // ... more cells
    ]
  },
  "summary": {
    "strongestSector": "CHUNGKHOAN",
    "weakestSector": "BDS",
    "strongestLayer": "FUTURE",
    "marketTrend": "POSITIVE_DIVERGENCE"
  }
}
```

---

### FEATURE 2: Range & Correlation Multi-day Volatility Chart
**(Biểu Đồ Biên Độ & Tương Quan Nhiều Ngày)**

#### Purpose:
Visualize market volatility distribution across 7 different price change ranges over the last 20 trading sessions to identify panic selling, FOMO buying, or healthy consolidation patterns.

#### Volatility Levels:
```javascript
const VOLATILITY_LEVELS = {
  'VERY_STRONG_UP': {
    code: 'PURPLE',
    range: '> +6%',
    color: '#800080',
    interpretation: 'Extremely bullish stocks'
  },
  'STRONG_UP': {
    code: 'DARK_GREEN',
    range: '+2% to +6%',
    color: '#006400',
    interpretation: 'Strong gainers'
  },
  'MODERATE_UP': {
    code: 'LIGHT_GREEN',
    range: '0% to +2%',
    color: '#90EE90',
    interpretation: 'Moderate gainers'
  },
  'REFERENCE': {
    code: 'YELLOW',
    range: '0%',
    color: '#FFFF00',
    interpretation: 'Unchanged'
  },
  'MODERATE_DOWN': {
    code: 'LIGHT_RED',
    range: '-2% to 0%',
    color: '#FFB6C1',
    interpretation: 'Moderate losers'
  },
  'STRONG_DOWN': {
    code: 'DARK_RED',
    range: '-6% to -2%',
    color: '#8B0000',
    interpretation: 'Strong losers'
  },
  'VERY_STRONG_DOWN': {
    code: 'BLUE',
    range: '< -6%',
    color: '#0000FF',
    interpretation: 'Extremely bearish stocks'
  }
};
```

#### Calculation Logic:

**Step 1: Classify Stocks by Volatility Range**
```javascript
function classifyStocksByVolatility(date) {
  const allStocks = getAllActiveStocks();
  const distribution = {
    VERY_STRONG_UP: [],
    STRONG_UP: [],
    MODERATE_UP: [],
    REFERENCE: [],
    MODERATE_DOWN: [],
    STRONG_DOWN: [],
    VERY_STRONG_DOWN: []
  };
  
  allStocks.forEach(stock => {
    const change = stock.changePercent;
    
    if (change > 6) distribution.VERY_STRONG_UP.push(stock);
    else if (change >= 2 && change <= 6) distribution.STRONG_UP.push(stock);
    else if (change > 0 && change < 2) distribution.MODERATE_UP.push(stock);
    else if (change === 0) distribution.REFERENCE.push(stock);
    else if (change > -2 && change < 0) distribution.MODERATE_DOWN.push(stock);
    else if (change <= -6 && change >= -2) distribution.STRONG_DOWN.push(stock);
    else if (change < -6) distribution.VERY_STRONG_DOWN.push(stock);
  });
  
  // Calculate percentages
  const total = allStocks.length;
  const percentages = {};
  
  Object.keys(distribution).forEach(level => {
    percentages[level] = (distribution[level].length / total) * 100;
  });
  
  return {
    date: date,
    distribution: distribution,
    percentages: percentages,
    total: total
  };
}
```

**Step 2: Generate 20-Session Historical Data**
```javascript
function generateVolatilityHistory(sessions = 20) {
  const history = [];
  const dates = getTradingDates(sessions); // Get last 20 trading days
  
  dates.forEach(date => {
    const volatility = classifyStocksByVolatility(date);
    history.push(volatility);
  });
  
  return history;
}
```

**Step 3: Calculate Market Status Metrics**
```javascript
function calculateMarketStatus(volatilityHistory) {
  // Get latest 5 sessions
  const recent5 = volatilityHistory.slice(-5);
  
  // Calculate averages for up/down movements
  const upAvg5 = recent5.reduce((sum, session) => {
    return sum + session.percentages.VERY_STRONG_UP 
               + session.percentages.STRONG_UP 
               + session.percentages.MODERATE_UP;
  }, 0) / 5;
  
  const downAvg5 = recent5.reduce((sum, session) => {
    return sum + session.percentages.VERY_STRONG_DOWN 
               + session.percentages.STRONG_DOWN 
               + session.percentages.MODERATE_DOWN;
  }, 0) / 5;
  
  // Calculate standard deviation for volatility spread
  const upStdDev5 = calculateStdDev(recent5.map(s => 
    s.percentages.VERY_STRONG_UP + s.percentages.STRONG_UP + s.percentages.MODERATE_UP
  ));
  
  const downStdDev5 = calculateStdDev(recent5.map(s => 
    s.percentages.VERY_STRONG_DOWN + s.percentages.STRONG_DOWN + s.percentages.MODERATE_DOWN
  ));
  
  // Count advancing vs declining stocks
  const latest = volatilityHistory[volatilityHistory.length - 1];
  const advancers = latest.distribution.VERY_STRONG_UP.length 
                  + latest.distribution.STRONG_UP.length 
                  + latest.distribution.MODERATE_UP.length;
  const decliners = latest.distribution.VERY_STRONG_DOWN.length 
                  + latest.distribution.STRONG_DOWN.length 
                  + latest.distribution.MODERATE_DOWN.length;
  
  return {
    status: {
      UpAvg5: upAvg5.toFixed(2),      // Average % of stocks going up
      DnAvg5: downAvg5.toFixed(2),    // Average % of stocks going down
      UpStrd5: upStdDev5.toFixed(2),  // Spread of upward movement
      DnStrd5: downStdDev5.toFixed(2),// Spread of downward movement
    },
    statistics: {
      advancing: advancers,
      declining: decliners,
      unchanged: latest.distribution.REFERENCE.length,
      adRatio: (advancers / decliners).toFixed(2)
    },
    marketCondition: getMarketCondition(upAvg5, downAvg5, upStdDev5, downStdDev5)
  };
}

function getMarketCondition(upAvg, downAvg, upStd, downStd) {
  // High upward average + low spread = strong healthy rally
  if (upAvg > 60 && upStd < 10) return 'STRONG_BULLISH';
  
  // High downward average + low spread = panic selling
  if (downAvg > 60 && downStd < 10) return 'PANIC_SELLING';
  
  // High averages both sides + high spread = volatile market
  if (upAvg > 50 && downAvg > 50) return 'HIGHLY_VOLATILE';
  
  // Low movement = consolidation
  if (upAvg < 40 && downAvg < 40) return 'CONSOLIDATION';
  
  return 'NORMAL';
}
```

**Step 4: Detect Sudden Spikes (Đột Biến)**
```javascript
function detectVolatilitySpikes(volatilityHistory) {
  const spikes = [];
  
  for (let i = 1; i < volatilityHistory.length; i++) {
    const current = volatilityHistory[i];
    const previous = volatilityHistory[i - 1];
    
    // Check for sudden increase in extreme movements
    const panicSelling = current.percentages.VERY_STRONG_DOWN 
                        - previous.percentages.VERY_STRONG_DOWN;
    
    const fomoBuilding = current.percentages.VERY_STRONG_UP 
                        - previous.percentages.VERY_STRONG_UP;
    
    // Spike threshold: > 15% change in extreme category
    if (panicSelling > 15) {
      spikes.push({
        date: current.date,
        type: 'PANIC_SELLING',
        magnitude: panicSelling,
        interpretation: 'Risk of capitulation - potential buying opportunity'
      });
    }
    
    if (fomoBuilding > 15) {
      spikes.push({
        date: current.date,
        type: 'FOMO_BUYING',
        magnitude: fomoBuilding,
        interpretation: 'Risk of exhaustion - potential selling pressure ahead'
      });
    }
  }
  
  return spikes;
}
```

#### Chart Rendering (Frontend):
```javascript
// Using Recharts or Chart.js
function renderVolatilityChart(volatilityHistory) {
  // Prepare stacked area chart data
  const chartData = volatilityHistory.map(session => ({
    date: session.date,
    'VERY_STRONG_UP': session.percentages.VERY_STRONG_UP,
    'STRONG_UP': session.percentages.STRONG_UP,
    'MODERATE_UP': session.percentages.MODERATE_UP,
    'REFERENCE': session.percentages.REFERENCE,
    'MODERATE_DOWN': session.percentages.MODERATE_DOWN,
    'STRONG_DOWN': session.percentages.STRONG_DOWN,
    'VERY_STRONG_DOWN': session.percentages.VERY_STRONG_DOWN
  }));
  
  return (
    <AreaChart data={chartData}>
      <XAxis dataKey="date" />
      <YAxis label="% of Stocks" />
      <Area 
        type="monotone" 
        dataKey="VERY_STRONG_UP" 
        stackId="1" 
        fill="#800080" 
      />
      <Area 
        type="monotone" 
        dataKey="STRONG_UP" 
        stackId="1" 
        fill="#006400" 
      />
      {/* ... other areas */}
    </AreaChart>
  );
}
```

#### API Endpoint:
```javascript
GET /api/v1/volatility/range-correlation?sessions=20

Response:
{
  "history": [
    {
      "date": "2025-11-17",
      "percentages": {
        "VERY_STRONG_UP": 2.3,
        "STRONG_UP": 15.7,
        "MODERATE_UP": 32.1,
        "REFERENCE": 8.5,
        "MODERATE_DOWN": 28.3,
        "STRONG_DOWN": 11.2,
        "VERY_STRONG_DOWN": 1.9
      },
      "distribution": {
        "VERY_STRONG_UP": ["FPT", "VCB"],
        // ... stock lists
      }
    },
    // ... 19 more sessions
  ],
  "status": {
    "UpAvg5": "48.20",
    "DnAvg5": "42.10",
    "UpStrd5": "8.50",
    "DnStrd5": "7.30"
  },
  "statistics": {
    "advancing": 450,
    "declining": 380,
    "unchanged": 70,
    "adRatio": "1.18"
  },
  "marketCondition": "NORMAL",
  "spikes": [
    {
      "date": "2025-11-14",
      "type": "PANIC_SELLING",
      "magnitude": 18.5,
      "interpretation": "Risk of capitulation - potential buying opportunity"
    }
  ]
}
```

---

### FEATURE 3: Daily Volatility Distribution Chart
**(Chart Biên Độ của Ngày)**

#### Purpose:
Provide detailed breakdown of today's market volatility to assess seller/buyer advantage and identify momentum extremes.

#### Visual Structure:
```
        % of Stocks
        ↑
    40% │     ████
        │     ████
    30% │     ████  ███
        │     ████  ███
    20% │ ██  ████  ███  ██
        │ ██  ████  ███  ██  █
    10% │ ██  ████  ███  ██  █  █
        │ ██  ████  ███  ██  █  █  █
     0% └─────────────────────────────→
        <-6% -2%  0%  2%  6% >12%
           Price Change Range
           
    Colors:
    ██ VERY_STRONG_DOWN (Blue)
    ██ STRONG_DOWN (Dark Red)
    ██ MODERATE_DOWN (Light Red)
    ██ REFERENCE (Yellow)
    ██ MODERATE_UP (Light Green)
    ██ STRONG_UP (Dark Green)
    ██ VERY_STRONG_UP (Purple)
```

#### Detailed Calculation:

**Step 1: Granular Price Range Classification**
```javascript
const DETAILED_RANGES = [
  { min: 12, max: Infinity, label: '>12%', color: '#4B0082' },
  { min: 9, max: 12, label: '9-12%', color: '#800080' },
  { min: 7, max: 9, label: '7-9%', color: '#9370DB' },
  { min: 5, max: 7, label: '5-7%', color: '#006400' },
  { min: 3, max: 5, label: '3-5%', color: '#228B22' },
  { min: 2, max: 3, label: '2-3%', color: '#90EE90' },
  { min: 0, max: 2, label: '0-2%', color: '#ADFF2F' },
  { min: 0, max: 0, label: '0%', color: '#FFFF00' },
  { min: -2, max: 0, label: '0 to -2%', color: '#FFB6C1' },
  { min: -3, max: -2, label: '-2 to -3%', color: '#FF69B4' },
  { min: -5, max: -3, label: '-3 to -5%', color: '#FF0000' },
  { min: -7, max: -5, label: '-5 to -7%', color: '#8B0000' },
  { min: -9, max: -7, label: '-7 to -9%', color: '#800000' },
  { min: -12, max: -9, label: '-9 to -12%', color: '#000080' },
  { min: -Infinity, max: -12, label: '<-12%', color: '#00008B' }
];

function classifyDailyVolatility() {
  const stocks = getAllActiveStocks();
  const distribution = {};
  
  DETAILED_RANGES.forEach(range => {
    distribution[range.label] = {
      stocks: [],
      count: 0,
      percentage: 0,
      ...range
    };
  });
  
  stocks.forEach(stock => {
    const change = stock.changePercent;
    
    // Find matching range
    const range = DETAILED_RANGES.find(r => {
      if (change === 0) return r.min === 0 && r.max === 0;
      if (change > 0) return change >= r.min && change < r.max;
      if (change < 0) return change <= r.min && change > r.max;
    });
    
    if (range) {
      distribution[range.label].stocks.push(stock);
      distribution[range.label].count++;
    }
  });
  
  // Calculate percentages
  const total = stocks.length;
  Object.keys(distribution).forEach(label => {
    distribution[label].percentage = 
      (distribution[label].count / total) * 100;
  });
  
  return distribution;
}
```

**Step 2: Calculate Seller/Buyer Advantage**
```javascript
function calculateMarketAdvantage(distribution) {
  // Sum up all selling pressure (negative changes)
  const sellerAdvantage = Object.values(distribution)
    .filter(d => d.min < 0)
    .reduce((sum, d) => sum + d.percentage, 0);
  
  // Sum up all buying pressure (positive changes)
  const buyerAdvantage = Object.values(distribution)
    .filter(d => d.min > 0)
    .reduce((sum, d) => sum + d.percentage, 0);
  
  // Neutral (unchanged)
  const neutral = distribution['0%']?.percentage || 0;
  
  return {
    sellerAdvantage: sellerAdvantage.toFixed(2),
    buyerAdvantage: buyerAdvantage.toFixed(2),
    neutral: neutral.toFixed(2),
    netAdvantage: (buyerAdvantage - sellerAdvantage).toFixed(2),
    interpretation: getAdvantageInterpretation(
      buyerAdvantage, 
      sellerAdvantage
    )
  };
}

function getAdvantageInterpretation(buyerAdv, sellerAdv) {
  const diff = buyerAdv - sellerAdv;
  
  if (diff > 30) return 'STRONG_BUYER_ADVANTAGE';
  if (diff > 15) return 'MODERATE_BUYER_ADVANTAGE';
  if (diff > -15 && diff < 15) return 'BALANCED';
  if (diff < -15) return 'MODERATE_SELLER_ADVANTAGE';
  if (diff < -30) return 'STRONG_SELLER_ADVANTAGE';
}
```

**Step 3: 5-Range Volatility Status**
```javascript
function calculate5RangeStatus(distribution) {
  // Group into 5 broader categories
  const status = {
    VERY_STRONG_UP: 0,
    MODERATE_UP: 0,
    NEUTRAL: 0,
    MODERATE_DOWN: 0,
    VERY_STRONG_DOWN: 0
  };
  
  Object.values(distribution).forEach(range => {
    if (range.min > 5) status.VERY_STRONG_UP += range.percentage;
    else if (range.min > 0 && range.min <= 5) status.MODERATE_UP += range.percentage;
    else if (range.min === 0) status.NEUTRAL += range.percentage;
    else if (range.min >= -5 && range.min < 0) status.MODERATE_DOWN += range.percentage;
    else if (range.min < -5) status.VERY_STRONG_DOWN += range.percentage;
  });
  
  return status;
}
```

**Step 4: Risk Signal Detection**
```javascript
function detectDailyRiskSignals(distribution, advantage) {
  const signals = [];
  
  // Panic selling signal: >25% of stocks in strong decline
  const panicThreshold = distribution['-5 to -7%']?.percentage + 
                        distribution['-7 to -9%']?.percentage +
                        distribution['<-12%']?.percentage;
  
  if (panicThreshold > 25) {
    signals.push({
      type: 'PANIC_SELLING',
      severity: 'HIGH',
      message: `${panicThreshold.toFixed(1)}% of stocks in severe decline`,
      action: 'CAUTION: Potential capitulation, wait for stabilization'
    });
  }
  
  // FOMO signal: >25% of stocks in strong advance
  const fomoThreshold = distribution['5-7%']?.percentage + 
                       distribution['7-9%']?.percentage +
                       distribution['>12%']?.percentage;
  
  if (fomoThreshold > 25) {
    signals.push({
      type: 'FOMO_RISK',
      severity: 'HIGH',
      message: `${fomoThreshold.toFixed(1)}% of stocks in extreme gains`,
      action: 'CAUTION: Potential exhaustion, risk of pullback'
    });
  }
  
  // Weak breadth: <40% participation in positive territory
  if (advantage.buyerAdvantage < 40 && advantage.sellerAdvantage < 40) {
    signals.push({
      type: 'WEAK_BREADTH',
      severity: 'MEDIUM',
      message: 'Low market participation',
      action: 'Lack of conviction, avoid chasing'
    });
  }
  
  return signals;
}
```

#### API Endpoint:
```javascript
GET /api/v1/volatility/daily

Response:
{
  "date": "2025-11-17",
  "distribution": {
    ">12%": { count: 12, percentage: 1.3, color: "#4B0082" },
    "9-12%": { count: 25, percentage: 2.7, color: "#800080" },
    // ... all ranges
    "<-12%": { count: 8, percentage: 0.9, color: "#00008B" }
  },
  "advantage": {
    "sellerAdvantage": "42.30",
    "buyerAdvantage": "48.20",
    "neutral": "9.50",
    "netAdvantage": "5.90",
    "interpretation": "MODERATE_BUYER_ADVANTAGE"
  },
  "fiveRangeStatus": {
    "VERY_STRONG_UP": 15.2,
    "MODERATE_UP": 33.0,
    "NEUTRAL": 9.5,
    "MODERATE_DOWN": 31.8,
    "VERY_STRONG_DOWN": 10.5
  },
  "riskSignals": [
    {
      "type": "WEAK_BREADTH",
      "severity": "MEDIUM",
      "message": "Low market participation",
      "action": "Lack of conviction, avoid chasing"
    }
  ],
  "summary": {
    "totalStocks": 900,
    "advancing": 434,
    "declining": 380,
    "unchanged": 86
  }
}
```

---

### FEATURE 4: Futures vs Underlying Correlation Scatter Plot
**(Biểu Đồ Tương Đối Thị Trường Phái Sinh và Cơ Sở)**

#### Purpose:
Track the correlation between VN30 Index (underlying) and VN30F1M futures to identify safe trading conditions (both in sync) vs risky conditions (divergence indicating manipulation).

#### Visual Structure:
```
    Future % Change
         ↑
     30% │               
         │        ● (Recent session - large dot)
     20% │      /  ═══ Green line (3-day trend)
         │    /   ─── Yellow line (5-day trend)
     10% │  /     ··· Orange line (10-day trend)
         │/       --- Red line (20-day trend)
      0% ├──────────────────────────────→
         │                      VN-INDEX % Change
    -10% │
         │
    -20% │  ● Small dots = historical sessions
```

#### Calculation Logic:

**Step 1: Collect Coordinate Data**
```javascript
function getCoordinateData(sessions = 20) {
  const dates = getTradingDates(sessions);
  const coordinates = [];
  
  dates.forEach(date => {
    const vnIndex = getIndexData('VNINDEX', date);
    const vn30Future = getFutureData('VN30F1M', date);
    
    coordinates.push({
      date: date,
      x: vnIndex.changePercent,
      y: vn30Future.changePercent,
      vnIndexValue: vnIndex.close,
      futureValue: vn30Future.close,
      basis: vn30Future.close - vnIndex.close
    });
  });
  
  return coordinates;
}
```

**Step 2: Calculate Trend Lines**
```javascript
function calculateTrendLines(coordinates) {
  const trends = {};
  const periods = [3, 5, 10, 20];
  const colors = ['GREEN', 'YELLOW', 'ORANGE', 'RED'];
  
  periods.forEach((period, index) => {
    const recentData = coordinates.slice(-period);
    
    // Simple moving average of changes
    const avgX = recentData.reduce((sum, d) => sum + d.x, 0) / period;
    const avgY = recentData.reduce((sum, d) => sum + d.y, 0) / period;
    
    // Calculate linear regression for trend line
    const regression = calculateLinearRegression(
      recentData.map(d => d.x),
      recentData.map(d => d.y)
    );
    
    trends[`${period}DAY`] = {
      period: period,
      color: colors[index],
      slope: regression.slope,
      intercept: regression.intercept,
      avgX: avgX,
      avgY: avgY,
      correlation: regression.rSquared,
      interpretation: interpretTrend(regression.slope, regression.rSquared)
    };
  });
  
  return trends;
}

function calculateLinearRegression(xValues, yValues) {
  const n = xValues.length;
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumYY = yValues.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // R-squared (correlation coefficient)
  const yMean = sumY / n;
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
  const ssResidual = yValues.reduce((sum, y, i) => {
    const predicted = slope * xValues[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);
  
  return { slope, intercept, rSquared };
}
```

**Step 3: Correlation Analysis**
```javascript
function analyzeCorrelation(trends) {
  const shortTerm = trends['3DAY'];
  const mediumTerm = trends['5DAY'];
  const longTerm = trends['20DAY'];
  
  // Check if all trends point in same direction
  const allBullish = Object.values(trends).every(t => t.slope > 0);
  const allBearish = Object.values(trends).every(t => t.slope < 0);
  
  // Check for divergence
  const shortLongDivergence = Math.sign(shortTerm.slope) !== Math.sign(longTerm.slope);
  
  let signal, interpretation;
  
  if (allBullish) {
    signal = 'SAFE_BULLISH';
    interpretation = 'Đồng pha tăng - Safe to buy both spot and futures';
  } else if (allBearish) {
    signal = 'SAFE_BEARISH';
    interpretation = 'Đồng pha giảm - Consistent downtrend, avoid longs';
  } else if (shortLongDivergence) {
    signal = 'RISK_DIVERGENCE';
    interpretation = 'Đi ngược hướng - WARNING: Futures manipulation risk!';
  } else {
    signal = 'MIXED';
    interpretation = 'Phân hóa - Mixed signals, trade with caution';
  }
  
  return {
    signal: signal,
    interpretation: interpretation,
    shortTerm: shortTerm,
    longTerm: longTerm,
    divergenceDetected: shortLongDivergence,
    correlationStrength: calculateOverallCorrelation(trends)
  };
}

function calculateOverallCorrelation(trends) {
  // Average R-squared across all periods
  const avgCorrelation = Object.values(trends)
    .reduce((sum, t) => sum + t.correlation, 0) / Object.keys(trends).length;
  
  if (avgCorrelation > 0.8) return 'STRONG';
  if (avgCorrelation > 0.6) return 'MODERATE';
  if (avgCorrelation > 0.4) return 'WEAK';
  return 'VERY_WEAK';
}
```

**Step 4: Manipulation Detection**
```javascript
function detectManipulation(coordinates, trends) {
  const warnings = [];
  const recent = coordinates[coordinates.length - 1];
  const shortTrend = trends['3DAY'];
  const longTrend = trends['20DAY'];
  
  // Warning 1: Futures rallying while spot declining
  if (recent.y > 2 && recent.x < -2) {
    warnings.push({
      type: 'FUTURES_PUMP',
      message: 'Futures up significantly while spot down',
      risk: 'HIGH',
      action: 'Likely manipulation. Avoid buying futures.'
    });
  }
  
  // Warning 2: Futures crashing while spot stable
  if (recent.y < -2 && recent.x > -1 && recent.x < 1) {
    warnings.push({
      type: 'FUTURES_DUMP',
      message: 'Futures dumping while spot relatively stable',
      risk: 'HIGH',
      action: 'Potential short squeeze incoming. Be cautious.'
    });
  }
  
  // Warning 3: Short-term trend opposes long-term
  if (Math.sign(shortTrend.slope) !== Math.sign(longTrend.slope)) {
    warnings.push({
      type: 'TREND_DIVERGENCE',
      message: '3-day trend contradicts 20-day trend',
      risk: 'MEDIUM',
      action: 'Short-term manipulation possible. Wait for confirmation.'
    });
  }
  
  // Warning 4: Abnormal basis (futures premium/discount)
  const normalBasis = 5; // points
  if (Math.abs(recent.basis) > normalBasis * 3) {
    warnings.push({
      type: 'ABNORMAL_BASIS',
      message: `Futures basis at ${recent.basis.toFixed(2)} points`,
      risk: 'MEDIUM',
      action: 'Unusual premium/discount. Arbitrage opportunity or manipulation.'
    });
  }
  
  return warnings;
}
```

#### API Endpoint:
```javascript
GET /api/v1/correlation/futures-underlying?sessions=20

Response:
{
  "coordinates": [
    {
      "date": "2025-11-17",
      "vnIndexChange": 1.25,
      "futureChange": 1.87,
      "vnIndexClose": 1284.50,
      "futureClose": 1295.30,
      "basis": 10.80
    },
    // ... 19 more sessions
  ],
  "trendLines": {
    "3DAY": {
      "period": 3,
      "color": "GREEN",
      "slope": 1.15,
      "intercept": 0.23,
      "correlation": 0.87,
      "interpretation": "Strong positive correlation (đồng pha)"
    },
    "5DAY": { /* ... */ },
    "10DAY": { /* ... */ },
    "20DAY": { /* ... */ }
  },
  "analysis": {
    "signal": "SAFE_BULLISH",
    "interpretation": "Đồng pha tăng - Safe to buy both spot and futures",
    "divergenceDetected": false,
    "correlationStrength": "STRONG"
  },
  "manipulationWarnings": [],
  "recommendation": {
    "action": "BUY",
    "confidence": "HIGH",
    "reasoning": "All timeframes show positive correlation with strong R-squared values"
  }
}
```

---

## DASHBOARD COMPONENTS

### Component 1: Top Control Panel (Bộ Lọc)

#### Filters Available:
```javascript
const FILTER_OPTIONS = {
  // 1. Ceiling/Floor Price Selection
  ceilingFloorPrice: {
    options: ['ALL (R,Y,G)', '=>GREEN', 'G1', 'G2', 'G5', 'GREEN', 
              'YELLOW', 'RED', '=>RED'],
    description: 'Filter by price position relative to ceiling/floor',
    apiParam: 'priceStatus'
  },
  
  // 2. Market Cap Type
  marketCap: {
    options: ['ĐỒNG - BlueChip', 'ĐỒNG - MidCap', 'ĐỒNG - Penny'],
    description: 'Filter by market capitalization tier',
    apiParam: 'marketCapType'
  },
  
  // 3. Industry/Sector Selection
  industry: {
    type: 'dropdown',
    options: SECTORS, // From earlier definition
    multiSelect: true,
    apiParam: 'sectors'
  },
  
  // 4. Price Range
  priceRange: {
    min: 0,
    max: 500000, // VND
    step: 10000,
    apiParam: 'priceMin,priceMax'
  },
  
  // 5. Minimum Volume
  minVolume: {
    options: [0, 10000, 100000, 500000, 1000000, 5000000, 10000000],
    apiParam: 'minVolume'
  },
  
  // 6. Total Stock Count Limit
  totalStocks: {
    min: 1,
    max: 500,
    default: 50,
    apiParam: 'limit'
  }
};
```

#### Filter Application Logic:
```javascript
async function applyFilters(filters) {
  let query = 'SELECT * FROM stocks WHERE 1=1';
  const params = [];
  
  // Price Status filter
  if (filters.priceStatus && filters.priceStatus !== 'ALL (R,Y,G)') {
    if (filters.priceStatus === '=>GREEN') {
      query += ` AND price_position IN ('G1', 'G2', 'G5', 'GREEN')`;
    } else if (filters.priceStatus === '=>RED') {
      query += ` AND price_position IN ('R1', 'R2', 'R5', 'RED')`;
    } else {
      query += ` AND price_position = ?`;
      params.push(filters.priceStatus);
    }
  }
  
  // Market cap filter
  if (filters.marketCapType) {
    query += ` AND market_cap_type = ?`;
    params.push(filters.marketCapType);
  }
  
  // Sector filter
  if (filters.sectors && filters.sectors.length > 0) {
    const placeholders = filters.sectors.map(() => '?').join(',');
    query += ` AND sector IN (${placeholders})`;
    params.push(...filters.sectors);
  }
  
  // Price range
  if (filters.priceMin) {
    query += ` AND close >= ?`;
    params.push(filters.priceMin);
  }
  if (filters.priceMax) {
    query += ` AND close <= ?`;
    params.push(filters.priceMax);
  }
  
  // Min volume
  if (filters.minVolume) {
    query += ` AND volume >= ?`;
    params.push(filters.minVolume);
  }
  
  // Limit
  query += ` ORDER BY volume DESC LIMIT ?`;
  params.push(filters.limit || 50);
  
  const results = await db.query(query, params);
  return results;
}
```

### Component 2: Evaluation Panel (Đánh Giá)

#### Metrics Displayed:
```javascript
const EVALUATION_METRICS = {
  strength: {
    label_vn: 'SỨC MẠNH',
    label_en: 'STRENGTH',
    calculation: (data) => {
      // % of advancing stocks
      const advancers = data.filter(s => s.change > 0).length;
      return ((advancers / data.length) * 10).toFixed(2);
    },
    color: (value) => value > 5 ? 'green' : 'red'
  },
  
  dispersion: {
    label_vn: 'PHÂN HÓA',
    label_en: 'DISPERSION',
    calculation: (data) => {
      // Not implemented in manual, placeholder
      return 0.00;
    }
  },
  
  balance: {
    label_vn: 'CÂN BẰNG',
    label_en: 'BALANCE',
    calculation: (data) => {
      const advancing = data.filter(s => s.change > 0).length;
      const declining = data.filter(s => s.change < 0).length;
      const ratio = advancing / declining;
      return ratio.toFixed(2);
    },
    interpretation: (value) => {
      if (value > 1.5) return 'Buyer Dominated';
      if (value < 0.67) return 'Seller Dominated';
      return 'Balanced';
    }
  },
  
  quality: {
    label_vn: 'CHẤT LƯỢNG',
    label_en: 'QUALITY',
    calculation: (data) => {
      // Average volume as quality indicator
      const avgVol = data.reduce((sum, s) => sum + s.volume, 0) / data.length;
      return (avgVol / 1000000).toFixed(2); // In millions
    }
  }
};
```

### Component 3: Volatility Indicator (Độ Khó)

Shows market difficulty levels across different timeframes:

```javascript
function calculateVolatilityIndicator(symbol) {
  const timeframes = ['Intraday', 'T-1', 'T-2', 'A-5'];
  const indicators = {};
  
  timeframes.forEach(tf => {
    const data = getHistoricalData(symbol, tf);
    const volatility = calculateATR(data); // Average True Range
    
    // Classify volatility
    let level, color;
    if (volatility < 1) {
      level = 'YẾU'; // Weak
      color = 'green';
    } else if (volatility < 2) {
      level = 'TB'; // Average
      color = 'yellow';
    } else if (volatility < 3) {
      level = 'KHÁI'; // Volatile
      color = 'orange';
    } else {
      level = 'TỐT'; // Strong
      color: 'red';
    }
    
    indicators[tf] = { volatility, level, color };
  });
  
  return indicators;
}

// Render as horizontal bar chart
function renderVolatilityIndicator(indicators) {
  return (
    <div className="volatility-grid">
      {Object.entries(indicators).map(([tf, data]) => (
        <div key={tf} className="volatility-row">
          <span className="timeframe-label">{tf}</span>
          <div className="bar-container">
            <div 
              className="bar" 
              style={{
                width: `${data.volatility * 20}%`,
                backgroundColor: data.color
              }}
            />
          </div>
          <span className="level-label">{data.level}</span>
        </div>
      ))}
    </div>
  );
}
```

### Component 4: Trend Lines (Xu Hướng)

Multi-period moving average strength visualization:

```javascript
function calculateTrendStrength(symbol) {
  const periods = [
    { name: 'Sức Mạnh Thị Trường', days: 1, color: '#00FF00' },
    { name: 'Độ Cân Bằng', days: 1, color: '#FFFF00' },
    { name: 'Chất Lượng', days: 1, color: '#FFA500' },
    { name: 'Độ Phân Hóa (-)', days: 1, color: '#FF0000' }
  ];
  
  const trendData = periods.map(period => {
    const historicalData = getHistoricalData(symbol, period.days);
    const values = historicalData.map(d => d.value);
    
    // Calculate exponential moving average
    const ema = calculateEMA(values, period.days);
    
    return {
      name: period.name,
      color: period.color,
      values: ema,
      current: ema[ema.length - 1]
    };
  });
  
  return trendData;
}

// Render as line chart
function renderTrendChart(trendData) {
  return (
    <LineChart width={400} height={200} data={trendData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Legend />
      {trendData.map(trend => (
        <Line 
          key={trend.name}
          type="monotone"
          dataKey={trend.name}
          stroke={trend.color}
          strokeWidth={2}
        />
      ))}
    </LineChart>
  );
}
```

---

## TECHNICAL ARCHITECTURE

### Technology Stack Recommendation

#### Frontend
```javascript
{
  framework: 'React 18+ with TypeScript',
  stateManagement: 'Redux Toolkit + RTK Query',
  styling: 'Tailwind CSS + shadcn/ui components',
  charting: [
    'Recharts (primary - responsive, declarative)',
    'D3.js (custom visualizations)',
    'TradingView Lightweight Charts (candlestick charts)'
  ],
  realtime: 'Socket.io-client',
  dataGrid: 'AG Grid React (for Matrix view)',
  deployment: 'Vercel or Netlify',
  
  keyLibraries: {
    'recharts': '^2.10.0',
    'd3': '^7.8.5',
    'lightweight-charts': '^4.1.0',
    'socket.io-client': '^4.7.0',
    'ag-grid-react': '^31.0.0',
    '@tanstack/react-query': '^5.0.0'
  }
}
```

**Example React Component Structure:**
```typescript
// src/components/Dashboard/InterLayerMatrix.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgGridReact } from 'ag-grid-react';

interface MatrixCell {
  layer: string;
  sector: string;
  strength: number;
  relativeStrength: number;
  color: string;
  status: string;
}

export const InterLayerMatrix: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['interLayerMatrix'],
    queryFn: fetchInterLayerMatrix,
    refetchInterval: 60000 // Refresh every minute
  });

  const columnDefs = [
    { field: 'layer', headerName: 'Layer', pinned: 'left' },
    ...SECTORS.map(sector => ({
      field: sector.code,
      headerName: sector.name,
      cellStyle: (params) => ({
        backgroundColor: params.data[sector.code]?.color,
        color: 'white',
        fontWeight: 'bold'
      }),
      valueFormatter: (params) => params.value?.relativeStrength.toFixed(2)
    }))
  ];

  if (isLoading) return <div>Loading matrix...</div>;

  return (
    <div className="ag-theme-alpine-dark h-full">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={data.matrix.cells}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true
        }}
      />
    </div>
  );
};
```

#### Backend
```javascript
{
  runtime: 'Node.js 20+ LTS',
  framework: 'Express.js or Fastify (for better performance)',
  language: 'TypeScript',
  database: {
    primary: 'PostgreSQL 16 (TimescaleDB extension for time-series)',
    cache: 'Redis 7.x (real-time data, session management)',
    analytics: 'ClickHouse (optional - for heavy analytics queries)'
  },
  orm: 'Prisma or TypeORM',
  realtime: 'Socket.io',
  jobQueue: 'Bull (Redis-based job queue for data fetching)',
  monitoring: 'Prometheus + Grafana',
  logging: 'Winston + Elasticsearch',
  
  keyDependencies: {
    'express': '^4.18.0',
    'socket.io': '^4.7.0',
    'prisma': '^5.7.0',
    'ioredis': '^5.3.0',
    'bull': '^4.12.0',
    'ws': '^8.16.0' // For external WebSocket connections
  }
}
```

**Example Backend API Structure:**
```typescript
// src/api/routes/volatility.routes.ts
import { Router } from 'express';
import { VolatilityController } from '../controllers/volatility.controller';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();
const controller = new VolatilityController();

// Range & Correlation endpoint
router.get(
  '/range-correlation',
  cacheMiddleware(60), // Cache for 60 seconds
  controller.getRangeCorrelation
);

// Daily volatility endpoint
router.get(
  '/daily',
  cacheMiddleware(30),
  controller.getDailyVolatility
);

export default router;

// src/controllers/volatility.controller.ts
import { Request, Response } from 'express';
import { VolatilityService } from '../services/volatility.service';

export class VolatilityController {
  private service = new VolatilityService();

  getRangeCorrelation = async (req: Request, res: Response) => {
    try {
      const sessions = parseInt(req.query.sessions as string) || 20;
      
      const data = await this.service.calculateRangeCorrelation(sessions);
      
      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };

  getDailyVolatility = async (req: Request, res: Response) => {
    // Implementation
  };
}
```

#### Database Schema (PostgreSQL + TimescaleDB)
```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Main stocks table
CREATE TABLE stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  exchange VARCHAR(10), -- HOSE, HNX, UPCOM
  sector_code VARCHAR(50),
  industry_code VARCHAR(50),
  market_cap_type VARCHAR(20), -- BLUECHIP, MIDCAP, PENNY
  listing_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series price data (hypertable)
CREATE TABLE stock_prices (
  time TIMESTAMPTZ NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  open NUMERIC(10, 2),
  high NUMERIC(10, 2),
  low NUMERIC(10, 2),
  close NUMERIC(10, 2),
  volume BIGINT,
  value BIGINT,
  change_percent NUMERIC(5, 2),
  foreign_buy_volume BIGINT,
  foreign_sell_volume BIGINT,
  
  FOREIGN KEY (symbol) REFERENCES stocks(symbol)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('stock_prices', 'time');

-- Create indexes
CREATE INDEX idx_stock_prices_symbol_time ON stock_prices (symbol, time DESC);
CREATE INDEX idx_stock_prices_time ON stock_prices (time DESC);

-- Intraday ticks (hypertable)
CREATE TABLE stock_ticks (
  time TIMESTAMPTZ NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  price NUMERIC(10, 2),
  volume INTEGER,
  side VARCHAR(4), -- BUY, SELL
  match_type VARCHAR(10), -- ATO, ATC, LO, MP
  
  FOREIGN KEY (symbol) REFERENCES stocks(symbol)
);

SELECT create_hypertable('stock_ticks', 'time');
CREATE INDEX idx_stock_ticks_symbol_time ON stock_ticks (symbol, time DESC);

-- Index data
CREATE TABLE index_prices (
  time TIMESTAMPTZ NOT NULL,
  index_code VARCHAR(20) NOT NULL, -- VNINDEX, VN30, HNX, etc.
  open NUMERIC(10, 2),
  high NUMERIC(10, 2),
  low NUMERIC(10, 2),
  close NUMERIC(10, 2),
  volume BIGINT,
  value BIGINT,
  change_percent NUMERIC(5, 2),
  advancing INTEGER,
  declining INTEGER,
  unchanged INTEGER
);

SELECT create_hypertable('index_prices', 'time');

-- Futures data
CREATE TABLE futures_prices (
  time TIMESTAMPTZ NOT NULL,
  contract_code VARCHAR(20) NOT NULL, -- VN30F1M, VN30F2M
  open NUMERIC(10, 2),
  high NUMERIC(10, 2),
  low NUMERIC(10, 2),
  close NUMERIC(10, 2),
  volume BIGINT,
  open_interest BIGINT,
  settlement_price NUMERIC(10, 2)
);

SELECT create_hypertable('futures_prices', 'time');

-- Sector/Industry mappings
CREATE TABLE sectors (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  parent_code VARCHAR(50),
  level INTEGER -- 1 = sector, 2 = industry, 3 = sub-industry
);

CREATE TABLE stock_sector_mapping (
  symbol VARCHAR(10) NOT NULL,
  sector_code VARCHAR(50) NOT NULL,
  
  PRIMARY KEY (symbol, sector_code),
  FOREIGN KEY (symbol) REFERENCES stocks(symbol),
  FOREIGN KEY (sector_code) REFERENCES sectors(code)
);

-- Calculated metrics cache
CREATE TABLE market_metrics_cache (
  metric_type VARCHAR(50) NOT NULL, -- 'inter_layer_matrix', 'volatility_daily', etc.
  metric_key VARCHAR(100) NOT NULL, -- e.g., 'BLUECHIP_BDS', '2025-11-17'
  data JSONB NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  
  PRIMARY KEY (metric_type, metric_key)
);

CREATE INDEX idx_metrics_expires ON market_metrics_cache(expires_at);

-- Continuous aggregates for performance (TimescaleDB feature)
CREATE MATERIALIZED VIEW daily_stock_summary
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 day', time) AS day,
  symbol,
  first(open, time) as open,
  max(high) as high,
  min(low) as low,
  last(close, time) as close,
  sum(volume) as volume,
  sum(value) as value
FROM stock_prices
GROUP BY day, symbol;

-- Refresh policy (auto-update)
SELECT add_continuous_aggregate_policy('daily_stock_summary',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour');
```

#### Redis Data Structures
```javascript
// Real-time quote cache
// Key: quote:{symbol}
// Value: JSON string
// TTL: 5 seconds
{
  symbol: 'VCB',
  price: 95400,
  change: 2.1,
  volume: 1234567,
  timestamp: '2025-11-17T07:45:00Z'
}

// Market strength cache
// Key: strength:{layer}:{sector}
// Value: JSON string
// TTL: 60 seconds
{
  layer: 'BLUECHIP',
  sector: 'NGANHANG',
  strength: 3.45,
  timestamp: '2025-11-17T07:45:00Z'
}

// Volatility distribution cache
// Key: volatility:daily:{date}
// Value: JSON string
// TTL: 300 seconds (5 minutes)
{
  date: '2025-11-17',
  distribution: { /* ... */ },
  calculated_at: '2025-11-17T07:40:00Z'
}

// WebSocket session management
// Key: ws:session:{sessionId}
// Value: JSON string
// TTL: No expiry (removed on disconnect)
{
  userId: 'user123',
  connectedAt: '2025-11-17T07:30:00Z',
  subscriptions: ['VNINDEX', 'VCB', 'VIC']
}

// Rate limiting
// Key: ratelimit:{ip}:{endpoint}
// Value: Request count
// TTL: 60 seconds
```

#### Real-time Data Flow Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL DATA SOURCES                      │
│  SSI WebSocket │ VNDIRECT API │ VNX Data │ FiinTrade      │
└────────┬────────────────┬───────────┬─────────────┬────────┘
         │                │           │             │
         ▼                ▼           ▼             ▼
    ┌────────────────────────────────────────────────────┐
    │         DATA INGESTION LAYER (Node.js Workers)     │
    │                                                     │
    │  ┌──────────────┐  ┌──────────────┐               │
    │  │ WebSocket    │  │ REST API     │               │
    │  │ Connector    │  │ Poller       │               │
    │  └──────┬───────┘  └──────┬───────┘               │
    └─────────┼──────────────────┼────────────────────────┘
              │                  │
              ▼                  ▼
         ┌─────────────────────────────┐
         │   REDIS (Message Queue)     │
         │   - Real-time quotes        │
         │   - Market events           │
         └────────────┬────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────────┐        ┌──────────────────┐
    │  PostgreSQL │        │  Calculation      │
    │  TimescaleDB│◄───────│  Engine           │
    │             │        │  (Background Jobs)│
    └─────────────┘        └──────────────────┘
         │                         │
         │                         ▼
         │                  ┌──────────────────┐
         │                  │  REDIS (Cache)   │
         │                  │  - Metrics       │
         │                  │  - Aggregates    │
         │                  └──────────────────┘
         │                         │
         ▼                         ▼
    ┌───────────────────────────────────────┐
    │      APPLICATION SERVER (Express)      │
    │                                        │
    │  ┌──────────┐      ┌──────────────┐  │
    │  │ REST API │      │ WebSocket    │  │
    │  │ Endpoints│      │ Server       │  │
    │  └────┬─────┘      └──────┬───────┘  │
    └───────┼────────────────────┼──────────┘
            │                    │
            ▼                    ▼
       ┌─────────────────────────────────┐
       │      FRONTEND (React)           │
       │                                 │
       │  ┌──────────┐  ┌─────────────┐ │
       │  │ API      │  │ WebSocket   │ │
       │  │ Calls    │  │ Connection  │ │
       │  └──────────┘  └─────────────┘ │
       │                                 │
       │  Dashboard Components           │
       └─────────────────────────────────┘
```

#### Background Job Processing
```typescript
// src/jobs/marketDataJob.ts
import Bull from 'bull';
import { MarketDataService } from '../services/marketData.service';

const marketDataQueue = new Bull('market-data', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

// Job: Fetch and process market data every minute
marketDataQueue.process('fetch-quotes', async (job) => {
  const service = new MarketDataService();
  
  console.log(`[${new Date().toISOString()}] Fetching market quotes...`);
  
  try {
    // Fetch from external API
    const quotes = await service.fetchLatestQuotes();
    
    // Store in database
    await service.saveQuotes(quotes);
    
    // Update Redis cache
    await service.cacheQuotes(quotes);
    
    // Emit to connected WebSocket clients
    io.emit('marketUpdate', quotes);
    
    console.log(`Successfully processed ${quotes.length} quotes`);
    return { success: true, count: quotes.length };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
});

// Job: Calculate market metrics every 5 minutes
marketDataQueue.process('calculate-metrics', async (job) => {
  const service = new MarketDataService();
  
  console.log(`[${new Date().toISOString()}] Calculating market metrics...`);
  
  try {
    // Calculate inter-layer matrix
    const matrix = await service.calculateInterLayerMatrix();
    
    // Calculate volatility metrics
    const volatility = await service.calculateVolatilityMetrics();
    
    // Cache results
    await service.cacheMetrics({ matrix, volatility });
    
    return { success: true };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    throw error;
  }
});

// Schedule jobs
marketDataQueue.add('fetch-quotes', {}, {
  repeat: { cron: '*/1 * * * *' } // Every minute
});

marketDataQueue.add('calculate-metrics', {}, {
  repeat: { cron: '*/5 * * * *' } // Every 5 minutes
});

export default marketDataQueue;
```

---

## DEVELOPMENT PHASES

### Phase 1: Foundation & Data Pipeline (Weeks 1-3)

#### Week 1: Project Setup & Database
- [ ] Initialize Git repository
- [ ] Setup development environment (Docker Compose)
- [ ] Configure PostgreSQL + TimescaleDB
- [ ] Create database schema
- [ ] Setup Redis
- [ ] Initialize Node.js backend project structure
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Setup environment variables (.env)

**Deliverables:**
- Working local development environment
- Database with schema migrations
- Basic Express server responding to health checks

#### Week 2: Data Ingestion Layer
- [ ] Research and document available Vietnamese stock APIs
- [ ] Implement SSI WebSocket connector
- [ ] Implement VNDIRECT REST API client
- [ ] Create data normalization layer
- [ ] Setup Bull queue for background jobs
- [ ] Implement historical data backfill script
- [ ] Add error handling and retry logic

**Deliverables:**
- Automated data fetching from at least 2 sources
- Historical data for 500+ stocks (last 2 years)
- Real-time quote updates (if API available)

#### Week 3: Calculation Engine
- [ ] Implement strength calculation functions
- [ ] Implement sector classification logic
- [ ] Create layer-sector intersection logic
- [ ] Build volatility classification algorithms
- [ ] Develop correlation calculation engine
- [ ] Write unit tests for all calculations
- [ ] Performance optimization (parallel processing)

**Deliverables:**
- All core calculation functions tested and working
- Benchmark showing calculations can complete in <5 seconds
- Documentation of calculation logic

### Phase 2: API Development (Weeks 4-5)

#### Week 4: REST API Endpoints
- [ ] Design API contract (OpenAPI/Swagger)
- [ ] Implement `/api/v1/matrix/inter-layer` endpoint
- [ ] Implement `/api/v1/volatility/range-correlation` endpoint
- [ ] Implement `/api/v1/volatility/daily` endpoint
- [ ] Implement `/api/v1/correlation/futures-underlying` endpoint
- [ ] Add caching middleware
- [ ] Add rate limiting
- [ ] Write API documentation

**Deliverables:**
- Complete REST API with 10+ endpoints
- Swagger/OpenAPI documentation
- Postman collection for testing

#### Week 5: WebSocket & Real-time
- [ ] Setup Socket.io server
- [ ] Implement real-time quote streaming
- [ ] Create subscription management system
- [ ] Add authentication for WebSocket
- [ ] Implement reconnection logic
- [ ] Load testing (simulate 1000+ concurrent connections)
- [ ] Monitor memory usage and optimize

**Deliverables:**
- Working WebSocket server
- Sub-100ms latency for quote updates
- Support for 1000+ concurrent users

### Phase 3: Frontend Development (Weeks 6-9)

#### Week 6: Project Setup & Layout
- [ ] Initialize React project (Vite or Create React App)
- [ ] Setup Tailwind CSS
- [ ] Configure routing (React Router)
- [ ] Create base layout components (Header, Sidebar, Footer)
- [ ] Implement authentication UI (login/register)
- [ ] Setup Redux Toolkit store
- [ ] Configure API client (RTK Query)

**Deliverables:**
- React app with authentication
- Responsive layout working on desktop and mobile
- Basic navigation between pages

#### Week 7: Dashboard - Matrix & Filters
- [ ] Implement Control Panel (Bộ Lọc) component
- [ ] Build Inter-Layer Matrix visualization (AG Grid)
- [ ] Add color-coding logic for matrix cells
- [ ] Create tooltip/hover effects for cells
- [ ] Implement filter application logic
- [ ] Add loading states and error handling
- [ ] Responsive design for mobile

**Deliverables:**
- Working Inter-Layer Matrix component
- All filters functional
- Drill-down capability (click on cell → see stock list)

#### Week 8: Charts & Visualizations
- [ ] Implement Range & Correlation chart (Recharts)
- [ ] Build Daily Volatility Distribution chart
- [ ] Create Futures-Underlying scatter plot
- [ ] Add Trend Lines component
- [ ] Implement Volatility Indicator bars
- [ ] Add chart export functionality (PNG/PDF)
- [ ] Optimize chart rendering performance

**Deliverables:**
- All 4 major chart components working
- Interactive tooltips and legends
- Smooth animations and transitions

#### Week 9: Matrix View & Stock Details
- [ ] Create Matrix table view with sorting/filtering
- [ ] Implement individual stock detail modal
- [ ] Add stock comparison functionality
- [ ] Build watchlist feature
- [ ] Implement portfolio tracking (if scope allows)
- [ ] Add favorites/bookmarks
- [ ] Create settings page

**Deliverables:**
- Complete Matrix view with all features
- Stock detail page with comprehensive data
- User preferences saved to localStorage

### Phase 4: Testing & Optimization (Weeks 10-11)

#### Week 10: Testing
- [ ] Write unit tests for all React components
- [ ] Backend integration tests
- [ ] End-to-end tests (Playwright or Cypress)
- [ ] Performance testing (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing backend APIs

**Deliverables:**
- 80%+ code coverage
- All critical user flows tested
- Performance score >90 on Lighthouse

#### Week 11: Optimization & Bug Fixes
- [ ] Database query optimization
- [ ] Redis caching optimization
- [ ] Frontend bundle size reduction
- [ ] Image optimization
- [ ] Code splitting and lazy loading
- [ ] Fix all critical and high-priority bugs
- [ ] Security audit

**Deliverables:**
- Sub-2 second page load times
- < 500KB initial bundle size
- Zero critical security vulnerabilities

### Phase 5: Deployment & Launch (Week 12)

#### Week 12: Deployment
- [ ] Setup production server (VPS or cloud)
- [ ] Configure Nginx reverse proxy
- [ ] Setup SSL certificates (Let's Encrypt)
- [ ] Configure environment variables for production
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Database backup strategy
- [ ] Monitoring setup (PM2, Prometheus, Grafana)
- [ ] Error tracking (Sentry)
- [ ] Soft launch to beta users
- [ ] Collect feedback and iterate

**Deliverables:**
- Live production application
- 99.9% uptime guarantee
- Automated deployment pipeline

---

## DEPLOYMENT STRATEGY

### Infrastructure Options

#### Option A: Self-Hosted VPS (Cost-Effective)
```yaml
Provider: DigitalOcean or Vultr
Specs:
  - CPU: 4 vCPU
  - RAM: 8GB
  - Storage: 160GB SSD
  - Bandwidth: 5TB
  - Cost: ~$40-60/month

Services:
  - Nginx (Reverse Proxy + SSL)
  - Node.js (Application Server)
  - PostgreSQL 16 + TimescaleDB
  - Redis
  - PM2 (Process Manager)
```

#### Option B: Cloud Platform (Scalable)
```yaml
Provider: AWS or Google Cloud Platform

Frontend:
  - Vercel or Netlify (Free tier)
  - Cloudflare CDN

Backend:
  - AWS EC2 t3.medium (App Server)
  - AWS RDS PostgreSQL (Database)
  - AWS ElastiCache Redis (Cache)
  - AWS CloudWatch (Monitoring)
  
Estimated Cost: ~$100-150/month
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          npm install
          npm run test
          
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
          
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/stockapp
            git pull origin main
            npm install
            pm2 restart all
```

### Monitoring & Alerts
```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeWebSocketConnections = new prometheus.Gauge({
  name: 'active_websocket_connections',
  help: 'Number of active WebSocket connections'
});

// Alert rules (Alertmanager)
// Alert if API response time > 2 seconds for 5 minutes
// Alert if WebSocket connections drop by 50% suddenly
// Alert if database CPU > 80% for 10 minutes
// Alert if Redis memory usage > 90%
```

---

## ADDITIONAL CONSIDERATIONS

### Security
- [ ] Implement JWT authentication
- [ ] Rate limiting per user/IP
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection (Content Security Policy)
- [ ] CORS configuration
- [ ] Environment variable protection
- [ ] Regular security audits

### Legal & Compliance
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Data retention policy
- [ ] GDPR compliance (if applicable)
- [ ] Copyright notices for data sources
- [ ] API usage agreements with data providers

### Future Enhancements (Phase 6+)
- [ ] Mobile app (React Native)
- [ ] Stock alerts and notifications
- [ ] AI-powered stock recommendations
- [ ] Backtesting engine
- [ ] Portfolio analytics
- [ ] Social features (share analysis)
- [ ] Export to Excel/CSV
- [ ] Multi-language support (English/Vietnamese)
- [ ] Dark mode
- [ ] Advanced technical indicators

---

## APPENDIX

### Glossary of Vietnamese Terms
```javascript
const VIETNAMESE_GLOSSARY = {
  'Liên Tầng Thị Trường 5 Cấp': 'Market Inter-layer 5 Levels',
  'Biên Độ': 'Volatility / Price Range',
  'Tương Quan': 'Correlation',
  'Sức Mạnh': 'Strength',
  'Lan Tỏa': 'Spread / Breadth',
  'Phân Hóa': 'Divergence / Dispersion',
  'Chất Lượng': 'Quality',
  'Cân Bằng': 'Balance',
  'Đồng Pha': 'In Phase / Synchronized',
  'Đi Ngược Hướng': 'Out of Phase / Divergent',
  'Phái Sinh': 'Derivatives / Futures',
  'Cơ Sở': 'Underlying / Spot',
  'Bất Động Sản': 'Real Estate (BDS)',
  'Ngân Hàng': 'Banking',
  'Chứng Khoán': 'Securities / Brokerage',
  'Đột Biến': 'Sudden Spike / Anomaly',
  'FOMO': 'Fear Of Missing Out',
  'Hoảng Loạn': 'Panic Selling',
  'Lợi Thế Bên Bán': 'Seller Advantage',
  'Lợi Thế Bên Mua': 'Buyer Advantage'
};
```

### Useful Resources
```
Vietnamese Stock Market APIs:
- SSI iBoard: https://iboard.ssi.com.vn
- VNDIRECT: https://www.vndirect.com.vn
- VPS SmartOne: https://www.vps.com.vn
- FiinTrade: https://fiintrade.vn

Technical Documentation:
- TimescaleDB: https://docs.timescale.com
- Socket.io: https://socket.io/docs
- Recharts: https://recharts.org
- AG Grid: https://www.ag-grid.com/react-data-grid

Vietnamese Market Information:
- HOSE: https://www.hsx.vn
- HNX: https://www.hnx.vn
- SSI Research: https://www.ssi.com.vn
```

---

## CONTACT & SUPPORT

For questions or clarifications about this specification:
- Technical Lead: [Your Name]
- Project Manager: [PM Name]
- Repository: [GitHub URL]
- Documentation: [Wiki URL]

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** Draft for Review

