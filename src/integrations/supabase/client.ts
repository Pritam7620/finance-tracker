// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://thrpkdznruojvctfvcgs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRocnBrZHpucnVvanZjdGZ2Y2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NDU0NDQsImV4cCI6MjA2NDAyMTQ0NH0.aU9NnOfXfLnl--t9ZqpRryJYTCvKhF0AcFAvrY4nCfo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);