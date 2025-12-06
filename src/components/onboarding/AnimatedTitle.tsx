import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, fonts} from '../../utilities/theme';
import Text from '../ui/Text';

interface AnimatedTitleProps {
  title: string;
  subtitle?: string;
  delay?: number;
  centered?: boolean;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  title,
  subtitle,
  delay = 0,
  centered = false,
}) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(delay).springify()}
      style={centered && styles.centered}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text.primary,
            textShadowColor: colors.accent,
          },
          centered && styles.centeredText,
        ]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          variant="body"
          color="secondary"
          style={[styles.subtitle, centered && styles.centeredText]}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontFamily: fonts.GameDay,
    textShadowOffset: {width: 2, height: 1},
    textShadowRadius: 2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    lineHeight: 24,
  },
  centered: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
});

export default AnimatedTitle;
