require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
  
  try {
    // Read the SQL file content
    const sqlFilePath = path.join(__dirname, '..', 'db', 'user_profiles.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into separate statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each SQL statement
    for (const statement of statements) {
      console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);
      
      try {
        // Instead of using RPC, execute SQL directly through REST API
        // We'll have to handle this manually since Supabase JS doesn't expose SQL execution directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'params=single-object',
            'X-Client-Info': 'supabase-js/2.0.0'
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error executing SQL statement:', errorData);
        } else {
          console.log('Statement executed successfully');
        }
      } catch (sqlError) {
        console.error('Error executing SQL statement:', sqlError);
      }
    }
    
    console.log('User profiles table setup completed');
    
    // Verify table was created
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error verifying table creation:', error);
    } else {
      console.log('User profiles table exists and has', data.count, 'rows');
    }
    
  } catch (error) {
    console.error('Error setting up user profiles table:', error);
    process.exit(1);
  }
}

main(); 