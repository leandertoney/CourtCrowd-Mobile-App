import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import {colors, fonts} from '../../../utilities/theme';
import {Downarrow, Uparrow} from '../../../assets/svg';
import {SECTIONS_ARRAY} from '../../../constants/SectionArray';

interface Section {
  title: string;
  content: string;
  id: number;
}

const Help: React.FC = () => {
  const [activeSections, setActiveSections] = useState<number[]>([]);

  const renderHeader = (section: Section) => {
    return (
      <View
        style={[
          styles.textContainer,
          {
            borderBottomRightRadius:
              section.id === activeSections[0] + 1 ? 0 : 3,
            borderBottomLeftRadius:
              section.id === activeSections[0] + 1 ? 0 : 3,
          },
        ]}>
        <Text style={styles.header}>{section.title}</Text>

        {section.id === activeSections[0] + 1 ? <Uparrow /> : <Downarrow />}
      </View>
    );
  };

  const renderContent = (section: Section) => {
    return (
      <View style={styles.subContainer}>
        <Text style={styles.subText}>{section.content}</Text>
      </View>
    );
  };

  const updateSections = (activeSections: number[]) => {
    setActiveSections(activeSections);
  };

  return (
    <View style={styles.container}>
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
    backgroundColor: colors.black,
    paddingHorizontal: 20,
    flex: 1,
  },
  subContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    paddingBottom: 16,
  },
  subText: {
    color: colors.black,
    fontSize: 14,
    fontFamily: fonts.ReadexRegular,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginTop: 24,
    height: 72,
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopRightRadius: 3,
    borderTopLeftRadius: 3,
  },
  header: {
    fontSize: 16,
    fontFamily: fonts.ReadexMedium,
    color: colors.black,
  },
});
