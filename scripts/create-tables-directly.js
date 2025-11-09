#!/usr/bin/env node

/**
 * This script creates the essay_topics and essay_prompts tables directly
 * and inserts the Education topic with its prompt.
 *
 * IMPORTANT: This will only work if you have the postgres connection string.
 * The better approach is to use the Supabase SQL Editor in the dashboard.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTablesAndData() {
  console.log('\n📋 IMPORTANT INFORMATION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('The Supabase JavaScript client cannot create tables directly.');
  console.log('You MUST use the Supabase SQL Editor to create the tables.\n');
  console.log('Please follow these steps:\n');
  console.log('1. Open your Supabase Dashboard SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql\n');
  console.log('2. Copy ALL contents from this file:');
  console.log('   APPLY_THIS_IN_SUPABASE_SQL_EDITOR.sql\n');
  console.log('3. Paste into the SQL Editor');
  console.log('4. Click "Run" button\n');
  console.log('5. You should see success messages confirming table creation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Let's test if tables exist
  console.log('🔍 Checking if tables exist...\n');

  const { data: topicsData, error: topicsError } = await supabase
    .from('essay_topics')
    .select('*')
    .limit(1);

  if (topicsError) {
    if (topicsError.message.includes('does not exist') || topicsError.message.includes('schema cache')) {
      console.log('❌ Table "essay_topics" does NOT exist');
      console.log('   Error:', topicsError.message);
      console.log('\n⚠️  You MUST create the tables using the SQL Editor (see instructions above)\n');
      process.exit(1);
    } else {
      console.error('❌ Unexpected error:', topicsError.message);
      process.exit(1);
    }
  }

  console.log('✅ Table "essay_topics" exists!');
  console.log(`   Found ${topicsData?.length || 0} topics\n`);

  // Check for Education topic
  const { data: educationTopic, error: eduError } = await supabase
    .from('essay_topics')
    .select('*')
    .eq('name', 'Education')
    .single();

  if (eduError && eduError.code !== 'PGRST116') {
    console.error('❌ Error checking for Education topic:', eduError.message);
  }

  if (!educationTopic) {
    console.log('📝 Education topic not found. Creating it...');
    const { data: newTopic, error: insertError } = await supabase
      .from('essay_topics')
      .insert({
        name: 'Education',
        description: 'Topics related to education systems, university, learning, and academic development'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating Education topic:', insertError.message);
      process.exit(1);
    }

    console.log('✅ Created Education topic:', newTopic.id);

    // Create the prompt
    const { data: newPrompt, error: promptError } = await supabase
      .from('essay_prompts')
      .insert({
        topic_id: newTopic.id,
        title: 'Free University Education',
        description: 'University education should be free to everyone, regardless of income. To what extent do you agree or disagree?'
      })
      .select()
      .single();

    if (promptError) {
      console.error('❌ Error creating prompt:', promptError.message);
      process.exit(1);
    }

    console.log('✅ Created prompt:', newPrompt.id);
    console.log('\n🎉 SUCCESS! Education topic and prompt created!\n');
  } else {
    console.log('✅ Education topic already exists:', educationTopic.id);

    // Check for the prompt
    const { data: prompts } = await supabase
      .from('essay_prompts')
      .select('*')
      .eq('topic_id', educationTopic.id);

    console.log(`✅ Found ${prompts?.length || 0} prompts for Education topic\n`);
  }

  console.log('✅ All done! Check your app at http://localhost:3000/ielts-essay\n');
}

createTablesAndData();
