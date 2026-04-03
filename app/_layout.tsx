import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useLanguageStore } from '../src/stores/languageStore';
import { useAuthStore } from '../src/stores/authStore';
import { ensureProfile } from '../src/utils/profile';
import { supabase } from '../src/utils/supabase';

export default function RootLayout() {
  const initializeLanguage = useLanguageStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    void initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setSession(null);
      } else {
        setSession(data.session ?? null);
      }

      setInitialized(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setInitialized(true);

       if (session?.user) {
        void ensureProfile({
          userId: session.user.id,
          email: session.user.email ?? null,
          username: (session.user.user_metadata?.username as string | undefined) ?? null,
          name: (session.user.user_metadata?.username as string | undefined) ?? null,
        }).catch(() => {
          // Keep auth usable even if profile bootstrapping fails.
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setInitialized, setSession]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="(auth)/login" options={{ title: 'Login' }} />
      <Stack.Screen name="(auth)/register" options={{ title: 'Register' }} />
      <Stack.Screen name="auth/callback" options={{ title: 'Email Verification' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
      <Stack.Screen name="profile/edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="profile/preview" options={{ title: 'Preview' }} />
      <Stack.Screen name="public/[username]" options={{ title: 'Public Page' }} />
    </Stack>
  );
}
