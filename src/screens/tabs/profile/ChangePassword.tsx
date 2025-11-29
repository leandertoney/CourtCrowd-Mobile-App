import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {HomeStackParamsList} from '../../../navigation/HomeNavigation';
import {BottomTabParamlist} from '../../../navigation/BottomNavigation';
import {colors, fonts} from '../../../utilities/theme';
import {AppButton, FormInput} from '../../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {ChangePasswordModel} from '../../../models';
import {showToast} from '../../../helper/toast';
import {supabase} from '../../../lib/supabase';

type Props = NativeStackScreenProps<
  BottomTabParamlist & HomeStackParamsList,
  'ChangePassword'
>;

const ChangePassword: React.FC<Props> = ({navigation}) => {
  const [currentPasswod, setCurrentPassword] = useState(false);
  const [newPasswod, setNewPassword] = useState(false);
  const [confirmPasswod, setConfirmPassword] = useState(false);
  const [isChangePasswordModel, setChangePasswordModal] = useState(false);
  const [isloading, setLoading] = useState(false);

  const toggleCurrentPassword = () => setCurrentPassword(!currentPasswod);
  const toggleConfirmPassword = () => setConfirmPassword(!confirmPasswod);
  const toggleNewPassword = () => setNewPassword(!newPasswod);

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required('Current-Password is required'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('New-Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },

    validationSchema: validationSchema,

    onSubmit: async values => {
      const {newPassword} = values;
      await handleSaveChanges(newPassword);
    },
  });

  const handleSaveChanges = async (newPassword: string) => {
    setLoading(true);
    try {
      // Update password in Supabase
      const {error} = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setLoading(false);
      setChangePasswordModal(true);
    } catch (error: any) {
      setLoading(false);
      console.error('Error changing password:', error);

      if (error.message?.includes('weak')) {
        showToast('New password is too weak', 'error', 'error');
      } else if (error.message?.includes('same')) {
        showToast('New password must be different', 'error', 'error');
      } else {
        showToast(error.message || 'Something went wrong', 'error', 'error');
      }
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.container}>
        <Text style={styles.titleStyle}>Enter your old password</Text>
        <FormInput
          title="Current Password"
          placeholder="Enter your password"
          isPassword={true}
          onLeftIconPress={toggleCurrentPassword}
          secureTextEntry={!currentPasswod}
          onChangeText={formik.handleChange('currentPassword')}
          value={formik.values.currentPassword}
          onBlur={formik.handleBlur('currentPassword')}
          errorMessage={
            formik.touched.currentPassword && formik.errors.currentPassword
          }
        />
        <Text style={styles.titleStyle}>Set a new password</Text>

        <FormInput
          title="Password"
          placeholder="Enter your password"
          isPassword={true}
          onLeftIconPress={toggleNewPassword}
          secureTextEntry={!newPasswod}
          onChangeText={formik.handleChange('newPassword')}
          value={formik.values.newPassword}
          onBlur={formik.handleBlur('newPassword')}
          errorMessage={formik.touched.newPassword && formik.errors.newPassword}
        />
        <FormInput
          title="Confirm Password"
          placeholder="Re-Type Your Password"
          isPassword={true}
          onLeftIconPress={toggleConfirmPassword}
          secureTextEntry={!confirmPasswod}
          onChangeText={formik.handleChange('confirmPassword')}
          value={formik.values.confirmPassword}
          onBlur={formik.handleBlur('confirmPassword')}
          errorMessage={
            formik.touched.confirmPassword && formik.errors.confirmPassword
          }
        />
      </View>
      <AppButton
        title="CHANGE PASSWORD"
        customStyle={{marginBottom: 20, marginHorizontal: 20}}
        onPress={formik.handleSubmit}
        isLoading={isloading}
      />
      <ChangePasswordModel
        isVisible={isChangePasswordModel}
        onClose={() => setChangePasswordModal(false)}
        onPressButton={() => navigation.goBack()}
      />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 20,
  },
  titleStyle: {
    fontSize: 16,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
    marginTop: 20,
  },
  contentContainer: {
    flexDirection: 'column',
    flexGrow: 1,
    backgroundColor: colors.black,
  },
});

export default ChangePassword;
