import { PostgrestError } from '@supabase/supabase-js';
import { LinkItem, PublicProfile, Profile } from '../types';
import { supabase } from './supabase';

export const defaultProfileValues: Omit<Profile, 'user_id' | 'username'> = {
  name: '',
  bio: '',
  avatar_url: '',
  cta_text: '',
  cta_link: '',
  trust_review_count: 0,
  trust_response_time: '',
  trust_reuse_rate: '',
};

export function buildPublicProfile(profile: Profile | null, linkItems: LinkItem[] = []): PublicProfile | null {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    serviceCards: [],
    linkItems,
  };
}

function shouldIgnoreMissingTable(error: PostgrestError | null) {
  return error?.code === '42P01';
}

export async function fetchProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<Profile>();

  if (error && !shouldIgnoreMissingTable(error)) {
    throw error;
  }

  return data ?? null;
}

export async function fetchProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle<Profile>();

  if (error && !shouldIgnoreMissingTable(error)) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const linkItems = await fetchLinkItemsByUserId(data.user_id);

  return buildPublicProfile(data, linkItems);
}

export async function fetchLinkItemsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('link_items')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true })
    .returns<LinkItem[]>();

  if (error && !shouldIgnoreMissingTable(error)) {
    throw error;
  }

  return data ?? [];
}

export async function fetchPublicProfileByUserId(userId: string) {
  const [profile, linkItems] = await Promise.all([
    fetchProfileByUserId(userId),
    fetchLinkItemsByUserId(userId),
  ]);

  return buildPublicProfile(profile, linkItems);
}

interface UpsertProfileInput {
  userId: string;
  username: string;
  updates?: Partial<Omit<Profile, 'user_id' | 'username'>>;
}

interface EnsureProfileInput {
  userId: string;
  email?: string | null;
  username?: string | null;
  name?: string | null;
}

export async function upsertProfile({
  userId,
  username,
  updates = {},
}: UpsertProfileInput) {
  const payload: Profile = {
    user_id: userId,
    username,
    ...defaultProfileValues,
    ...updates,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single<Profile>();

  if (error) {
    throw error;
  }

  return data;
}

export function getProfileSaveErrorMessage(error: unknown) {
  if (error instanceof PostgrestError) {
    if (error.code === '23505') {
      return '이미 사용 중인 공개 링크 주소예요. 다른 사용자 이름으로 바꿔주세요.';
    }

    if (error.code === '42501') {
      return '로그인 상태가 확인되지 않아 저장하지 못했어요. 다시 로그인한 뒤 시도해주세요.';
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '저장 중 오류가 발생했어요.';
}

interface CreateLinkItemInput {
  userId: string;
  title: string;
  description?: string;
  link: string;
  order: number;
}

interface UpdateLinkItemInput {
  id: string;
  title: string;
  description?: string;
  link: string;
}

export function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function openableExternalUrl(value: string) {
  return normalizeExternalUrl(value);
}

export async function createLinkItem({ userId, title, description, link, order }: CreateLinkItemInput) {
  const payload = {
    user_id: userId,
    title,
    description: description ?? '',
    link: normalizeExternalUrl(link),
    order,
  };

  const { data, error } = await supabase
    .from('link_items')
    .insert(payload)
    .select()
    .single<LinkItem>();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteLinkItem(id: string) {
  const { error } = await supabase
    .from('link_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function updateLinkItem({ id, title, description, link }: UpdateLinkItemInput) {
  const payload = {
    title,
    description: description ?? '',
    link: normalizeExternalUrl(link),
  };

  const { data, error } = await supabase
    .from('link_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single<LinkItem>();

  if (error) {
    throw error;
  }

  return data;
}

export function getLinkItemSaveErrorMessage(error: unknown) {
  if (error instanceof PostgrestError) {
    if (error.code === 'P0001') {
      return error.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '링크를 저장하지 못했어요.';
}

interface UploadAvatarInput {
  userId: string;
  uri: string;
  mimeType?: string | null;
}

function getAvatarExtension(mimeType?: string | null) {
  if (!mimeType) {
    return 'jpg';
  }

  if (mimeType.includes('png')) {
    return 'png';
  }

  if (mimeType.includes('webp')) {
    return 'webp';
  }

  return 'jpg';
}

export async function uploadAvatar({ userId, uri, mimeType }: UploadAvatarInput) {
  const response = await fetch(uri);
  const blob = await response.blob();
  const extension = getAvatarExtension(mimeType);
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    cacheControl: '3600',
    upsert: true,
    contentType: mimeType ?? undefined,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  return data.publicUrl;
}

export function subscribeToProfileRealtime(userId: string, onChange: () => void) {
  const channel = supabase
    .channel(`profile-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`,
      },
      onChange
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'link_items',
        filter: `user_id=eq.${userId}`,
      },
      onChange
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function ensureProfile({
  userId,
  email,
  username,
  name,
}: EnsureProfileInput) {
  const existingProfile = await fetchProfileByUserId(userId);

  if (existingProfile) {
    return existingProfile;
  }

  const fallbackUsername = email?.split('@')[0] || `user-${userId.slice(0, 8)}`;
  const normalizedUsername = username?.trim().toLowerCase() || fallbackUsername;

  return upsertProfile({
    userId,
    username: normalizedUsername,
    updates: {
      name: name?.trim() || normalizedUsername,
    },
  });
}
