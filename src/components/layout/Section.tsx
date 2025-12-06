import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import {spacing} from '../../utilities/theme';
import Text from '../ui/Text';

// =============================================================================
// TYPES
// =============================================================================

interface SectionProps {
  title: string;
  onSeeAll?: () => void;
  seeAllText?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

interface HorizontalSectionProps<T> extends Omit<SectionProps, 'children'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemSpacing?: number;
  snapToItem?: boolean;
  itemWidth?: number;
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

const Section: React.FC<SectionProps> = ({
  title,
  onSeeAll,
  seeAllText = 'See all',
  children,
  style,
  contentStyle,
}) => {
  const colors = useColors();

  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Text variant="h3">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text variant="bodySmall" color="tertiary">
              {seeAllText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );
};

// =============================================================================
// HORIZONTAL SECTION COMPONENT
// =============================================================================

export function HorizontalSection<T>({
  title,
  onSeeAll,
  seeAllText = 'See all',
  data,
  renderItem,
  keyExtractor,
  itemSpacing = spacing.sm,
  snapToItem = false,
  itemWidth,
  style,
}: HorizontalSectionProps<T>) {
  const colors = useColors();

  return (
    <View style={[styles.section, style]}>
      <View style={[styles.header, styles.horizontalHeader]}>
        <Text variant="h3">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text variant="bodySmall" color="tertiary">
              {seeAllText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.horizontalContent,
          {gap: itemSpacing},
        ]}
        renderItem={({item, index}) => (
          <View
            style={[
              itemWidth ? {width: itemWidth} : undefined,
            ]}>
            {renderItem(item, index)}
          </View>
        )}
        keyExtractor={keyExtractor}
        snapToAlignment={snapToItem ? 'start' : undefined}
        decelerationRate={snapToItem ? 'fast' : 'normal'}
        snapToInterval={snapToItem && itemWidth ? itemWidth + itemSpacing : undefined}
      />
    </View>
  );
}

// =============================================================================
// GRID SECTION COMPONENT
// =============================================================================

interface GridSectionProps<T> extends Omit<SectionProps, 'children'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  columns?: number;
  itemSpacing?: number;
}

export function GridSection<T>({
  title,
  onSeeAll,
  seeAllText = 'See all',
  data,
  renderItem,
  keyExtractor,
  columns = 2,
  itemSpacing = spacing.sm,
  style,
}: GridSectionProps<T>) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Text variant="h3">{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text variant="bodySmall" color="tertiary">
              {seeAllText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.grid, {gap: itemSpacing}]}>
        {data.map((item, index) => (
          <View
            key={keyExtractor(item, index)}
            style={{width: `${100 / columns - 2}%`}}>
            {renderItem(item, index)}
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  horizontalHeader: {
    paddingHorizontal: spacing.md,
  },
  content: {},
  horizontalContent: {
    paddingHorizontal: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
});

export default Section;
