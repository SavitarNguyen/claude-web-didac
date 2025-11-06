# Database Migration Instructions

## Add corrected_content column to essays table

To enable the essay history and corrected essay functionality, you need to add a new column to the `essays` table in your Supabase database.

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **fpomqateqebxypbjabch** (cute-vocab-lms)
3. Navigate to the **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Paste the following SQL:

```sql
-- Add corrected_content column to essays table to store the corrected version of the essay
ALTER TABLE public.essays
ADD COLUMN IF NOT EXISTS corrected_content TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.essays.corrected_content IS 'Stores the corrected/revised version of the essay after IELTS analysis';
```

6. Click **Run** to execute the migration
7. Verify the column was added by going to **Table Editor** > **essays** and checking for the new `corrected_content` column

### Verification

You can verify the migration was successful by running this query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'essays' AND column_name = 'corrected_content';
```

You should see one row returned with the column details.

## What this enables:

- Saving both original and corrected essay versions to the database
- Viewing essay history at `/my-essays`
- Side-by-side comparison of original and corrected versions
- Better tracking of student progress over time
