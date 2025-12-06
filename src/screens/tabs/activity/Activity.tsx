import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '../../../contexts/ThemeContext';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import {PremiumBadge} from '../../../components/ui/Badge';
import Chip from '../../../components/ui/Chip';
import {spacing, borderRadius} from '../../../utilities/theme';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// TYPES
// =============================================================================

type ActivityTab = 'all' | 'notifications' | 'friends';

interface ActivityItem {
  id: string;
  type: 'smart' | 'friend' | 'system' | 'court' | 'premium';
  title: string;
  description: string;
  time: string;
  icon?: string;
  iconType?: 'players' | 'court' | 'star' | 'bell' | 'crown';
  avatar?: string | null;
  avatarName?: string;
  actionLabel?: string;
  actionType?: 'join' | 'view' | 'upgrade';
  courtId?: string;
}

// =============================================================================
// ICONS
// =============================================================================

const UsersIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const CourtIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const StarIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BellIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const CrownIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 7l4 4 6-6 6 6 4-4-2 14H4L2 7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// MOCK DATA
// =============================================================================

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'smart',
    title: 'Court needs a 4th player!',
    description: 'Central Park Courts is short one player for a doubles match',
    time: '2m ago',
    iconType: 'players',
    actionLabel: 'Join Game',
    actionType: 'join',
    courtId: '123',
  },
  {
    id: '2',
    type: 'friend',
    title: 'John checked in',
    description: 'Riverside Courts • 4 players active',
    time: '15m ago',
    avatar: null,
    avatarName: 'John Smith',
    actionLabel: 'View',
    actionType: 'view',
    courtId: '456',
  },
  {
    id: '3',
    type: 'system',
    title: 'New court discovered',
    description: 'Oak Street Recreation Center added to your area',
    time: '2h ago',
    iconType: 'court',
    actionLabel: 'View',
    actionType: 'view',
    courtId: '789',
  },
  {
    id: '4',
    type: 'friend',
    title: 'Sarah started a session',
    description: 'Downtown Sports Complex • 8 players active',
    time: '1h ago',
    avatar: null,
    avatarName: 'Sarah Johnson',
    actionLabel: 'View',
    actionType: 'view',
    courtId: '012',
  },
  {
    id: '5',
    type: 'smart',
    title: 'Perfect match found!',
    description: 'Players at your skill level are at Beacon Hill Courts',
    time: '30m ago',
    iconType: 'star',
    actionLabel: 'Check it out',
    actionType: 'view',
    courtId: '345',
  },
  {
    id: '6',
    type: 'premium',
    title: 'Unlock Friends Activity',
    description: 'See when your friends are playing and get smart notifications',
    time: '',
    iconType: 'crown',
    actionLabel: 'Upgrade',
    actionType: 'upgrade',
  },
  {
    id: '7',
    type: 'friend',
    title: 'Mike finished playing',
    description: 'Played 2 hours at Eastside Courts',
    time: '3h ago',
    avatar: null,
    avatarName: 'Mike Davis',
  },
];

// =============================================================================
// ACTIVITY SCREEN
// =============================================================================

