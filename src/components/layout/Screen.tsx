import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ViewStyle,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useColors} from '../../contexts/ThemeContext';
import {screenPadding} from '../../utilities/theme';

// =============================================================================
// TYPES
// =============================================================================

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal';
  keyboardAvoiding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

// =============================================================================
// SCREEN COMPONENT
// =============================================================================

const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = true,
  safeArea = true,
  keyboardAvoiding = false,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
}) => {
  const colors = useColors();

  const getSafeAreaEdges = (): ('top' | 'bottom' | 'left' | 'right')[] => {
    if (safeArea === true) {
      return ['top', 'bottom', 'left', 'right'];
    }
    if (safeArea === 'top') {
      return ['top', 'left', 'right'];
    }
    if (safeArea === 'bottom') {
      return ['bottom', 'left', 'right'];
    }
    if (safeArea === 'horizontal') {
      return ['left', 'right'];
    }
    return [];
  };

  const containerStyle = [
    styles.container,
    {backgroundColor: colors.background},
    padding && styles.padding,
    style,
  ];

  const scrollContentStyle = [
    padding && styles.padding,
    styles.scrollContent,
    contentContainerStyle,
  ];

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
                colors={[colors.accent]}
              />
            ) : undefined
          }>
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.content, padding && styles.padding, style]}>
        {children}
      </View>
    );
  };

  const renderWithKeyboardAvoiding = (content: React.ReactNode) => {
    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}>
          {content}
        </KeyboardAvoidingView>
      );
    }
    return content;
  };

  const edges = getSafeAreaEdges();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      {safeArea ? (
        <SafeAreaView
          style={[styles.safeArea, {backgroundColor: colors.background}]}
          edges={edges}>
          {renderWithKeyboardAvoiding(renderContent())}
        </SafeAreaView>
      ) : (
        <View style={[styles.safeArea, {backgroundColor: colors.background}]}>
          {renderWithKeyboardAvoiding(renderContent())}
        </View>
      )}
    </>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: screenPadding.horizontal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: screenPadding.vertical,
  },
  keyboardAvoiding: {
    flex: 1,
  },
});

export default Screen;
