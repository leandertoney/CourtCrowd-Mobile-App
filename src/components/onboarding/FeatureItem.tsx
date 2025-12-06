import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';

interface FeatureItemProps {
  icon: string;
  title: string;
  isPremium?: boolean;
  index?: number;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  isPremium = false,
  index = 0,
}) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInUp.duration(300).delay(index * 80)}
      style={[styles.container, {borderBottomColor: colors.border}]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isPremium
              ? `${colors.accent}15`
              : colors.surfaceLight,
          },
        ]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text variant="bodyMedium">{title}</Text>
        {isPremium && (
          <View style={[styles.premiumBadge, {backgroundColor: `${colors.accent}15`}]}>
            <Text variant="caption" style={{color: colors.accent, fontWeight: '600'}}>
              Premium
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
});

export default FeatureItem;
