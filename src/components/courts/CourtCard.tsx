import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ViewStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius, shadows, animation} from '../../utilities/theme';
import Text from '../ui/Text';
import {AvatarStack} from '../ui/Avatar';
import Svg, {Path} from 'react-native-svg';
import {images} from '../../assets/images';
import {useCourtPhoto} from '../../hooks/useCourtPhotos';

// =============================================================================
// TYPES
// =============================================================================

interface CourtCardProps {
  court: {
    id: string;
    name: string;
    address?: string;
    distance?: number | null;
    photo_url?: string | null;
    google_place_id?: string | null;
    place_id?: string;
    lat?: number;
    lng?: number;
    photos?: {photo_reference: string}[];
    onlineUsers?: {id: string; name?: string; photo?: string}[];
  };
  variant?: 'default' | 'compact' | 'featured' | 'mini' | 'tall';
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
}

// =============================================================================
// ICONS
// =============================================================================

const HeartIcon: React.FC<{filled: boolean; color: string}> = ({filled, color}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationPinIcon: React.FC<{color: string; size?: number}> = ({color, size = 14}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UsersIcon: React.FC<{color: string; size?: number}> = ({color, size = 14}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// ANIMATED TOUCHABLE
// =============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// =============================================================================
// COURT CARD COMPONENT
// =============================================================================

const CourtCard: React.FC<CourtCardProps> = ({
  court,
  variant = 'default',
  onPress,
  onFavorite,
  isFavorite = false,
  style,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  // Use the photo caching hook - fetches from Google Places and caches in Supabase
  const {photoUrl: cachedPhotoUrl, loading: photoLoading} = useCourtPhoto(court);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, animation.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
  };

  // Get photo source - prioritize cached photo, then existing photo_url, then placeholder
  const getPhotoSource = (): ImageSourcePropType => {
    if (cachedPhotoUrl) return {uri: cachedPhotoUrl};
    if (court.photo_url) return {uri: court.photo_url};
    if (court.photos?.[0]?.photo_reference) return {uri: court.photos[0].photo_reference};
    // Use local placeholder when no photo is available
    return images.courtPlaceholder;
  };

  const photoSource = getPhotoSource();
  const hasUserPhoto = Boolean(court.photo_url || cachedPhotoUrl);

  // Get dimensions based on variant
  const getDimensions = () => {
    switch (variant) {
      case 'compact':
        return {width: 140, height: 180};
      case 'featured':
        return {width: '100%' as const, height: 200};
      case 'mini':
        return {width: 100, height: 100};
      case 'tall':
        return {width: 225, height: 360};
      default:
        return {width: 160, height: 200};
    }
  };

  const dimensions = getDimensions();
  const activeUsers = court.onlineUsers?.length || 0;

  // Mini variant (for Recently Visited quick access)
  if (variant === 'mini') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[animatedStyle, style]}>
        <View style={[styles.miniCard, {backgroundColor: colors.surface}]}>
          <ImageBackground
            source={photoSource}
            style={styles.miniImage}
            imageStyle={styles.miniImageStyle}>
            {activeUsers > 0 && (
              <View style={[styles.miniActiveBadge, {backgroundColor: colors.accent}]}>
                <Text variant="micro" color="inverse" style={{fontWeight: '600'}}>
                  {activeUsers}
                </Text>
              </View>
            )}
          </ImageBackground>
          <Text
            variant="caption"
            numberOfLines={1}
            style={styles.miniName}>
            {court.name}
          </Text>
        </View>
      </AnimatedTouchable>
    );
  }

  // Featured variant (full width hero card)
  if (variant === 'featured') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[styles.featuredCard, animatedStyle, style]}>
        <ImageBackground
          source={photoSource}
          style={styles.featuredImage}
          imageStyle={styles.featuredImageStyle}>
          <View style={styles.featuredOverlay} />
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeader}>
              {activeUsers > 0 && (
                <View style={[styles.liveBadge, {backgroundColor: colors.accent}]}>
                  <View style={[styles.liveDot, {backgroundColor: colors.text.inverse}]} />
                  <Text variant="caption" color="inverse" style={{fontWeight: '600'}}>
                    {activeUsers} playing now
                  </Text>
                </View>
              )}
              {onFavorite && (
                <TouchableOpacity
                  onPress={onFavorite}
                  style={[styles.favoriteButton, {backgroundColor: 'rgba(0,0,0,0.4)'}]}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <HeartIcon filled={isFavorite} color={isFavorite ? colors.accent : colors.text.primary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.featuredInfo}>
              <Text variant="h3" color="primary" style={styles.featuredName}>
                {court.name}
              </Text>
              <View style={styles.metaRow}>
                {court.distance != null && (
                  <View style={styles.metaItem}>
                    <LocationPinIcon color={colors.text.secondary} />
                    <Text variant="bodySmall" color="secondary">
                      {court.distance.toFixed(1)} mi
                    </Text>
                  </View>
                )}
              </View>
              {activeUsers > 0 && court.onlineUsers && (
                <View style={styles.avatarRow}>
                  <AvatarStack
                    users={court.onlineUsers.map(u => ({
                      name: u.name || 'Player',
                      imageUrl: u.photo,
                    }))}
                    size="sm"
                    max={4}
                  />
                </View>
              )}
            </View>
          </View>
        </ImageBackground>
      </AnimatedTouchable>
    );
  }

  // Tall variant (full-image with overlay text)
  if (variant === 'tall') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[
          styles.tallCard,
          {
            width: dimensions.width,
            height: dimensions.height,
          },
          shadows.md,
          animatedStyle,
          style,
        ]}>
        <ImageBackground
          source={photoSource}
          style={styles.tallImage}
          imageStyle={styles.tallImageStyle}>
          {/* Gradient overlay for text readability */}
          <View style={styles.tallGradient} />

          {/* Top section: badges */}
          <View style={styles.tallHeader}>
            {activeUsers > 0 && (
              <View style={[styles.activeBadge, {backgroundColor: colors.info}]}>
                <UsersIcon color={colors.text.inverse} size={12} />
                <Text variant="micro" color="inverse" style={{fontWeight: '600', marginLeft: 3}}>
                  {activeUsers}
                </Text>
              </View>
            )}
            {onFavorite && (
              <TouchableOpacity
                onPress={onFavorite}
                style={[styles.favoriteButton, {backgroundColor: 'rgba(0,0,0,0.4)'}]}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <HeartIcon filled={isFavorite} color={isFavorite ? colors.accent : '#fff'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom section: text overlay */}
          <View style={styles.tallContent}>
            <Text variant="bodySmall" numberOfLines={2} style={styles.tallName}>
              {court.name}
            </Text>
            {court.distance != null && (
              <View style={styles.tallMeta}>
                <LocationPinIcon color="rgba(255,255,255,0.9)" size={12} />
                <Text variant="caption" style={styles.tallDistance}>
                  {court.distance.toFixed(1)} mi
                </Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </AnimatedTouchable>
    );
  }

  // Default and Compact variants
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      style={[
        styles.card,
        {
          width: dimensions.width,
          backgroundColor: colors.surface,
        },
        shadows.md,
        animatedStyle,
        style,
      ]}>
      <ImageBackground
        source={photoSource}
        style={[styles.image, {height: dimensions.height - 70}]}
        imageStyle={styles.imageStyle}>
        <View style={styles.cardOverlay} />
        <View style={styles.cardHeader}>
          {activeUsers > 0 && (
            <View style={[styles.activeBadge, {backgroundColor: colors.accent}]}>
              <UsersIcon color={colors.text.inverse} size={12} />
              <Text variant="micro" color="inverse" style={{fontWeight: '600', marginLeft: 3}}>
                {activeUsers}
              </Text>
            </View>
          )}
          {onFavorite && (
            <TouchableOpacity
              onPress={onFavorite}
              style={[styles.favoriteButton, {backgroundColor: 'rgba(0,0,0,0.4)'}]}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <HeartIcon filled={isFavorite} color={isFavorite ? colors.accent : '#fff'} />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      <View style={styles.cardContent}>
        <Text variant="bodySmall" numberOfLines={1} style={styles.cardName}>
          {court.name}
        </Text>
        <View style={styles.cardMeta}>
          {court.distance != null && (
            <View style={styles.metaItem}>
              <LocationPinIcon color={colors.text.tertiary} size={12} />
              <Text variant="caption" color="tertiary">
                {court.distance.toFixed(1)} mi
              </Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Default Card
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  imageStyle: {
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  cardContent: {
    padding: spacing.sm,
  },
  cardName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  favoriteButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },

  // Featured Card
  featuredCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.md,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredImageStyle: {
    borderRadius: borderRadius.lg,
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: borderRadius.lg,
  },
  featuredContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredInfo: {
    gap: spacing.xs,
  },
  featuredName: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  avatarRow: {
    marginTop: spacing.xs,
  },

  // Mini Card
  miniCard: {
    width: 100,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  miniImage: {
    width: 100,
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 4,
  },
  miniImageStyle: {
    borderTopLeftRadius: borderRadius.sm,
    borderTopRightRadius: borderRadius.sm,
  },
  miniActiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  miniName: {
    padding: spacing.xs,
    fontWeight: '500',
  },

  // Tall Card (full-image with overlay)
  tallCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tallImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tallImageStyle: {
    borderRadius: borderRadius.md,
  },
  tallGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Create gradient effect using a positioned overlay
    borderRadius: borderRadius.md,
  },
  tallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.sm,
  },
  tallContent: {
    padding: spacing.sm,
    paddingTop: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  tallName: {
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
    marginBottom: 4,
  },
  tallMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tallDistance: {
    color: 'rgba(255,255,255,0.9)',
  },
});

export default CourtCard;
