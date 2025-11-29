import React, {useState} from 'react';
import {StyleSheet, View, SectionList, Text} from 'react-native';
import {RectButton} from 'react-native-gesture-handler';
import {NotificationItem, SwipeableWraper} from '../../../components';
import {colors, fonts} from '../../../utilities/theme';

type NotificationItemType = {
  title: string;
  image: string;
  subTitle: string;
  isActive: boolean;
  date: string;
};

const Row = ({item}: {item: NotificationItemType}) => (
  <RectButton style={styles.rectButton}>
    <NotificationItem
      title={item.title}
      image={item.image}
      suTitle={item.subTitle}
      isActive={item.isActive}
    />
  </RectButton>
);

const SwipeableRow = ({
  item,
  onSwipeableOpen,
}: {
  item: NotificationItemType;
  onSwipeableOpen: (ref: any) => void;
}) => (
  <SwipeableWraper onSwipeableOpen={onSwipeableOpen}>
    <Row item={item} />
  </SwipeableWraper>
);

// Notification Component
const Notification = () => {
  const [currentOpenRow, setCurrentOpenRow] = useState<any>(null);

  const handleSwipeableOpen = (rowRef: any) => {
    if (currentOpenRow && currentOpenRow.current !== rowRef.current) {
      currentOpenRow.current.close();
    }
    setCurrentOpenRow(rowRef);
  };
  const NOTIFICATION_SECTIONS = [
    {
      title: 'Today',
      data: NOTIFICATION_ARRAY.filter(item => item.date === 'today'),
    },
    {
      title: 'May 4th,2023',
      data: NOTIFICATION_ARRAY.filter(item => item.date === 'yesterday'),
    },
  ];

  return (
    <View style={styles.container}>
      <SectionList
        sections={NOTIFICATION_SECTIONS}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.title}
        renderItem={({item}) => (
          <SwipeableRow item={item} onSwipeableOpen={handleSwipeableOpen} />
        )}
        renderSectionHeader={({section: {title}}) => (
          <Text style={styles.title}>{title}</Text>
        )}
        contentContainerStyle={{paddingBottom: 130}}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.ReadexBold,
    color: colors.white,
    marginTop: 20,
  },
  rectButton: {
    backgroundColor: colors.black,
    marginTop: 20,
  },
});

export const NOTIFICATION_ARRAY: NotificationItemType[] = [
  {
    title: 'Liz Edwards',
    image:
      'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    subTitle: 'Commented in Buchmiller park group.',
    isActive: true,
    date: 'today',
  },
  {
    title: 'Sarah Steven',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    subTitle: 'Commented in park group.(Location)',
    isActive: false,
    date: 'yesterday',
  },
  {
    title: 'Sarah Stevense',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    subTitle: 'Commented in park group.(Location)',
    isActive: false,
    date: 'yesterday',
  },
  {
    title: 'Sarah Steves',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    subTitle: 'Commented in park group.(Location)',
    isActive: false,
    date: 'yesterday',
  },
  {
    title: 'Gurdip Singh',
    image:
      'https://media.istockphoto.com/id/1497142422/photo/close-up-photo-portrait-of-young-successful-entrepreneur-businessman-investor-wearing-glasses.webp?a=1&b=1&s=612x612&w=0&k=20&c=YBSe3jKmA6zZgE5U2ojmXjWf6h-Oo2ocdpfL9qMOLao=',
    subTitle: 'Commented in park group.(Location)',
    isActive: false,
    date: 'today',
  },
  {
    title: 'Sarah Stevens',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D',
    subTitle: 'Commented in park group.(Location)',
    isActive: false,
    date: 'today',
  },
];

export default Notification;
