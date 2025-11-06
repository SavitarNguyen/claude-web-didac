

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_flashcard_count"("set_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE flashcard_sets
    SET card_count = GREATEST(COALESCE(card_count, 0) - 1, 0)
    WHERE id = set_id_param;
END;
$$;


ALTER FUNCTION "public"."decrement_flashcard_count"("set_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_flashcard_count"("set_id_param" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE flashcard_sets
    SET card_count = COALESCE(card_count, 0) + 1
    WHERE id = set_id_param;
END;
$$;


ALTER FUNCTION "public"."increment_flashcard_count"("set_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_flashcard_admin"("p_set_id" "uuid", "p_word" "text", "p_definition" "text", "p_example" "text" DEFAULT NULL::"text", "p_topic" "text" DEFAULT NULL::"text", "p_vietnamese_translation" "text" DEFAULT NULL::"text", "p_pronunciation" "text" DEFAULT NULL::"text", "p_word_type" "text" DEFAULT NULL::"text", "p_usage_collocations" "text" DEFAULT NULL::"text", "p_related_words" "text" DEFAULT NULL::"text", "p_sample_ielts_usage" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  flashcard_id UUID;
BEGIN
  -- Generate a new UUID for the flashcard
  flashcard_id := gen_random_uuid();
  
  -- Insert the flashcard with all the new columns
  INSERT INTO flashcards (
    id,
    set_id,
    word,
    definition,
    example,
    topic,
    vietnamese_translation,
    pronunciation,
    word_type,
    usage_collocations,
    related_words,
    sample_ielts_usage,
    created_at
  ) VALUES (
    flashcard_id,
    p_set_id,
    p_word,
    p_definition,
    p_example,
    p_topic,
    p_vietnamese_translation,
    p_pronunciation,
    p_word_type,
    p_usage_collocations,
    p_related_words,
    p_sample_ielts_usage,
    NOW()
  );
  
  -- Update the card count for the set
  UPDATE flashcard_sets 
  SET card_count = (
    SELECT COUNT(*) 
    FROM flashcards 
    WHERE set_id = p_set_id
  )
  WHERE id = p_set_id;
  
  RETURN flashcard_id;
END;
$$;


ALTER FUNCTION "public"."insert_flashcard_admin"("p_set_id" "uuid", "p_word" "text", "p_definition" "text", "p_example" "text", "p_topic" "text", "p_vietnamese_translation" "text", "p_pronunciation" "text", "p_word_type" "text", "p_usage_collocations" "text", "p_related_words" "text", "p_sample_ielts_usage" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."recalculate_all_flashcard_counts"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE flashcard_sets fs
    SET card_count = (
        SELECT COUNT(*) 
        FROM flashcards f 
        WHERE f.set_id = fs.id
    );
END;
$$;


ALTER FUNCTION "public"."recalculate_all_flashcard_counts"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assignments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "prompt" "text" NOT NULL,
    "due_date" timestamp with time zone,
    "instructions" "text",
    "type" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."essays" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "score" numeric,
    "feedback" "jsonb",
    "user_id" "uuid",
    "is_flagged" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."essays" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcard_progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "flashcard_id" "uuid",
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."flashcard_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcard_sets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "card_count" integer DEFAULT 0,
    "slug" "text"
);


ALTER TABLE "public"."flashcard_sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flashcards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "set_id" "uuid",
    "word" "text" NOT NULL,
    "definition" "text" NOT NULL,
    "example" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "topic" "text",
    "vietnamese_translation" "text",
    "pronunciation" "text",
    "word_type" "text",
    "usage_collocations" "text",
    "related_words" "text",
    "sample_ielts_usage" "text"
);


ALTER TABLE "public"."flashcards" OWNER TO "postgres";


COMMENT ON COLUMN "public"."flashcards"."topic" IS 'Topic category from XLSX';



COMMENT ON COLUMN "public"."flashcards"."vietnamese_translation" IS 'Vietnamese translation from XLSX';



COMMENT ON COLUMN "public"."flashcards"."pronunciation" IS 'Pronunciation guide from XLSX';



COMMENT ON COLUMN "public"."flashcards"."word_type" IS 'Part of speech from XLSX';



COMMENT ON COLUMN "public"."flashcards"."usage_collocations" IS 'Usage and collocations from XLSX';



COMMENT ON COLUMN "public"."flashcards"."related_words" IS 'Related words from XLSX';



COMMENT ON COLUMN "public"."flashcards"."sample_ielts_usage" IS 'Sample IELTS usage from XLSX';



CREATE TABLE IF NOT EXISTS "public"."progress" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "words_learned" integer DEFAULT 0,
    "essays_completed" integer DEFAULT 0,
    "speaking_completed" integer DEFAULT 0,
    "study_time_minutes" integer DEFAULT 0,
    "last_study_date" timestamp with time zone DEFAULT "now"(),
    "streak" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."speaking_practices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "audio_url" "text" NOT NULL,
    "transcript" "text",
    "score" numeric,
    "feedback" "jsonb",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."speaking_practices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text",
    "email" "text",
    "password" "text",
    "image" "text",
    "role" "text" DEFAULT 'student'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."essays"
    ADD CONSTRAINT "essays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcard_progress"
    ADD CONSTRAINT "flashcard_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcard_progress"
    ADD CONSTRAINT "flashcard_progress_user_id_flashcard_id_key" UNIQUE ("user_id", "flashcard_id");



ALTER TABLE ONLY "public"."flashcard_sets"
    ADD CONSTRAINT "flashcard_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."speaking_practices"
    ADD CONSTRAINT "speaking_practices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assignments"
    ADD CONSTRAINT "assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."essays"
    ADD CONSTRAINT "essays_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcard_progress"
    ADD CONSTRAINT "flashcard_progress_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "public"."flashcards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcard_progress"
    ADD CONSTRAINT "flashcard_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcards"
    ADD CONSTRAINT "flashcards_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "public"."flashcard_sets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."progress"
    ADD CONSTRAINT "progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."speaking_practices"
    ADD CONSTRAINT "speaking_practices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins and teachers can manage all sets" ON "public"."flashcard_sets" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ((("users"."id")::"text" = ("auth"."uid"())::"text") AND (("users"."role" = 'admin'::"text") OR ("users"."role" = 'teacher'::"text"))))));



