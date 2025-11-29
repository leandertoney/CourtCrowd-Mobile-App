import {useEffect, useState, useCallback} from 'react';
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
 */
export function useCourtPresence(courtIds: string[]) {
  const [presence, setPresence] = useState<Record<string, CourtPresenceData>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  const fetchPresence = useCallback(async () => {
    if (!courtIds.length) {
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
        .in('court_id', courtIds);

      if (error) throw error;

      // Group by court_id
      const grouped: Record<string, CourtPresenceData> = {};

      for (const courtId of courtIds) {
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
  }, [courtIds.join(',')]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    const subscribe = async () => {
      await fetchPresence();

      if (!courtIds.length) return;

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
            if (courtId && courtIds.includes(courtId)) {
              // Refetch to get updated data
              await fetchPresence();
            }
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
  }, [courtIds.join(','), fetchPresence]);

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
