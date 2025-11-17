-- ========================================
-- Finlens Database Schema
-- Vietnamese Stock Market Analysis Platform
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- STOCKS TABLE
-- Stores information about Vietnamese stocks
-- ========================================
CREATE TABLE IF NOT EXISTS stocks (
    symbol VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    exchange VARCHAR(10) NOT NULL CHECK (exchange IN ('HOSE', 'HNX', 'UPCOM')),
    industry VARCHAR(100),
    sector VARCHAR(100),
    layer VARCHAR(20) CHECK (layer IN ('BLUECHIP', 'MIDCAP', 'PENNY')),
    listing_date DATE,
    outstanding_shares BIGINT,
    market_cap DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by exchange
CREATE INDEX IF NOT EXISTS idx_stocks_exchange ON stocks(exchange);

-- Index for faster queries by industry
CREATE INDEX IF NOT EXISTS idx_stocks_industry ON stocks(industry);

-- Index for faster queries by sector
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);

-- Index for faster queries by layer
CREATE INDEX IF NOT EXISTS idx_stocks_layer ON stocks(layer);

-- ========================================
-- STOCK_PRICES TABLE
-- Stores historical price data for stocks
-- ========================================
CREATE TABLE IF NOT EXISTS stock_prices (
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

    -- Ensure no duplicate entries for same stock on same date
    UNIQUE(symbol, date)
);

-- Index for faster queries by symbol
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON stock_prices(symbol);

-- Index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_stock_prices_date ON stock_prices(date);

-- Composite index for symbol and date queries (most common)
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_date ON stock_prices(symbol, date DESC);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at in stocks table
DROP TRIGGER IF EXISTS update_stocks_updated_at ON stocks;
CREATE TRIGGER update_stocks_updated_at
    BEFORE UPDATE ON stocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE stocks IS 'Stores information about Vietnamese stocks listed on HOSE, HNX, and UPCOM';
COMMENT ON TABLE stock_prices IS 'Stores historical daily price data for stocks';

COMMENT ON COLUMN stocks.symbol IS 'Stock ticker symbol (e.g., VNM, VIC, FPT)';
COMMENT ON COLUMN stocks.exchange IS 'Stock exchange: HOSE, HNX, or UPCOM';
COMMENT ON COLUMN stocks.layer IS 'Stock layer/category: BLUECHIP, MIDCAP, or PENNY';
COMMENT ON COLUMN stocks.outstanding_shares IS 'Number of outstanding shares';
COMMENT ON COLUMN stocks.market_cap IS 'Market capitalization in VND';

COMMENT ON COLUMN stock_prices.adjusted_close IS 'Adjusted closing price (accounting for splits, dividends)';
COMMENT ON COLUMN stock_prices.volume IS 'Trading volume for the day';
