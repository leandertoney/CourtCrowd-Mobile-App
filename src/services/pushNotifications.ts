import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import {supabase} from '../lib/supabase';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationData {
  type:
    | 'friend_arrived'
    | 'friend_on_way'
    | 'new_message'
    | 'new_follower'
    | 'court_activity';
  courtId?: string;
  courtName?: string;
  userId?: string;
  userName?: string;
  message?: string;
}

/**
 * Register for push notifications and save token to database
 */
export async function registerForPushNotifications(): Promise<string | null> {

  // Check/request permissions
  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get the Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '834c59e9-0902-4b29-ada0-5563830266f8', // From app.json
    });

    const token = tokenData.data;
    console.log('Push token:', token);

    // Save token to user profile
    await savePushToken(token);

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Save push token to user's profile in database
 */
async function savePushToken(token: string): Promise<void> {
  try {
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) return;

    const {error} = await supabase
      .from('users')
      .update({push_token: token})
      .eq('id', user.id);

    if (error) {
      console.error('Error saving push token:', error);
    }
  } catch (error) {
    console.error('Error in savePushToken:', error);
  }
}

/**
 * Remove push token (on logout)
 */
export async function removePushToken(): Promise<void> {
  try {
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('users').update({push_token: null}).eq('id', user.id);
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}

/**
 * Send a local notification (for testing or immediate alerts)
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: PushNotificationData,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as any,
      sound: true,
    },
    trigger: null, // Immediate
  });
}

/**
 * Set up notification listeners
 * Returns cleanup function
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (
    response: Notifications.NotificationResponse,
  ) => void,
): () => void {
  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    },
  );

  // Listener for when user taps on notification
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      onNotificationResponse?.(response);
    });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Get the last notification response (for when app opens from notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
  await setBadgeCount(0);
}

// Android-specific channel setup
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B82F6',
  });

  Notifications.setNotificationChannelAsync('court-activity', {
    name: 'Court Activity',
    description: 'Notifications about court activity and player arrivals',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B82F6',
  });

  Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    description: 'Chat messages and direct messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#3B82F6',
  });

  Notifications.setNotificationChannelAsync('social', {
    name: 'Social',
    description: 'New followers and friend activity',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}
