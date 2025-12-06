import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {borderRadius, spacing, shadows, animation} from '../../utilities/theme';

// =============================================================================
// TYPES
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

interface ImageCardProps extends CardProps {
  imageSource: ImageSourcePropType;
  imageStyle?: ViewStyle;
  overlay?: boolean;
  overlayOpacity?: number;
}

// =============================================================================
// CARD COMPONENT
// =============================================================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

const Card: React.FC<CardProps> = ({
  children,
  variant = 'filled',
  onPress,
  padding = 'md',
  radius = 'sm',
  style,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, animation.spring);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animation.spring);
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.surface;
      case 'outlined':
        return 'transparent';
      case 'filled':
        return colors.surface;
      default:
        return colors.surface;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: colors.border,
      };
    }
    return {};
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const getRadius = () => {
    switch (radius) {
      case 'sm':
        return borderRadius.sm;
      case 'md':
        return borderRadius.md;
      case 'lg':
        return borderRadius.lg;
      default:
        return borderRadius.sm;
    }
  };

  const cardStyle = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderRadius: getRadius(),
      padding: getPadding(),
    },
    getBorderStyle(),
    variant === 'elevated' && shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[cardStyle, animatedStyle]}>
        {children}
      </AnimatedTouchable>
    );
  }

  return <AnimatedView style={[cardStyle, animatedStyle]}>{children}</AnimatedView>;
};

// =============================================================================
// IMAGE CARD COMPONENT
// =============================================================================

export const ImageCard: React.FC<ImageCardProps> = ({
  children,
  imageSource,
  imageStyle,
  overlay = true,
  overlayOpacity = 0.4,
  onPress,
  padding = 'md',
  radius = 'sm',
  style,
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, animation.spring);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, animation.spring);
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'md':
        return spacing.md;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  const getRadius = () => {
    switch (radius) {
      case 'sm':
        return borderRadius.sm;
      case 'md':
        return borderRadius.md;
      case 'lg':
        return borderRadius.lg;
      default:
        return borderRadius.sm;
    }
  };

  const content = (
    <ImageBackground
      source={imageSource}
      style={[styles.imageBackground, imageStyle]}
      imageStyle={{borderRadius: getRadius()}}>
      {overlay && (
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
              borderRadius: getRadius(),
            },
          ]}
        />
      )}
      <View style={[styles.imageContent, {padding: getPadding()}]}>
        {children}
      </View>
    </ImageBackground>
  );

  const cardStyle = [
    styles.imageCard,
    {borderRadius: getRadius()},
    shadows.md,
    style,
  ];

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
        style={[cardStyle, animatedStyle]}>
        {content}
      </AnimatedTouchable>
    );
  }

  return <AnimatedView style={[cardStyle, animatedStyle]}>{content}</AnimatedView>;
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageCard: {
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContent: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 1,
  },
});

export default Card;
