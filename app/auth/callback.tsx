import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { ensureProfile } from '../../src/utils/profile';
import { supabase } from '../../src/utils/supabase';

function extractAuthParams(rawUrl: string | null) {
  if (!rawUrl) {
    return {
      accessToken: null,
      refreshToken: null,
      code: null,
    };
  }

  const normalizedUrl = rawUrl.replace('#', '?');
  const parsed = Linking.parse(normalizedUrl);
  const params = parsed.queryParams ?? {};

  const accessToken = typeof params.access_token === 'string' ? params.access_token : null;
  const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : null;
  const code = typeof params.code === 'string' ? params.code : null;

  return { accessToken, refreshToken, code };
}

export default function AuthCallback() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [message, setMessage] = useState<string>(t.authCallback.checking);

  useEffect(() => {
    let isMounted = true;

    const completeAuth = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const fallbackUrl =
          typeof window !== 'undefined' ? window.location.href : null;
        const url = initialUrl ?? fallbackUrl;
        const { accessToken, refreshToken, code } = extractAuthParams(url);
        const queryCode = typeof params.code === 'string' ? params.code : null;
        const queryAccessToken =
          typeof params.access_token === 'string' ? params.access_token : null;
        const queryRefreshToken =
          typeof params.refresh_token === 'string' ? params.refresh_token : null;

        const finalCode = queryCode ?? code;
        const finalAccessToken = queryAccessToken ?? accessToken;
        const finalRefreshToken = queryRefreshToken ?? refreshToken;

        if (finalCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(finalCode);

          if (error) {
            throw error;
          }
        } else if (finalAccessToken && finalRefreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          });

          if (error) {
            throw error;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          throw new Error(t.authCallback.sessionError);
        }

        await ensureProfile({
          userId: session.user.id,
          email: session.user.email ?? null,
          username: (session.user.user_metadata?.username as string | undefined) ?? null,
          name: (session.user.user_metadata?.username as string | undefined) ?? null,
        });

        if (isMounted) {
          setMessage(t.authCallback.success);
        }

        router.replace('/profile/edit');
      } catch (error) {
        if (isMounted) {
          setMessage(error instanceof Error ? error.message : t.authCallback.genericError);
        }
      }
    };

    void completeAuth();

    return () => {
      isMounted = false;
    };
  }, [params.access_token, params.code, params.refresh_token, t.authCallback.checking, t.authCallback.genericError, t.authCallback.sessionError, t.authCallback.success]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={styles.title}>{t.authCallback.title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 22,
  },
});
