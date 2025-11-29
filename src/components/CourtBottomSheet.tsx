import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Court} from '../lib/supabase';
import {PresenceUser} from '../hooks/useCourtPresence';
import {useCourtMessages, MessageWithUser} from '../hooks/useCourtMessages';
import {useFavorites, useFollows} from '../hooks/useCourts';
import {colors} from '../utilities/theme';

interface CourtBottomSheetProps {
  court: Court | null;
  users: PresenceUser[];
  onClose: () => void;
}

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?background=CAFF00&color=000&bold=true&name=';

export function CourtBottomSheet({
  court,
  users,
  onClose,
}: CourtBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [messageInput, setMessageInput] = useState('');
  const snapPoints = useMemo(() => ['25%', '60%', '90%'], []);

  const {messages, loading: messagesLoading, sending, sendMessage} = useCourtMessages(
    court?.id || null,
  );
  const {isFavorite, toggleFavorite} = useFavorites();
  const {isFollowing, toggleFollow} = useFollows();

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim()) return;
    const {error} = await sendMessage(messageInput);
    if (!error) {
      setMessageInput('');
    }
  }, [messageInput, sendMessage]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  if (!court) return null;

  const renderMessage = ({item}: {item: MessageWithUser}) => (
    <View style={styles.messageContainer}>
      <Image
        source={{
          uri:
            item.user?.avatar_url ||
            `${DEFAULT_AVATAR}${encodeURIComponent(item.user?.name || '?')}`,
        }}
        style={styles.messageAvatar}
      />
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.messageName}>{item.user?.name || 'Anonymous'}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    </View>
  );

  const renderUser = ({item}: {item: PresenceUser}) => (
    <View style={styles.userItem}>
      <Image
        source={{
          uri:
            item.avatar_url ||
            `${DEFAULT_AVATAR}${encodeURIComponent(item.name || '?')}`,
        }}
        style={styles.userAvatar}
      />
      <Text style={styles.userName} numberOfLines={1}>
        {item.name || 'Anonymous'}
      </Text>
      <Pressable
        style={[
          styles.followButton,
          isFollowing(item.id) && styles.followingButton,
        ]}
        onPress={() => toggleFollow(item.id)}>
        <Text
          style={[
            styles.followButtonText,
            isFollowing(item.id) && styles.followingButtonText,
          ]}>
          {isFollowing(item.id) ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.courtName}>{court.name}</Text>
            <Text style={styles.courtAddress}>{court.address}</Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(court.id)}>
            <Text style={styles.favoriteIcon}>
              {isFavorite(court.id) ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>

        {/* Users at court */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>
            {users.length} {users.length === 1 ? 'person' : 'people'} here now
          </Text>
          {users.length > 0 && (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usersList}
            />
          )}
        </View>

        {/* Chat section */}
        <View style={styles.chatSection}>
          <Text style={styles.sectionTitle}>Court Chat</Text>
          <BottomSheetScrollView style={styles.messagesList}>
            {messages.map(msg => (
              <View key={msg.id}>{renderMessage({item: msg})}</View>
            ))}
            {messages.length === 0 && !messagesLoading && (
              <Text style={styles.emptyChat}>
                No messages yet. Start the conversation!
              </Text>
            )}
          </BottomSheetScrollView>
        </View>

        {/* Message input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            placeholderTextColor={colors.gray3}
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, sending && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={sending || !messageInput.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sheetBackground: {
    backgroundColor: colors.black2,
  },
  handleIndicator: {
    backgroundColor: colors.gray3,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  headerLeft: {
    flex: 1,
  },
  courtName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  courtAddress: {
    fontSize: 14,
    color: colors.gray3,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  usersSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray3,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  usersList: {
    gap: 12,
  },
  userItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  userName: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.black,
  },
  followingButtonText: {
    color: colors.primary,
  },
  chatSection: {
    flex: 1,
    paddingTop: 16,
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  messageTime: {
    fontSize: 12,
    color: colors.gray3,
  },
  messageText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  emptyChat: {
    textAlign: 'center',
    color: colors.gray3,
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray2,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.black,
    fontWeight: '600',
  },
});
