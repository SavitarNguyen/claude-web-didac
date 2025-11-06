import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Apply migration to add corrected_content column
    const { error } = await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.essays
        ADD COLUMN IF NOT EXISTS corrected_content TEXT;

        COMMENT ON COLUMN public.essays.corrected_content IS 'Stores the corrected/revised version of the essay after IELTS analysis';
      `,
    });

    if (error) {
      console.error("Migration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Migration applied successfully" });
  } catch (error: any) {
    console.error("Error applying migration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
