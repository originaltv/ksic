# Supabase Realtime Setup Guide (Demo Mode)

This guide explains how to set up Supabase realtime functionality for your KSIC Portal demo application.

## What is Supabase Realtime?

Supabase Realtime allows you to listen to database changes in real-time. When data is inserted, updated, or deleted in your database, your frontend application will automatically receive these changes and update the UI accordingly.

## Demo Mode Setup

This application is configured for **demo mode** with automatic authentication using hardcoded credentials:
- **Email**: `demo@ksic.com`
- **Password**: `demo123456`

## Prerequisites

1. A Supabase project with the following tables:
   - `sarees`
   - `transactions` 
   - `stations`

2. Supabase client configured in your application

## Step 1: Enable Authentication in Supabase Dashboard

### 1.1 Navigate to Authentication Settings

1. Go to your Supabase project dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Settings** in the submenu

### 1.2 Configure Authentication

1. In the **General** section:
   - Set **Site URL** to your application URL (e.g., `http://localhost:3000` for development)
   - Add redirect URLs: `http://localhost:3000`
   - **Disable Email confirmations** for demo purposes (optional)

### 1.3 Create Demo User (Optional)

The application will automatically create the demo user on first run, but you can also create it manually:

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `demo@ksic.com`
   - Password: `demo123456`
4. Click **Add User**

## Step 2: Enable Realtime in Supabase Dashboard

### 2.1 Navigate to Database Settings

1. Go to your Supabase project dashboard
2. Click on **Database** in the left sidebar
3. Click on **Replication** in the submenu

### 2.2 Enable Realtime for Tables

1. In the **Replication** section, you'll see a list of your tables
2. For each table you want to enable realtime for (`sarees`, `transactions`, `stations`):
   - Toggle the **Realtime** switch to **ON**
   - This enables realtime subscriptions for INSERT, UPDATE, and DELETE events

### 2.3 Alternative: Enable via SQL

You can also enable realtime using SQL commands in the SQL Editor:

```sql
-- Enable realtime for sarees table
ALTER PUBLICATION supabase_realtime ADD TABLE sarees;

-- Enable realtime for transactions table  
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable realtime for stations table
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
```

## Step 3: Configure Row Level Security (RLS)

### 3.1 Enable RLS on Tables

```sql
-- Enable RLS on sarees table
ALTER TABLE sarees ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on stations table
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
```

### 3.2 Create Policies

Create policies that allow authenticated users to read data:

```sql
-- Policy for sarees table
CREATE POLICY "Allow authenticated users to read sarees" ON sarees
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for transactions table
CREATE POLICY "Allow authenticated users to read transactions" ON transactions
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for stations table
CREATE POLICY "Allow authenticated users to read stations" ON stations
FOR SELECT USING (auth.role() = 'authenticated');
```

## Step 4: Test the Setup

### 4.1 Start the Application

1. Start your application: `npm run dev`
2. Navigate to `http://localhost:3000`
3. The application will automatically:
   - Sign in with demo credentials (`demo@ksic.com` / `demo123456`)
   - Create the demo user if it doesn't exist
   - Redirect you to the dashboard

### 4.2 Test Realtime Functionality

1. Open your application in one browser tab
2. Open the Supabase dashboard in another tab
3. Go to **Table Editor** and select one of your tables
4. Insert, update, or delete a row
5. Your frontend application should automatically reflect these changes

## Step 5: Environment Variables

Ensure your environment variables are properly configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 6: Frontend Implementation

The realtime functionality has been implemented in your application using:

### 6.1 Demo Authentication System

- **Auto-signin** (`lib/supabase.ts`): Automatically signs in with demo credentials
- **Auth Context** (`contexts/auth-context.tsx`): Manages authentication state
- **Protected Routes** (`components/protected-route.tsx`): Shows loading while auth initializes

### 6.2 Custom Hook (`hooks/use-realtime.ts`)

This hook provides:
- Generic realtime subscription functionality
- Specific hooks for each table (`useSareesRealtime`, `useTransactionsRealtime`, `useStationsRealtime`)
- Connection status monitoring
- Automatic cleanup on component unmount

### 6.3 Updated Pages

The following pages now include realtime functionality:

- **Dashboard** (`app/page.tsx`): Updates station counts and totals in real-time
- **Transactions** (`app/transactions/page.tsx`): Shows new transactions as they're added
- **Tracker** (`app/tracker/page.tsx`): Updates saree status and station information in real-time

### 6.4 Visual Indicators

Each page includes a realtime status indicator that shows:
- 🟢 **Live updates enabled**: When realtime is connected
- 🟠 **Connecting to live updates...**: When establishing connection

## Troubleshooting

### Common Issues

1. **"API error happened while trying to communicate with the server"**
   - This usually means the demo user wasn't created successfully
   - Check the browser console for authentication errors
   - Manually create the demo user in Supabase dashboard

2. **Realtime not working**
   - Check that realtime is enabled for the table in Supabase dashboard
   - Verify RLS policies allow the current user to read the table
   - Check browser console for connection errors
   - Ensure the demo user is authenticated (check console logs)

3. **Authentication issues**
   - Verify your Supabase URL and anon key are correct
   - Check that email confirmations are disabled or properly configured
   - Ensure the site URL is set correctly in Supabase dashboard
   - Look for authentication errors in the browser console

4. **Connection issues**
   - Verify your Supabase URL and anon key are correct
   - Check network connectivity
   - Ensure you're not hitting rate limits

5. **Data not updating**
   - Check that the table has the correct structure
   - Verify that the realtime hook is properly handling the payload
   - Check browser console for any errors
   - Ensure the demo user is authenticated

### Debug Mode

To enable debug logging, check the browser console for:
- Authentication initialization messages
- Realtime connection status
- Any error messages

## Performance Considerations

1. **Connection Limits**: Supabase has connection limits based on your plan
2. **Data Volume**: Large datasets may impact performance
3. **Filtering**: Consider filtering realtime subscriptions to only relevant data
4. **Cleanup**: Always clean up subscriptions when components unmount

## Security Best Practices

1. **RLS Policies**: Always use Row Level Security to control data access
2. **Demo Mode**: This setup is for demo purposes only - implement proper authentication for production
3. **Data Validation**: Validate all data received through realtime subscriptions
4. **Error Handling**: Implement proper error handling for connection failures

## Next Steps

1. Test the authentication and realtime functionality with your actual data
2. Monitor performance and adjust as needed
3. Consider implementing optimistic updates for better UX
4. Add error boundaries for better error handling
5. For production, replace demo authentication with proper user management

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the browser console for errors
3. Verify your Supabase project settings
4. Contact Supabase support if needed 