import React, {useRef} from 'react';
import {Animated, StyleSheet, Text, View, I18nManager} from 'react-native';
import {RectButton, Swipeable} from 'react-native-gesture-handler';
import {DeleteIcon} from '../../assets/svg';

type AppleStyleSwipeableRowProps = {
  children: React.ReactNode;
  onSwipeableOpen?: (ref: React.RefObject<Swipeable>) => void;
};

const SwipeableWraper: React.FC<AppleStyleSwipeableRowProps> = ({
  children,
  onSwipeableOpen,
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<number>,
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    return (
      <Animated.View style={{flex: 1, transform: [{translateX: trans}]}}>
        <RectButton
          style={[
            styles.rightAction,
            {backgroundColor: '#F94949', borderRadius: 8},
          ]}
          onPress={closeSwipeable}>
          <DeleteIcon />
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
  ) => (
    <View
      style={{
        width: 120,
        height: 100,
        marginTop: 20,
      }}>
      {renderRightAction('More', '#C8C7CD', 192, progress)}
    </View>
  );

  const closeSwipeable = () => {
    swipeableRef.current?.close();
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={30}
      rightThreshold={40}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => {
        if (onSwipeableOpen) {
          onSwipeableOpen(swipeableRef);
        }
      }}>
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default SwipeableWraper;
