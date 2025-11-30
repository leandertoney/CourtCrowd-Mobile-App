import React from 'react';
import {StyleSheet, Text, ImageBackground} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {appStyles} from '../../utilities/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigation';
import {images} from '../../assets/images';
import {AppButton, FormInput} from '../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import useAuth from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPassword: React.FC<Props> = ({navigation}) => {
  const {userForgotPassword, loading} = useAuth(navigation);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
    },

    validationSchema: validationSchema,

    onSubmit: values => {
      userForgotPassword(values.email, () => {
        navigation.goBack();
      });
    },
  });

  return (
    <ImageBackground
      source={images.backGround}
      style={{flex: 1, paddingBottom: 10}}>
      <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[appStyles.title, {paddingTop: hp('10%')}]}>
          Forgot Password
        </Text>
        <Text style={appStyles.subTitle}>
          Enter your registered email or phone number below we will send you a
          password reset link.
        </Text>
        <FormInput
          title="Email Address"
          placeholder="example@gmail.com"
          keyboardType="email-address"
          containerStyle={{marginTop: 12}}
          onChangeText={formik.handleChange('email')}
          value={formik.values.email}
          onBlur={formik.handleBlur('email')}
          errorMessage={formik.touched.email && formik.errors.email}
        />

        <AppButton
          title="RESET"
          onPress={formik.handleSubmit}
          customStyle={{marginTop: 32}}
          isLoading={loading}
        />
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 28,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
