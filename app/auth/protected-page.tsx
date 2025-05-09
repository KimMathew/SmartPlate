import { useSession } from '@supabase/auth-helpers-react';
import { useEffect } from 'react';

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const session = useSession();

  useEffect(() => {
    if (!session) {
      window.location.href = '/login';
    }
  }, [session]);

  if (!session) {
    return null; // Optionally, you can show a loading spinner here
  }

  return <>{children}</>;
}