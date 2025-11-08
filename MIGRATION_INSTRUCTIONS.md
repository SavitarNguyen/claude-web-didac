# Fix Essay Access Issue - Migration Instructions

## Problem
Students cannot see their corrected essays because the `essays` table is missing Row Level Security (RLS) policies.

## Solution
Apply the SQL migration to add RLS policies to the essays table.

---

## Apply via Supabase Dashboard (2 minutes)

### Steps:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql/new

2. **Copy the Migration SQL**
   - Open the file: `scripts/apply-migrations-simple.sql`
   - Select all and copy

3. **Paste and Execute**
   - Paste into the SQL Editor
   - Click "Run"

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check Table Editor → essays → Policies tab
   - Should see 4 new policies

5. **Test**
   - Refresh http://localhost:3000/ielts-essay/my-essays
   - Log in as a student
   - Essays should now be visible!

---

## What This Migration Does

✅ Adds `corrected_content` column
✅ Adds `level` column  
✅ Enables Row Level Security
✅ Creates 4 RLS policies for student access
✅ Grants proper permissions

---

**Files Created:**
- `supabase/migrations/20250114000000_add_rls_policies_to_essays.sql`
- `scripts/apply-migrations-simple.sql` (use this one)
- `scripts/fix-essay-rls.js`
