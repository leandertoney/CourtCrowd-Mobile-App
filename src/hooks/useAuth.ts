import {useState} from 'react';
import {supabase} from '../lib/supabase';
import {ICreateUser} from '../interfaces/IUser';
import Toast from 'react-native-toast-message';

const useAuth = (navigation: any) => {
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const signUpUser = async (values: ICreateUser) => {
    setSignUpLoading(true);
    try {
      // Sign up with Supabase Auth
      const {data: authData, error: authError} = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            skill_level: values.skill,
            play_hours: values.playHours,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile in users table
        const {error: profileError} = await supabase.from('users').upsert({
          id: authData.user.id,
          email: values.email,
          name: values.name,
          skill_level: values.skill,
          play_hours: values.playHours.toString(),
        });

        if (profileError) {
          console.warn('Profile creation error:', profileError);
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Account created',
        text2: 'You can now sign in with your credentials',
      });

      // Navigate to login after successful signup
      navigation.navigate('LogIn');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign up failed',
        text2: error.message || 'An error occurred during sign up',
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  const signInUser = async (email: string, password: string) => {
    setSignInLoading(true);
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
      });

      return {data, error: null};
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign in failed',
        text2: error.message || 'Invalid credentials',
      });
      return {data: null, error};
    } finally {
      setSignInLoading(false);
    }
  };

  const userForgotPassword = async (email: string, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'courtcrowd://auth/reset-password',
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Check your email',
        text2: 'We sent you a password reset link',
      });

      onSuccess?.();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send reset email',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpUser,
    signUpLoading,
    signInUser,
    signInLoading,
    userForgotPassword,
    loading,
  };
};

export default useAuth;
