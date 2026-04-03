import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { ensureProfile } from './profile';
import { supabase } from './supabase';

const nativeAuthRedirectUrl = 'linkit://auth/callback';

// This completion hook is only needed for web-based auth flows.
// Running it eagerly on native has caused unstable module initialization in dev builds.
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

export function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return nativeAuthRedirectUrl;
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

function createNonce(length = 32) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
}

export async function isAppleSignInSupported() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple() {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple 로그인은 iPhone에서 사용할 수 있어요.');
  }

  const rawNonce = createNonce();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple 로그인 토큰을 받아오지 못했어요.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Apple 로그인 세션을 만들지 못했어요.');
  }

  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
    .filter(Boolean)
    .join(' ')
    .trim();

  await ensureProfile({
    userId: data.user.id,
    email: data.user.email ?? null,
    username: (data.user.user_metadata?.username as string | undefined) ?? null,
    name:
      fullName
      || (data.user.user_metadata?.full_name as string | undefined)
      || (data.user.user_metadata?.name as string | undefined)
      || null,
  });

  return data.session;
}

export async function deleteMyAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw error;
  }

  await supabase.auth.signOut().catch(() => undefined);
}
