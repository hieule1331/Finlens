# API Endpoints Testing Guide

This guide shows how to test the Finlens Market Data API endpoints.

## Prerequisites

1. Start Docker containers:
```bash
docker compose up -d
```

2. Run migrations (if not done):
```bash
npm run migrate
```

3. Seed the database (if not done):
```bash
npm run seed
```

4. Start the development server:
```bash
npm run dev
```

The server should be running on `http://localhost:3000`

## Available Endpoints

### 1. Get Latest Prices
Get the latest prices for all stocks (default limit: 50)

**Endpoint:** `GET /api/v1/market/latest`

**Query Parameters:**
- `limit` (optional): Number of stocks to return (1-100, default: 50)

**Test Commands:**

```bash
# Get latest prices (default 50 stocks)
curl http://localhost:3000/api/v1/market/latest

# Get latest prices for 10 stocks
curl http://localhost:3000/api/v1/market/latest?limit=10

# Get latest prices for 100 stocks
curl http://localhost:3000/api/v1/market/latest?limit=100
```

**Expected Response:**
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
    },
    ...
  ]
}
```

---

### 2. Get Stock History
Get historical price data for a specific stock

**Endpoint:** `GET /api/v1/market/history/:symbol`

**Path Parameters:**
- `symbol` (required): Stock symbol (e.g., VCB, VIC, FPT)

**Query Parameters:**
- `days` (optional): Number of days of history (1-365, default: 30)

**Test Commands:**

```bash
# Get 30-day history for VCB
curl http://localhost:3000/api/v1/market/history/VCB

# Get 7-day history for VIC
curl http://localhost:3000/api/v1/market/history/VIC?days=7

# Get 90-day history for FPT
curl http://localhost:3000/api/v1/market/history/FPT?days=90

# Test with non-existent stock (should return 404)
curl http://localhost:3000/api/v1/market/history/INVALID
```

**Expected Response:**
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
      },
      ...
    ]
  }
}
```

---

### 3. Get Market Summary
Get overall market summary statistics

**Endpoint:** `GET /api/v1/market/summary`

**Test Commands:**

```bash
# Get market summary
curl http://localhost:3000/api/v1/market/summary
```

**Expected Response:**
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
      },
      {
        "exchange": "HNX",
        "stock_count": 8,
        "total_volume": 8000000
      },
      {
        "exchange": "UPCOM",
        "stock_count": 2,
        "total_volume": 2000000
      }
    ],
    "sectors": [
      {
        "sector": "NGANHANG",
        "stock_count": 10
      },
      {
        "sector": "BDS",
        "stock_count": 8
      },
      ...
    ],
    "date": "2024-11-17T00:00:00.000Z"
  }
}
```

---

## Using with Formatted Output

For better readability, pipe the curl output through `jq`:

```bash
# Install jq (if not installed)
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS

# Test with formatted output
curl -s http://localhost:3000/api/v1/market/latest | jq
curl -s http://localhost:3000/api/v1/market/history/VCB | jq
curl -s http://localhost:3000/api/v1/market/summary | jq
```

---

## Error Responses

### 400 Bad Request
Invalid parameters

```json
{
  "error": "Bad Request",
  "message": "Limit must be between 1 and 100"
}
```

### 404 Not Found
Resource not found

```json
{
  "error": "Not Found",
  "message": "Stock with symbol 'INVALID' not found"
}
```

### 500 Internal Server Error
Server error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch latest prices"
}
```

---

## Testing All Endpoints Script

Create a test script to test all endpoints at once:

```bash
#!/bin/bash

echo "Testing Finlens Market Data API"
echo "================================"
echo ""

echo "1. Testing GET /api/v1/market/latest"
curl -s http://localhost:3000/api/v1/market/latest?limit=5 | jq '.success, .count'
echo ""

echo "2. Testing GET /api/v1/market/history/VCB"
curl -s http://localhost:3000/api/v1/market/history/VCB?days=7 | jq '.success, .data.symbol'
echo ""

echo "3. Testing GET /api/v1/market/summary"
curl -s http://localhost:3000/api/v1/market/summary | jq '.success, .data.total_stocks'
echo ""

echo "All tests completed!"
```

Save as `test-api.sh`, make executable, and run:

```bash
chmod +x test-api.sh
./test-api.sh
```
