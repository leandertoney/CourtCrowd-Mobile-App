import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/OnboardingNavigation';
import {OnboardingScreen} from '../../components/onboarding';
import {useAppDispatch} from '../../store';
import {
  setPlayFrequency,
  PlayFrequency as PlayFrequencyType,
} from '../../store/slices/onboardingSlice';
import {spacing, borderRadius} from '../../utilities/theme';
import {useColors} from '../../contexts/ThemeContext';
import Text from '../../components/ui/Text';
import Animated, {FadeIn, FadeInUp} from 'react-native-reanimated';
import Svg, {Path, Circle} from 'react-native-svg';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PlayFrequency'>;

const CheckIcon: React.FC<{color: string}> = ({color}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const OPTIONS = [
  {label: 'Once a week', value: 'once_week'},
  {label: '2-3 times a week', value: '2_3_week'},
  {label: '4+ times a week', value: '4_plus_week'},
  {label: 'Just getting started', value: 'just_starting'},
];

const PlayFrequency: React.FC<Props> = ({navigation}) => {
  const dispatch = useAppDispatch();
  const colors = useColors();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    dispatch(setPlayFrequency(value as PlayFrequencyType));

    setTimeout(() => {
      navigation.navigate('BiggestStruggle');
    }, 300);
  };

  return (
    <OnboardingScreen>
      <View style={styles.container}>
        <Animated.View
          entering={FadeIn.duration(500).delay(200)}
          style={styles.header}>
          <Text variant="h2" style={styles.question}>
            How often do you play?
          </Text>
        </Animated.View>

        <View style={styles.optionsList}>
          {OPTIONS.map((option, index) => (
            <Animated.View
              key={option.value}
              entering={FadeInUp.duration(400).delay(300 + index * 80)}>
              <TouchableOpacity
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: selected === option.value ? colors.accent : colors.surfaceLight,
                    borderColor: selected === option.value ? colors.accent : colors.border,
                  },
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.8}>
                <Text
                  variant="body"
                  style={{
                    flex: 1,
                    color: selected === option.value ? colors.background : colors.text.primary,
                    fontWeight: selected === option.value ? '600' : '400',
                  }}>
                  {option.label}
                </Text>
                {selected === option.value && <CheckIcon color={colors.background} />}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(700)}
          style={styles.hint}>
          <Text variant="bodySmall" color="tertiary" style={styles.hintText}>
            This helps us personalize your experience
          </Text>
        </Animated.View>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  question: {
    textAlign: 'center',
  },
  optionsList: {
    gap: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  hint: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  hintText: {
    textAlign: 'center',
  },
});

export default PlayFrequency;
