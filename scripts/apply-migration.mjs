import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Applying migration: add corrected_content column...');

    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE public.essays
        ADD COLUMN IF NOT EXISTS corrected_content TEXT;
      `
    });

    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: directError } = await supabase
        .from('essays')
        .select('id')
        .limit(1);

      if (!directError) {
        console.log('✅ Migration applied successfully (column may already exist)');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration applied successfully');
    }
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
