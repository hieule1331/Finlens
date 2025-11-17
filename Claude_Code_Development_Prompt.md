# CLAUDE CODE - OPTIMIZED DEVELOPMENT PROMPT
## Vietnamese Stock Market Web Application

**IMPORTANT INSTRUCTIONS FOR CLAUDE CODE:**
- Work incrementally in small, focused steps
- Complete one feature fully before moving to the next
- Test each component before proceeding
- Ask for confirmation before major architecture decisions

---

## PROJECT OVERVIEW

Build a Vietnamese stock market analysis web application based on Finlens StockApp 2.0, featuring:
1. Market Inter-layer 5 Levels Matrix
2. Multi-day Volatility Analysis
3. Daily Volatility Distribution
4. Futures-Underlying Correlation

---

## PHASE 1: PROJECT SETUP (START HERE)

### Step 1: Initialize Backend
```bash
# Create project structure
mkdir vietnamese-stock-app
cd vietnamese-stock-app
mkdir backend frontend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors dotenv
npm install typescript @types/node @types/express ts-node nodemon --save-dev

# Create basic structure
mkdir src
mkdir src/routes src/controllers src/services src/utils
touch src/server.ts
touch .env
touch tsconfig.json
```

**File: tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

**File: src/server.ts**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**File: package.json - Add scripts**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 2: Test Backend
```bash
npm run dev
# Visit http://localhost:5000/health
# Should see: {"status":"ok","timestamp":"..."}
```

**✅ CHECKPOINT:** Backend server running? → Proceed to Step 3

---

### Step 3: Setup Database (PostgreSQL)

**Option A: Docker (Recommended)**
```yaml
# File: docker-compose.yml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_USER: stockapp
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: vietnamese_stocks
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Start services:**
```bash
docker-compose up -d
```

**Install database client:**
```bash
npm install pg
npm install @types/pg --save-dev
```

**File: src/utils/database.ts**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'stockapp',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vietnamese_stocks',
  password: process.env.DB_PASSWORD || 'dev_password_123',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

export default pool;
```

**Create initial schema:**
```sql
-- File: src/database/schema.sql
CREATE TABLE IF NOT EXISTS stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  exchange VARCHAR(10),
  sector VARCHAR(50),
  market_cap_type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS stock_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  open DECIMAL(10,2),
  high DECIMAL(10,2),
  low DECIMAL(10,2),
  close DECIMAL(10,2),
  volume BIGINT,
  change_percent DECIMAL(5,2),
  UNIQUE(symbol, date)
);

CREATE INDEX idx_prices_symbol_date ON stock_prices(symbol, date DESC);
```

**Migration script:**
```typescript
// File: src/database/migrate.ts
import fs from 'fs';
import path from 'path';
import { query } from '../utils/database';

async function runMigration() {
  const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf-8'
  );
  
  try {
    await query(schema);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit();
}

runMigration();
```

**Run migration:**
```bash
npx ts-node src/database/migrate.ts
```

**✅ CHECKPOINT:** Database tables created? → Proceed to Step 4

---

### Step 4: Sample Data Generator

**File: src/utils/sampleData.ts**
```typescript
export const SECTORS = [
  'BDS', 'NGANHANG', 'CHUNGKHOAN', 'THEP', 
  'DAUKI', 'DIEN', 'THUCPHAM', 'CONGNGHE'
];

export const MARKET_CAP_TYPES = ['BLUECHIP', 'MIDCAP', 'PENNY'];

export function generateSampleStocks(count: number = 50) {
  const stocks = [];
  
  for (let i = 0; i < count; i++) {
    const symbol = `STOCK${i.toString().padStart(3, '0')}`;
    stocks.push({
      symbol: symbol,
      name: `Company ${symbol}`,
      exchange: i % 3 === 0 ? 'HOSE' : i % 3 === 1 ? 'HNX' : 'UPCOM',
      sector: SECTORS[i % SECTORS.length],
      market_cap_type: MARKET_CAP_TYPES[i % MARKET_CAP_TYPES.length]
    });
  }
  
  return stocks;
}

export function generateSamplePrices(symbol: string, days: number = 20) {
  const prices = [];
  let basePrice = 10000 + Math.random() * 90000; // 10k-100k VND
  
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random walk
    const change = (Math.random() - 0.5) * 0.1; // ±10% max
    basePrice = basePrice * (1 + change);
    
    const open = basePrice * (0.98 + Math.random() * 0.04);
    const close = basePrice * (0.98 + Math.random() * 0.04);
    const high = Math.max(open, close) * (1 + Math.random() * 0.05);
    const low = Math.min(open, close) * (1 - Math.random() * 0.05);
    
    prices.push({
      symbol: symbol,
      date: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.floor(Math.random() * 10000000),
      change_percent: ((close - open) / open * 100).toFixed(2)
    });
  }
  
  return prices;
}
```

