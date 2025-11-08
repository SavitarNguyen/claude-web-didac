import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔄 Checking Supabase connection...')
console.log('URL:', supabaseUrl)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log('📝 Checking if corrected_content column exists...')

const { error } = await supabase
  .from('essays')
  .select('corrected_content')
  .limit(1)

if (error) {
  if (error.message.includes('corrected_content') || error.code === 'PGRST204') {
    console.log('⚠️  Column does not exist.')
    console.log('')
    console.log('==========================================')
    console.log('PLEASE APPLY THIS MIGRATION MANUALLY:')
    console.log('==========================================')
    console.log('')
    console.log('1. Go to: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new')
    console.log('2. Paste this SQL:')
    console.log('')
    console.log('   ALTER TABLE public.essays')
    console.log('   ADD COLUMN IF NOT EXISTS corrected_content TEXT;')
    console.log('')
    console.log('3. Click "Run"')
    console.log('4. Then run this script again to verify')
    console.log('==========================================')
    process.exit(1)
  } else {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
} else {
  console.log('✅ Column already exists! Migration has been applied.')
  console.log('✅ You can now save essays with corrected content.')
}
