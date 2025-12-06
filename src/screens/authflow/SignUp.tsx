import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text, {DisplayTitle} from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import {AuthStackParamList} from '../../navigation/AuthNavigation';
import useAuth from '../../hooks/useAuth';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {ICreateUser} from '../../interfaces/IUser';
import Svg, {Path, Circle} from 'react-native-svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

// =============================================================================
// ICONS
// =============================================================================

const UserIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="5" stroke={color} strokeWidth="2" />
    <Path d="M20 21a8 8 0 10-16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const MailIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LockIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const StarIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClockIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

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

// =============================================================================
// SIGN UP SCREEN
// =============================================================================

const SignUp: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {signUpUser, signUpLoading} = useAuth(navigation);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    skill: Yup.string().required('Skill level is required'),
    playHours: Yup.number()
      .min(0, 'Must be a positive number')
      .required('Play hours is required'),
  });

  const formik = useFormik<ICreateUser>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      skill: '',
      playHours: 0,
    },
    validationSchema,
    onSubmit: signUpUser,
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={[styles.backButton, {backgroundColor: colors.surfaceLight}]}
          onPress={() => navigation.goBack()}>
          <BackIcon color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Title Section */}
        <View style={styles.titleSection}>
          <DisplayTitle style={styles.title}>Create Account</DisplayTitle>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Join Court Crowd and find your next game
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <TextInput
            label="Full Name"
            placeholder="John Doe"
            autoCapitalize="words"
            autoComplete="name"
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            error={formik.touched.name && formik.errors.name}
            leftIcon={<UserIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email && formik.errors.email}
            leftIcon={<MailIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <TextInput
            label="Password"
            placeholder="Create a strong password"
            isPassword
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password && formik.errors.password}
            leftIcon={<LockIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <TextInput
            label="Confirm Password"
            placeholder="Repeat your password"
            isPassword
            value={formik.values.confirmPassword}
            onChangeText={formik.handleChange('confirmPassword')}
            onBlur={formik.handleBlur('confirmPassword')}
            error={formik.touched.confirmPassword && formik.errors.confirmPassword}
            leftIcon={<LockIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <TextInput
                label="Skill Level (1-10)"
                placeholder="5"
                keyboardType="numeric"
                value={formik.values.skill}
                onChangeText={formik.handleChange('skill')}
                onBlur={formik.handleBlur('skill')}
                error={formik.touched.skill && formik.errors.skill}
                leftIcon={<StarIcon color={colors.text.tertiary} />}
                variant="outlined"
              />
            </View>
            <View style={styles.halfInput}>
              <TextInput
                label="Hours/Week"
                placeholder="4"
                keyboardType="numeric"
                value={formik.values.playHours.toString() === '0' ? '' : formik.values.playHours.toString()}
                onChangeText={formik.handleChange('playHours')}
                onBlur={formik.handleBlur('playHours')}
                error={formik.touched.playHours && formik.errors.playHours}
                leftIcon={<ClockIcon color={colors.text.tertiary} />}
                variant="outlined"
              />
            </View>
          </View>

          <Button
            title="Create Account"
            onPress={formik.handleSubmit}
            loading={signUpLoading}
            disabled={signUpLoading}
            style={styles.signUpButton}
            size="lg"
          />
        </View>

        {/* Terms */}
        <Text variant="caption" color="tertiary" style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text variant="caption" style={{color: colors.accent}}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text variant="caption" style={{color: colors.accent}}>
            Privacy Policy
          </Text>
        </Text>

        {/* Sign In Link */}
        <View style={[styles.signInContainer, {paddingBottom: insets.bottom + spacing.lg}]}>
          <Text variant="body" color="secondary">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
            <Text variant="body" style={{color: colors.accent, fontWeight: '600'}}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    maxWidth: 280,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  termsText: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});

export default SignUp;
