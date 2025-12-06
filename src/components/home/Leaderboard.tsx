import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import Card from '../ui/Card';
import {
  useLeaderboard,
  LeaderboardPeriod,
  LeaderboardMetric,
  LeaderboardEntry,
  formatPlayTime,
} from '../../hooks/useLeaderboard';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const TrophyIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M6 9v3a6 6 0 006 6v0a6 6 0 006-6V9M6 9h12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 18v4M8 22h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const FlameIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 23c6.075 0 11-4.925 11-11 0-4.418-2.594-8.216-6.335-10a.75.75 0 00-1.026.79c.247 1.702-.263 3.477-1.502 4.79C13.089 8.644 12 9.5 12 11c0-1.5-1.089-2.356-2.137-3.42C8.624 6.267 8.114 4.492 8.361 2.79a.75.75 0 00-1.026-.79C3.594 3.784 1 7.582 1 12c0 6.075 4.925 11 11 11z" />
  </Svg>
);

// =============================================================================
// PERIOD TOGGLE
// =============================================================================

interface PeriodToggleProps {
  selected: LeaderboardPeriod;
  onSelect: (period: LeaderboardPeriod) => void;
}

const PeriodToggle: React.FC<PeriodToggleProps> = ({selected, onSelect}) => {
  const colors = useColors();
  const periods: {value: LeaderboardPeriod; label: string}[] = [
    {value: 'today', label: 'Today'},
    {value: 'week', label: 'Week'},
    {value: 'all', label: 'All Time'},
  ];

  return (
    <View style={styles.periodToggle}>
      {periods.map(({value, label}) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.periodButton,
            {
              backgroundColor:
                selected === value ? colors.accent : colors.surfaceLight,
            },
          ]}
          onPress={() => onSelect(value)}>
          <Text
            variant="caption"
            style={{
              color: selected === value ? colors.background : colors.text.secondary,
              fontWeight: selected === value ? '600' : '400',
            }}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// =============================================================================
// METRIC TOGGLE
// =============================================================================

interface MetricToggleProps {
  selected: LeaderboardMetric;
  onSelect: (metric: LeaderboardMetric) => void;
}

const MetricToggle: React.FC<MetricToggleProps> = ({selected, onSelect}) => {
  const colors = useColors();

  return (
    <View style={styles.metricToggle}>
      <TouchableOpacity
        style={[
          styles.metricButton,
          selected === 'checkins' && {borderBottomColor: colors.accent},
        ]}
        onPress={() => onSelect('checkins')}>
        <Text
          variant="bodySmall"
          style={{
            color:
              selected === 'checkins'
                ? colors.accent
                : colors.text.tertiary,
            fontWeight: selected === 'checkins' ? '600' : '400',
          }}>
          Check-ins
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.metricButton,
          selected === 'playtime' && {borderBottomColor: colors.accent},
        ]}
        onPress={() => onSelect('playtime')}>
        <Text
          variant="bodySmall"
          style={{
            color:
              selected === 'playtime'
                ? colors.accent
                : colors.text.tertiary,
            fontWeight: selected === 'playtime' ? '600' : '400',
          }}>
          Play Time
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// =============================================================================
// LEADERBOARD ITEM
// =============================================================================

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  metric: LeaderboardMetric;
  onPress?: () => void;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  entry,
  metric,
  onPress,
}) => {
  const colors = useColors();
  const isTopThree = entry.rank <= 3;

  const getRankColor = () => {
    switch (entry.rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return colors.text.tertiary;
    }
  };

  const displayValue =
    metric === 'checkins'
      ? entry.value.toString()
      : formatPlayTime(entry.value);

  return (
    <TouchableOpacity
      style={styles.leaderboardItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        {isTopThree ? (
          <View
            style={[styles.rankBadge, {backgroundColor: `${getRankColor()}20`}]}>
            <Text
              variant="bodySmall"
              style={{color: getRankColor(), fontWeight: '700'}}>
              {entry.rank}
            </Text>
          </View>
        ) : (
          <Text variant="bodySmall" color="tertiary" style={{fontWeight: '500'}}>
            {entry.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      {entry.avatar_url ? (
        <Image source={{uri: entry.avatar_url}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, {backgroundColor: colors.surfaceLight}]}>
          <Text variant="bodySmall" color="secondary">
            {(entry.name || 'U')[0].toUpperCase()}
          </Text>
        </View>
      )}

      {/* Name & DUPR */}
      <View style={styles.nameContainer}>
        <Text variant="bodySmall" numberOfLines={1} style={{fontWeight: '500'}}>
          {entry.name || entry.nickname || 'Anonymous'}
        </Text>
        {entry.dupr && (
          <Text variant="caption" color="tertiary">
            DUPR {entry.dupr}
          </Text>
        )}
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        {entry.rank === 1 && <FlameIcon color={colors.warning} size={14} />}
        <Text
          variant="bodySmall"
          style={{
            color: isTopThree ? colors.accent : colors.text.primary,
            fontWeight: isTopThree ? '700' : '500',
          }}>
          {displayValue}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// LEADERBOARD COMPONENT
// =============================================================================

interface LeaderboardProps {
  style?: object;
  onUserPress?: (userId: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({style, onUserPress}) => {
  const colors = useColors();
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [metric, setMetric] = useState<LeaderboardMetric>('checkins');

  const {entries, loading, error} = useLeaderboard({
    period,
    metric,
    limit: 10,
  });

  return (
    <Card variant="filled" padding="md" style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TrophyIcon color={colors.warning} size={22} />
          <Text variant="h4" style={{marginLeft: spacing.sm}}>
            Leaderboard
          </Text>
        </View>
        <PeriodToggle selected={period} onSelect={setPeriod} />
      </View>

      {/* Metric Toggle */}
      <MetricToggle selected={metric} onSelect={setMetric} />

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text variant="bodySmall" color="tertiary">
            Loading...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodySmall" color="tertiary">
            Could not load leaderboard
          </Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TrophyIcon color={colors.text.tertiary} size={32} />
          <Text
            variant="bodySmall"
            color="tertiary"
            style={{marginTop: spacing.sm, textAlign: 'center'}}>
            No activity yet this {period === 'today' ? 'day' : period}
          </Text>
          <Text variant="caption" color="tertiary" style={{textAlign: 'center'}}>
            Be the first to check in!
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {entries.map(entry => (
            <LeaderboardItem
              key={entry.user_id}
              entry={entry}
              metric={metric}
              onPress={onUserPress ? () => onUserPress(entry.user_id) : undefined}
            />
          ))}
        </View>
      )}
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  metricToggle: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  metricButton: {
    paddingBottom: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  list: {
    gap: spacing.sm,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});

export default Leaderboard;
