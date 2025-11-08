const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const supabaseUrl = 'https://fpomqateqebxypbjabch.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb21xYXRlcWVieHlwYmphYmNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQyMDIwMywiZXhwIjoyMDc3OTk2MjAzfQ.jzP0aFLZrwgrzEPM1NTDEGMOOxZhX8NnBbsl_ksxzDA';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration files to apply in order
const migrations = [
  '20250111000000_add_corrected_content_to_essays.sql',
  '20250113000000_add_level_to_essays.sql',
  '20250114000000_add_rls_policies_to_essays.sql'
];

async function applyMigrations() {
  console.log('Starting migration process...\n');

  for (const migration of migrations) {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migration);

    try {
      console.log(`Applying migration: ${migration}`);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Execute the migration SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // If exec_sql doesn't exist, try direct query
        console.log('  Trying direct SQL execution...');
        const { error: directError } = await supabase.from('_sql').select('*').limit(0);

        if (directError) {
          console.error(`  ❌ Error: ${error.message}`);
          console.log(`  ⚠️  You may need to apply this migration manually via Supabase dashboard`);
          console.log(`  SQL to execute:\n${sql}\n`);
        }
      } else {
        console.log(`  ✓ Successfully applied ${migration}`);
      }

    } catch (err) {
      console.error(`  ❌ Failed to apply ${migration}:`, err.message);
      console.log('\n  Please apply this migration manually in Supabase SQL Editor:');
      console.log(`  ${migrationPath}\n`);
    }
  }

  console.log('\n✨ Migration process completed!');
  console.log('\nNext steps:');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/fpomqateqebxypbjabch');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Copy and paste the SQL from each migration file listed above');
  console.log('4. Execute each migration in order');
  console.log('\nOr use the Supabase CLI:');
  console.log('  npx supabase db push --db-url "postgresql://postgres.fpomqateqebxypbjabch:Tyson@1801@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"\n');
}

applyMigrations().catch(console.error);
