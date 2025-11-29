import React, {useEffect, useState} from 'react';
import Navigation from './src/navigation/Navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, StyleSheet, LogBox} from 'react-native';
import {colors} from './src/utilities/theme';
import {Provider} from 'react-redux';
import {store} from './src/store';
import Toast, {
  BaseToastProps,
  ErrorToast,
  SuccessToast,
} from 'react-native-toast-message';
import {supabase} from './src/lib/supabase';
import {Session} from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import {registerPushToken} from './src/services/auth';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setIsReady(true);
    });

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);

      // Register push token when user signs in
      if (session?.user) {
        registerForPushNotifications(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const registerForPushNotifications = async (userId: string) => {
    try {
      const {status: existingStatus} =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      await registerPushToken(userId, token.data);
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar backgroundColor={colors.black} barStyle="light-content" />
      <Provider store={store}>
        <AppContent session={session} />
      </Provider>
    </GestureHandlerRootView>
  );
};

interface AppContentProps {
  session: Session | null;
}

const AppContent = ({session}: AppContentProps) => {
  const toastConfig = {
    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={[styles.errorToastContainer, {backgroundColor: colors.white}]}
        text1Style={[styles.text1, {color: colors.black}]}
        text2Style={[styles.text2, {color: colors.black}]}
      />
    ),
    success: (props: BaseToastProps) => (
      <SuccessToast
        {...props}
        style={[styles.successToastContainer, {backgroundColor: colors.white}]}
        text1Style={[styles.text1, {color: colors.black}]}
        text2Style={[styles.text2, {color: colors.black}]}
      />
    ),
  };

  return (
    <>
      <Navigation session={session} />
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  successToastContainer: {
    borderLeftColor: 'green',
    marginHorizontal: 15,
    width: '88%',
    borderLeftWidth: 9,
  },
  errorToastContainer: {
    borderLeftColor: colors.red,
    marginHorizontal: 15,
    width: '88%',
    borderLeftWidth: 9,
    backgroundColor: colors.red,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
  },
  text2: {
    fontSize: 13,
    fontWeight: '300',
  },
});

export default App;
