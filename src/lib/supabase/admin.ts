import { createClient } from "@supabase/supabase-js";

// This client uses the service_role key — ONLY use in server-side code (API routes, server actions).
// NEVER expose this to the browser/client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
