import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {ProfileItem} from '../../../components';
import {useAppDispatch, useAppSelector} from '../../../store';
import {logout} from '../../../store/slices/authSlice';
import {
  HelpIcon,
  LockIcon,
  ProfileIcon,
  RatingIcon,
  SearchIcon,
  SeatingIcon,
} from '../../../assets/svg';
import {LogoutModel} from '../../../models';
import Toast from 'react-native-toast-message';
import {supabase} from '../../../lib/supabase';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'Profile'
>;

const Profile: React.FC<Props> = ({navigation}) => {
  const user = useAppSelector(state => state.auth.user);

  const dispatch = useAppDispatch();
  const [isLogOutModel, setLogOutModal] = useState(false);
  const [isDeleteModel, setDeleteModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerIconsContainer}>
          <TouchableOpacity
            style={styles.headerIconButton}
            hitSlop={6}
            onPress={() => navigation.navigate('SearchPeople')}>
            <SearchIcon width={18} height={18} />
          </TouchableOpacity>
          <View style={styles.ratingContainer}>
            <RatingIcon />
            <Text style={styles.ratingText}>5.56</Text>
          </View>
        </View>
      ),
    });
  }, [navigation]);

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

  return (
    <View style={styles.container}>
      <ScrollView style={{paddingBottom: 0}}>
        <View style={styles.imgContainer}>
          <Image
            source={{
              uri:
                user?.photo?.url ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8fyCL_BuInOSRkT8XwQg0XWGjNQfgHQCXqA&s',
            }}
            style={styles.imgStyle}
          />
        </View>
        <Text style={styles.nameStyle}>{user?.name}</Text>
        <Text style={styles.surNameStyle}>
          {user?.nickName ? user.nickName : 'Enter your Nick Name'}
        </Text>
        <Text style={styles.surNameStyle}>
          {user?.address ? user.address : 'Enter your Address'}
        </Text>
        <Text style={styles.linkStyle}>www.externallinkhere.com</Text>
        <ProfileItem
          icon={<ProfileIcon />}
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          containerStyle={{marginTop: 40}}
        />
        <ProfileItem
          icon={<LockIcon />}
          title="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <ProfileItem
          icon={<SeatingIcon />}
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <ProfileItem
          icon={<HelpIcon />}
          title="Help & Support"
          onPress={() => navigation.navigate('Help')}
        />
      </ScrollView>
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

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: colors.black,
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 7,
  },
  headerIconButton: {
    marginRight: 12,
  },
  ratingContainer: {
    backgroundColor: colors.blackLight,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: fonts.ReadexMedium,
    color: colors.gray[50],
    marginLeft: 2,
  },
  imgContainer: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderColor: colors.primary,
    borderWidth: 2,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgStyle: {
    width: 94,
    height: 94,
    borderRadius: 100,
    borderColor: colors.white,
    borderWidth: 1,
  },
  surNameStyle: {
    fontSize: 11,
    fontFamily: fonts.ReadexRegular,
    color: '#7A7A7A',
    textAlign: 'center',
    marginTop: 1,
  },
  linkStyle: {
    fontSize: 12,
    fontFamily: fonts.ReadexRegular,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 1,
  },
  nameStyle: {
    fontSize: 16,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    marginTop: 10,
    textAlign: 'center',
  },
});
