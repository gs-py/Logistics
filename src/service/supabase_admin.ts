import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wuzropprhzffzaxvtokc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1enJvcHByaHpmZnpheHZ0b2tjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDIwNDk2NCwiZXhwIjoyMDU1NzgwOTY0fQ.Z3arxOSIfsxzSC3Xa7EUg5rrK3laYhlFV3nm1ia3IhM";
export const supabase_admin = createClient(supabaseUrl, supabaseKey);
