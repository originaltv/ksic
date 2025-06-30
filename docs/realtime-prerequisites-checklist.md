# Supabase Realtime Prerequisites Checklist

This checklist ensures all components are properly configured for realtime functionality to work.

## ✅ Frontend Code Verification

### 1. Supabase Client Configuration
- [x] **Supabase Client**: Properly configured with auth settings
- [x] **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` required
- [x] **Auth Configuration**: Auto-refresh, persist session, detect session enabled

### 2. Authentication System
- [x] **Auto-Login**: Demo user credentials configured (`varun_tv@outlook.com` / `tv7411786785`)
- [x] **Auth Context**: Properly wraps the application
- [x] **User Creation**: Automatically creates demo user if not exists
- [x] **Session Management**: Handles auth state changes

### 3. Realtime Hooks
- [x] **useRealtime Hook**: Generic realtime subscription functionality
- [x] **Table-Specific Hooks**: `useSareesRealtime`, `useTransactionsRealtime`, `useStationsRealtime`
- [x] **Memoization**: Proper useCallback implementation to prevent infinite re-renders
- [x] **Connection Status**: Tracks realtime connection state
- [x] **Cleanup**: Proper channel cleanup on unmount

### 4. Page Implementations
- [x] **Dashboard**: Uses `useSareesRealtime` and `useStationsRealtime`
- [x] **Transactions**: Uses `useTransactionsRealtime`
- [x] **Tracker**: Uses `useSareesRealtime`
- [x] **Visual Indicators**: Shows connection status on each page
- [x] **Error Handling**: Proper error boundaries and loading states

## 🔧 Supabase Dashboard Configuration Required

### 1. Authentication Setup
```bash
# Go to: Authentication → Settings
# Configure:
- Site URL: http://localhost:3000
- Redirect URLs: http://localhost:3000
- Disable Email confirmations (for demo)
```

### 2. Realtime Enablement
```bash
# Go to: Database → Replication
# Enable Realtime for:
- [ ] sarees table
- [ ] transactions table  
- [ ] stations table
```

### 3. Row Level Security (RLS)
```sql
-- Run in SQL Editor:

-- Enable RLS on all tables
ALTER TABLE sarees ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read sarees" ON sarees
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read transactions" ON transactions
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read stations" ON stations
FOR SELECT USING (auth.role() = 'authenticated');
```

### 4. Table Structure Verification
```sql
-- Verify tables exist and have correct structure:

-- Check sarees table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'sarees' AND table_schema = 'public';

-- Check transactions table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public';

-- Check stations table
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'stations' AND table_schema = 'public';
```

## 🧪 Testing Checklist

### 1. Environment Variables
```bash
# Check .env.local file exists with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Application Startup
```bash
# Start the application
npm run dev

# Check browser console for:
- [ ] "Demo user signed in successfully" OR "Demo user created successfully"
- [ ] No authentication errors
- [ ] No infinite re-render errors
```

### 3. Realtime Connection Test
```bash
# Check browser console for:
- [ ] "Realtime sarees subscription status: SUBSCRIBED"
- [ ] "Realtime transactions subscription status: SUBSCRIBED"  
- [ ] "Realtime stations subscription status: SUBSCRIBED"
- [ ] Visual indicators showing "Live updates enabled"
```

### 4. Data Flow Test
```bash
# Test realtime functionality:
1. Open app in one browser tab
2. Open Supabase dashboard in another tab
3. Go to Table Editor → select a table
4. Insert/update/delete a row
5. Verify app updates automatically without refresh
```

## 🚨 Common Issues & Solutions

### Issue 1: "API error happened while trying to communicate with the server"
**Solution**: 
- Verify RLS policies are created
- Check user is authenticated (console logs)
- Ensure realtime is enabled for tables

### Issue 2: "Maximum update depth exceeded"
**Solution**: 
- ✅ Already fixed with useCallback memoization
- Check for any remaining non-memoized callbacks

### Issue 3: Realtime not connecting
**Solution**:
- Verify realtime is enabled in Supabase dashboard
- Check authentication status
- Verify table names match exactly

### Issue 4: Data not updating
**Solution**:
- Check RLS policies allow authenticated access
- Verify table structure matches interfaces
- Check browser console for errors

## 📋 Final Verification Steps

Before testing realtime:

1. **✅ Frontend Code**: All components properly implemented
2. **✅ Supabase Auth**: Demo user can authenticate
3. **✅ Realtime Enabled**: All tables have realtime enabled
4. **✅ RLS Policies**: Authenticated users can read data
5. **✅ Environment Variables**: Properly configured
6. **✅ No Console Errors**: Clean startup without errors

## 🎯 Ready for Testing

Once all checkboxes are completed:

1. Start the application: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Check console for successful authentication and realtime connections
4. Test realtime by making changes in Supabase dashboard
5. Verify automatic updates in the application

**Status**: 🟡 **Ready for Supabase Dashboard Configuration** 