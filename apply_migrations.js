const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://fpomqateqebxypbjabch.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb21xYXRlcWVieHlwYmphYmNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQyMDIwMywiZXhwIjoyMDc3OTk2MjAzfQ.jzP0aFLZrwgrzEPM1NTDEGMOOxZhX8NnBbsl_ksxzDA';

// Migration files in order
const migrations = [
  '20250727104830_remote_schema.sql',
  '20250727110847_add_vocabulary_columns_to_flashcards.sql',
  '20250727111453_create_admin_flashcard_function.sql',
  '20250727111942_disable_rls_for_import.sql',
  '20250727112139_fix_admin_function.sql'
];

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function applyMigrations() {
  console.log('Starting migration process...\n');

  for (const migration of migrations) {
    const filePath = path.join(__dirname, 'supabase', 'migrations', migration);

    console.log(`Applying migration: ${migration}`);

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      // For the remote_schema.sql, we'll use the direct database connection
      // For others, we'll use the REST API
      console.log(`  Reading SQL file... (${sql.length} characters)`);
      console.log(`  ⚠️  Note: This script requires direct database access.`);
      console.log(`  Please apply this migration manually via Supabase Dashboard > SQL Editor\n`);

    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
      throw error;
    }
  }

  console.log('✅ Migration files identified. Please apply manually via Supabase Dashboard.');
}

applyMigrations().catch(console.error);
