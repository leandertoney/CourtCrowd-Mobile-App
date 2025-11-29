import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {appStyles, colors, fonts} from '../../utilities/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigation';
import {images} from '../../assets/images';
import {AppButton, FormInput} from '../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {AppleIcon, GoogleIcon} from '../../assets/svg';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {
  signInWithMagicLink,
  signInWithGoogle,
  signInWithApple,
  isAppleAuthAvailable,
} from '../../services/auth';
import Toast from 'react-native-toast-message';

type Props = NativeStackScreenProps<AuthStackParamList, 'LogIn'>;

const LogIn: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showApple, setShowApple] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    // Check if Apple auth is available (iOS only)
    if (Platform.OS === 'ios') {
      isAppleAuthAvailable().then(setShowApple);
    }
  }, []);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email required',
        text2: 'Please enter your email address',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid email',
        text2: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);
    try {
      const {error} = await signInWithMagicLink(email);
      if (error) throw error;

      setMagicLinkSent(true);
      Toast.show({
        type: 'success',
        text1: 'Check your email',
        text2: 'We sent you a magic link to sign in',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send magic link',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const {error} = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to sign in with Google',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const {error} = await signInWithApple();
      if (error) throw error;
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to sign in with Apple',
      });
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
      <ImageBackground
        source={images.backGround}
        style={{
          height: Dimensions.get('screen').height,
          paddingBottom: 10,
          paddingHorizontal: 20,
        }}>
        <Text style={[appStyles.title, styles.titleStyle]}>Welcome</Text>
        <Text style={appStyles.subTitle}>
          Sign in to find courts and connect with players near you.
        </Text>

        {magicLinkSent ? (
          <View style={styles.magicLinkSent}>
            <Text style={styles.magicLinkTitle}>Check your email</Text>
            <Text style={styles.magicLinkText}>
              We sent a magic link to {email}. Click the link in the email to
              sign in.
            </Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => setMagicLinkSent(false)}>
              <Text style={styles.resendText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FormInput
              title="Email Address"
              placeholder="e.g example@gmail.com"
              keyboardType="email-address"
              containerStyle={{marginTop: 30}}
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
            />

            <AppButton
              title="SEND MAGIC LINK"
              onPress={handleMagicLink}
              isLoading={loading}
              containerStyle={{marginTop: 20}}
            />

            <Text style={styles.divider}>OR</Text>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}>
                <GoogleIcon />
                <Text style={styles.socialButtonText}>
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {showApple && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleSignIn}
                  disabled={appleLoading}>
                  <AppleIcon />
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                    {appleLoading ? 'Signing in...' : 'Continue with Apple'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        <Text style={styles.termsText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  titleStyle: {
    paddingTop: hp('13%'),
  },
  contentContainer: {
    flexDirection: 'column',
  },
  divider: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.gray3,
    textAlign: 'center',
    marginVertical: 24,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
  },
  appleButton: {
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.white,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
  },
  appleButtonText: {
    color: colors.white,
  },
  magicLinkSent: {
    marginTop: 40,
    alignItems: 'center',
  },
  magicLinkTitle: {
    fontSize: 24,
    fontFamily: fonts.ReadexBold,
    color: colors.primary,
    marginBottom: 16,
  },
  magicLinkText: {
    fontSize: 16,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  resendButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  resendText: {
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
    color: colors.primary,
  },
  termsText: {
    fontSize: 12,
    fontFamily: fonts.ReadexRegular,
    color: colors.gray3,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
