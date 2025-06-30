-- Realtime Debug and Verification Script
-- Run this in Supabase SQL Editor to check your configuration

-- 1. Check if realtime is enabled for tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = p.schemaname 
            AND tablename = p.tablename
        ) THEN 'ENABLED'
        ELSE 'DISABLED'
    END as realtime_status
FROM pg_tables p
WHERE schemaname = 'public' 
AND tablename IN ('sarees', 'transactions', 'stations');

-- 2. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('sarees', 'transactions', 'stations');

-- 3. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('sarees', 'transactions', 'stations');

-- 4. Check current user and authentication
SELECT 
    current_user,
    session_user,
    auth.role() as auth_role;

-- 5. Test if you can read from tables (this should work if authenticated)
SELECT COUNT(*) as sarees_count FROM sarees;
SELECT COUNT(*) as transactions_count FROM transactions;
SELECT COUNT(*) as stations_count FROM stations;

-- 6. Enable realtime for all tables (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE sarees;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE stations;

-- 7. Verify realtime is now enabled
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND schemaname = p.schemaname 
            AND tablename = p.tablename
        ) THEN 'ENABLED'
        ELSE 'DISABLED'
    END as realtime_status
FROM pg_tables p
WHERE schemaname = 'public' 
AND tablename IN ('sarees', 'transactions', 'stations'); 