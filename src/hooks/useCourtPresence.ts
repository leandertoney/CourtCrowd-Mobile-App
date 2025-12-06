import {useEffect, useState, useCallback, useMemo} from 'react';
import {supabase, User} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';

export interface PresenceUser {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface CourtPresenceData {
  court_id: string;
  users: PresenceUser[];
  count: number;
}

/**
 * Hook to subscribe to real-time court presence updates
 * @param courtIds - Can be a single court ID string or an array of court IDs
 */
export function useCourtPresence(courtIds: string | string[] | undefined) {
  // Ensure courtIds is always an array
  const safeCourtIds = useMemo(() => {
    if (Array.isArray(courtIds)) return courtIds;
    if (courtIds) return [courtIds];
    return [];
  }, [courtIds]);

  // Create a stable key for dependencies
  const courtIdsKey = safeCourtIds.join(',');

  const [presence, setPresence] = useState<Record<string, CourtPresenceData>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const fetchPresence = useCallback(async () => {
    if (!safeCourtIds.length) {
      setPresence({});
      setLoading(false);
      return;
    }

    try {
      const {data, error} = await supabase
        .from('court_presence')
        .select(
          `
          court_id,
          user:users (
            id,
            name,
            avatar_url
          )
        `,
        )
        .in('court_id', safeCourtIds);

      if (error) throw error;

      // Group by court_id
      const grouped: Record<string, CourtPresenceData> = {};

      for (const courtId of safeCourtIds) {
        grouped[courtId] = {
          court_id: courtId,
          users: [],
          count: 0,
        };
      }

      if (data) {
        for (const row of data) {
          if (row.user && grouped[row.court_id]) {
            grouped[row.court_id].users.push(row.user as PresenceUser);
            grouped[row.court_id].count++;
          }
        }
      }

      setPresence(grouped);
    } catch (error) {
      console.error('Error fetching court presence:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtIdsKey]); // Only depend on the string key, not the array reference

  useEffect(() => {
    let channel: RealtimeChannel | null = null;
    let isMounted = true;

    const subscribe = async () => {
      await fetchPresence();

      if (!safeCourtIds.length || !isMounted) return;

      // Subscribe to realtime changes
      channel = supabase
        .channel('court-presence-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'court_presence',
          },
          async payload => {
            // Check if this change affects our courts
            const courtId =
              (payload.new as any)?.court_id ||
              (payload.old as any)?.court_id;
            if (courtId && safeCourtIds.includes(courtId) && isMounted) {
              // Refetch to get updated data
              await fetchPresence();
            }
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courtIdsKey, fetchPresence]); // Use courtIdsKey string instead of array reference

  return {presence, loading, refetch: fetchPresence};
}

/**
 * Hook to get presence for a single court
 */
export function useSingleCourtPresence(courtId: string | null) {
  const courtIds = courtId ? [courtId] : [];
  const {presence, loading, refetch} = useCourtPresence(courtIds);

  return {
    users: courtId ? presence[courtId]?.users || [] : [],
    count: courtId ? presence[courtId]?.count || 0 : 0,
    loading,
    refetch,
  };
}

// =============================================================================
// RECENT ACTIVITY HOOK
// =============================================================================

export interface RecentActivity {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  court_id: string;
  court_name: string;
  entered_at: string;
}

/**
 * Hook to get recent check-in activity for the activity ticker
 * @param limit - Max number of recent activities to fetch (default 20)
 */
export function useRecentActivity(limit: number = 20) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const {data, error} = await supabase
        .from('court_presence')
        .select(
          `
          id,
          user_id,
          court_id,
          entered_at,
          user:users (
            id,
            name,
            avatar_url
          ),
          court:courts (
            id,
            name
          )
        `,
        )
        .order('entered_at', {ascending: false})
        .limit(limit);

      if (error) throw error;

      if (data) {
        const mapped: RecentActivity[] = data
          .filter(row => row.user && row.court)
          .map(row => ({
            id: row.id,
            user_id: row.user_id,
            user_name: (row.user as any)?.name || null,
            user_avatar: (row.user as any)?.avatar_url || null,
            court_id: row.court_id,
            court_name: (row.court as any)?.name || 'Unknown Court',
            entered_at: row.entered_at,
          }));
        setActivities(mapped);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      await fetchRecentActivity();

      // Subscribe to realtime changes
      channel = supabase
        .channel('recent-activity-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'court_presence',
          },
          async () => {
            // Refetch on new check-ins
            await fetchRecentActivity();
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchRecentActivity]);

  return {activities, loading, refetch: fetchRecentActivity};
}
