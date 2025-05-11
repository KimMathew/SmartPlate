// components/supabase-provider.tsx
'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient] = useState(() => createClient());

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
    </SessionContextProvider>
  );
}
