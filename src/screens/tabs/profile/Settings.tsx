import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {useColors, useTheme} from '../../../contexts/ThemeContext';
import Text from '../../../components/ui/Text';
import Card from '../../../components/ui/Card';
import {spacing} from '../../../utilities/theme';
import {useAppDispatch, useAppSelector} from '../../../store';
import {logout, updateUserAction} from '../../../store/slices/authSlice';
import {resetOnboarding} from '../../../store/slices/onboardingSlice';
import {LogoutModel} from '../../../models';
import Toast from 'react-native-toast-message';
import {supabase} from '../../../lib/supabase';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

// =============================================================================
// ICONS
// =============================================================================

const UserIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="5" stroke={color} strokeWidth="2" />
    <Path d="M20 21a8 8 0 10-16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LockIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0110 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const BellIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MessageIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SunIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
    <Path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const MoonIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RefreshIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 4v6h6M23 20v-6h-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path
      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path d="M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const LogoutIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M16 17l5-5-5-5M21 12H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrashIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ChevronRightIcon: React.FC<{color: string; size?: number}> = ({color, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18l6-6-6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// MENU ITEM COMPONENT
// =============================================================================

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  isLast?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  showChevron = true,
  rightElement,
  destructive = false,
  isLast = false,
}) => {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        !isLast && {borderBottomColor: colors.border, borderBottomWidth: 1},
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.menuIconContainer, {backgroundColor: colors.surfaceLight}]}>
        {icon}
      </View>
      <Text
        variant="body"
        style={[styles.menuLabel, destructive && {color: colors.error}]}>
        {label}
      </Text>
      {rightElement}
      {showChevron && !rightElement && (
        <ChevronRightIcon color={colors.text.tertiary} size={18} />
      )}
    </TouchableOpacity>
  );
};

// =============================================================================
// SETTINGS SCREEN
// =============================================================================

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Settings'
>;

