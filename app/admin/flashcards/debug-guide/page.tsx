export default function DebuggingGuidePage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Flashcard Creation Debugging Guide</h1>

      <div className="prose dark:prose-invert max-w-none">
        <h2>Step 1: Run the Emergency Fix SQL Script</h2>
        <p>
          First, run the <code>emergency_flashcard_fix.sql</code> script in your Supabase SQL editor. This script will:
        </p>
        <ul>
          <li>Ensure the flashcards table exists with the minimal required structure</li>
          <li>Add the card_count column to the flashcard_sets table if it doesn't exist</li>
          <li>Create helper functions for managing card counts</li>
          <li>Set up permissive RLS policies to eliminate permission issues</li>
          <li>Fix any foreign key constraints</li>
          <li>Create a test flashcard set if none exist</li>
        </ul>

        <h2>Step 2: Try the Direct SQL Test</h2>
        <p>
          Run the <code>direct_flashcard_test.sql</code> script in your Supabase SQL editor. This will attempt to create
          a flashcard directly in the database, bypassing any API or application code.
        </p>
        <p>
          <strong>Important:</strong> Make sure to replace <code>'your-set-id-here'</code> with an actual set ID from
          your database.
        </p>

        <h2>Step 3: Try the Emergency Flashcard Creation Page</h2>
        <p>
          Navigate to the Emergency Flashcard Creation page and try to create a flashcard using the simplified form.
          This uses a minimal API endpoint with fewer dependencies and simpler error handling.
        </p>

        <h2>Step 4: Check for Specific Issues</h2>
        <h3>Database Structure Issues</h3>
        <p>Run these queries in the SQL editor to check for database structure issues:</p>
        <pre>
          {`-- Check flashcards table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcards';

-- Check flashcard_sets table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'flashcard_sets';`}
        </pre>

        <h3>Permission Issues</h3>
        <p>Check if your user has the correct permissions:</p>
        <pre>
          {`-- Check your user's role
SELECT id, email, role FROM users WHERE email = 'your-email@example.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'flashcards';`}
        </pre>

        <h3>Foreign Key Issues</h3>
        <p>Check for foreign key constraints that might be causing issues:</p>
        <pre>
          {`-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'flashcards';`}
        </pre>

        <h2>Step 5: Check Browser Console and Network Logs</h2>
        <p>
          Open your browser's developer tools (F12) and check the Console and Network tabs for any errors when trying to
          create a flashcard.
        </p>

        <h2>Step 6: Check Server Logs</h2>
        <p>Check your Vercel deployment logs for any server-side errors that might be occurring.</p>

        <h2>Common Issues and Solutions</h2>
        <h3>Issue: "Permission denied for table flashcards"</h3>
        <p>
          <strong>Solution:</strong> This is an RLS policy issue. The emergency fix script should have set up permissive
          policies, but you can also manually run:
        </p>
        <pre>
          {`-- Make RLS policies more permissive
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users" 
ON flashcards FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);`}
        </pre>

        <h3>Issue: "Foreign key constraint violation"</h3>
        <p>
          <strong>Solution:</strong> Make sure the set_id you're using exists in the flashcard_sets table:
        </p>
        <pre>
          {`-- Check if the set exists
SELECT * FROM flashcard_sets WHERE id = 'your-set-id-here';`}
        </pre>

        <h3>Issue: "Column X does not exist"</h3>
        <p>
          <strong>Solution:</strong> The table structure might be incorrect. Run the emergency fix script or manually
          add the missing column:
        </p>
        <pre>
          {`-- Add missing column (example for 'word' column)
ALTER TABLE flashcards ADD COLUMN word TEXT NOT NULL DEFAULT '';`}
        </pre>
      </div>
    </div>
  )
}

