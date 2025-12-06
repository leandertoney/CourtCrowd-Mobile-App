import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import {useColors} from '../../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../../utilities/theme';
import Text from '../../../components/ui/Text';
import {Downarrow, Uparrow} from '../../../assets/svg';
import {SECTIONS_ARRAY} from '../../../constants/SectionArray';

interface Section {
  title: string;
  content: string;
  id: number;
}

const Help: React.FC = () => {
  const colors = useColors();
  const [activeSections, setActiveSections] = useState<number[]>([]);

  const renderHeader = (section: Section) => {
    return (
      <View
        style={[
          styles.textContainer,
          {
            backgroundColor: colors.accent,
            borderBottomRightRadius:
              section.id === activeSections[0] + 1 ? 0 : borderRadius.sm,
            borderBottomLeftRadius:
              section.id === activeSections[0] + 1 ? 0 : borderRadius.sm,
          },
        ]}>
        <Text variant="bodyLarge" style={{color: colors.background}}>
          {section.title}
        </Text>

        {section.id === activeSections[0] + 1 ? <Uparrow /> : <Downarrow />}
      </View>
    );
  };

  const renderContent = (section: Section) => {
    return (
      <View style={[styles.subContainer, {backgroundColor: colors.accent}]}>
        <Text variant="body" style={{color: colors.background}}>
          {section.content}
        </Text>
      </View>
    );
  };

  const updateSections = (activeSections: number[]) => {
    setActiveSections(activeSections);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Accordion
        sections={SECTIONS_ARRAY}
        activeSections={activeSections}
        renderHeader={renderHeader}
        renderContent={renderContent}
        onChange={updateSections}
        underlayColor="transparent"
      />
    </View>
  );
};

export default Help;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    flex: 1,
  },
  subContainer: {
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.sm,
    borderBottomRightRadius: borderRadius.sm,
    paddingBottom: spacing.md,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    height: 72,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderTopRightRadius: borderRadius.sm,
    borderTopLeftRadius: borderRadius.sm,
  },
});