const Activity: React.FC = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<ActivityTab>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const filterActivities = () => {
    if (activeTab === 'notifications') {
      return MOCK_ACTIVITIES.filter(a => a.type !== 'friend');
    }
    if (activeTab === 'friends') {
      return MOCK_ACTIVITIES.filter(a => a.type === 'friend' || a.type === 'premium');
    }
    return MOCK_ACTIVITIES;
  };

  const renderIcon = (item: ActivityItem) => {
    let IconComponent = BellIcon;
    let iconColor = colors.text.secondary;

    switch (item.iconType) {
      case 'players':
        IconComponent = UsersIcon;
        iconColor = colors.accent;
        break;
      case 'court':
        IconComponent = CourtIcon;
        iconColor = colors.info;
        break;
      case 'star':
        IconComponent = StarIcon;
        iconColor = colors.warning;
        break;
      case 'crown':
        IconComponent = CrownIcon;
        iconColor = colors.warning;
        break;
      default:
        IconComponent = BellIcon;
    }

    return <IconComponent color={iconColor} size={20} />;
  };

  const handleAction = (item: ActivityItem) => {
    if (item.actionType === 'upgrade') {
      // Navigate to premium/subscription screen
      return;
    }
    if (item.courtId) {
      // Navigate to court details
      navigation.navigate('CourtDetails', {courtId: item.courtId});
    }
  };

  const renderActivityItem = ({item}: {item: ActivityItem}) => {
    const isFriendActivity = item.type === 'friend';
    const isPremiumPromo = item.type === 'premium';

    if (isPremiumPromo) {
      return (
        <Card
          variant="outlined"
          padding="md"
          style={[
            styles.premiumCard,
            {
              borderColor: colors.warning,
              backgroundColor: `${colors.warning}10`,
            },
          ]}>
          <View style={styles.activityRow}>
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: `${colors.warning}20`},
              ]}>
              {renderIcon(item)}
            </View>

            <View style={styles.activityContent}>
              <Text variant="bodyMedium" style={{fontWeight: '600'}}>
                {item.title}
              </Text>
              <Text variant="bodySmall" color="secondary">
                {item.description}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.upgradeButton, {backgroundColor: colors.warning}]}
              onPress={() => handleAction(item)}>
              <Text variant="caption" style={{color: colors.text.inverse, fontWeight: '600'}}>
                {item.actionLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    }

    return (
      <Card
        variant="filled"
        padding="md"
        style={[styles.activityCard, {backgroundColor: colors.surface}]}>
        <View style={styles.activityRow}>
          {isFriendActivity ? (
            <Avatar name={item.avatarName} size="md" />
          ) : (
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: colors.surfaceLight},
              ]}>
              {renderIcon(item)}
            </View>
          )}

          <View style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <Text variant="bodyMedium" style={{fontWeight: '500'}}>
                {item.title}
              </Text>
              {isFriendActivity && <PremiumBadge style={styles.premiumBadge} />}
            </View>
            <Text variant="bodySmall" color="secondary" numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View style={styles.activityMeta}>
            {item.time && (
              <Text variant="caption" color="tertiary">
                {item.time}
              </Text>
            )}
            {item.actionLabel && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      item.type === 'smart' ? colors.accent : colors.surfaceLight,
                  },
                ]}
                onPress={() => handleAction(item)}>
                <Text
                  variant="caption"
                  style={{
                    color:
                      item.type === 'smart'
                        ? colors.text.inverse
                        : colors.text.primary,
                    fontWeight: '600',
                  }}>
                  {item.actionLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BellIcon color={colors.text.tertiary} size={48} />
      <Text variant="h4" color="secondary" style={styles.emptyTitle}>
        No activity yet
      </Text>
      <Text variant="body" color="tertiary" style={styles.emptySubtext}>
        {activeTab === 'friends'
          ? 'Follow players to see their activity'
          : 'Check back later for updates'}
      </Text>
    </View>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeaderContainer}>
      <Text variant="caption" color="tertiary" style={styles.sectionHeader}>
        TODAY
      </Text>
    </View>
  );

  const activities = filterActivities();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <Text variant="h1">Activity</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <Chip
          label="All"
          selected={activeTab === 'all'}
          onPress={() => setActiveTab('all')}
        />
        <Chip
          label="Notifications"
          selected={activeTab === 'notifications'}
          onPress={() => setActiveTab('notifications')}
        />
        <View style={styles.friendsChipContainer}>
          <Chip
            label="Friends"
            selected={activeTab === 'friends'}
            onPress={() => setActiveTab('friends')}
          />
          <PremiumBadge style={styles.chipBadge} />
        </View>
      </View>

      {/* Activity List */}
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          activities.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={activities.length > 0 ? renderSectionHeader : null}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  friendsChipContainer: {
    position: 'relative',
  },
  chipBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  emptyListContent: {
    flex: 1,
  },
  sectionHeaderContainer: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  activityCard: {
    marginBottom: 0,
  },
  premiumCard: {
    marginBottom: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  premiumBadge: {
    marginLeft: spacing.xs,
  },
  activityMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  upgradeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});

export default Activity;
