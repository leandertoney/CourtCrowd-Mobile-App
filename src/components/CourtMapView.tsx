import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Court} from '../lib/supabase';
import {useCourtPresence, PresenceUser} from '../hooks/useCourtPresence';
import {useColors} from '../contexts/ThemeContext';
import {spacing} from '../utilities/theme';
import Text from './ui/Text';
import Svg, {Path, Circle} from 'react-native-svg';

interface CourtMapViewProps {
  courts: Court[];
  onCourtPress: (court: Court, users: PresenceUser[]) => void;
  initialLocation?: {latitude: number; longitude: number} | null;
}

// Map Pin Icon
const MapPinIcon: React.FC<{color: string; size?: number}> = ({color, size = 48}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.2}
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill={color} />
  </Svg>
);

/**
 * CourtMapView - Placeholder for map functionality
 * Map will be added in a future release
 */
export function CourtMapView({courts}: CourtMapViewProps) {
  const colors = useColors();
  const courtIds = courts.map(c => c.id);
  useCourtPresence(courtIds);

  return (
    <View style={[styles.container, {backgroundColor: colors.surfaceLight}]}>
      <View style={styles.content}>
        <MapPinIcon color={colors.accent} size={64} />
        <Text variant="h3" style={styles.title}>
          Map View Coming Soon
        </Text>
        <Text variant="body" color="secondary" style={styles.text}>
          Use the list view to browse {courts.length} court{courts.length !== 1 ? 's' : ''} near you.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
