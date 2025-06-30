# KSIC Saree Tracking Portal - Supabase Integration

This document outlines the Supabase database schema and integration for the KSIC Saree Tracking Portal.

## Database Schema

### 1. sarees table
Stores all saree information including current status and progress.

\`\`\`sql
CREATE TABLE sarees (
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
\`\`\`

### 2. transactions table
Records all saree movements between stations.

\`\`\`sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id VARCHAR(10) UNIQUE NOT NULL, -- TXN001, TXN002, etc.
  saree_id VARCHAR(10) NOT NULL REFERENCES sarees(saree_id),
  from_station VARCHAR(50) NOT NULL,
  to_station VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### 3. stations table
Stores station information for dashboard display.

\`\`\`sql
CREATE TABLE stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_from_previous INTEGER NOT NULL DEFAULT 0
);
\`\`\`

## Frontend Integration

### Supabase Client Configuration
The application uses the Supabase JavaScript client with the following configuration:

- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Client-side queries for real-time data fetching
- TypeScript interfaces for type safety

### Data Fetching Patterns

#### Dashboard Data
- Fetches station counts from `stations` table
- Calculates real-time counts by querying `sarees` table grouped by `current_station`
- Updates station counts dynamically

#### Transactions List
- Fetches all transactions from `transactions` table
- Supports filtering by station and search terms
- Implements real-time sorting by timestamp

#### Saree Tracker
- Fetches all sarees from `sarees` table
- Calculates station duration using latest transaction timestamps
- Supports search by saree ID, article number, and weaver name

#### Individual Saree Details
- Fetches saree details from `sarees` table by `saree_id`
- Builds manufacturing timeline using `transactions` table
- Calculates stage progress based on transaction history

## Key Features

1. **Real-time Data**: All data is fetched directly from Supabase tables
2. **Efficient Queries**: Optimized queries with proper indexing
3. **Type Safety**: Full TypeScript integration with database types
4. **Scalable Schema**: Minimal table design for efficient data storage
5. **Audit Trail**: Complete transaction history for tracking saree movements

## Station Flow
The manufacturing process follows this sequence:
1. Inspection
2. Dyeing  
3. FWH (Finishing & Warehouse)
4. FMG (Final Manufacturing & Grading)
5. Showroom Inward

Progress is calculated as: `(completed_stages / total_stages) * 100`

## Data Consistency
- Station counts are calculated dynamically from saree data
- Transaction history provides complete audit trail
- Timestamps are stored in UTC for consistency
- Foreign key constraints ensure data integrity
