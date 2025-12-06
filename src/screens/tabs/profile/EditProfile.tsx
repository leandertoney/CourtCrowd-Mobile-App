import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {spacing} from '../../../utilities/theme';
import {useColors} from '../../../contexts/ThemeContext';
import {AddimgIcon} from '../../../assets/svg';
import {FormInput, MultilineInput} from '../../../components';
import Button from '../../../components/ui/Button';
import Text from '../../../components/ui/Text';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useAppDispatch, useAppSelector} from '../../../store';
import {showToast} from '../../../helper/toast';
import {IUser} from '../../../interfaces/IUser';
import {supabase} from '../../../lib/supabase';
import {updateUserAction} from '../../../store/slices/authSlice';
import {uploadImage} from '../../../services/storage';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'EditProfile'
>;

const EditProfile: React.FC<Props> = ({navigation}) => {
  const colors = useColors();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [profileImage, setProfileImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    nickName: Yup.string(),
    address: Yup.string(),
    Dupr: Yup.string().required('DUPR is required'),
    bio: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      nickName: user?.nickName || '',
      address: user?.address || '',
      Dupr: user?.dupr || '',
      bio: user?.bio || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      await handleSaveChanges({...values, dupr: Number(values.Dupr)});
    },
  });

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ----------------------------- # Save Changes # --------------------------------
  const handleSaveChanges = async (values: Partial<IUser>) => {
    setIsLoading(true);
    try {
      const {data: {user: currentUser}} = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      let photo;

      if (profileImage) {
        // Define the storage path using the user's ID
        const storagePath = `avatars/${currentUser.id}`;
        // Upload the image to Supabase Storage and retrieve its URL and path
        photo = await uploadImage(profileImage, storagePath);
      }

      // Prepare the payload with updated user information
      const payload: any = {
        name: values.name,
        nickname: values.nickName,
        address: values.address,
        dupr: values.dupr,
        bio: values.bio,
        updated_at: new Date().toISOString(),
      };

      // If a new photo was uploaded, include it in the payload
      if (photo) {
        payload.avatar_url = photo.url;
      }

      // Update profile in Supabase
      const {error} = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      dispatch(updateUserAction({
        ...values,
        photo: photo ? {url: photo.url, path: photo.path} : user?.photo,
      }));

      showToast('Profile updated successfully!', 'Success', 'success');
      setProfileImage('');
      formik.resetForm();

      navigation.goBack();
    } catch (error: any) {
      console.error('Error updating user details:', error);
      showToast(error.message || 'Could not update user details!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.contentContainer, {backgroundColor: colors.background}]}
    >
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={[styles.imgStyle, {alignSelf: 'center'}]}>
          <Image
            source={{
              uri:
                profileImage ||
                user?.photo?.url ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8fyCL_BuInOSRkT8XwQg0XWGjNQfgHQCXqA&s',
            }}
            style={styles.imgStyle}
          />
          <TouchableOpacity onPress={handleImagePicker}>
            <AddimgIcon style={styles.addImg} />
          </TouchableOpacity>
        </View>
        <FormInput
          title="Full Name"
          placeholder="e.g John Smith"
          containerStyle={{marginTop: 6}}
          onChangeText={formik.handleChange('name')}
          value={formik.values.name}
          onBlur={formik.handleBlur('name')}
          errorMessage={formik.touched.name && formik.errors.name}
        />
        <FormInput
          title="Nickname"
          placeholder="Enter your nick-name"
          onChangeText={formik.handleChange('nickName')}
          value={formik.values.nickName}
          onBlur={formik.handleBlur('nickName')}
          errorMessage={formik.touched.nickName && formik.errors.nickName}
        />
        <FormInput
          title="Email Address"
          placeholder={user?.email}
          editable={false}
        />
        <FormInput
          title="Hometown"
          placeholder="Enter your address"
          onChangeText={formik.handleChange('address')}
          value={formik.values.address}
          onBlur={formik.handleBlur('address')}
          errorMessage={formik.touched.address && formik.errors.address}
        />
        <FormInput
          title="DUPR"
          placeholder="Enter your depr/utr rating"
          keyboardType="number-pad"
          onChangeText={formik.handleChange('Dupr')}
          value={formik.values.Dupr.toString()}
          onBlur={formik.handleBlur('Dupr')}
          errorMessage={formik.touched.Dupr && formik.errors.Dupr}
        />
        <View>
          <Text variant="caption" color="tertiary" style={{marginTop: 4}}>
            Accurate ratings provides better player experience within the app
          </Text>
        </View>
        <MultilineInput
          title="Bio"
          placeholder="Enter to type your bio"
          multiline={true}
          numberOfLines={5}
          onChangeText={formik.handleChange('bio')}
          value={formik.values.bio}
          onBlur={formik.handleBlur('bio')}
          errorMessage={formik.touched.bio && formik.errors.bio}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="SAVE CHANGES"
          onPress={formik.handleSubmit}
          loading={isLoading}
          size="lg"
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  imgStyle: {width: 100, height: 100, borderRadius: 100},
  contentContainer: {
    flexDirection: 'column',
    flexGrow: 1,
  },
  addImg: {position: 'absolute', right: -20, bottom: -10},
  buttonContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
});

export default EditProfile;
