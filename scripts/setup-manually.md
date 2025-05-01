# Manual Setup for User Profiles Table

Since the Supabase JavaScript client doesn't directly support executing arbitrary SQL statements, follow these steps to set up the user profiles table manually:

## Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Paste the following SQL:

```sql
-- Create the user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  country VARCHAR(2),
  street VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  postal_code VARCHAR(50),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
```

6. Click "Run" or "Execute" to create the table

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed:

1. Save the SQL above to a file named `setup-user-profiles.sql`
2. Run the following command:

```bash
supabase db execute -f setup-user-profiles.sql
```

## Verification

To verify the table was created, you can run the following SQL in the Supabase SQL Editor:

```sql
SELECT * FROM user_profiles LIMIT 10;
```

If the table was created successfully, this query should execute without errors, although it may not return any rows if the table is empty. 