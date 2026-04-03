import { Platform } from 'react-native';

const fallbackPublicBaseUrl = 'https://linkit-link.netlify.app';

export function getPublicBaseUrl() {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_PUBLIC_BASE_URL?.trim();

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return fallbackPublicBaseUrl;
}

export function getPublicProfileUrl(username: string) {
  return `${getPublicBaseUrl()}/${username}`;
}