CREATE POLICY "Allow all operations for authenticated users" ON "public"."flashcards" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete for authenticated users only" ON "public"."flashcard_sets" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."flashcards" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."flashcard_sets" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."flashcards" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."flashcard_sets" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."flashcards" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."flashcard_sets" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."flashcards" FOR UPDATE USING (true);



CREATE POLICY "Flashcard sets are viewable by everyone" ON "public"."flashcard_sets" FOR SELECT USING (true);



CREATE POLICY "Flashcards are viewable by everyone" ON "public"."flashcards" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own progress" ON "public"."flashcard_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own flashcard progress" ON "public"."flashcard_progress" USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



CREATE POLICY "Users can update their own progress" ON "public"."flashcard_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own progress" ON "public"."flashcard_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."flashcard_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flashcards" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."decrement_flashcard_count"("set_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_flashcard_count"("set_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_flashcard_count"("set_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_flashcard_count"("set_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_flashcard_count"("set_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_flashcard_count"("set_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_flashcard_admin"("p_set_id" "uuid", "p_word" "text", "p_definition" "text", "p_example" "text", "p_topic" "text", "p_vietnamese_translation" "text", "p_pronunciation" "text", "p_word_type" "text", "p_usage_collocations" "text", "p_related_words" "text", "p_sample_ielts_usage" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_flashcard_admin"("p_set_id" "uuid", "p_word" "text", "p_definition" "text", "p_example" "text", "p_topic" "text", "p_vietnamese_translation" "text", "p_pronunciation" "text", "p_word_type" "text", "p_usage_collocations" "text", "p_related_words" "text", "p_sample_ielts_usage" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_flashcard_admin"("p_set_id" "uuid", "p_word" "text", "p_definition" "text", "p_example" "text", "p_topic" "text", "p_vietnamese_translation" "text", "p_pronunciation" "text", "p_word_type" "text", "p_usage_collocations" "text", "p_related_words" "text", "p_sample_ielts_usage" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."recalculate_all_flashcard_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."recalculate_all_flashcard_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."recalculate_all_flashcard_counts"() TO "service_role";


















GRANT ALL ON TABLE "public"."assignments" TO "anon";
GRANT ALL ON TABLE "public"."assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."assignments" TO "service_role";



GRANT ALL ON TABLE "public"."essays" TO "anon";
GRANT ALL ON TABLE "public"."essays" TO "authenticated";
GRANT ALL ON TABLE "public"."essays" TO "service_role";



GRANT ALL ON TABLE "public"."flashcard_progress" TO "anon";
GRANT ALL ON TABLE "public"."flashcard_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcard_progress" TO "service_role";



GRANT ALL ON TABLE "public"."flashcard_sets" TO "anon";
GRANT ALL ON TABLE "public"."flashcard_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcard_sets" TO "service_role";



GRANT ALL ON TABLE "public"."flashcards" TO "anon";
GRANT ALL ON TABLE "public"."flashcards" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcards" TO "service_role";



GRANT ALL ON TABLE "public"."progress" TO "anon";
GRANT ALL ON TABLE "public"."progress" TO "authenticated";
GRANT ALL ON TABLE "public"."progress" TO "service_role";



GRANT ALL ON TABLE "public"."speaking_practices" TO "anon";
GRANT ALL ON TABLE "public"."speaking_practices" TO "authenticated";
GRANT ALL ON TABLE "public"."speaking_practices" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
