import React, {useRef, useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox, {Camera, MapView, UserLocation, MarkerView} from '@rnmapbox/maps';
import {Court} from '../lib/supabase';
import {useCourtPresence, PresenceUser} from '../hooks/useCourtPresence';
import {AvatarStack} from './AvatarStack';
import {colors} from '../utilities/theme';

// Initialize Mapbox
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

interface CourtMapViewProps {
  courts: Court[];
  onCourtPress: (court: Court, users: PresenceUser[]) => void;
  initialLocation?: {latitude: number; longitude: number} | null;
}

export function CourtMapView({
  courts,
  onCourtPress,
  initialLocation,
}: CourtMapViewProps) {
  const cameraRef = useRef<Camera>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialLocation || null);

  // Get court IDs for presence subscription
  const courtIds = courts.map(c => c.id);
  const {presence} = useCourtPresence(courtIds);

  // Center on user when location updates
  const handleUserLocation = useCallback(
    (location: {coords: {latitude: number; longitude: number}}) => {
      if (!userLocation) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    },
    [userLocation],
  );

  const handleCourtPress = useCallback(
    (court: Court) => {
      const users = presence[court.id]?.users || [];
      onCourtPress(court, users);
    },
    [presence, onCourtPress],
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Dark}
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={false}>
        <Camera
          ref={cameraRef}
          followUserLocation={!userLocation}
          followZoomLevel={14}
          defaultSettings={{
            centerCoordinate: userLocation
              ? [userLocation.longitude, userLocation.latitude]
              : [-122.4194, 37.7749], // Default to SF
            zoomLevel: 14,
          }}
        />

        <UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          onUpdate={handleUserLocation}
        />

        {courts.map(court => (
          <MarkerView
            key={court.id}
            coordinate={[court.lng, court.lat]}
            anchor={{x: 0.5, y: 1}}>
            <AvatarStack
              users={presence[court.id]?.users || []}
              onPress={() => handleCourtPress(court)}
              size="medium"
            />
          </MarkerView>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
