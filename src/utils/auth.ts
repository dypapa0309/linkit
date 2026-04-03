import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ensureProfile } from './profile';
import { supabase } from './supabase';

// This completion hook is only needed for web-based auth flows.
// Running it eagerly on native has caused unstable module initialization in dev builds.
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

export function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return Linking.createURL('/auth/callback');
}

export function extractAuthParams(rawUrl: string | null) {
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

export async function completeAuthFromUrl(rawUrl: string | null) {
  const { accessToken, refreshToken, code } = extractAuthParams(rawUrl);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw error;
    }
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error('로그인 세션을 확인하지 못했어요.');
  }

  await ensureProfile({
    userId: session.user.id,
    email: session.user.email ?? null,
    username: (session.user.user_metadata?.username as string | undefined) ?? null,
    name: (session.user.user_metadata?.full_name as string | undefined)
      ?? (session.user.user_metadata?.name as string | undefined)
      ?? (session.user.user_metadata?.username as string | undefined)
      ?? null,
  });

  return session;
}

export async function signInWithGoogle() {
  const redirectTo = getAuthRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    return null;
  }

  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return null;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    return null;
  }

  return completeAuthFromUrl(result.url);
}
