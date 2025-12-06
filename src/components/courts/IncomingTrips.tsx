import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {useColors} from '../../contexts/ThemeContext';
import {spacing, borderRadius} from '../../utilities/theme';
import Text from '../ui/Text';
import {TripWithDetails, formatETA} from '../../hooks/useCourtTrips';

// =============================================================================
// ICONS
// =============================================================================

const CarIcon: React.FC<{color: string; size?: number}> = ({
  color,
  size = 16,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 6L18.29 11M2 11V16C2 16.5304 2.21071 17.0391 2.58579 17.4142C2.96086 17.7893 3.46957 18 4 18H5M10 18H14M19 18H20C20.5304 18 21.0391 17.7893 21.4142 17.4142C21.7893 17.0391 22 16.5304 22 16V11M6 18C6 18.5304 6.21071 19.0391 6.58579 19.4142C6.96086 19.7893 7.46957 20 8 20C8.53043 20 9.03914 19.7893 9.41421 19.4142C9.78929 19.0391 10 18.5304 10 18M14 18C14 18.5304 14.2107 19.0391 14.5858 19.4142C14.9609 19.7893 15.4696 20 16 20C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18M22 11L20.29 4.59C20.2011 4.30209 20.0238 4.0495 19.7844 3.86431C19.545 3.67912 19.2555 3.57048 18.95 3.55H16M22 11H2M16 3.55H12.95C12.6445 3.57048 12.355 3.67912 12.1156 3.86431C11.8762 4.0495 11.6989 4.30209 11.61 4.59L10 10H16M6 6H3V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// =============================================================================
// TRIP ITEM
// =============================================================================

interface TripItemProps {
  trip: TripWithDetails;
}

const TripItem: React.FC<TripItemProps> = ({trip}) => {
  const colors = useColors();
  const userName = trip.user?.name || 'Someone';

  return (
    <View style={[styles.tripItem, {backgroundColor: colors.surfaceLight}]}>
      {/* Avatar */}
      {trip.user?.avatar_url ? (
        <Image source={{uri: trip.user.avatar_url}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, {backgroundColor: colors.info}]}>
          <Text variant="micro" color="inverse" style={{fontWeight: '600'}}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Name and ETA */}
      <View style={styles.tripInfo}>
        <Text variant="caption" style={{fontWeight: '600'}}>
          {userName}
        </Text>
        <Text variant="micro" color="tertiary">
          {formatETA(trip.estimated_arrival)}
        </Text>
      </View>

      {/* Car icon */}
      <View style={[styles.carBadge, {backgroundColor: `${colors.info}15`}]}>
        <CarIcon color={colors.info} size={14} />
      </View>
    </View>
  );
};

// =============================================================================
// INCOMING TRIPS
// =============================================================================

interface IncomingTripsProps {
  trips: TripWithDetails[];
  loading?: boolean;
}

const IncomingTrips: React.FC<IncomingTripsProps> = ({trips, loading}) => {
  const colors = useColors();

  if (loading) {
    return null;
  }

  if (trips.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerDot, {backgroundColor: colors.info}]} />
        <Text variant="caption" color="secondary" style={{fontWeight: '500'}}>
          On Their Way ({trips.length})
        </Text>
      </View>

      {/* Trip list */}
      <View style={styles.tripList}>
        {trips.map(trip => (
          <TripItem key={trip.id} trip={trip} />
        ))}
      </View>
    </View>
  );
};

// =============================================================================
// COMPACT VERSION (for smaller spaces)
// =============================================================================

interface IncomingTripsCompactProps {
  trips: TripWithDetails[];
  maxDisplay?: number;
}

export const IncomingTripsCompact: React.FC<IncomingTripsCompactProps> = ({
  trips,
  maxDisplay = 3,
}) => {
  const colors = useColors();

  if (trips.length === 0) {
    return null;
  }

  const displayTrips = trips.slice(0, maxDisplay);
  const remaining = trips.length - maxDisplay;

  return (
    <View style={styles.compactContainer}>
      {/* Stacked avatars */}
      <View style={styles.avatarStack}>
        {displayTrips.map((trip, index) => (
          <View
            key={trip.id}
            style={[
              styles.stackedAvatarContainer,
              {
                marginLeft: index === 0 ? 0 : -8,
                zIndex: displayTrips.length - index,
              },
            ]}>
            {trip.user?.avatar_url ? (
              <Image
                source={{uri: trip.user.avatar_url}}
                style={[styles.stackedAvatar, {borderColor: colors.surface}]}
              />
            ) : (
              <View
                style={[
                  styles.stackedAvatarPlaceholder,
                  {backgroundColor: colors.info, borderColor: colors.surface},
                ]}>
                <Text variant="micro" color="inverse" style={{fontWeight: '600'}}>
                  {(trip.user?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ))}
        {remaining > 0 && (
          <View
            style={[
              styles.stackedAvatarContainer,
              {marginLeft: -8, zIndex: 0},
            ]}>
            <View
              style={[
                styles.stackedAvatarPlaceholder,
                {backgroundColor: colors.surfaceLight, borderColor: colors.surface},
              ]}>
              <Text variant="micro" color="secondary" style={{fontWeight: '600'}}>
                +{remaining}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Text */}
      <Text variant="micro" color="secondary" style={{marginLeft: spacing.xs}}>
        {trips.length === 1 ? '1 person' : `${trips.length} people`} on the way
      </Text>
    </View>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  tripList: {
    gap: spacing.xs,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  carBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatarContainer: {},
  stackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  stackedAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IncomingTrips;
