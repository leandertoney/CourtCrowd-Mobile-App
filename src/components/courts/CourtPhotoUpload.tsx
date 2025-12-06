import React, {useState, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, {Path, Circle} from 'react-native-svg';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import {uploadImage} from '../../services/storage';
import {supabase} from '../../lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

interface CourtPhotoUploadProps {
  courtId: string;
  hasPhoto: boolean;
  onPhotoUploaded?: (photoUrl: string) => void;
  variant?: 'button' | 'overlay' | 'floating';
}

export interface CourtPhotoUploadRef {
  showImagePicker: () => void;
}

// =============================================================================
// ICONS
// =============================================================================

const CameraIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
  </Svg>
);

const ImageIcon: React.FC<{color: string; size?: number}> = ({color, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
    <Path
      d="M21 15l-5-5L5 21"
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

const CourtPhotoUpload = forwardRef<CourtPhotoUploadRef, CourtPhotoUploadProps>(
  ({courtId, hasPhoto, onPhotoUploaded, variant = 'button'}, ref) => {
  const colors = useColors();
  const [uploading, setUploading] = useState(false);

  // Expose showImagePicker to parent via ref
  useImperativeHandle(ref, () => ({
    showImagePicker,
  }));

  const requestPermissions = async () => {
    const {status: cameraStatus} = await ImagePicker.requestCameraPermissionsAsync();
    const {status: libraryStatus} = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please enable camera and photo library access to add court photos.',
        [{text: 'OK'}],
      );
      return false;
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(
      hasPhoto ? 'Update Photo' : 'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImage('library'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      };

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        await uploadCourtPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const uploadCourtPhoto = async (localUri: string) => {
    setUploading(true);

    try {
      // Generate unique path for court photo
      const timestamp = Date.now();
      const storagePath = `court-photos/${courtId}/${timestamp}`;

      // Upload to Supabase Storage
      const {url} = await uploadImage(localUri, storagePath, 'media');

      // Update court record with new photo URL
      const {error: updateError} = await supabase
        .from('courts')
        .update({photo_url: url})
        .eq('id', courtId);

      if (updateError) throw updateError;

      // Notify parent of successful upload
      onPhotoUploaded?.(url);

      Alert.alert(
        'Photo Uploaded!',
        'Thanks for helping other players see this court!',
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error uploading court photo:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload photo. Please try again.',
        [{text: 'OK'}],
      );
    } finally {
      setUploading(false);
    }
  };

  // Floating button variant (for CourtDetails hero)
  if (variant === 'floating') {
    return (
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {backgroundColor: `${colors.background}CC`},
        ]}
        onPress={showImagePicker}
        disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color={colors.accent} size="small" />
        ) : (
          <>
            <CameraIcon color={colors.accent} size={20} />
            <Text variant="caption" style={{color: colors.accent, marginLeft: spacing.xs}}>
              {hasPhoto ? 'Update' : 'Add Photo'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  // Overlay variant (for cards without photos)
  if (variant === 'overlay') {
    if (hasPhoto) return null;

    return (
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.overlayButton, {backgroundColor: `${colors.accent}20`}]}
          onPress={showImagePicker}
          disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={colors.accent} size="small" />
          ) : (
            <>
              <CameraIcon color={colors.accent} size={24} />
              <Text variant="caption" style={{color: colors.accent, marginTop: spacing.xs}}>
                Add Photo
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Default button variant
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: hasPhoto ? colors.surfaceLight : colors.accent,
          borderColor: hasPhoto ? colors.border : 'transparent',
          borderWidth: hasPhoto ? 1 : 0,
        },
      ]}
      onPress={showImagePicker}
      disabled={uploading}>
      {uploading ? (
        <ActivityIndicator
          color={hasPhoto ? colors.accent : colors.text.inverse}
          size="small"
        />
      ) : (
        <>
          <CameraIcon
            color={hasPhoto ? colors.text.primary : colors.text.inverse}
            size={18}
          />
          <Text
            variant="label"
            style={{
              color: hasPhoto ? colors.text.primary : colors.text.inverse,
              marginLeft: spacing.sm,
            }}>
            {hasPhoto ? 'Update Photo' : 'Add Photo'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
});

export default CourtPhotoUpload;
