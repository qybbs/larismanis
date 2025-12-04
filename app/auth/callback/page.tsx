'use client';

import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } catch (error) {
          console.error('Error exchanging code for session:', error);
        }
      }
      
      // Redirect to home or dashboard after handling auth
      router.push('/dashboard');
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Logging you in...</h2>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
}
