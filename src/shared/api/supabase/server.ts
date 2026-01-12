import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { ENV } from '@/shared/config/environment';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // middleware updates sessions
        }
      },
    },
  });
}
