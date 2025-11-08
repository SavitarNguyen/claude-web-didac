#!/usr/bin/env node

/**
 * This script applies the essay table migrations directly to Supabase
 * It adds the missing RLS policies so students can see their essays
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the combined migration SQL
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'apply-migrations-simple.sql'),
  'utf8'
);

const supabaseUrl = 'https://fpomqateqebxypbjabch.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwb21xYXRlcWVieHlwYmphYmNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQyMDIwMywiZXhwIjoyMDc3OTk2MjAzfQ.jzP0aFLZrwgrzEPM1NTDEGMOOxZhX8NnBbsl_ksxzDA';

console.log('🔧 Fixing Essays Table RLS Policies...\n');

// Parse URL
const url = new URL(`${supabaseUrl}/rest/v1/rpc/exec_sql`);

const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${serviceRoleKey}`,
    'apikey': serviceRoleKey,
    'Prefer': 'return=minimal'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Successfully applied migrations!\n');
      console.log('Changes made:');
      console.log('  ✓ Added corrected_content column');
      console.log('  ✓ Added level column');
      console.log('  ✓ Enabled Row Level Security');
      console.log('  ✓ Created 4 RLS policies for student access');
      console.log('  ✓ Granted permissions to authenticated users\n');
      console.log('🎉 Students should now be able to see their essays!');
      console.log('   Refresh the page at http://localhost:3000/ielts-essay/my-essays\n');
    } else {
      console.error(`❌ Migration failed with status ${res.statusCode}`);
      console.error('Response:', data);
      console.log('\n⚠️  Alternative: Apply the SQL manually');
      console.log('1. Open: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new');
      console.log('2. Copy the SQL from: scripts/apply-migrations-simple.sql');
      console.log('3. Paste and run it in the SQL Editor\n');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error executing migration:', e.message);
  console.log('\n⚠️  Alternative: Apply the SQL manually');
  console.log('1. Open: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new');
  console.log('2. Copy the SQL from: scripts/apply-migrations-simple.sql');
  console.log('3. Paste and run it in the SQL Editor\n');
});

req.write(postData);
req.end();
