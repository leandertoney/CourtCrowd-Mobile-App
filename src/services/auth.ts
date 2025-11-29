import {supabase} from '../lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri} from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const redirectUrl = makeRedirectUri({
  scheme: 'courtcrowd',
  path: 'auth/callback',
});

/**
 * Sign in with magic link (passwordless email)
 */
export async function signInWithMagicLink(email: string) {
  const {error} = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
  return {error};
}

/**
 * Sign in with Apple
 */
export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    const {data, error} = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) throw error;

    // Update user name if provided by Apple (only on first sign-in)
    if (credential.fullName?.givenName && data.user) {
      const fullName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ');

      await supabase
        .from('users')
        .update({name: fullName})
        .eq('id', data.user.id);
    }

    return {data, error: null};
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return {data: null, error: null}; // User cancelled
    }
    return {data: null, error};
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success') {
      const url = result.url;
      // Extract tokens from URL
      const params = new URLSearchParams(url.split('#')[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        const {data: sessionData, error: sessionError} =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

        return {data: sessionData, error: sessionError};
      }
    }
  }

  return {data: null, error: new Error('Google sign-in failed')};
}

/**
 * Sign out current user
 */
export async function signOut() {
  const {error} = await supabase.auth.signOut();
  return {error};
}

/**
 * Get current session
 */
export async function getSession() {
  const {data, error} = await supabase.auth.getSession();
  return {session: data.session, error};
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();
  return {user, error};
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    name?: string;
    nickname?: string;
    avatar_url?: string;
    skill_level?: string;
    play_hours?: string;
    dupr?: string;
    bio?: string;
    location_sharing?: boolean;
  },
) {
  const {data, error} = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return {data, error};
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(userId: string, uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  const fileExt = uri.split('.').pop() || 'jpg';
  const fileName = `${userId}/avatar.${fileExt}`;

  const {error: uploadError} = await supabase.storage
    .from('avatars')
    .upload(fileName, blob, {
      upsert: true,
      contentType: `image/${fileExt}`,
    });

  if (uploadError) throw uploadError;

  const {data} = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Update user profile with new avatar URL
  await supabase
    .from('users')
    .update({avatar_url: data.publicUrl})
    .eq('id', userId);

  return {url: data.publicUrl};
}

/**
 * Register push notification token
 */
export async function registerPushToken(userId: string, token: string) {
  const {error} = await supabase
    .from('users')
    .update({push_token: token})
    .eq('id', userId);

  return {error};
}

/**
 * Check if Apple authentication is available
 */
export async function isAppleAuthAvailable() {
  return await AppleAuthentication.isAvailableAsync();
}
