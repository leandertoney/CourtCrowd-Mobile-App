import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {colors} from '../../utilities/theme';

interface Props {
  message?: string;
  containerStyle?: ViewStyle;
}

const LoadingView: React.FC<Props> = ({
  message = 'Loading...',
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={'large'} color={colors.white} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default LoadingView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  text: {
    color: colors.white,
  },
});