**File: src/database/seed.ts**
```typescript
import { query } from '../utils/database';
import { generateSampleStocks, generateSamplePrices } from '../utils/sampleData';

async function seedDatabase() {
  console.log('Starting database seed...');
  
  // Clear existing data
  await query('DELETE FROM stock_prices');
  await query('DELETE FROM stocks');
  
  // Insert stocks
  const stocks = generateSampleStocks(50);
  
  for (const stock of stocks) {
    await query(
      'INSERT INTO stocks (symbol, name, exchange, sector, market_cap_type) VALUES ($1, $2, $3, $4, $5)',
      [stock.symbol, stock.name, stock.exchange, stock.sector, stock.market_cap_type]
    );
  }
  
  console.log(`Inserted ${stocks.length} stocks`);
  
  // Insert historical prices
  let totalPrices = 0;
  for (const stock of stocks) {
    const prices = generateSamplePrices(stock.symbol, 20);
    
    for (const price of prices) {
      await query(
        `INSERT INTO stock_prices 
         (symbol, date, open, high, low, close, volume, change_percent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [price.symbol, price.date, price.open, price.high, 
         price.low, price.close, price.volume, price.change_percent]
      );
      totalPrices++;
    }
  }
  
  console.log(`Inserted ${totalPrices} price records`);
  console.log('Database seed completed!');
  process.exit();
}

seedDatabase();
```

**Run seed:**
```bash
npx ts-node src/database/seed.ts
```

**✅ CHECKPOINT:** Sample data inserted? → Proceed to Step 5

---

### Step 5: First API Endpoint

**File: src/services/marketData.service.ts**
```typescript
import { query } from '../utils/database';

