import React from 'react';
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
import {spacing} from '../../utilities/theme';
import Text, {DisplayTitle} from '../../components/ui/Text';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import {AuthStackParamList} from '../../navigation/AuthNavigation';
import useAuth from '../../hooks/useAuth';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Svg, {Path} from 'react-native-svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

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

const LockResetIcon: React.FC<{color: string; size?: number}> = ({color, size = 64}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M7 11V7a5 5 0 019.9-1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M12 15v2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

// =============================================================================
// FORGOT PASSWORD SCREEN
// =============================================================================

const ForgotPassword: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {userForgotPassword, loading} = useAuth(navigation);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: values => {
      userForgotPassword(values.email, () => {
        navigation.goBack();
      });
    },
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
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + spacing.lg}]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={[styles.iconCircle, {backgroundColor: `${colors.accent}20`}]}>
            <LockResetIcon color={colors.accent} />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <DisplayTitle style={styles.title}>Forgot Password?</DisplayTitle>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            No worries! Enter your registered email address and we'll send you a link to
            reset your password.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
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

          <Button
            title="Send Reset Link"
            onPress={formik.handleSubmit}
            loading={loading}
            disabled={loading || !formik.values.email.trim()}
            style={styles.resetButton}
            size="lg"
          />
        </View>

        {/* Back to Sign In */}
        <View style={styles.signInContainer}>
          <Text variant="body" color="secondary">
            Remember your password?{' '}
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
  illustrationContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});

export default ForgotPassword;
