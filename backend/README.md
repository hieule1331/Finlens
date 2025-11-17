# Finlens Backend API

Vietnamese Stock Market Analysis Platform - Backend API

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Scripts](#scripts)

## 🎯 Overview

Finlens Backend is a RESTful API for analyzing Vietnamese stock market data. It provides endpoints for retrieving stock prices, historical data, and market summaries for stocks listed on HOSE, HNX, and UPCOM exchanges.

## ✨ Features

- **Market Data API**: Get latest prices, historical data, and market summaries
- **PostgreSQL Database**: Persistent storage for stocks and price history
- **Redis Integration**: Ready for caching and real-time features
- **TypeScript**: Full type safety and enhanced developer experience
- **Docker Support**: Easy deployment with Docker Compose
- **Sample Data**: Pre-configured with 50 Vietnamese stocks across 8 sectors

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express 5.x
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: pg (node-postgres)
- **Dev Tools**: Nodemon, ESLint, Prettier

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Docker**: v20.0.0 or higher ([Download](https://www.docker.com/get-started))
- **Docker Compose**: v2.0.0 or higher (comes with Docker Desktop)

Verify installations:

```bash
node --version    # Should be v18.0.0 or higher
npm --version     # Should be v9.0.0 or higher
docker --version  # Should be v20.0.0 or higher
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hieule1331/Finlens.git
cd Finlens/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

The default configuration should work for local development:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finlens
DB_USER=postgres
DB_PASSWORD=finlens123

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 💾 Database Setup

### 1. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose up -d
```

Verify containers are running:

```bash
docker compose ps
```

You should see:
- `finlens-postgres` - PostgreSQL database
- `finlens-redis` - Redis cache

### 2. Run Database Migrations

Create tables and schema:

```bash
npm run migrate
```

This creates:
- `stocks` table - Stock information
- `stock_prices` table - Historical price data
- Indexes for optimized queries
- Foreign key constraints

### 3. Seed Sample Data

Populate database with 50 Vietnamese stocks:

```bash
npm run seed
```

This inserts:
- 50 stocks across 8 sectors
- ~700 price records (20 days per stock)
- Data from HOSE, HNX, and UPCOM exchanges

### 4. Verify Database

Check that everything is set up correctly:

```bash
npm run db:verify
```

## 🏃 Running the Application

### Development Mode

Start the server with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

Build and run:

```bash
npm run build
npm start
```

### Test Database Connection

```bash
npm run test:db
```

## 📡 API Endpoints

Base URL: `http://localhost:3000`

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-17T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "service": "Finlens Stock Market Analysis API"
}
```

### Get Latest Prices

Get latest prices for all stocks.

```http
GET /api/v1/market/latest?limit=50
```

**Query Parameters:**
- `limit` (optional): Number of stocks to return (1-100, default: 50)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "symbol": "VCB",
      "name": "Vietcombank",
      "exchange": "HOSE",
      "sector": "NGANHANG",
      "latest_date": "2024-11-17T00:00:00.000Z",
      "open": 85.5,
      "high": 87.2,
      "low": 84.8,
      "close": 86.9,
      "volume": 1500000
    }
  ]
}
```

### Get Stock History

Get historical price data for a specific stock.

```http
GET /api/v1/market/history/:symbol?days=30
```

**Path Parameters:**
- `symbol` (required): Stock symbol (e.g., VCB, VIC, FPT)

**Query Parameters:**
- `days` (optional): Number of days (1-365, default: 30)

**Example:**
```bash
curl http://localhost:3000/api/v1/market/history/VCB?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "VCB",
    "name": "Vietcombank",
    "exchange": "HOSE",
    "sector": "NGANHANG",
    "prices": [
      {
        "date": "2024-11-17T00:00:00.000Z",
        "open": 85.5,
        "high": 87.2,
        "low": 84.8,
        "close": 86.9,
        "volume": 1500000,
        "adjusted_close": 86.9
      }
    ]
  }
}
```

### Get Market Summary

Get overall market statistics.

```http
GET /api/v1/market/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_stocks": 50,
    "total_volume": 75000000,
    "exchanges": [
      {
        "exchange": "HOSE",
        "stock_count": 40,
        "total_volume": 65000000
      }
    ],
    "sectors": [
      {
        "sector": "NGANHANG",
        "stock_count": 10
      }
    ],
    "date": "2024-11-17T00:00:00.000Z"
  }
}
```

## 🗄 Database Schema

### Stocks Table

Stores information about Vietnamese stocks.

```sql
CREATE TABLE stocks (
    symbol VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    exchange VARCHAR(10) NOT NULL,  -- HOSE, HNX, or UPCOM
    industry VARCHAR(100),
    sector VARCHAR(100),
    listing_date DATE,
    outstanding_shares BIGINT,
    market_cap DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stock Prices Table

Stores historical price data.

```sql
CREATE TABLE stock_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL REFERENCES stocks(symbol) ON DELETE CASCADE,
    date DATE NOT NULL,
    open DECIMAL(15, 2) NOT NULL,
    high DECIMAL(15, 2) NOT NULL,
    low DECIMAL(15, 2) NOT NULL,
    close DECIMAL(15, 2) NOT NULL,
    volume BIGINT NOT NULL,
    adjusted_close DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, date)
);
```

### Sectors

The database includes stocks from 8 sectors:

- **NGANHANG** (Banking): VCB, BID, CTG, TCB, MBB, ACB, VPB, TPB, HDB, STB
- **BDS** (Real Estate): VHM, VIC, NVL, VRE, DXG, PDR, KDH, DIG
- **CHUNGKHOAN** (Securities): SSI, VND, HCM, VCI, FTS
- **THEP** (Steel): HPG, HSG, NKG, POM
- **DAUKI** (Oil & Gas): GAS, PLX, PVD, PVS, PVT, GMD
- **DIEN** (Energy): POW, NT2, REE, PC1
- **THUCPHAM** (Food & Beverage): VNM, MSN, SAB, VHC, MCH, KDC
- **CONGNGHE** (Technology): FPT, CMG, VGI, ELC, MWG, VJC

## 🧪 Testing

### Run API Tests

```bash
npm run test:api
```

This tests all endpoints and validates responses.

### Manual Testing

See [TEST.md](./TEST.md) for detailed manual testing guide with curl commands.

### Test Database Connection

```bash
npm run test:db
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── market.controller.ts
│   ├── services/            # Business logic
│   │   └── marketData.service.ts
│   ├── routes/              # Route definitions
│   │   └── market.routes.ts
│   ├── database/            # Database scripts
│   │   ├── schema.sql
│   │   ├── migrate.ts
│   │   ├── seed.ts
│   │   └── verify.ts
│   ├── utils/               # Utility functions
│   │   ├── database.ts
│   │   └── sampleData.ts
│   ├── test/                # Test files
│   │   └── api.test.ts
│   └── index.ts            # Application entry point
├── docker-compose.yml       # Docker services
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables
└── README.md              # This file
```

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |
| `npm run db:verify` | Verify database schema |
| `npm run test:db` | Test database connection |
| `npm run test:api` | Run API endpoint tests |
| `npm run lint` | Lint TypeScript files |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |

## 🐳 Docker Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Remove volumes (WARNING: deletes all data)
docker compose down -v

# Restart services
docker compose restart

# Check status
docker compose ps
```

## 🔧 Troubleshooting

### Port Already in Use

If port 3000, 5432, or 6379 is already in use:

1. Stop the conflicting service
2. Or change ports in `.env` and `docker-compose.yml`

### Database Connection Failed

1. Check Docker containers are running: `docker compose ps`
2. Check database credentials in `.env`
3. Try restarting containers: `docker compose restart`

### No Data in Database

1. Run migrations: `npm run migrate`
2. Seed database: `npm run seed`
3. Verify: `npm run db:verify`

## 📝 License

ISC

## 👥 Contributors

- Development Team

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team

---

**Built with ❤️ for the Vietnamese stock market community**
