-- Create sarees table
CREATE TABLE IF NOT EXISTS sarees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  saree_id VARCHAR(10) UNIQUE NOT NULL, -- NSW-XXXXX or OSW-XXXXX format
  article_number VARCHAR(6) NOT NULL, -- KS-XXX format
  length VARCHAR(20) NOT NULL,
  weaver_name VARCHAR(100) NOT NULL,
  fabric_type VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  design VARCHAR(100) NOT NULL,
  weight VARCHAR(20) NOT NULL,
  current_station VARCHAR(50) NOT NULL DEFAULT 'Inspection',
  status VARCHAR(20) NOT NULL DEFAULT 'In Progress', -- 'In Progress', 'Completed', 'Inwarded'
  progress INTEGER NOT NULL DEFAULT 0, -- 0-100
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_completion DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for tracking movements
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(10) UNIQUE NOT NULL, -- TXN001, TXN002, etc.
  saree_id VARCHAR(10) NOT NULL REFERENCES sarees(saree_id),
  from_station VARCHAR(50) NOT NULL,
  to_station VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stations table for dashboard data
CREATE TABLE IF NOT EXISTS stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_from_previous INTEGER NOT NULL DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sarees_saree_id ON sarees(saree_id);
CREATE INDEX IF NOT EXISTS idx_sarees_current_station ON sarees(current_station);
CREATE INDEX IF NOT EXISTS idx_sarees_status ON sarees(status);
CREATE INDEX IF NOT EXISTS idx_transactions_saree_id ON transactions(saree_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_sarees_updated_at BEFORE UPDATE ON sarees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
