import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Text from '../ui/Text';
import {supabase} from '../../lib/supabase';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const CheckInIcon = ({color, size = 20}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const ClockIcon = ({color, size = 20}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon = ({color, size = 20}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrophyIcon = ({color, size = 20}: {color: string; size?: number}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 1012 0V2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// TYPES
// =============================================================================

interface ActivityItem {
  id: string;
  type: 'checkin' | 'playtime' | 'friends' | 'achievement';
  title: string;
  subtitle?: string;
  timestamp: Date;
  icon: 'checkin' | 'clock' | 'users' | 'trophy';
  accentColor?: string;
}

// =============================================================================
// ACTIVITY ITEM COMPONENT
// =============================================================================

interface ActivityItemRowProps {
  item: ActivityItem;
}

const ActivityItemRow: React.FC<ActivityItemRowProps> = ({item}) => {
  const colors = useColors();

  const renderIcon = () => {
    const iconColor = item.accentColor || colors.accent;
    switch (item.icon) {
      case 'checkin':
        return <CheckInIcon color={iconColor} />;
      case 'clock':
        return <ClockIcon color={iconColor} />;
      case 'users':
        return <UsersIcon color={iconColor} />;
      case 'trophy':
        return <TrophyIcon color={iconColor} />;
      default:
        return <CheckInIcon color={iconColor} />;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.activityRow}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: (item.accentColor || colors.accent) + '15'},
        ]}>
        {renderIcon()}
      </View>
      <View style={styles.activityContent}>
        <Text variant="body" style={{fontWeight: '500'}}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text variant="caption" color="tertiary">
            {item.subtitle}
          </Text>
        )}
      </View>
      <Text variant="caption" color="tertiary">
        {formatTimeAgo(item.timestamp)}
      </Text>
    </View>
  );
};

// =============================================================================
// RECENT ACTIVITY COMPONENT
// =============================================================================

interface RecentActivityProps {
  userId?: string;
  limit?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  limit = 5,
}) => {
  const colors = useColors();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current || !userId) {
      if (!userId) setLoading(false);
      return;
    }
    hasFetchedRef.current = true;

    const fetchRecentActivity = async () => {
      try {
        // Get recent check-ins
        const {data: checkins} = await supabase
          .from('court_presence')
          .select(`
            id,
            entered_at,
            exited_at,
            duration_minutes,
            courts (
              name
            )
          `)
          .eq('user_id', userId)
          .order('entered_at', {ascending: false})
          .limit(limit);

        // Get recent follow activity (new followers)
        const {data: newFollowers} = await supabase
          .from('follows')
          .select('created_at')
          .eq('following_id', userId)
          .order('created_at', {ascending: false})
          .limit(5);

        // Get user stats (may not exist)
        const {data: stats} = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        const activityItems: ActivityItem[] = [];

        // Add check-in activities
        checkins?.forEach((checkin: any) => {
          const courtName = checkin.courts?.name || 'Unknown Court';

          if (checkin.exited_at && checkin.duration_minutes) {
            // Completed session
            activityItems.push({
              id: `playtime-${checkin.id}`,
              type: 'playtime',
              title: `Played ${formatDuration(checkin.duration_minutes)}`,
              subtitle: courtName,
              timestamp: new Date(checkin.exited_at),
              icon: 'clock',
              accentColor: '#22C55E', // green
            });
          } else if (checkin.entered_at) {
            // Check-in
            activityItems.push({
              id: `checkin-${checkin.id}`,
              type: 'checkin',
              title: `Checked in`,
              subtitle: courtName,
              timestamp: new Date(checkin.entered_at),
              icon: 'checkin',
            });
          }
        });

        // Add follower milestone if applicable
        const followerCount = newFollowers?.length || 0;
        if (followerCount > 0 && newFollowers?.[0]) {
          activityItems.push({
            id: 'followers-milestone',
            type: 'friends',
            title: `Gained ${followerCount} new follower${followerCount > 1 ? 's' : ''}`,
            subtitle: 'This week',
            timestamp: new Date(newFollowers[0].created_at),
            icon: 'users',
            accentColor: '#3B82F6', // blue
          });
        }

        // Add achievement for milestones
        if (stats) {
          if (stats.total_checkins >= 10 && stats.total_checkins < 15) {
            activityItems.push({
              id: 'achievement-10',
              type: 'achievement',
              title: '🎉 10 Check-ins milestone!',
              subtitle: 'Keep it up!',
              timestamp: new Date(),
              icon: 'trophy',
              accentColor: '#FFD700',
            });
          } else if (stats.total_checkins >= 50 && stats.total_checkins < 55) {
            activityItems.push({
              id: 'achievement-50',
              type: 'achievement',
              title: '🏆 50 Check-ins achieved!',
              subtitle: 'You\'re a regular!',
              timestamp: new Date(),
              icon: 'trophy',
              accentColor: '#FFD700',
            });
          }
        }

        // Sort by timestamp and limit
        activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(activityItems.slice(0, limit));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [userId, limit]);

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.surface}]}>
        <View style={styles.header}>
          <Text variant="h4" style={{fontWeight: '600'}}>
            Recent Activity
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={[styles.container, {backgroundColor: colors.surface}]}>
        <View style={styles.header}>
          <Text variant="h4" style={{fontWeight: '600'}}>
            Recent Activity
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text variant="body" color="tertiary" style={styles.emptyText}>
            No recent activity yet
          </Text>
          <Text variant="caption" color="tertiary">
            Check in at a court to get started!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <View style={styles.header}>
        <Text variant="h4" style={{fontWeight: '600'}}>
          Recent Activity
        </Text>
      </View>
      <View style={styles.activityList}>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ActivityItemRow item={activity} />
            {index < activities.length - 1 && (
              <View style={[styles.separator, {backgroundColor: colors.border}]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    marginBottom: spacing.xs,
  },
  activityList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginLeft: 52,
  },
});

export default RecentActivity;
