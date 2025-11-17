# Testing Guide

Comprehensive testing guide for the Finlens Backend API.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Setup for Testing](#setup-for-testing)
- [Automated Testing](#automated-testing)
- [Manual Testing](#manual-testing)
- [API Endpoint Tests](#api-endpoint-tests)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before testing, ensure you have:

1. **Docker containers running**:
   ```bash
   cd backend
   docker compose up -d
   ```

2. **Database migrated**:
   ```bash
   npm run migrate
   ```

3. **Database seeded**:
   ```bash
   npm run seed
   ```

4. **Server running**:
   ```bash
   npm run dev
   ```

## 🚀 Setup for Testing

### Quick Start

Run all setup steps in sequence:

```bash
# 1. Start Docker containers
docker compose up -d

# 2. Install dependencies (if not done)
npm install

# 3. Run migrations
npm run migrate

# 4. Seed database
npm run seed

# 5. Start server (in a separate terminal)
npm run dev
```

### Verify Setup

Check that everything is running:

```bash
# Check Docker containers
docker compose ps

# Should show:
# - finlens-postgres (healthy)
# - finlens-redis (healthy)

# Check database
npm run db:verify

# Test database connection
npm run test:db
```

## 🤖 Automated Testing

### Run All API Tests

Execute the automated test suite:

```bash
npm run test:api
```

This will test:
- ✅ Health check endpoint
- ✅ Root endpoint
- ✅ Get latest prices
- ✅ Get stock history (valid symbol)
- ✅ Get stock history (invalid symbol - 404)
- ✅ Get market summary
- ✅ Invalid endpoint (404)

**Expected Output:**

```
🧪 Running API Tests...

Test Results:
============================================================
1. ✅ PASS - Health Check (45ms)
2. ✅ PASS - Root Endpoint (23ms)
3. ✅ PASS - Get Latest Prices (67ms)
4. ✅ PASS - Get Stock History (89ms)
5. ✅ PASS - Get Stock History - Not Found (34ms)
6. ✅ PASS - Get Market Summary (56ms)
7. ✅ PASS - Invalid Endpoint - Not Found (12ms)

============================================================
Total: 7 tests
✅ Passed: 7
❌ Failed: 0
Success Rate: 100.0%

🎉 All tests passed!
```

## 🧪 Manual Testing

### Using cURL

All examples assume server is running on `http://localhost:3000`

### 1. Health Check

**Request:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-17T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "service": "Finlens Stock Market Analysis API"
}
```

---

### 2. Root Endpoint

**Request:**
```bash
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "message": "Welcome to Finlens Stock Market Analysis API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "market": {
      "latest": "/api/v1/market/latest",
      "history": "/api/v1/market/history/:symbol",
      "summary": "/api/v1/market/summary"
    }
  }
}
```

---

## 📡 API Endpoint Tests

### 3. Get Latest Prices

Get latest prices for stocks (default: 50).

**Request (default):**
```bash
curl http://localhost:3000/api/v1/market/latest
```

**Request (with limit):**
```bash
curl "http://localhost:3000/api/v1/market/latest?limit=10"
```

**Request (maximum limit):**
```bash
curl "http://localhost:3000/api/v1/market/latest?limit=100"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "symbol": "ACB",
      "name": "Asia Commercial Bank",
      "exchange": "HOSE",
      "sector": "NGANHANG",
      "latest_date": "2024-11-16T00:00:00.000Z",
      "open": 25.5,
      "high": 26.2,
      "low": 25.1,
      "close": 25.9,
      "volume": 2500000
    },
    ...
  ]
}
```

**Test Invalid Limit (should return 400):**
```bash
curl "http://localhost:3000/api/v1/market/latest?limit=500"
```

**Expected Error:**
```json
{
  "error": "Bad Request",
  "message": "Limit must be between 1 and 100"
}
```

---

### 4. Get Stock History

Get historical price data for a specific stock.

**Request (VCB - 30 days):**
```bash
curl http://localhost:3000/api/v1/market/history/VCB
```

**Request (FPT - 7 days):**
```bash
curl "http://localhost:3000/api/v1/market/history/FPT?days=7"
```

**Request (VIC - 90 days):**
```bash
curl "http://localhost:3000/api/v1/market/history/VIC?days=90"
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
        "date": "2024-11-16T00:00:00.000Z",
        "open": 85.5,
        "high": 87.2,
        "low": 84.8,
        "close": 86.9,
        "volume": 1500000,
        "adjusted_close": 86.9
      },
      {
        "date": "2024-11-15T00:00:00.000Z",
        "open": 84.2,
        "high": 86.0,
        "low": 83.9,
        "close": 85.5,
        "volume": 1450000,
        "adjusted_close": 85.5
      },
      ...
    ]
  }
}
```

**Test Invalid Symbol (should return 404):**
```bash
curl http://localhost:3000/api/v1/market/history/INVALID123
```

**Expected Error:**
```json
{
  "error": "Not Found",
  "message": "Stock with symbol 'INVALID123' not found"
}
```

**Test Invalid Days (should return 400):**
```bash
curl "http://localhost:3000/api/v1/market/history/VCB?days=500"
```

**Expected Error:**
```json
{
  "error": "Bad Request",
  "message": "Days must be between 1 and 365"
}
```

---

### 5. Get Market Summary

Get overall market statistics.

**Request:**
```bash
curl http://localhost:3000/api/v1/market/summary
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_stocks": 50,
    "total_volume": 75250000,
    "exchanges": [
      {
        "exchange": "HOSE",
        "stock_count": 42,
        "total_volume": 65000000
      },
      {
        "exchange": "HNX",
        "stock_count": 6,
        "total_volume": 8000000
      },
      {
        "exchange": "UPCOM",
        "stock_count": 2,
        "total_volume": 2250000
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
      {
        "sector": "CONGNGHE",
        "stock_count": 6
      },
      {
        "sector": "CHUNGKHOAN",
        "stock_count": 5
      },
      {
        "sector": "THUCPHAM",
        "stock_count": 6
      },
      {
        "sector": "DAUKI",
        "stock_count": 6
      },
      {
        "sector": "THEP",
        "stock_count": 4
      },
      {
        "sector": "DIEN",
        "stock_count": 4
      }
    ],
    "date": "2024-11-16T00:00:00.000Z"
  }
}
```

---

### 6. Test Error Handling

**Invalid Endpoint (404):**
```bash
curl http://localhost:3000/api/v1/invalid
```

**Expected Response:**
```json
{
  "error": "Not Found",
  "message": "The requested resource does not exist"
}
```

---

## 🧰 Advanced Testing

### Using jq for Formatted Output

Install `jq` for pretty-printed JSON:

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

**Usage:**
```bash
# Pretty print all responses
curl -s http://localhost:3000/api/v1/market/latest | jq

