import React, {useCallback} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../../utilities/theme';
import Text from '../../../components/ui/Text';
import {SearchBar, LoadingView, EmptyView} from '../../../components';
import {useConversations, Conversation} from '../../../hooks/useDirectMessages';
import Svg, {Path, Circle} from 'react-native-svg';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Chat'
>;

// =============================================================================
// ICONS
// =============================================================================

const MessageSquareIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 48,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
};

// =============================================================================
// CONVERSATION ITEM
// =============================================================================

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  currentUserId: string;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  currentUserId,
}) => {
  const colors = useColors();
  const {otherUser, lastMessage, unreadCount} = conversation;

  const messagePreview = lastMessage
    ? lastMessage.sender_id === currentUserId
      ? `You: ${lastMessage.content}`
      : lastMessage.content
    : 'No messages yet';

  return (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        unreadCount > 0 && {backgroundColor: colors.surfaceLight},
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      {otherUser.avatar_url ? (
        <Image source={{uri: otherUser.avatar_url}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, {backgroundColor: colors.accent}]}>
          <Text variant="h4" style={{color: colors.background}}>
            {(otherUser.name || 'U')[0].toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            variant="bodyLarge"
            style={{fontWeight: unreadCount > 0 ? '600' : '400'}}
            numberOfLines={1}>
            {otherUser.name || 'Unknown User'}
          </Text>
          {lastMessage && (
            <Text variant="caption" color="tertiary">
              {formatTimeAgo(lastMessage.created_at)}
            </Text>
          )}
        </View>

        <View style={styles.conversationPreview}>
          <Text
            variant="bodySmall"
            color={unreadCount > 0 ? 'primary' : 'secondary'}
            numberOfLines={1}
            style={{flex: 1, fontWeight: unreadCount > 0 ? '500' : '400'}}>
            {messagePreview}
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, {backgroundColor: colors.accent}]}>
              <Text variant="caption" style={{color: colors.background}}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// CHAT SCREEN
// =============================================================================

const Chat: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const {conversations, loading, refetch} = useConversations();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string>('');

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const {data} = await (await import('../../../lib/supabase')).supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter(
      conv =>
        conv.otherUser.name?.toLowerCase().includes(query) ||
        conv.lastMessage?.content.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      navigation.navigate('ChatDetail', {
        conversationId: conversation.id,
        otherUser: conversation.otherUser,
      });
    },
    [navigation],
  );

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <LoadingView />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <SearchBar
        placeholder="Search conversations"
        containerStyle={styles.searchContainer}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item)}
            currentUserId={currentUserId}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, {backgroundColor: colors.surfaceLight}]}>
              <MessageSquareIcon color={colors.text.tertiary} />
            </View>
            <Text variant="h4" color="secondary" style={styles.emptyTitle}>
              No conversations yet
            </Text>
            <Text variant="body" color="tertiary" style={styles.emptySubtitle}>
              Start a conversation by visiting a user's profile and tapping "Message"
            </Text>
          </View>
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
  searchContainer: {
    marginTop: 0,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: 130,
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});

export default Chat;
