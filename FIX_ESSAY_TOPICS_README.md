# Fix Essay Topics & Prompts Feature

## Problem
The "Add Topic" and "Add Prompt" buttons are not working because the required database tables don't exist in Supabase.

## Solution
Apply the SQL migration to create the required tables.

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/fpomqateqebxypbjabch/sql
   - Or navigate to: Dashboard → SQL Editor

2. **Copy and Run the SQL**
   - Open the file: `APPLY_THIS_IN_SUPABASE_SQL_EDITOR.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor
   - Click "Run" button

3. **Verify Success**
   - You should see messages like:
     ```
     Topics created: 1
     Prompts created: 1
     ```
   - The tables should now appear in Table Editor

4. **Refresh Your Browser**
   - Go back to http://localhost:3000/ielts-essay
   - You should now see the Education topic with the prompt!

### Option 2: Using Supabase CLI (Alternative)

If you have Supabase CLI installed:

```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/`

## What This Creates

### Tables Created:
1. **essay_topics** - Stores topic categories (Education, Technology, etc.)
2. **essay_prompts** - Stores essay questions/prompts for each topic
3. **vocab_suggestions** - Stores vocabulary and grammar suggestions for each prompt

### Initial Data:
- **Topic**: Education
  - **Description**: Topics related to education systems, university, learning, and academic development
  - **Prompt**: Free University Education
    - **Question**: "University education should be free to everyone, regardless of income. To what extent do you agree or disagree?"

### Permissions:
- **Everyone** can view topics, prompts, and vocabulary suggestions
- Only **admins and teachers** can create, update, or delete them

## After Migration

Once the migration is applied successfully:

1. **View the Topic**
   - Go to http://localhost:3000/ielts-essay
   - Select "Education" from the topics list
   - Select "Free University Education" prompt

2. **Test Ideas Generator**
   - With the prompt selected, scroll down
   - You'll see the "Ideas Generator" section
   - Click "Generate Ideas" to test the AI feature

3. **Add More Content**
   - Use the "+ Add Topic" button to create new topics
   - Use the "+ Add Prompt" button to add more essay questions
   - These buttons will now work correctly!

## Troubleshooting

If you still see errors after applying the migration:

1. **Check Tables Exist**
   - Go to Supabase Dashboard → Table Editor
   - Verify `essay_topics`, `essay_prompts`, and `vocab_suggestions` tables exist

2. **Check RLS Policies**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies exist for all three tables

3. **Check Your User Role**
   - Make sure your account has `role = 'admin'` in the `users` table
   - Only admins can create new topics/prompts

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear site data in DevTools

## Need Help?

Check the browser console (F12) and network tab for specific error messages.
