import { PostgrestError } from '@supabase/supabase-js';
import { PublicProfile, Profile } from '../types';
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

export function buildPublicProfile(profile: Profile | null): PublicProfile | null {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    serviceCards: [],
    linkItems: [],
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

  return buildPublicProfile(data ?? null);
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