const Settings: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const {isDark, toggleTheme} = useTheme();
  const insets = useSafeAreaInsets();
  const {user} = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();

  const [isLogOutModel, setLogOutModal] = useState(false);
  const [isDeleteModel, setDeleteModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const deleteAccount = async () => {
    try {
      setIsLoading(true);
      const {
        data: {user: currentUser},
      } = await supabase.auth.getUser();

      if (currentUser) {
        // Delete user's profile data
        await supabase.from('profiles').delete().eq('id', currentUser.id);

        // Delete user's favorites
        await supabase.from('favorites').delete().eq('user_id', currentUser.id);

        // Delete user's follows
        await supabase
          .from('follows')
          .delete()
          .or(
            `follower_id.eq.${currentUser.id},following_id.eq.${currentUser.id}`,
          );

        // Sign out
        await supabase.auth.signOut();

        setDeleteModel(false);
        dispatch(logout());

        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account data has been removed.',
        });
      }
    } catch (error: any) {
      console.log('Error deleting account', error);
      Toast.show({
        type: 'error',
        text1: 'Account Deletion Error',
        text2:
          error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileSetting = async (key: string, value: boolean) => {
    try {
      const {
        data: {user: currentUser},
      } = await supabase.auth.getUser();
      if (!currentUser) return;

      const {error} = await supabase
        .from('profiles')
        .update({[key]: value, updated_at: new Date().toISOString()})
        .eq('id', currentUser.id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  const onTogglePushNotification = async () => {
    const newValue = !user?.pushNotifications;
    const payload = {pushNotifications: newValue};

    dispatch(updateUserAction(payload));
    await updateProfileSetting('push_notifications', newValue);
  };

  const onToggleNotification = async () => {
    const newValue = !user?.notifications;
    const payload = {notifications: newValue};

    dispatch(updateUserAction(payload));
    await updateProfileSetting('notifications', newValue);
  };

  const onToggleMessaging = async () => {
    const newValue = !user?.messaging;
    const payload = {messaging: newValue};

    dispatch(updateUserAction(payload));
    await updateProfileSetting('messaging', newValue);
  };

  const handleRestartOnboarding = () => {
    Alert.alert(
      'Restart Onboarding',
      'This will take you through the onboarding flow again. Your account data will not be affected.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Restart',
          onPress: () => {
            dispatch(resetOnboarding());
            Toast.show({
              type: 'success',
              text1: 'Onboarding Reset',
              text2: 'The onboarding flow will start on your next app launch.',
            });
          },
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
            ACCOUNT
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon={<UserIcon color={colors.text.secondary} size={20} />}
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <MenuItem
              icon={<LockIcon color={colors.text.secondary} size={20} />}
              label="Change Password"
              onPress={() => navigation.navigate('ChangePassword')}
              isLast
            />
          </Card>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
            NOTIFICATIONS
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon={<BellIcon color={colors.text.secondary} size={20} />}
              label="Push Notifications"
              onPress={onTogglePushNotification}
              showChevron={false}
              rightElement={
                <Switch
                  value={user?.pushNotifications}
                  onValueChange={onTogglePushNotification}
                  trackColor={{false: colors.surfaceLight, true: colors.accent}}
                  thumbColor={colors.background}
                />
              }
            />
            <MenuItem
              icon={<BellIcon color={colors.text.secondary} size={20} />}
              label="In-App Notifications"
              onPress={onToggleNotification}
              showChevron={false}
              rightElement={
                <Switch
                  value={user?.notifications}
                  onValueChange={onToggleNotification}
                  trackColor={{false: colors.surfaceLight, true: colors.accent}}
                  thumbColor={colors.background}
                />
              }
            />
            <MenuItem
              icon={<MessageIcon color={colors.text.secondary} size={20} />}
              label="Direct Messages"
              onPress={onToggleMessaging}
              showChevron={false}
              rightElement={
                <Switch
                  value={user?.messaging}
                  onValueChange={onToggleMessaging}
                  trackColor={{false: colors.surfaceLight, true: colors.accent}}
                  thumbColor={colors.background}
                />
              }
              isLast
            />
          </Card>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
            PREFERENCES
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon={
                isDark ? (
                  <MoonIcon color={colors.text.secondary} size={20} />
                ) : (
                  <SunIcon color={colors.text.secondary} size={20} />
                )
              }
              label="Dark Mode"
              onPress={toggleTheme}
              showChevron={false}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{false: colors.surfaceLight, true: colors.accent}}
                  thumbColor={colors.background}
                />
              }
              isLast
            />
          </Card>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
            SUPPORT
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon={<HelpIcon color={colors.text.secondary} size={20} />}
              label="Help & Support"
              onPress={() => navigation.navigate('Help')}
            />
            <MenuItem
              icon={<RefreshIcon color={colors.text.secondary} size={20} />}
              label="Restart Onboarding"
              onPress={handleRestartOnboarding}
              isLast
            />
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text variant="caption" color="tertiary" style={styles.sectionTitle}>
            DANGER ZONE
          </Text>
          <Card variant="filled" padding="none">
            <MenuItem
              icon={<LogoutIcon color={colors.error} size={20} />}
              label="Log Out"
              onPress={() => setLogOutModal(true)}
              showChevron={false}
              destructive
            />
            <MenuItem
              icon={<TrashIcon color={colors.error} size={20} />}
              label="Delete Account"
              onPress={() => setDeleteModel(true)}
              showChevron={false}
              destructive
              isLast
            />
          </Card>
        </View>

        {/* App Version */}
        <Text variant="caption" color="tertiary" style={styles.versionText}>
          Court Crowd v1.0.0
        </Text>
      </ScrollView>

      {/* Modals */}
      <LogoutModel
        isVisible={isDeleteModel}
        onClose={() => setDeleteModel(false)}
        isDeleteAccount
        onPress={() => {
          deleteAccount();
        }}
        isloading={isLoading}
      />

      <LogoutModel
        isVisible={isLogOutModel}
        onClose={() => setLogOutModal(false)}
        isDeleteAccount={false}
        onPress={handleLogout}
      />
    </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
  },
  versionText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
});

export default Settings;
