-- Database Changes for KSIC Portal
-- Run these queries in Supabase SQL Editor

-- 1. Modify transactions table
-- Remove transaction_id column
ALTER TABLE transactions DROP COLUMN IF EXISTS transaction_id;

-- Ensure transactions.id has UUID auto-generation
-- First, check if the id column exists and its current type
DO $$
BEGIN
    -- Check if id column exists and is UUID type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'id' 
        AND table_schema = 'public'
    ) THEN
        -- If id column exists but doesn't have default, add it
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND column_name = 'id' 
            AND column_default LIKE '%gen_random_uuid%'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE transactions ALTER COLUMN id SET DEFAULT gen_random_uuid();
        END IF;
    ELSE
        -- If id column doesn't exist, create it
        ALTER TABLE transactions ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
END $$;

-- 2. Modify stations table
-- Remove last_updated and change_from_previous columns
ALTER TABLE stations DROP COLUMN IF EXISTS last_updated;
ALTER TABLE stations DROP COLUMN IF EXISTS change_from_previous;

-- 3. Modify sarees table
-- Remove start_date, estimated_completion, weight, fabric_type columns
ALTER TABLE sarees DROP COLUMN IF EXISTS start_date;
ALTER TABLE sarees DROP COLUMN IF EXISTS estimated_completion;
ALTER TABLE sarees DROP COLUMN IF EXISTS weight;
ALTER TABLE sarees DROP COLUMN IF EXISTS fabric_type;

-- 4. Verify the changes
-- Check transactions table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check stations table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'stations' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sarees table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'sarees' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Update RLS policies if needed (they should still work with the new structure)
-- The existing policies should continue to work as they reference auth.role()

-- 6. Test data access
-- Verify you can still query the tables
SELECT COUNT(*) FROM sarees;
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM stations;

-- 7. Test UUID auto-generation (only if sarees table has data)
DO $$
DECLARE
    test_saree_id VARCHAR;
    test_transaction_id UUID;
BEGIN
    -- Get the first saree_id from the sarees table
    SELECT saree_id INTO test_saree_id FROM sarees LIMIT 1;
    
    -- Only test if we have sarees data
    IF test_saree_id IS NOT NULL THEN
        -- Insert a test transaction to verify UUID auto-generation works
        INSERT INTO transactions (saree_id, from_station, to_station, timestamp) 
        VALUES (test_saree_id, 'Inspection', 'Dyeing', NOW())
        RETURNING id INTO test_transaction_id;
        
        -- Show the generated UUID
        RAISE NOTICE 'Test transaction created with UUID: %', test_transaction_id;
        
        -- Clean up test data
        DELETE FROM transactions WHERE id = test_transaction_id;
        
        RAISE NOTICE 'UUID auto-generation test completed successfully';
    ELSE
        RAISE NOTICE 'No sarees data found. Skipping UUID auto-generation test.';
    END IF;
END $$; 