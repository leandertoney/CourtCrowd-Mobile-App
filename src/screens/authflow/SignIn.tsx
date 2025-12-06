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
import Svg, {Path, Circle} from 'react-native-svg';

type Props = NativeStackScreenProps<AuthStackParamList, 'LogIn'>;

// =============================================================================
// ICONS
// =============================================================================

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

// =============================================================================
// SIGN IN SCREEN
// =============================================================================

const SignIn: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signInUser, signInLoading} = useAuth(navigation);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    await signInUser(email, password);
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingTop: insets.top + spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Logo/Brand Section */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, {backgroundColor: colors.accent}]}>
            <Text variant="h1" style={{color: colors.text.inverse, fontSize: 32}}>
              CC
            </Text>
          </View>
          <DisplayTitle style={styles.title}>Welcome Back</DisplayTitle>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Sign in to find courts and connect with players near you.
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
            value={email}
            onChangeText={setEmail}
            leftIcon={<MailIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={setPassword}
            leftIcon={<LockIcon color={colors.text.tertiary} />}
            variant="outlined"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <Text variant="label" style={{color: colors.accent}}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSignIn}
            loading={signInLoading}
            disabled={signInLoading || !isFormValid}
            style={styles.signInButton}
            size="lg"
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
          <Text variant="caption" color="tertiary" style={styles.dividerText}>
            or continue with
          </Text>
          <View style={[styles.divider, {backgroundColor: colors.border}]} />
        </View>

        {/* Social Sign In */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, {backgroundColor: colors.surfaceLight}]}>
            <Text variant="label">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButton, {backgroundColor: colors.surfaceLight}]}>
            <Text variant="label">Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={[styles.signUpContainer, {paddingBottom: insets.bottom + spacing.lg}]}>
          <Text variant="body" color="secondary">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text variant="body" style={{color: colors.accent, fontWeight: '600'}}>
              Sign Up
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
});

export default SignIn;
