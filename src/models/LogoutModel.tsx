import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import {AppButton, FormInput} from '../components';
import {colors, fonts} from '../utilities/theme';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  isDeleteAccount?: boolean;
  onPress?: (password: string | undefined) => void;
  isloading?: boolean;
}

const LogoutModal: React.FC<Props> = ({
  isVisible,
  onClose,
  isDeleteAccount = false,
  onPress,
  isloading,
}) => {
  const [password, setPassword] = useState<string>('');

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handlePress = () => {
    if (onPress) {
      onPress(isDeleteAccount ? password : undefined);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      avoidKeyboard
      useNativeDriver
      hideModalContentWhileAnimating
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      style={styles.modal}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <Text style={styles.title}>
            {isDeleteAccount ? 'Delete Account' : 'Logout'}
          </Text>
          <Text style={styles.subTitle}>
            {isDeleteAccount
              ? 'Are you sure you want to delete your account?'
              : 'Are you sure you want to log out?'}
          </Text>

          {isDeleteAccount ? (
            <FormInput
              placeholder="Enter your password"
              style={{width: '100%', color: colors.white}}
              title="Password"
              titleStyle={{marginTop: 15}}
              secureTextEntry
              onChangeText={handlePasswordChange}
              value={password}
              containerStyle={{marginHorizontal: 26}}
            />
          ) : null}

          <View style={styles.buttonContainerRow}>
            <AppButton
              title="Cancel"
              customStyle={styles.cancelButton}
              titleStyle={{color: colors.white}}
              onPress={onClose}
            />

            <AppButton
              title={isDeleteAccount ? 'Delete' : 'Yes, Log out'}
              customStyle={{
                borderRadius: 100,
                backgroundColor: isDeleteAccount
                  ? password.length === 0
                    ? colors.gray[250]
                    : colors.red
                  : colors.primary,
                width: '40%',
              }}
              disabled={isDeleteAccount ? password.length === 0 : false}
              onPress={handlePress}
              isLoading={isloading}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blackLight,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  handle: {
    width: '14%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#35383F',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    marginTop: 14,
    fontFamily: fonts.ReadexSemiBold,
    color: '#F75555',
  },
  subTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.ReadexMedium,
    textAlign: 'center',
    paddingHorizontal: 50,
    marginTop: 8,
  },
  buttonContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#35383F',
    width: '40%',
    borderRadius: 100,
  },
});

export default LogoutModal;
