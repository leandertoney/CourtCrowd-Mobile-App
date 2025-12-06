import {useEffect, useState, useCallback} from 'react';
import {supabase} from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  skill_level: string | null;
  bio: string | null;
  created_at: string;
}

export interface UserWithFollowStatus extends UserProfile {
  isFollowing: boolean;
  isFollowingMe: boolean;
  mutualFriends?: number;
}

/**
 * Hook to search for users
 */
export function useUserSearch() {
  const [results, setResults] = useState<UserWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || !currentUserId) {
        setResults([]);
        return;
      }

      setLoading(true);

      try {
        // Search users by name or nickname
        const {data: users, error} = await supabase
          .from('users')
          .select('*')
          .neq('id', currentUserId)
          .or(`name.ilike.%${query}%,nickname.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(20);

        if (error) throw error;

        // Get following status for each user
        const {data: following} = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUserId);

        const followingIds = new Set(following?.map(f => f.following_id) || []);

        // Get who is following me
        const {data: followers} = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', currentUserId);

        const followerIds = new Set(followers?.map(f => f.follower_id) || []);

        const usersWithStatus: UserWithFollowStatus[] = (users || []).map(
          user => ({
            ...user,
            isFollowing: followingIds.has(user.id),
            isFollowingMe: followerIds.has(user.id),
          }),
        );

        setResults(usersWithStatus);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [currentUserId],
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {results, loading, searchUsers, clearResults};
}

/**
 * Hook to get suggested users to follow
 */
export function useSuggestedUsers() {
  const [users, setUsers] = useState<UserWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setUsers([]);
        return;
      }

      // Get users I'm already following
      const {data: following} = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = new Set(following?.map(f => f.following_id) || []);

      // Get users who are not me and not already following
      const {data: suggested, error} = await supabase
        .from('users')
        .select('*')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;

      // Filter out users I'm already following and add follow status
      const usersWithStatus: UserWithFollowStatus[] = (suggested || [])
        .filter(u => !followingIds.has(u.id))
        .map(u => ({
          ...u,
          isFollowing: false,
          isFollowingMe: false,
        }));

      setUsers(usersWithStatus);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  return {users, loading, refetch: fetchSuggestedUsers};
}

/**
 * Hook to get followers and following lists
 */
export function useFollowLists() {
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setFollowers([]);
        setFollowing([]);
        return;
      }

      // Get followers
      const {data: followerData} = await supabase
        .from('follows')
        .select(
          `
          follower:follower_id (
            id,
            email,
            name,
            nickname,
            avatar_url,
            skill_level,
            bio,
            created_at
          )
        `,
        )
        .eq('following_id', user.id);

      // Get following
      const {data: followingData} = await supabase
        .from('follows')
        .select(
          `
          following:following_id (
            id,
            email,
            name,
            nickname,
            avatar_url,
            skill_level,
            bio,
            created_at
          )
        `,
        )
        .eq('follower_id', user.id);

      setFollowers(
        (followerData?.map((f: any) => f.follower) as UserProfile[]) || [],
      );
      setFollowing(
        (followingData?.map((f: any) => f.following) as UserProfile[]) || [],
      );
    } catch (error) {
      console.error('Error fetching follow lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {followers, following, loading, refetch: fetchLists};
}

/**
 * Hook to get a user's profile
 */
export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserWithFollowStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const {
        data: {user: currentUser},
      } = await supabase.auth.getUser();

      const {data, error} = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check follow status
      let isFollowing = false;
      let isFollowingMe = false;

      if (currentUser && currentUser.id !== userId) {
        const {data: followCheck} = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .single();

        isFollowing = !!followCheck;

        const {data: followerCheck} = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', userId)
          .eq('following_id', currentUser.id)
          .single();

        isFollowingMe = !!followerCheck;
      }

      setProfile({
        ...data,
        isFollowing,
        isFollowingMe,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {profile, loading, refetch: fetchProfile};
}
