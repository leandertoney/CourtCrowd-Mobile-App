import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import {SwipeableWraper, LoadingView, EmptyView} from '../../../components';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../../utilities/theme';
import Text from '../../../components/ui/Text';
import {
  useNotifications,
  AppNotification,
} from '../../../hooks/useNotifications';
import Svg, {Path, Circle} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const PersonIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <Path
      d="M20 21c0-3.314-3.582-6-8-6s-8 2.686-8 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const LocationIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const MessageIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BellIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getNotificationIcon = (
  type: string,
  color: string,
): React.ReactElement => {
  switch (type) {
    case 'friend_arrived':
    case 'friend_on_way':
      return <LocationIcon color={color} />;
    case 'new_follower':
      return <PersonIcon color={color} />;
    case 'new_message':
      return <MessageIcon color={color} />;
    default:
      return <BellIcon color={color} />;
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const groupNotificationsByDate = (
  notifications: AppNotification[],
): {title: string; data: AppNotification[]}[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  const groups: Record<string, AppNotification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      groups['Today'].push(notification);
    } else if (date.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(notification);
    } else if (date >= thisWeek) {
      groups['This Week'].push(notification);
    } else {
      groups['Earlier'].push(notification);
    }
  });

  return Object.entries(groups)
    .filter(([_, data]) => data.length > 0)
    .map(([title, data]) => ({title, data}));
};

// =============================================================================
// NOTIFICATION ITEM COMPONENT
// =============================================================================

interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const colors = useColors();
  const avatarUrl = notification.data?.user_avatar;

  return (
    <SwipeableWraper onSwipeableOpen={() => {}} onDelete={onDelete}>
      <RectButton
        style={[
          styles.notificationItem,
          {
            backgroundColor: notification.read
              ? colors.background
              : colors.surfaceLight,
          },
        ]}
        onPress={onPress}>
        <View style={styles.notificationContent}>
          {avatarUrl ? (
            <Image source={{uri: avatarUrl}} style={styles.avatar} />
          ) : (
            <View
              style={[styles.iconContainer, {backgroundColor: colors.accent}]}>
              {getNotificationIcon(notification.type, colors.background)}
            </View>
          )}

          <View style={styles.textContainer}>
            <Text
              variant="bodyLarge"
              style={{fontWeight: notification.read ? '400' : '600'}}>
              {notification.title}
            </Text>
            <Text variant="bodySmall" color="secondary" numberOfLines={2}>
              {notification.body}
            </Text>
            <Text variant="caption" color="tertiary" style={styles.time}>
              {formatTimeAgo(notification.created_at)}
            </Text>
          </View>

          {!notification.read && (
            <View style={[styles.unreadDot, {backgroundColor: colors.accent}]} />
          )}
        </View>
      </RectButton>
    </SwipeableWraper>
  );
};

// =============================================================================
// NOTIFICATION SCREEN
// =============================================================================

const Notification: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<any>();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      // Mark as read
      if (!notification.read) {
        markAsRead(notification.id);
      }

      // Navigate based on type
      switch (notification.type) {
        case 'friend_arrived':
        case 'friend_on_way':
          if (notification.data?.court_id) {
            navigation.navigate('CourtDetails', {
              court: {
                id: notification.data.court_id,
                place_id: notification.data.court_id,
                name: notification.data.court_name,
              },
            });
          }
          break;
        case 'new_follower':
          // Could navigate to user profile when that's implemented
          break;
        case 'new_message':
          if (notification.data?.court_id) {
            navigation.navigate('CourtDetails', {
              court: {
                id: notification.data.court_id,
                place_id: notification.data.court_id,
                name: notification.data.court_name,
              },
            });
          }
          break;
      }
    },
    [markAsRead, navigation],
  );

  const sections = groupNotificationsByDate(notifications);

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <LoadingView />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text variant="bodySmall" style={{color: colors.accent}}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <SectionList
        sections={sections}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onDelete={() => deleteNotification(item.id)}
          />
        )}
        renderSectionHeader={({section: {title}}) => (
          <Text variant="h4" style={styles.sectionTitle}>
            {title}
          </Text>
        )}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyView
            message="No notifications yet"
            subMessage="When friends arrive at courts or follow you, you'll see it here"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingBottom: 130,
  },
  sectionTitle: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  notificationItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  time: {
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
    marginTop: spacing.xs,
  },
});

export default Notification;
