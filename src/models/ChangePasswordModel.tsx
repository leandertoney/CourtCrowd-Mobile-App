import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Modal} from 'react-native';
import {colors, fonts} from '../utilities/theme';
import {PasswordSuccessIcon} from '../assets/svg';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPressButton?: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({
  isVisible,
  onPressButton,
  onClose,
}) => {
  return (
    <View>
      <Modal
        visible={isVisible}
        animationType="fade"
        transparent
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <PasswordSuccessIcon />
            <Text style={styles.title}>Yaay</Text>
            <Text style={styles.subTitle}>
              Your Password Has been successfully Changed
            </Text>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={onPressButton}>
              <Text style={styles.buttonText}>Go Back Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: colors.blackLight,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  buttonContainer: {
    height: 56,
    width: 180,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
  },
  title: {
    fontSize: 24,
    marginTop: 45,
    fontFamily: fonts.ReadexRegular,
    color: '#53E88B',
  },
  subTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.ReadexRegular,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChangePasswordModal;
