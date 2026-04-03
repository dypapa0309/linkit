import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../src/i18n';
import { completeAuthFromUrl, getAuthRedirectUrl } from '../../src/utils/auth';

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
        const url =
          initialUrl
          ?? fallbackUrl
          ?? (typeof params.code === 'string' ? `${getAuthRedirectUrl()}?code=${params.code}` : null);
        await completeAuthFromUrl(url);

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
