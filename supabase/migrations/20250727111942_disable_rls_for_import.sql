-- Temporarily disable RLS for flashcards table to allow bulk import
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON flashcards
    FOR ALL USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
