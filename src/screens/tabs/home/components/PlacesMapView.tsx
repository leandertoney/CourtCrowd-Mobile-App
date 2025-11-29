import {
    StyleSheet,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
  } from 'react-native';
  import React, {useEffect, useRef, useState} from 'react';
  import {DistanceIcon, StarIcon} from '../../../../assets/svg';
  import {colors, fonts} from '../../../../utilities/theme';
  import MapView, {Marker} from 'react-native-maps';
  import {useAppSelector} from '../../../../store';
  import {IPlace} from '../../../../interfaces/IPlace';
  // TODO: This component will be replaced by CourtMapView.tsx (Mapbox)
  
  interface Props {
    places: IPlace[] | null;
    onPressCard?: (place: IPlace) => void;
  }
  
  export default function PlacesMapView({places, onPressCard}: Props) {
    const {currentLocation} = useAppSelector(state => state.auth);
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  
    const [selectedPlace, setSelectedPlace] = useState<IPlace>();
  
    useEffect(() => {
      if (currentLocation && isMapLoaded) {
        mapRef.current?.animateToRegion({
          latitude: currentLocation?.coords.latitude,
          longitude: currentLocation?.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }, [currentLocation, isMapLoaded]);
  
    return (
      <View style={{flex: 1, marginTop: 5}}>
        <MapView
          style={{flex: 1}}
          initialRegion={{
            latitude: currentLocation?.coords.latitude || 37.78825,
            longitude: currentLocation?.coords.longitude || -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          ref={mapRef}
          onMapLoaded={() => {
            setIsMapLoaded(true);
          }}
          userInterfaceStyle="light"
  
          // customMapStyle={darkMapStyle}
        >
          {/* Central User Marker */}
          {currentLocation?.coords ? (
            <Marker coordinate={currentLocation?.coords}>
              <View style={{alignItems: 'center'}}>
                <View style={styles.centralMarker}>
                  <Image
                    source={{
                      uri: 'https://randomuser.me/api/portraits/men/1.jpg',
                    }}
                    style={styles.centralimg}
                  />
                </View>
              </View>
            </Marker>
          ) : null}
  
          {/* Other Markers */}
          {places?.map(d => (
            <Marker
              key={d.place_id}
              onPress={() => {
                setSelectedPlace(d);
              }}
              coordinate={{
                latitude: d.geometry.location.lat,
                longitude: d.geometry.location.lng,
              }}>
              <View
                style={{
                  alignItems: 'center',
                }}>
                <View style={styles.otherMarkerimg}>
                  <Image
                    style={{width: 32, height: 32, borderRadius: 32}}
                    source={{
                      uri:
                        d.photos?.length &&
                        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=40&photoreference=${d.photos[0].photo_reference}
                          &key=${MAP_API_KEY}`,
                    }}
                  />
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
  
        {selectedPlace ? (
          <TouchableOpacity
            onPress={() => onPressCard?.(selectedPlace)}
            style={{
              width: '90%',
              backgroundColor: '#131313',
              position: 'absolute',
              top: Dimensions.get('window').height - 450,
              alignSelf: 'center',
              borderRadius: 24,
              flexDirection: 'row',
              padding: 16,
            }}>
            <Image
              source={{
                uri: selectedPlace.photos.length
                  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedPlace.photos[0].photo_reference}
  &key=${MAP_API_KEY}`
                  : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=',
              }}
              style={{width: 64, height: 64, borderRadius: 16}}
            />
            <View
              style={{
                flex: 1,
                justifyContent: 'space-between',
                marginLeft: 8,
              }}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {selectedPlace.name}
              </Text>
              <Text style={styles.cardDesc} numberOfLines={1}>
                {selectedPlace.vicinity}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <DistanceIcon />
                <Text style={styles.cardDistance} numberOfLines={1}>
                  {selectedPlace.distance?.toFixed(2)} miles Away
                </Text>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 5,
                    backgroundColor: 'gray',
                    marginHorizontal: 8,
                    marginTop: 4,
                  }}
                />
                <StarIcon width={16} height={16} />
                <Text style={styles.cardDistance}>{selectedPlace.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    map: {
      width: '100%',
      height: '100%',
    },
    centralMarker: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      padding: 1.5,
    },
    centralimg: {
      width: 34,
      height: 34,
      borderRadius: 20,
    },
    otherMarkerimg: {
      width: 40,
      height: 40,
      borderRadius: 30,
      borderColor: colors.black,
      borderWidth: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    otherMarkerText: {
      width: 40,
      height: 17,
      borderRadius: 4,
      fontSize: 7,
      color: colors.white,
      fontFamily: fonts.ReadexSemiBold,
      textAlign: 'center',
      justifyContent: 'center',
      backgroundColor: '#5D5D5D',
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: fonts.ReadexMedium,
      color: colors.white,
    },
    cardDesc: {
      fontSize: 12,
      fontFamily: fonts.ReadexLight,
      color: colors.white,
    },
    cardDistance: {
      fontSize: 12,
      fontFamily: fonts.ReadexMedium,
      color: colors.white,
      marginLeft: 2,
    },
  });
  