import React, {useEffect, useMemo, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useColors} from '../../../contexts/ThemeContext';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import Avatar, {AvatarStack} from '../../../components/ui/Avatar';
import {PremiumBadge} from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import {spacing, borderRadius} from '../../../utilities/theme';
import {supabase} from '../../../lib/supabase';
import {useFavorites} from '../../../hooks/useCourts';
import {useCourtPresence} from '../../../hooks/useCourtPresence';
import {useCourtMessages} from '../../../hooks/useCourtMessages';
import {useCourtTripsWithUser} from '../../../hooks/useCourtTrips';
import {useAppSelector} from '../../../store';
import OnMyWayButton from '../../../components/courts/OnMyWayButton';
import IncomingTrips from '../../../components/courts/IncomingTrips';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import CourtPhotoUpload, {CourtPhotoUploadRef} from '../../../components/courts/CourtPhotoUpload';
import PhotoPromptModal from '../../../components/courts/PhotoPromptModal';
import {images} from '../../../assets/images';
import {useCourtPhoto} from '../../../hooks/useCourtPhotos';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// =============================================================================
// TYPES
// =============================================================================

interface CourtUser {
  id: string;
  avatar_url: string | null;
  name: string | null;
  rating?: number;
}

// =============================================================================
// ICONS
// =============================================================================

const BackIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon: React.FC<{color: string; size?: number; filled?: boolean}> = ({
  color,
  size = 24,
  filled = false,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const NavigationIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11l19-9-9 19-2-8-8-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

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

const ChatIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
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

const SendIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon: React.FC<{color: string; size?: number}> = ({color, size = 16}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ShareIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={color} strokeWidth="2" />
  </Svg>
);

// =============================================================================
// MESSAGE BUBBLE COMPONENT
// =============================================================================

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    user?: {
      name?: string;
      avatar_url?: string;
    };
  };
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({message, isOwn}) => {
  const colors = useColors();

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
      {!isOwn && (
        <Avatar
          imageUrl={message.user?.avatar_url}
          name={message.user?.name}
          size="sm"
        />
      )}
      <View
        style={[
          styles.messageContent,
          {
            backgroundColor: isOwn ? colors.accent : colors.surfaceLight,
          },
          isOwn && styles.ownMessageContent,
        ]}>
        {!isOwn && (
          <Text variant="caption" style={{fontWeight: '600', marginBottom: 2}}>
            {message.user?.name || 'Anonymous'}
          </Text>
        )}
        <Text
          variant="bodySmall"
          style={{color: isOwn ? colors.text.inverse : colors.text.primary}}>
          {message.content}
        </Text>
        <Text
          variant="caption"
          style={{
            color: isOwn ? `${colors.text.inverse}80` : colors.text.tertiary,
            marginTop: 2,
          }}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
};

// =============================================================================
// COURT DETAILS SCREEN
// =============================================================================

const CourtDetails: React.FC = () => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const court = route.params?.court;
  const courtId = court?.id || court?.place_id;

  // Fetch court photo (uses caching - fetches from Google once, stores in Supabase)
  const {
    photoUrl: cachedPhoto,
    loading: photosLoading,
    fromCache,
  } = useCourtPhoto(court);

  const {toggleFavorite, isFavorite} = useFavorites();
  const {presence} = useCourtPresence(courtId);
  const presenceUsers = courtId ? presence[courtId]?.users || [] : [];
  const {messages, sendMessage, sending} = useCourtMessages(courtId);
  const currentUser = useAppSelector(state => state.auth.user);

  // Trip tracking hook
  const {
    trips: incomingTrips,
    tripsCount: incomingCount,
    tripsLoading,
    myTrip,
    isHeadingHere,
    starting: tripStarting,
    cancelling: tripCancelling,
    startTrip,
    cancelTrip,
  } = useCourtTripsWithUser(courtId, currentUser?.id || null);

  const [courtDetail, setCourtDetail] = useState(court);
  const [loading, setLoading] = useState(true);
  const [userPhotos, setUserPhotos] = useState<CourtUser[]>([]);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchCourtDetail();
  }, []);

  const fetchCourtDetail = async () => {
    try {
      const {data, error} = await supabase
        .from('courts')
        .select('*')
        .eq('id', courtId)
        .single();

      if (error) throw error;

      if (data) {
        setCourtDetail({
          ...court,
          ...data,
          description: data.description || court?.description,
        });
      }
    } catch (error) {
      console.error('Error fetching court details:', error);
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    const lat = courtDetail?.lat || courtDetail?.geometry?.location?.lat;
    const lng = courtDetail?.lng || courtDetail?.geometry?.location?.lng;
    const latLng = `${lat},${lng}`;
    const label = courtDetail?.name || 'Court Location';

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latLng}`,
      android: `geo:0,0?q=${latLng}(${label})`,
    });

    if (url) Linking.openURL(url);
  };

  // Photo source - prioritize: cached/user photo > local placeholder
  const photoSource: ImageSourcePropType = useMemo(() => {
    // 1. Cached photo (either user-uploaded or fetched from Google and stored)
    if (cachedPhoto) return {uri: cachedPhoto};
    // 2. Photo URL from court detail (in case it was set elsewhere)
    if (courtDetail?.photo_url) return {uri: courtDetail.photo_url};
    // 3. Existing photo reference in court data
    if (courtDetail?.photos?.[0]?.photo_reference) {
      return {uri: courtDetail.photos[0].photo_reference};
    }
    // 4. Use local placeholder
    return images.courtPlaceholder;
  }, [courtDetail, cachedPhoto]);

  const hasUserPhoto = Boolean(courtDetail?.photo_url);
  const hasAnyPhoto = hasUserPhoto || Boolean(cachedPhoto);

  // Handle photo upload success
  const handlePhotoUploaded = (newPhotoUrl: string) => {
    setCourtDetail((prev: any) => ({
      ...prev,
      photo_url: newPhotoUrl,
    }));
    setShowPhotoPrompt(false);
  };

  // Show photo prompt after loading for courts without photos
  useEffect(() => {
    // Don't show prompt if: still loading, has user photo, has google photo, or photos still loading
    if (!loading && !photosLoading && !hasAnyPhoto) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowPhotoPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, photosLoading, hasAnyPhoto]);

  // Reference to trigger photo upload from modal
  const photoUploadRef = React.useRef<CourtPhotoUploadRef>(null);

  const liveRating = useMemo(() => {
    const usersWithRating = presenceUsers.filter(u => u.rating);
    if (!usersWithRating.length) return courtDetail?.rating || 0;

    const total = usersWithRating.reduce((sum, user) => sum + (user.rating || 0), 0);
    return parseFloat((total / usersWithRating.length).toFixed(1));
  }, [presenceUsers, courtDetail]);

  // Load user photos from presence data
  useEffect(() => {
    const loadOnlineUsersPhotos = async () => {
      try {
        if (!presenceUsers.length) {
          setUserPhotos([]);
          return;
        }

        const userIds = presenceUsers.map(u => u.user_id);
        const {data, error} = await supabase
          .from('profiles')
          .select('id, avatar_url, name')
          .in('id', userIds);

        if (error) throw error;
        setUserPhotos(data || []);
      } catch (error) {
        console.error('Failed to fetch user photos:', error);
      }
    };

    loadOnlineUsersPhotos();
  }, [presenceUsers]);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim() || sending) return;
    await sendMessage(messageText.trim());
    setMessageText('');
  }, [messageText, sendMessage, sending]);

  const handleOpenFullChat = () => {
    navigation.navigate('ChatDetail', {groupId: courtId});
  };

  const recentMessages = useMemo(() => {
    return messages.slice(0, 5);
  }, [messages]);

  const isFav = isFavorite(courtId);

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}>
        {/* Hero Image */}
        <ImageBackground
          source={photoSource}
          style={styles.heroImage}
          resizeMode="cover">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}>
            {/* Header Buttons */}
            <View style={[styles.headerButtons, {paddingTop: insets.top + spacing.sm}]}>
              <TouchableOpacity
                style={[styles.headerButton, {backgroundColor: `${colors.background}CC`}]}
                onPress={() => navigation.goBack()}>
                <BackIcon color={colors.text.primary} />
              </TouchableOpacity>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={[styles.headerButton, {backgroundColor: `${colors.background}CC`}]}
                  onPress={() => {}}>
                  <ShareIcon color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.headerButton,
                    {backgroundColor: isFav ? colors.error : `${colors.background}CC`},
                  ]}
                  onPress={() => toggleFavorite(courtId)}>
                  <HeartIcon
                    color={isFav ? colors.text.inverse : colors.text.primary}
                    filled={isFav}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <View style={styles.ratingBadge}>
                <StarIcon color={colors.warning} size={14} />
                <Text variant="label" style={{marginLeft: 4}}>
                  {liveRating.toFixed(1)}
                </Text>
              </View>
              <Text variant="h2" style={styles.heroTitle}>
                {courtDetail?.name || 'Court'}
              </Text>
              {courtDetail?.address && (
                <View style={styles.addressRow}>
                  <LocationIcon color={colors.text.secondary} size={14} />
                  <Text variant="bodySmall" color="secondary" style={{marginLeft: 4}}>
                    {courtDetail.address}
                  </Text>
                </View>
              )}
            </View>

            {/* Photo Upload Button */}
            <CourtPhotoUpload
              ref={photoUploadRef}
              courtId={courtId}
              hasPhoto={hasUserPhoto}
              onPhotoUploaded={handlePhotoUploaded}
              variant="floating"
            />
          </LinearGradient>
        </ImageBackground>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, {backgroundColor: colors.accent}]}
            onPress={openMap}>
            <NavigationIcon color={colors.text.inverse} />
            <Text variant="label" style={{color: colors.text.inverse, marginLeft: spacing.xs}}>
              Directions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, {backgroundColor: colors.surfaceLight}]}
            onPress={handleOpenFullChat}>
            <ChatIcon color={colors.text.primary} />
            <Text variant="label" style={{marginLeft: spacing.xs}}>
              Chat
            </Text>
          </TouchableOpacity>
        </View>

        {/* On My Way Button */}
        <View style={styles.tripButtonContainer}>
          <OnMyWayButton
            courtId={courtId}
            courtLat={courtDetail?.lat || courtDetail?.geometry?.location?.lat || 0}
            courtLng={courtDetail?.lng || courtDetail?.geometry?.location?.lng || 0}
            isHeadingHere={isHeadingHere}
            myTrip={myTrip}
            starting={tripStarting}
            cancelling={tripCancelling}
            onStartTrip={startTrip}
            onCancelTrip={cancelTrip}
          />
        </View>

        {/* Active Players */}
        <Card variant="filled" padding="md" style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <UsersIcon color={colors.accent} size={20} />
              <Text variant="h4" style={{marginLeft: spacing.sm}}>
                Active Now
              </Text>
              <View style={[styles.liveBadge, {backgroundColor: `${colors.success}20`}]}>
                <View style={[styles.liveDot, {backgroundColor: colors.success}]} />
                <Text variant="caption" style={{color: colors.success, marginLeft: 4}}>
                  {presenceUsers.length} playing
                </Text>
              </View>
            </View>
            <PremiumBadge />
          </View>

          {userPhotos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playersRow}>
              {userPhotos.map(user => (
                <View key={user.id} style={styles.playerItem}>
                  <Avatar
                    imageUrl={user.avatar_url}
                    name={user.name || undefined}
                    size="lg"
                  />
                  <Text variant="caption" color="secondary" style={styles.playerName}>
                    {user.name?.split(' ')[0] || 'Player'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyPlayers}>
              <Text variant="body" color="tertiary">
                No players currently at this court
              </Text>
              <Text variant="bodySmall" color="tertiary" style={{marginTop: 4}}>
                Be the first to check in!
              </Text>
            </View>
          )}

          {/* Incoming Trips */}
          <IncomingTrips trips={incomingTrips} loading={tripsLoading} />
        </Card>

        {/* Live Rating */}
        <View style={styles.statsRow}>
          <Card variant="filled" padding="md" style={styles.statCard}>
            <Text variant="caption" color="tertiary">
              LIVE RATING
            </Text>
            <View style={styles.statValue}>
              <StarIcon color={colors.warning} size={24} />
              <Text variant="h2" style={{marginLeft: spacing.xs}}>
                {liveRating.toFixed(1)}
              </Text>
            </View>
            <Text variant="caption" color="secondary">
              Based on {presenceUsers.filter(u => u.rating).length || 0} active players
            </Text>
          </Card>
          <Card variant="filled" padding="md" style={styles.statCard}>
            <Text variant="caption" color="tertiary">
              DISTANCE
            </Text>
            <View style={styles.statValue}>
              <LocationIcon color={colors.accent} size={24} />
              <Text variant="h2" style={{marginLeft: spacing.xs}}>
                {court?.distance?.toFixed(1) || '0'}
              </Text>
              <Text variant="body" color="secondary" style={{marginLeft: 4}}>
                mi
              </Text>
            </View>
            <Text variant="caption" color="secondary">
              From your location
            </Text>
          </Card>
        </View>

        {/* Description */}
        {courtDetail?.description || courtDetail?.editorial_summary?.overview ? (
          <Card variant="filled" padding="md" style={styles.section}>
            <Text variant="h4" style={{marginBottom: spacing.sm}}>
              About
            </Text>
            <Text variant="body" color="secondary">
              {courtDetail?.description || courtDetail?.editorial_summary?.overview}
            </Text>
          </Card>
        ) : null}

        {/* Court Chat */}
        <Card variant="filled" padding="md" style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <ChatIcon color={colors.accent} size={20} />
              <Text variant="h4" style={{marginLeft: spacing.sm}}>
                Court Chat
              </Text>
            </View>
            <TouchableOpacity onPress={handleOpenFullChat}>
              <Text variant="label" style={{color: colors.accent}}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Messages */}
          {recentMessages.length > 0 ? (
            <View style={styles.messagesContainer}>
              {recentMessages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.user_id === currentUserId}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyChat}>
              <ChatIcon color={colors.text.tertiary} size={32} />
              <Text variant="body" color="tertiary" style={{marginTop: spacing.sm}}>
                No messages yet
              </Text>
              <Text variant="bodySmall" color="tertiary">
                Start the conversation!
              </Text>
            </View>
          )}

          {/* Quick Message Input */}
          <View style={[styles.messageInputContainer, {backgroundColor: colors.surfaceLight}]}>
            <TextInput
              style={[styles.messageInput, {color: colors.text.primary}]}
              placeholder="Send a message..."
              placeholderTextColor={colors.text.tertiary}
              value={messageText}
              onChangeText={setMessageText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              keyboardAppearance="dark"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {backgroundColor: messageText.trim() ? colors.accent : colors.surface},
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}>
              <SendIcon
                color={messageText.trim() ? colors.text.inverse : colors.text.tertiary}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Reviews Section */}
        {(courtDetail?.reviews?.length > 0 || courtDetail?.user_ratings_total > 0) && (
          <Card variant="filled" padding="md" style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h4">Reviews</Text>
              <Text variant="bodySmall" color="tertiary">
                {courtDetail?.user_ratings_total || 0} reviews
              </Text>
            </View>

            {courtDetail?.reviews?.slice(0, 3).map((review: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.reviewItem,
                  index < (courtDetail.reviews?.length || 0) - 1 && {
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                  },
                ]}>
                <View style={styles.reviewHeader}>
                  <Avatar
                    imageUrl={review.profile_photo_url}
                    name={review.author_name}
                    size="sm"
                  />
                  <View style={styles.reviewInfo}>
                    <Text variant="bodyMedium">{review.author_name}</Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          color={i < review.rating ? colors.warning : colors.surfaceLight}
                          size={12}
                        />
                      ))}
                      <Text variant="caption" color="tertiary" style={{marginLeft: 4}}>
                        {review.relative_time_description || 'Recently'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text variant="bodySmall" color="secondary" style={styles.reviewText}>
                  {review.text}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.sm,
          },
        ]}>
        <View>
          <Text variant="h3">
            {court?.distance?.toFixed(1) || '0'} mi
          </Text>
          <Text variant="caption" color="tertiary">
            {presenceUsers.length > 0
              ? `${presenceUsers.length} players active`
              : 'No players right now'}
          </Text>
        </View>
        <Button
          title="Get Directions"
          onPress={openMap}
          leftIcon={<NavigationIcon color={colors.text.inverse} size={18} />}
        />
      </View>

      {/* Photo Prompt Modal */}
      <PhotoPromptModal
        visible={showPhotoPrompt}
        onClose={() => setShowPhotoPrompt(false)}
        onAddPhoto={() => {
          setShowPhotoPrompt(false);
          // Trigger the image picker after a short delay for modal to close
          setTimeout(() => {
            photoUploadRef.current?.showImagePicker();
          }, 300);
        }}
        courtName={courtDetail?.name || 'This court'}
      />
    </KeyboardAvoidingView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  tripButtonContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  playersRow: {
    gap: spacing.md,
  },
  playerItem: {
    alignItems: 'center',
  },
  playerName: {
    marginTop: spacing.xs,
    maxWidth: 60,
    textAlign: 'center',
  },
  emptyPlayers: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  messagesContainer: {
    marginBottom: spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  ownMessageBubble: {
    flexDirection: 'row-reverse',
  },
  messageContent: {
    maxWidth: '75%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  ownMessageContent: {
    marginLeft: 0,
    marginRight: spacing.sm,
    borderBottomRightRadius: 4,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewItem: {
    paddingVertical: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewInfo: {
    marginLeft: spacing.sm,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  reviewText: {
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
});

export default CourtDetails;
