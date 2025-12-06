import React from 'react';
import {StyleSheet, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import {formatETA, TripWithDetails} from '../../hooks/useCourtTrips';

// =============================================================================
// ICONS
// =============================================================================

const NavigationIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 20,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 11L22 2L13 21L11 13L3 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LocationIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const CloseIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// PULSING DOT
// =============================================================================

const PulsingDot: React.FC<{color: string}> = ({color}) => {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.8, {duration: 1500, easing: Easing.out(Easing.ease)}),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withTiming(0, {duration: 1500, easing: Easing.out(Easing.ease)}),
      -1,
      false,
    );
  }, [pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulseScale.value}],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.pulseContainer}>
      <Animated.View
        style={[styles.pulseRing, {backgroundColor: color}, pulseStyle]}
      />
      <View style={[styles.pulseDot, {backgroundColor: color}]} />
    </View>
  );
};

// =============================================================================
// ON MY WAY BUTTON
// =============================================================================

interface OnMyWayButtonProps {
  courtId: string;
  courtLat: number;
  courtLng: number;
  isHeadingHere: boolean;
  myTrip: TripWithDetails | null;
  starting: boolean;
  cancelling: boolean;
  onStartTrip: (courtId: string, lat: number, lng: number) => Promise<{success: boolean; error?: string}>;
  onCancelTrip: () => Promise<{success: boolean; error?: string}>;
}

const OnMyWayButton: React.FC<OnMyWayButtonProps> = ({
  courtId,
  courtLat,
  courtLng,
  isHeadingHere,
  myTrip,
  starting,
  cancelling,
  onStartTrip,
  onCancelTrip,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = async () => {
    if (isHeadingHere) {
      await onCancelTrip();
    } else {
      await onStartTrip(courtId, courtLat, courtLng);
    }
  };

  const isLoading = starting || cancelling;

  // Active trip to this court - show status
  if (isHeadingHere && myTrip) {
    return (
      <Animated.View
        style={[
          styles.activeContainer,
          {backgroundColor: colors.info, borderColor: `${colors.info}30`},
          animatedStyle,
        ]}>
        <View style={styles.activeContent}>
          {/* Pulsing indicator */}
          <PulsingDot color={colors.text.inverse} />

          {/* Status text */}
          <View style={styles.activeTextContainer}>
            <Text variant="button" style={{color: colors.text.inverse}}>
              On My Way
            </Text>
            <View style={styles.etaRow}>
              <LocationIcon color={colors.text.inverse} size={12} />
              <Text
                variant="caption"
                style={{color: colors.text.inverse, marginLeft: 4, opacity: 0.9}}>
                ETA: {formatETA(myTrip.estimated_arrival)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          onPress={onCancelTrip}
          disabled={cancelling}
          style={[styles.cancelButton, {backgroundColor: `${colors.text.inverse}20`}]}>
          {cancelling ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <CloseIcon color={colors.text.inverse} size={18} />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Default state - show "On My Way" button
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        activeOpacity={0.9}
        style={[
          styles.button,
          {backgroundColor: colors.info},
        ]}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.text.inverse} />
        ) : (
          <>
            <NavigationIcon color={colors.text.inverse} />
            <Text
              variant="button"
              style={{color: colors.text.inverse, marginLeft: spacing.sm}}>
              On My Way
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  activeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeTextContainer: {
    marginLeft: spacing.sm,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  pulseContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default OnMyWayButton;
