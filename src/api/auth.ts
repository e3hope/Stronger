import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './client';

const PUBLIC_USER_ID_CACHE_PREFIX = 'publicUserId:';

export async function getSessionUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Supabase `users` 테이블의 integer id를 반환한다.
 * AsyncStorage 캐시 우선 조회 → 미스 시 DB 조회/삽입 후 캐시 저장.
 */
export async function ensurePublicUser(authId: string): Promise<number | null> {
  const cacheKey = PUBLIC_USER_ID_CACHE_PREFIX + authId;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
  } catch {
    // AsyncStorage 실패는 무시하고 DB 폴백
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  let resolved: number | null = null;
  if (existingUser) {
    resolved = existingUser.id;
  } else {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ auth_id: authId })
      .select('id')
      .single();
    resolved = newUser?.id ?? null;
  }

  if (resolved != null) {
    try {
      await AsyncStorage.setItem(cacheKey, String(resolved));
    } catch {
      // 캐시 저장 실패 무시
    }
  }
  return resolved;
}

export async function clearPublicUserCache(authId: string) {
  try {
    await AsyncStorage.removeItem(PUBLIC_USER_ID_CACHE_PREFIX + authId);
  } catch {
    // 무시
  }
}
