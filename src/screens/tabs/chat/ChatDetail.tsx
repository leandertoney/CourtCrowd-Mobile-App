import React, {useCallback, useEffect, useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Text,
  useWindowDimensions,
} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts, spacing} from '../../../utilities/theme';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
  Time,
} from 'react-native-gifted-chat';
import {
  CameraIcon,
  LinkIcon,
  MenuIcon,
  SendIcon,
} from '../../../assets/svg';
import {ChatItem} from '../../../components';
import {ChatUserModel} from '../../../models';
import {supabase} from '../../../lib/supabase';
import {useCourtMessages} from '../../../hooks/useCourtMessages';
import {useConversationMessages} from '../../../hooks/useDirectMessages';
import {useAppSelector} from '../../../store';
import * as ImagePicker from 'expo-image-picker';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'ChatDetail'
>;

const ChatDetail: React.FC<Props> = ({navigation, route}) => {
  const {groupId, conversationId, otherUser} = route.params as any;
  const user = useAppSelector(state => state.auth.user);
  const [isUserModel, setUserModal] = useState(false);
  const [imageLocalPath, setImageLocalPath] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const {width} = useWindowDimensions();

  // Determine if this is a DM or court chat
  const isDM = !!conversationId;

  // Use appropriate hook based on chat type
  const courtChat = useCourtMessages(isDM ? null : groupId);
  const dmChat = useConversationMessages(isDM ? conversationId : null);

  const {
    messages: rawMessages,
    sendMessage,
    sending,
  } = isDM
    ? {
        messages: dmChat.messages,
        sendMessage: dmChat.sendMessage,
        sending: dmChat.sending,
      }
    : {
        messages: courtChat.messages,
        sendMessage: courtChat.sendMessage,
        sending: courtChat.sending,
      };

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Convert messages to GiftedChat format
  const giftedMessages: IMessage[] = useMemo(() => {
    return rawMessages
      .map(msg => {
        if (isDM) {
          // DM message format
          const dmMsg = msg as any;
          return {
            _id: dmMsg.id,
            text: dmMsg.content,
            createdAt: new Date(dmMsg.created_at),
            user: {
              _id: dmMsg.sender_id,
              name: dmMsg.sender?.name || 'Anonymous',
              avatar:
                dmMsg.sender?.avatar_url ||
                'https://randomuser.me/api/portraits/men/72.jpg',
            },
          };
        } else {
          // Court message format
          const courtMsg = msg as any;
          return {
            _id: courtMsg.id,
            text: courtMsg.content,
            createdAt: new Date(courtMsg.created_at),
            user: {
              _id: courtMsg.user_id,
              name: courtMsg.user?.name || 'Anonymous',
              avatar:
                courtMsg.user?.avatar_url ||
                'https://randomuser.me/api/portraits/men/72.jpg',
            },
            image: courtMsg.image_url || undefined,
          };
        }
      })
      .reverse(); // GiftedChat expects newest first
  }, [rawMessages, isDM]);

  const onSendMessage = async (messages: IMessage[] = []) => {
    const [messageToSend] = messages;

    try {
      setImageUploading(true);
      setImageUploading(false);
      setImageLocalPath('');

      // Send message with content
      if (messageToSend.text) {
        const content = messageToSend.text;
        await sendMessage(content);
      }
    } catch (error) {
      setImageUploading(false);
      console.log('Error while sending message', error);
    }
  };

  const handleCameraImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageLocalPath(result.assets[0].uri);
    }
  };

  const handleGalleryImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageLocalPath(result.assets[0].uri);
    }
  };

  useEffect(() => {
    // Set header title for DM
    if (isDM && otherUser) {
      navigation.setOptions({
        headerTitle: otherUser.name || 'Chat',
      });
    }

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setUserModal(true)}>
          <MenuIcon />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isDM, otherUser]);

  const renderChatFooter = useCallback(() => {
    if (imageLocalPath) {
      return (
        <View style={styles.chatFooter}>
          <Image
            source={{uri: imageLocalPath || ''}}
            style={styles.chatHeaderImage}
          />
          {imageUploading ? (
            <Text style={styles.uploadingText}>{'Uploading...'}</Text>
          ) : null}
          <TouchableOpacity
            onPress={() => setImageLocalPath('')}
            style={styles.buttonFooterChatImg}>
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [imageLocalPath, imageUploading]);

  if (!currentUserId) {
    return (
      <View style={styles.container}>
        <SafeAreaView
          style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: colors.white}}>Loading...</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header - show different content for DM vs Court Chat */}
        {isDM && otherUser ? (
          <View style={styles.dmHeader}>
            {otherUser.avatar_url ? (
              <Image
                source={{uri: otherUser.avatar_url}}
                style={styles.dmAvatar}
              />
            ) : (
              <View style={styles.dmAvatarPlaceholder}>
                <Text style={styles.dmAvatarText}>
                  {(otherUser.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.dmHeaderText}>
              <Text style={styles.dmName}>{otherUser.name || 'User'}</Text>
              <Text style={styles.dmStatus}>Direct Message</Text>
            </View>
          </View>
        ) : (
          <ChatItem
            title="Court Chat"
            image="https://media.istockphoto.com/id/654106810/photo/man-playing-badminton.jpg?s=612x612&w=0&k=20&c=v1-sb6yaokafN99WmJRwboswcs6CtsK48KbU1FD24Bs="
            body="Group chat for this court"
            containerStyle={{
              marginTop: 0,
              backgroundColor: colors.black,
              paddingHorizontal: 20,
            }}
          />
        )}

        <GiftedChat
          inverted={giftedMessages.length !== 0}
          messages={giftedMessages}
          onSend={(messages: any) => onSendMessage(messages)}
          user={{
            _id: currentUserId,
            name: user?.name || 'Me',
            avatar:
              user?.photo?.url ||
              'https://randomuser.me/api/portraits/men/72.jpg',
          }}
          alwaysShowSend
          showUserAvatar={!isDM}
          renderAvatar={
            isDM
              ? () => null
              : props => {
                  return (
                    <Image
                      source={{
                        uri:
                          typeof props?.currentMessage?.user?.avatar ===
                          'string'
                            ? props.currentMessage.user.avatar
                            : 'https://randomuser.me/api/portraits/men/72.jpg',
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                      }}
                    />
                  );
                }
          }
          renderUsernameOnMessage={!isDM}
          showAvatarForEveryMessage={!isDM}
          renderAvatarOnTop={true}
          placeholder="Type a message ...."
          lightboxProps={{
            activeProps: {
              style: {
                flex: 1,
                resizeMode: 'contain',
                width: width,
              },
            },
          }}
          messagesContainerStyle={[
            {
              backgroundColor: 'black',
              marginBottom: 22,
              flex: 1,
              paddingHorizontal: 20,
            },
            giftedMessages.length === 0 && {transform: [{scaleY: -1}]},
          ]}
          textInputProps={{
            color: colors.white,
            multiline: false,
            keyboardAppearance: 'dark',
          }}
          renderBubble={props => {
            return (
              <Bubble
                {...props}
                textStyle={{
                  left: styles.leftTextStyle,
                  right: styles.rightTextStyle,
                }}
                wrapperStyle={{
                  right: styles.rightWrapperStyle,
                  left: styles.leftWrapperStyle,
                }}
              />
            );
          }}
          renderSend={props => {
            const trimmedText = props.text?.trim() ?? '';
            const hasText = trimmedText.length > 0;
            const hasImage = !!imageLocalPath;
            const isDisabled = (!hasText && !hasImage) || sending;

            return (
              <Send
                {...props}
                disabled={isDisabled}
                containerStyle={styles.containerStyle}>
                <TouchableOpacity
                  disabled={isDisabled}
                  onPress={() => {
                    if (props.onSend && !isDisabled) {
                      props.onSend({text: trimmedText}, true);
                    }
                  }}
                  hitSlop={4}
                  style={[styles.sendIcon, isDisabled && {opacity: 0.7}]}>
                  <SendIcon />
                </TouchableOpacity>
              </Send>
            );
          }}
          renderInputToolbar={props => (
            <InputToolbar
              {...props}
              containerStyle={[
                styles.inputToolbarContainer,
                {backgroundColor: 'transparent'},
              ]}
              primaryStyle={[]}
              renderAccessory={() => (
                <View style={styles.inputIcons}>
                  <TouchableOpacity onPress={handleCameraImage}>
                    <CameraIcon />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleGalleryImage}>
                    <LinkIcon />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          renderTime={props => (
            <Time
              {...props}
              timeTextStyle={{
                left: styles.timeLeftTextStyle,
                right: styles.timeRightTextStyle,
              }}
            />
          )}
          renderChatFooter={renderChatFooter}
        />
      </SafeAreaView>
      <ChatUserModel
        isVisible={isUserModel}
        onClose={() => setUserModal(false)}
        onPressBlock={() => setUserModal(false)}
        onPressReport={() => setUserModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.blackLight,
    flex: 1,
  },
  dmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  dmAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  dmAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dmAvatarText: {
    color: colors.black,
    fontSize: 20,
    fontFamily: fonts.ReadexSemiBold,
  },
  dmHeaderText: {
    flex: 1,
  },
  dmName: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.ReadexSemiBold,
  },
  dmStatus: {
    color: colors.gray[400],
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    marginTop: 2,
  },
  leftTextStyle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
  },
  rightTextStyle: {
    color: colors.black,
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
  },
  rightWrapperStyle: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
    marginBottom: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 4,
  },
  leftWrapperStyle: {
    backgroundColor: '#202020',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 0,
    marginBottom: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  timeLeftTextStyle: {
    color: colors.white,
    textAlign: 'left',
    position: 'absolute',
    top: 22,
    left: -30,
  },
  timeRightTextStyle: {
    color: colors.white,
    textAlign: 'right',
    position: 'absolute',
    top: 18,
    right: -18,
  },
  containerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputToolbarContainer: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    borderColor: colors.gray[100],
    borderRadius: 40,
    width: '77%',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 3,
    bottom: 10,
    marginHorizontal: 18,
  },
  inputIcons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    position: 'absolute',
    right: 60,
    gap: 30,
  },
  attachmentIcon: {
    right: 48,
  },
  sendIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 120,
    bottom: 2,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 100,
    width: 44,
    height: 44,
  },
  hitSlopButton: {
    left: 16,
    right: 16,
    bottom: 16,
    top: 16,
  },
  chatFooter: {
    flexDirection: 'row',
    marginBottom: 26,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[300],
  },
  buttonFooterChatImg: {
    backgroundColor: colors.gray[400],
    margin: 8,
    height: 32,
    width: 32,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textFooterChat: {
    color: colors.white,
  },
  chatHeaderImage: {
    height: 75,
    width: 75,
    borderRadius: 8,
    margin: 8,
  },
  uploadingText: {
    color: colors.white,
    alignSelf: 'center',
    fontSize: 18,
    fontFamily: fonts.ReadexSemiBold,
  },
});

export default ChatDetail;
