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
      <Stack.Screen name="index" options={{ title: '홈', headerTitleAlign: 'center' }} />
      <Stack.Screen name="(auth)/login" options={{ title: '로그인', headerTitleAlign: 'center' }} />
      <Stack.Screen name="(auth)/register" options={{ title: '회원가입', headerTitleAlign: 'center' }} />
      <Stack.Screen name="auth/callback" options={{ title: '이메일 인증', headerTitleAlign: 'center' }} />
      <Stack.Screen name="privacy" options={{ title: '개인정보처리방침', headerTitleAlign: 'center' }} />
      <Stack.Screen name="settings" options={{ title: '설정', headerTitleAlign: 'center' }} />
      <Stack.Screen name="terms" options={{ title: '이용약관', headerTitleAlign: 'center' }} />
      <Stack.Screen name="profile/edit" options={{ title: '프로필 수정', headerTitleAlign: 'center' }} />
      <Stack.Screen name="profile/preview" options={{ title: '미리보기', headerTitleAlign: 'center' }} />
      <Stack.Screen name="public/[username]" options={{ title: '공개 프로필', headerTitleAlign: 'center' }} />
      <Stack.Screen name="[username]" options={{ headerShown: false }} />
    </Stack>
  );
}
