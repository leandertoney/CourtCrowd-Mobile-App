import {useEffect, useState, useCallback, useRef} from 'react';
import {supabase} from '../lib/supabase';

export type LeaderboardPeriod = 'today' | 'week' | 'month' | 'all';
export type LeaderboardMetric = 'checkins' | 'playtime';

export interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  dupr: string | null;
  value: number;
  rank: number;
}

interface UseLeaderboardOptions {
  period?: LeaderboardPeriod;
  metric?: LeaderboardMetric;
  limit?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const {period = 'week', metric = 'checkins', limit = 10} = options;

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const tableExistsRef = useRef<boolean | null>(null);
  const isMountedRef = useRef(true);

  const fetchLeaderboard = useCallback(async () => {
    // If we already know the table doesn't exist, don't retry
    if (tableExistsRef.current === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determine which column to use based on period and metric
      let valueColumn: string;
      if (metric === 'checkins') {
        switch (period) {
          case 'today':
            valueColumn = 'checkins_today';
            break;
          case 'week':
            valueColumn = 'checkins_week';
            break;
          case 'month':
            valueColumn = 'checkins_month';
            break;
          default:
            valueColumn = 'total_checkins';
        }
      } else {
        switch (period) {
          case 'today':
            valueColumn = 'play_minutes_today';
            break;
          case 'week':
            valueColumn = 'play_minutes_week';
            break;
          case 'month':
            valueColumn = 'play_minutes_month';
            break;
          default:
            valueColumn = 'total_play_minutes';
        }
      }

      // Query user_stats joined with users
      const {data, error: queryError} = await supabase
        .from('user_stats')
        .select(
          `
          user_id,
          ${valueColumn},
          users!inner (
            name,
            nickname,
            avatar_url,
            dupr
          )
        `,
        )
        .gt(valueColumn, 0)
        .order(valueColumn, {ascending: false})
        .limit(limit);

      if (queryError) {
        // If user_stats table doesn't exist yet, mark it and return empty
        if (queryError.code === '42P01' || queryError.code === 'PGRST205') {
          tableExistsRef.current = false;
          if (isMountedRef.current) {
            setEntries([]);
            setLoading(false);
          }
          return;
        }
        throw queryError;
      }

      // Table exists
      tableExistsRef.current = true;

      // Transform data
      const leaderboardEntries: LeaderboardEntry[] = (data || []).map(
        (item: any, index: number) => ({
          user_id: item.user_id,
          name: item.users?.name || null,
          nickname: item.users?.nickname || null,
          avatar_url: item.users?.avatar_url || null,
          dupr: item.users?.dupr || null,
          value: item[valueColumn] || 0,
          rank: index + 1,
        }),
      );

      setEntries(leaderboardEntries);

      // Get current user's rank
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (user) {
        const userEntry = leaderboardEntries.find(e => e.user_id === user.id);
        if (userEntry) {
          setCurrentUserRank(userEntry.rank);
        } else {
          // User not in top N, get their actual rank
          const {count} = await supabase
            .from('user_stats')
            .select('*', {count: 'exact', head: true})
            .gt(valueColumn, 0);

          // For now, set to null if not in leaderboard
          setCurrentUserRank(null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load leaderboard');
        setEntries([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [period, metric, limit]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    fetchLeaderboard();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchLeaderboard]);

  // Subscribe to real-time updates only if table exists
  useEffect(() => {
    // Don't subscribe if we know the table doesn't exist
    if (tableExistsRef.current === false) {
      return;
    }

    const subscription = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'user_stats'},
        () => {
          // Only fetch if table exists
          if (tableExistsRef.current !== false) {
            fetchLeaderboard();
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    error,
    currentUserRank,
    refetch: fetchLeaderboard,
  };
}

// Helper to format play time
export function formatPlayTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}