export class MarketDataService {
  async getLatestPrices(limit: number = 50) {
    const result = await query(`
      SELECT DISTINCT ON (s.symbol)
        s.symbol,
        s.name,
        s.sector,
        s.market_cap_type,
        p.close as price,
        p.change_percent,
        p.volume,
        p.date
      FROM stocks s
      JOIN stock_prices p ON s.symbol = p.symbol
      ORDER BY s.symbol, p.date DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }
  
  async getStockHistory(symbol: string, days: number = 20) {
    const result = await query(`
      SELECT *
      FROM stock_prices
      WHERE symbol = $1
      ORDER BY date DESC
      LIMIT $2
    `, [symbol, days]);
    
    return result.rows;
  }
}
```

**File: src/controllers/market.controller.ts**
```typescript
import { Request, Response } from 'express';
import { MarketDataService } from '../services/marketData.service';

export class MarketController {
  private service = new MarketDataService();
  
  getLatestPrices = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const data = await this.service.getLatestPrices(limit);
      
      res.json({
        success: true,
        data: data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
  getStockHistory = async (req: Request, res: Response) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const days = parseInt(req.query.days as string) || 20;
      
      const data = await this.service.getStockHistory(symbol, days);
      
      res.json({
        success: true,
        symbol: symbol,
        data: data,
        count: data.length
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}
```

**File: src/routes/market.routes.ts**
```typescript
import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';

const router = Router();
const controller = new MarketController();

router.get('/latest', controller.getLatestPrices);
router.get('/history/:symbol', controller.getStockHistory);

export default router;
```

**Update src/server.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/market.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/market', marketRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Test endpoints:**
```bash
# Test latest prices
curl http://localhost:5000/api/v1/market/latest?limit=10

# Test stock history
curl http://localhost:5000/api/v1/market/history/STOCK001?days=20
```

**✅ CHECKPOINT:** API returning data? → Proceed to Phase 2

---

## PHASE 2: CORE CALCULATIONS

### Step 6: Market Strength Calculation

**File: src/services/calculation.service.ts**
```typescript
import { query } from '../utils/database';

interface StockData {
  symbol: string;
  change_percent: number;
  volume: number;
  sector: string;
  market_cap_type: string;
}

export class CalculationService {
  async calculateLayerStrength(layer: string, date?: string) {
    // Get all stocks in this layer
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const result = await query(`
      SELECT 
        s.symbol,
        s.sector,
        s.market_cap_type,
        p.change_percent,
        p.volume
      FROM stocks s
      JOIN stock_prices p ON s.symbol = p.symbol
      WHERE p.date = $1
        AND s.market_cap_type = $2
    `, [targetDate, layer]);
    
    const stocks: StockData[] = result.rows;
    
    if (stocks.length === 0) {
      return {
        layer,
        strength: 0,
        avgChange: 0,
        advanceDeclineRatio: 0.5,
        status: 'NO_DATA'
      };
    }
    
    // Calculate average % change
    const avgChange = stocks.reduce((sum, s) => sum + parseFloat(s.change_percent), 0) / stocks.length;
    
    // Calculate advance/decline ratio
    const advancers = stocks.filter(s => parseFloat(s.change_percent) > 0).length;
    const decliners = stocks.filter(s => parseFloat(s.change_percent) < 0).length;
    const adRatio = advancers / (advancers + decliners || 1);
    
    // Composite strength score
    const strength = (avgChange * 0.6) + ((adRatio - 0.5) * 10 * 0.4);
    
    return {
      layer,
      strength: Number(strength.toFixed(2)),
      avgChange: Number(avgChange.toFixed(2)),
      advanceDeclineRatio: Number(adRatio.toFixed(2)),
      totalStocks: stocks.length,
      advancers,
      decliners,
      status: this.getStrengthStatus(strength)
    };
  }
  
  async calculateSectorStrength(sector: string, date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const result = await query(`
      SELECT 
        s.symbol,
        s.sector,
        p.change_percent
      FROM stocks s
      JOIN stock_prices p ON s.symbol = p.symbol
      WHERE p.date = $1
        AND s.sector = $2
    `, [targetDate, sector]);
    
    const stocks = result.rows;
    
    if (stocks.length === 0) {
      return { sector, strength: 0, avgChange: 0 };
    }
    
    const avgChange = stocks.reduce((sum, s) => sum + parseFloat(s.change_percent), 0) / stocks.length;
    const advancers = stocks.filter(s => parseFloat(s.change_percent) > 0).length;
    const decliners = stocks.filter(s => parseFloat(s.change_percent) < 0).length;
    const adRatio = advancers / (advancers + decliners || 1);
    
    const strength = (avgChange * 0.6) + ((adRatio - 0.5) * 10 * 0.4);
    
    return {
      sector,
      strength: Number(strength.toFixed(2)),
      avgChange: Number(avgChange.toFixed(2)),
      totalStocks: stocks.length
    };
  }
  
  private getStrengthStatus(strength: number): string {
    if (strength > 3) return 'VERY_STRONG';
    if (strength > 1) return 'STRONG';
    if (strength > -1) return 'MODERATE';
    if (strength > -3) return 'WEAK';
    return 'VERY_WEAK';
  }
}
```

**File: src/controllers/calculation.controller.ts**
```typescript
import { Request, Response } from 'express';
import { CalculationService } from '../services/calculation.service';

export class CalculationController {
  private service = new CalculationService();
  
  getLayerStrength = async (req: Request, res: Response) => {
    try {
      const layer = req.params.layer.toUpperCase();
      const date = req.query.date as string;
      
      const data = await this.service.calculateLayerStrength(layer, date);
      
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
  
  getSectorStrength = async (req: Request, res: Response) => {
    try {
      const sector = req.params.sector.toUpperCase();
      const date = req.query.date as string;
      
      const data = await this.service.calculateSectorStrength(sector, date);
      
      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  };
}
```

**Add routes:**
```typescript
// src/routes/calculation.routes.ts
import { Router } from 'express';
import { CalculationController } from '../controllers/calculation.controller';

const router = Router();
const controller = new CalculationController();

router.get('/layer/:layer', controller.getLayerStrength);
router.get('/sector/:sector', controller.getSectorStrength);

export default router;
```

**Update server.ts:**
```typescript
import calculationRoutes from './routes/calculation.routes';

// ... existing code ...

app.use('/api/v1/calculation', calculationRoutes);
```

**Test:**
```bash
curl http://localhost:5000/api/v1/calculation/layer/BLUECHIP
curl http://localhost:5000/api/v1/calculation/sector/BDS
```

**✅ CHECKPOINT:** Calculations working? → Proceed to Step 7

---

## PHASE 3: FRONTEND SETUP

### Step 7: Initialize React Frontend

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install axios recharts @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**File: tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**File: src/index.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**File: src/lib/api.ts**
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const marketApi = {
  getLatestPrices: (limit: number = 50) => 
    api.get(`/market/latest?limit=${limit}`),
  
  getStockHistory: (symbol: string, days: number = 20) =>
    api.get(`/market/history/${symbol}?days=${days}`),
};

export const calculationApi = {
  getLayerStrength: (layer: string, date?: string) =>
    api.get(`/calculation/layer/${layer}${date ? `?date=${date}` : ''}`),
  
  getSectorStrength: (sector: string, date?: string) =>
    api.get(`/calculation/sector/${sector}${date ? `?date=${date}` : ''}`),
};
```

**File: src/App.tsx**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { marketApi } from './lib/api';

const queryClient = new QueryClient();

function Dashboard() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await marketApi.getLatestPrices(20);
      setStocks(response.data.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Vietnamese Stock Market Dashboard
        </h1>
        
        <button
          onClick={fetchStocks}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Fetch Latest Prices'}
        </button>

        {stocks.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Change %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stocks.map((stock) => (
                  <tr key={stock.symbol}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(stock.price).toLocaleString('vi-VN')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      parseFloat(stock.change_percent) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(stock.change_percent).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {parseInt(stock.volume).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
```

**Start frontend:**
```bash
npm run dev
```

**✅ CHECKPOINT:** Frontend displaying stock data? → SUCCESS! Phase 1 Complete

---

## NEXT STEPS

After completing the foundation above, proceed incrementally:

1. **Inter-Layer Matrix Component**
   - Create matrix visualization
   - Add color coding logic
   - Implement filters

2. **Volatility Charts**
   - Multi-day stacked area chart
   - Daily distribution bar chart
   
3. **Correlation Scatter Plot**
   - Add futures data
   - Calculate trend lines
   - Detect divergence

4. **Polish & Deploy**
   - Add loading states
   - Error handling
   - Responsive design
   - Deploy to production

---

## TROUBLESHOOTING

**Backend won't start:**
- Check if port 5000 is available: `lsof -i :5000`
- Verify .env file exists with correct values
- Check PostgreSQL is running: `docker ps`

**Database connection fails:**
- Verify Docker containers are running
- Check connection string in .env
- Try connecting with psql: `psql -h localhost -U stockapp -d vietnamese_stocks`

**Frontend can't connect to backend:**
- Ensure CORS is enabled in backend
- Check API URL in frontend .env: `VITE_API_URL=http://localhost:5000/api/v1`
- Verify backend is running on correct port

**No data returned:**
- Run seed script: `npx ts-node src/database/seed.ts`
- Check database tables exist: `\dt` in psql
- Verify data in tables: `SELECT COUNT(*) FROM stocks;`

---

## BEST PRACTICES FOR CLAUDE CODE

1. **Work in Small Chunks**
   - Complete one endpoint at a time
   - Test after each change
   - Commit frequently

2. **Ask Questions**
   - Unclear requirements? Ask before coding
   - Multiple approaches? Discuss options
   - Stuck? Request help or alternative approach

3. **Provide Context**
   - When reporting issues, include error messages
   - Share relevant code snippets
   - Describe what you've already tried

4. **Incremental Testing**
   - Test each function independently
   - Use curl to test endpoints
   - Console.log liberally during development

---

**Ready to start? Begin with Phase 1, Step 1!**
