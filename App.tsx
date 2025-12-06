import React, {useEffect, useState, useCallback} from 'react';
import Navigation from './src/navigation/Navigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, StyleSheet, LogBox, View, ActivityIndicator} from 'react-native';
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
import * as SplashScreen from 'expo-splash-screen';
import {registerPushToken} from './src/services/auth';

// Import Inter fonts
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Import Theme Provider
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {GeofencingProvider} from './src/contexts/GeofencingContext';
import {darkColors} from './src/utilities/theme';

// Keep splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

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

  // Load Inter fonts
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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

  // Hide splash screen when everything is ready
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && isReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  // Show loading state while fonts and session load
  if (!fontsLoaded || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkColors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <ThemeProvider>
          <GeofencingProvider autoStart={!!session} showAlerts={true}>
            <AppContent session={session} />
          </GeofencingProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

interface AppContentProps {
  session: Session | null;
}

const AppContent = ({session}: AppContentProps) => {
  const {colors, isDark} = useTheme();

  const toastConfig = {
    error: (props: BaseToastProps) => (
      <ErrorToast
        {...props}
        style={[
          styles.errorToastContainer,
          {backgroundColor: colors.surface},
        ]}
        text1Style={[styles.text1, {color: colors.text.primary}]}
        text2Style={[styles.text2, {color: colors.text.secondary}]}
      />
    ),
    success: (props: BaseToastProps) => (
      <SuccessToast
        {...props}
        style={[
          styles.successToastContainer,
          {backgroundColor: colors.surface},
        ]}
        text1Style={[styles.text1, {color: colors.text.primary}]}
        text2Style={[styles.text2, {color: colors.text.secondary}]}
      />
    ),
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <Navigation session={session} />
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkColors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: darkColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successToastContainer: {
    borderLeftColor: darkColors.success,
    marginHorizontal: 15,
    width: '88%',
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  errorToastContainer: {
    borderLeftColor: darkColors.error,
    marginHorizontal: 15,
    width: '88%',
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  text1: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  text2: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});

export default App;
