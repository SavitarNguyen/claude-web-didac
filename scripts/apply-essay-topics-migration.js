const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250109000000_create_essay_topics_and_prompts.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration to Supabase...');

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

        if (error) {
          // Try direct execution if exec_sql doesn't exist
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          console.log('Note: Using direct SQL execution via pg');
          // We'll execute the full SQL at once
          break;
        }
      }
    }

    // If RPC didn't work, try executing the full SQL
    console.log('Attempting full SQL execution...');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.log('\n⚠️  Direct SQL execution not available via Supabase client.');
      console.log('Please apply the migration manually using one of these methods:\n');
      console.log('1. Copy the SQL from: supabase/migrations/20250109000000_create_essay_topics_and_prompts.sql');
      console.log('2. Go to: https://supabase.com/dashboard/project/_/sql');
      console.log('3. Paste and run the SQL\n');
      console.log('OR use the Supabase CLI:');
      console.log('   supabase db push\n');
      process.exit(1);
    }

    if (error) {
      throw error;
    }

    console.log('✅ Migration applied successfully!');
    console.log('✅ Created tables: essay_topics, essay_prompts, vocab_suggestions');
    console.log('✅ Added Education topic with Free University Education prompt');

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n📝 Manual application required. See instructions above.');
    process.exit(1);
  }
}

applyMigration();
