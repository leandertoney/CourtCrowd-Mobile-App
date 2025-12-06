import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Text from '../ui/Text';
import {useAppSelector} from '../../store';

interface PersonalizedGreetingProps {
  style?: object;
}

const PersonalizedGreeting: React.FC<PersonalizedGreetingProps> = ({style}) => {
  const colors = useColors();
  const user = useAppSelector(state => state.auth.user);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => {
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  }, [user?.name]);

  return (
    <View style={[styles.container, style]}>
      <Text variant="body" color="secondary">
        {greeting}
      </Text>
      {firstName && (
        <Text variant="h3" style={{color: colors.text.primary}}>
          {firstName}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
});

export default PersonalizedGreeting;
