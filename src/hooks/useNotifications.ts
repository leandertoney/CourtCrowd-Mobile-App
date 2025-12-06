import {useEffect, useState, useCallback, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {supabase} from '../lib/supabase';
import {RealtimeChannel} from '@supabase/supabase-js';
import {
  registerForPushNotifications,
  setupNotificationListeners,
  getLastNotificationResponse,
  setBadgeCount,
  clearAllNotifications,
  PushNotificationData,
} from '../services/pushNotifications';
import * as Notifications from 'expo-notifications';

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

/**
 * Hook to manage push notification registration
 */
export function usePushNotifications(
  onNotificationTap?: (data: PushNotificationData) => void,
) {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Register for push notifications
    const register = async () => {
      const token = await registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setIsRegistered(true);
      }
    };

    register();

    // Check if app was opened from a notification
    const checkInitialNotification = async () => {
      const response = await getLastNotificationResponse();
      if (response) {
        const data = response.notification.request.content
          .data as PushNotificationData;
        onNotificationTap?.(data);
      }
    };

    checkInitialNotification();

    // Set up notification listeners
    const cleanup = setupNotificationListeners(
      // On notification received (foreground)
      notification => {
        console.log('Foreground notification:', notification);
      },
      // On notification tapped
      response => {
        const data = response.notification.request.content
          .data as PushNotificationData;
        onNotificationTap?.(data);
      },
    );

    return cleanup;
  }, [onNotificationTap]);

  return {pushToken, isRegistered};
}

/**
 * Hook to manage in-app notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const {data, error} = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {ascending: false})
        .limit(50);

      if (error) throw error;

      const notifs = (data as AppNotification[]) || [];
      setNotifications(notifs);

      const unread = notifs.filter(n => !n.read).length;
      setUnreadCount(unread);
      setBadgeCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime notifications
  useEffect(() => {
    const subscribe = async () => {
      await fetchNotifications();

      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      // Subscribe to new notifications
      channelRef.current = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const newNotification = payload.new as AppNotification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            setBadgeCount(prev => prev + 1);
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const updated = payload.new as AppNotification;
            setNotifications(prev =>
              prev.map(n => (n.id === updated.id ? updated : n)),
            );
            // Recalculate unread count
            setNotifications(prev => {
              const unread = prev.filter(n => !n.read).length;
              setUnreadCount(unread);
              setBadgeCount(unread);
              return prev;
            });
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          payload => {
            const deleted = payload.old as AppNotification;
            setNotifications(prev => prev.filter(n => n.id !== deleted.id));
          },
        )
        .subscribe();
    };

    subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchNotifications]);

  // Refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        fetchNotifications();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const {error} = await supabase
        .from('notifications')
        .update({read: true})
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? {...n, read: true} : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      const {error} = await supabase
        .from('notifications')
        .update({read: true})
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
      setBadgeCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const {error} = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== notificationId);
        const unread = updated.filter(n => !n.read).length;
        setUnreadCount(unread);
        setBadgeCount(unread);
        return updated;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) return;

      const {error} = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
      clearAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
  };
}
