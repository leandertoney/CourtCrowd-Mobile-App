import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import {RecentActivity} from '../../hooks/useCourtPresence';
import Svg, {Path, Circle} from 'react-native-svg';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// =============================================================================
// ICONS
// =============================================================================

const ActivityIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 14,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// =============================================================================
// ACTIVITY ITEM
// =============================================================================

interface ActivityItemProps {
  activity: RecentActivity;
  onPress: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({activity, onPress}) => {
  const colors = useColors();

  const userName = activity.user_name || 'Someone';
  const timeAgo = getTimeAgo(activity.entered_at);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.activityItem, {backgroundColor: colors.surfaceLight}]}
      activeOpacity={0.7}>
      {/* Avatar */}
      {activity.user_avatar ? (
        <Image source={{uri: activity.user_avatar}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, {backgroundColor: colors.info}]}>
          <Text variant="micro" color="inverse" style={{fontWeight: '600'}}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Text */}
      <View style={styles.activityText}>
        <Text variant="caption" numberOfLines={1}>
          <Text variant="caption" style={{fontWeight: '600'}}>
            {userName}
          </Text>
          {' checked in at '}
          <Text variant="caption" style={{fontWeight: '600'}}>
            {activity.court_name}
          </Text>
        </Text>
      </View>

      {/* Time */}
      <View style={styles.timeContainer}>
        <Text variant="micro" color="tertiary">
          {timeAgo}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// ACTIVITY TICKER
// =============================================================================

interface ActivityTickerProps {
  activities: RecentActivity[];
  onActivityPress: (activity: RecentActivity) => void;
}

const ActivityTicker: React.FC<ActivityTickerProps> = ({
  activities,
  onActivityPress,
}) => {
  const colors = useColors();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);

  // Auto-scroll animation
  useEffect(() => {
    if (activities.length < 2) return;

    // Calculate total content width (approximate)
    const itemWidth = 280; // Approximate width of each item
    const totalWidth = activities.length * itemWidth;
    const scrollDistance = totalWidth - SCREEN_WIDTH + spacing.lg * 2;

    if (scrollDistance <= 0) return;

    // Create looping animation
    const animation = Animated.loop(
      Animated.sequence([
        // Scroll right
        Animated.timing(scrollX, {
          toValue: -scrollDistance,
          duration: activities.length * 4000, // 4 seconds per item
          useNativeDriver: true,
        }),
        // Pause at end
        Animated.delay(2000),
        // Reset to start (instant)
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        // Pause at start
        Animated.delay(2000),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [activities.length, scrollX]);

  if (activities.length === 0) {
    return (
      <View style={[styles.emptyContainer, {backgroundColor: colors.surface}]}>
        <ActivityIcon color={colors.text.tertiary} size={16} />
        <Text variant="caption" color="tertiary" style={{marginLeft: spacing.xs}}>
          No recent activity
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.liveDot, {backgroundColor: colors.info}]} />
        <Text variant="caption" color="secondary" style={{fontWeight: '500'}}>
          Live Activity
        </Text>
      </View>

      {/* Scrolling ticker */}
      <Animated.View
        style={[
          styles.tickerContainer,
          {transform: [{translateX: scrollX}]},
        ]}>
        {activities.map(activity => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onPress={() => onActivityPress(activity)}
          />
        ))}
      </Animated.View>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  tickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    marginLeft: spacing.xs,
    maxWidth: 200,
  },
  timeContainer: {
    marginLeft: spacing.xs,
    paddingLeft: spacing.xs,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
});

export default ActivityTicker;
