import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {appStyles, colors} from '../../utilities/theme';
import {AuthStackParamList} from '../../navigation/AuthNavigation';
import {images} from '../../assets/images';
import {AppButton, FormInput} from '../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {useAppDispatch} from '../../store';
import useAuth from '../../hooks/useAuth';
import {ICreateUser} from '../../interfaces/IUser';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUp: React.FC<Props> = ({navigation}) => {
  const {signUpUser, signUpLoading} = useAuth(navigation);

  const dispatch = useAppDispatch();
  const [hidePasswod, setHidePassword] = useState(false);
  const [confirmPasswod, setConfirmPassword] = useState(false);

  const togglePassword = () => setHidePassword(!hidePasswod);
  const toggleConfirmPassword = () => setConfirmPassword(!confirmPasswod);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm-Password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    skill: Yup.string().required('Skill-Level is required'),
    playHours: Yup.number().required('Play-Hours is required'),
  });

  const formik = useFormik<ICreateUser>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      skill: '',
      playHours: 0,
    },

    validationSchema: validationSchema,

    onSubmit: signUpUser,
  });
  console.log('setSignUpoading-----', signUpLoading);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.contentContainer}>
      <ImageBackground
        source={images.backGround}
        style={{
          height: Dimensions.get('screen').height,
          paddingHorizontal: 20,
        }}>
        <View style={{flex: 1}}>
          <Text style={[appStyles.title, styles.titleStyle]}>Registration</Text>
          <Text style={appStyles.subTitle}>
            Please enter details to register
          </Text>
          <FormInput
            title="Name"
            placeholder="Enter Name"
            containerStyle={{marginTop: 6}}
            onChangeText={formik.handleChange('name')}
            value={formik.values.name}
            onBlur={formik.handleBlur('name')}
            errorMessage={formik.touched.name && formik.errors.name}
          />
          <FormInput
            title="Email Address"
            placeholder="e.g example@gmail.com"
            keyboardType="email-address"
            onChangeText={formik.handleChange('email')}
            value={formik.values.email}
            onBlur={formik.handleBlur('email')}
            errorMessage={formik.touched.email && formik.errors.email}
          />
          <FormInput
            title="Password"
            placeholder="Enter Password"
            isPassword={true}
            onLeftIconPress={togglePassword}
            secureTextEntry={!hidePasswod}
            onChangeText={formik.handleChange('password')}
            value={formik.values.password}
            onBlur={formik.handleBlur('password')}
            errorMessage={formik.touched.password && formik.errors.password}
          />
          <FormInput
            title="Repeat Password"
            placeholder="Confirm Password"
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
          <FormInput
            title="What is your skill level?"
            placeholder="Enter Skill level"
            keyboardType="numeric"
            onChangeText={formik.handleChange('skill')}
            value={formik.values.skill}
            onBlur={formik.handleBlur('skill')}
            errorMessage={formik.touched.skill && formik.errors.skill}
          />
          <FormInput
            title="How many hours do you usaully play pickleball?"
            placeholder="Enter Hours"
            keyboardType="numeric"
            onChangeText={formik.handleChange('playHours')}
            value={formik.values.playHours.toString()}
            onBlur={formik.handleBlur('playHours')}
            errorMessage={formik.touched.playHours && formik.errors.playHours}
          />

          <AppButton
            title="REGISTER"
            customStyle={{marginTop: hp('3%')}}
            onPress={formik.handleSubmit}
            isLoading={signUpLoading}
            disabled={signUpLoading}
          />
          <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
            <Text style={[appStyles.bottomText, {marginTop: hp('5%')}]}>
              Already have an account?
              <Text style={{color: colors.primary}}> LOGIN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'column',
    paddingBottom: 90,
    backgroundColor: colors.black,
  },
  titleStyle: {
    paddingTop: hp('5%'),
  },
});