# Extract specific fields
curl -s http://localhost:3000/api/v1/market/latest | jq '.count'
curl -s http://localhost:3000/api/v1/market/latest | jq '.data[0].symbol'

# Filter by sector
curl -s http://localhost:3000/api/v1/market/latest?limit=50 | jq '.data[] | select(.sector == "NGANHANG")'
```

### Testing All Available Stocks

Get a list of all stock symbols:

```bash
curl -s "http://localhost:3000/api/v1/market/latest?limit=50" | jq -r '.data[].symbol'
```

**Output:**
```
ACB
BID
CMG
CTG
DIG
...
```

### Performance Testing

Test response time:

```bash
# Using curl's -w flag
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/v1/market/latest

# Using time command
time curl http://localhost:3000/api/v1/market/summary
```

---

## 🔄 Testing Workflow

### Complete Test Sequence

Run these commands in order to verify everything:

```bash
# 1. Health check
curl http://localhost:3000/health | jq '.status'
# Expected: "healthy"

# 2. Get latest prices
curl -s "http://localhost:3000/api/v1/market/latest?limit=5" | jq '.count'
# Expected: 5

# 3. Test a specific stock
curl -s http://localhost:3000/api/v1/market/history/VCB?days=7 | jq '.data.symbol'
# Expected: "VCB"

# 4. Get market summary
curl -s http://localhost:3000/api/v1/market/summary | jq '.data.total_stocks'
# Expected: 50

# 5. Test error handling
curl -s http://localhost:3000/api/v1/market/history/INVALID | jq '.error'
# Expected: "Not Found"
```

---

## 🐛 Troubleshooting

### Server Not Responding

**Problem:** `curl: (7) Failed to connect`

**Solution:**
1. Check if server is running: Look for "Server is running on port 3000"
2. Start server: `npm run dev`
3. Check port: `lsof -i :3000` (macOS/Linux)

### Empty Data Response

**Problem:** API returns empty arrays or 0 counts

**Solution:**
1. Check database is seeded: `npm run db:verify`
2. Re-seed database: `npm run seed`
3. Verify data: `npm run db:verify`

### Database Connection Errors

**Problem:** "Database connection failed"

**Solution:**
1. Check Docker containers: `docker compose ps`
2. Start containers: `docker compose up -d`
3. Test connection: `npm run test:db`

### 404 for Valid Stocks

**Problem:** Stock symbol returns 404 but should exist

**Solution:**
1. Verify stock exists: `npm run db:verify`
2. Check symbol spelling (case-sensitive)
3. Re-seed database if needed: `npm run seed`

---

## 📊 Test Coverage

Current test coverage:

- ✅ Health endpoints
- ✅ Market data endpoints
- ✅ Error handling (400, 404, 500)
- ✅ Query parameter validation
- ✅ Path parameter validation
- ✅ Response format validation
- ✅ Database integration

---

## 🎯 Success Criteria

All tests should pass when:

1. ✅ Docker containers are running
2. ✅ Database is migrated
3. ✅ Database is seeded with sample data
4. ✅ Server is running on port 3000
5. ✅ All endpoints return correct status codes
6. ✅ Response formats match specifications
7. ✅ Error handling works correctly

---

## 📞 Support

If tests are failing:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [README.md](./README.md) for setup instructions
3. Ensure all prerequisites are met
4. Check Docker container logs: `docker compose logs`

---

**Happy Testing! 🎉**
