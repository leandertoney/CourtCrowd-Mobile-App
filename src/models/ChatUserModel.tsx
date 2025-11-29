import React from 'react';
import {Text, StyleSheet, View, TouchableOpacity, Modal} from 'react-native';
import {colors, fonts} from '../utilities/theme';
import {BlockIcon, ReportIcon} from '../assets/svg';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onPressBlock?: () => void;
  onPressReport?: () => void;
}

const ChatUserModel: React.FC<Props> = ({
  isVisible,
  onPressBlock,
  onPressReport,
  onClose,
}) => {
  return (
    <View style={{justifyContent: 'flex-end'}}>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.containerRow}
              onPress={onPressBlock}>
              <BlockIcon />
              <Text style={styles.text}>Block User</Text>
            </TouchableOpacity>
            <View style={styles.lineStyle} />
            <TouchableOpacity
              style={styles.containerRow}
              onPress={onPressReport}>
              <ReportIcon />
              <Text style={styles.text}>Report User</Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    height: 130,
    paddingHorizontal: 20,
    backgroundColor: colors.blackLight,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 18,
  },
  lineStyle: {
    backgroundColor: colors.gray[100],
    height: 1,
    marginTop: 20,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
    color: colors.white,
  },
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
});

export default ChatUserModel;
