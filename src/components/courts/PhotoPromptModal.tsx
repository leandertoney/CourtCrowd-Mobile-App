import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import Button from '../ui/Button';

// =============================================================================
// TYPES
// =============================================================================

interface PhotoPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPhoto: () => void;
  courtName: string;
}

// =============================================================================
// ICONS
// =============================================================================

const CameraIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" />
  </Svg>
);

const CloseIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// COMPONENT
// =============================================================================

const PhotoPromptModal: React.FC<PhotoPromptModalProps> = ({
  visible,
  onClose,
  onAddPhoto,
  courtName,
}) => {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modal, {backgroundColor: colors.surface}]}>
              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeButton, {backgroundColor: colors.surfaceLight}]}
                onPress={onClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <CloseIcon color={colors.text.secondary} size={20} />
              </TouchableOpacity>

              {/* Icon */}
              <View style={[styles.iconContainer, {backgroundColor: `${colors.accent}15`}]}>
                <CameraIcon color={colors.accent} size={48} />
              </View>

              {/* Content */}
              <Text variant="h3" style={styles.title}>
                This court needs a photo!
              </Text>
              <Text
                variant="body"
                color="secondary"
                style={styles.description}>
                Help other pickleball players see what{' '}
                <Text variant="body" style={{fontWeight: '600'}}>
                  {courtName}
                </Text>{' '}
                looks like. Be the first to add a photo!
              </Text>

              {/* Benefits */}
              <View style={styles.benefits}>
                <View style={styles.benefitItem}>
                  <View style={[styles.checkmark, {backgroundColor: colors.success}]}>
                    <Text variant="caption" style={{color: '#fff'}}>
                      ✓
                    </Text>
                  </View>
                  <Text variant="bodySmall" color="secondary">
                    Help others find great courts
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={[styles.checkmark, {backgroundColor: colors.success}]}>
                    <Text variant="caption" style={{color: '#fff'}}>
                      ✓
                    </Text>
                  </View>
                  <Text variant="bodySmall" color="secondary">
                    Build the pickleball community
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Add Photo"
                  onPress={() => {
                    onClose();
                    onAddPhoto();
                  }}
                  style={{flex: 1}}
                />
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={onClose}>
                  <Text variant="label" color="tertiary">
                    Maybe Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  benefits: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  laterButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
});

export default PhotoPromptModal;
