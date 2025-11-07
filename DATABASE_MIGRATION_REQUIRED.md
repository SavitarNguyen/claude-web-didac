# 🚨 Database Migration Required

## You need to apply the essay system migration to use the new IELTS Essay features

### Steps to Apply Migration:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Migration**
   - Open the file: `supabase/migrations/20250112000000_create_essay_system_tables.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor

4. **Run the Migration**
   - Click the "Run" button
   - Wait for the success message

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - The following tables will be created:
     - `essay_topics` (with 8 default topics)
     - `essay_prompts`
     - `essay_vocab_suggestions`
     - `essay_drafts`

6. **Refresh Your App**
   - Go back to http://localhost:3000/ielts-essay
   - The topic selector should now work!

### What This Migration Does:

- ✅ Creates tables for essay topics, prompts, vocab suggestions, and drafts
- ✅ Inserts 8 default topics (Business, Law, Education, Environment, Politics, Culture, Health, Technology)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Configures admin-only access for managing topics/prompts/vocab
- ✅ Allows students to manage their own drafts with version history (max 5 versions)

### After Migration:

You'll be able to:
- Select topics in the IELTS Essay page
- Choose essay prompts
- View vocabulary/grammar suggestions (once added by admin)
- Save drafts with auto-save
- View version history
- Revert to previous draft versions

---

**Need Help?** The migration file is located at:
`supabase/migrations/20250112000000_create_essay_system_tables.sql`
