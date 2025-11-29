import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors} from '../../../utilities/theme';
import {AppButton, ToggleSwitchItem} from '../../../components';
import {useAppDispatch, useAppSelector} from '../../../store';
import {logout, updateUserAction} from '../../../store/slices/authSlice';
import {LogoutModel} from '../../../models';
import Toast from 'react-native-toast-message';
import {supabase} from '../../../lib/supabase';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Settings'
>;

const Settings: React.FC<Props> = ({navigation}) => {
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
      const {data: {user: currentUser}} = await supabase.auth.getUser();

      if (currentUser) {
        // Delete user's profile data
        await supabase
          .from('profiles')
          .delete()
          .eq('id', currentUser.id);

        // Delete user's favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id);

        // Delete user's follows
        await supabase
          .from('follows')
          .delete()
          .or(`follower_id.eq.${currentUser.id},following_id.eq.${currentUser.id}`);

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
        text2: error.message || 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileSetting = async (key: string, value: boolean) => {
    try {
      const {data: {user: currentUser}} = await supabase.auth.getUser();
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

  const onTogglePushNotifcation = async () => {
    const newValue = !user?.pushNotifications;
    const payload = {pushNotifications: newValue};

    dispatch(updateUserAction(payload));
    await updateProfileSetting('push_notifications', newValue);
  };

  const onToggleNotifcation = async () => {
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

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <ToggleSwitchItem
          title="Mobile Push Notifications"
          isSubTitle={true}
          isOn={user?.pushNotifications}
          onToggle={onTogglePushNotifcation}
          subTitle="Allows others to see your location only at specific courts within our
         app. To have a court location added to our app click here."
        />
        <ToggleSwitchItem
          onToggle={onToggleNotifcation}
          isOn={user?.notifications}
          title="Notifications"
        />
        <ToggleSwitchItem
          title="Messages"
          isSubTitle={true}
          isOn={user?.messaging}
          onToggle={onToggleMessaging}
          subTitle="Allows direct messages from other app users.
        Direct messages feature only available in PRO plan."
        />
        <AppButton
          customStyle={{marginTop: 64}}
          title="SAVE"
          onPress={() => navigation.goBack()}
        />
      </View>
      <TouchableOpacity
        onPress={() => setDeleteModel(true)}
        style={{alignSelf: 'center'}}>
        <Text style={{color: colors.red}}>Delete Account</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setLogOutModal(true)}
        style={{alignSelf: 'center', marginVertical: 24}}>
        <Text style={{color: colors.red}}>Logout</Text>
      </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 20,
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 20,
  },
});

export default Settings;
