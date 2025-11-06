import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

async function applyMigration() {
  console.log('🔄 Connecting to Supabase...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('📝 Applying migration to add corrected_content column...')

  try {
    // Use the REST API to execute raw SQL via a function
    // First, let's try to insert directly with the new column
    const { error } = await supabase
      .from('essays')
      .select('corrected_content')
      .limit(1)

    if (error) {
      if (error.message.includes('corrected_content')) {
        console.log('⚠️  Column does not exist. Adding column via SQL Editor...')
        console.log('')
        console.log('Please run this SQL in your Supabase SQL Editor:')
        console.log('==========================================')
        console.log('ALTER TABLE public.essays')
        console.log('ADD COLUMN IF NOT EXISTS corrected_content TEXT;')
        console.log('==========================================')
        console.log('')
        console.log('Steps:')
        console.log('1. Go to https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new')
        console.log('2. Paste the SQL above')
        console.log('3. Click "Run"')
        console.log('4. Refresh the schema (Settings > API > Schema cache refresh)')
        process.exit(1)
      } else {
        throw error
      }
    } else {
      console.log('✅ Column already exists! Migration already applied.')
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

applyMigration()
