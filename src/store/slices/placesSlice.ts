import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IPlace} from '../../interfaces/IPlace';

interface PlacesState {
  places: IPlace[] | null;
  nearbyPlaces: IPlace[] | null;
  favoritePlaces: IPlace[];
}

const initialState: PlacesState = {
  places: null,
  nearbyPlaces: null,
  favoritePlaces: [],
};

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setPlacesAction: (state, action: PayloadAction<IPlace[]>) => {
      state.places = action.payload;
    },
    setNearbyPlacesAction: (state, action: PayloadAction<IPlace[]>) => {
      state.nearbyPlaces = action.payload;
    },
    setFavoritePlacesAction: (state, action: PayloadAction<IPlace[]>) => {
      state.favoritePlaces = action.payload;
    },
    onFavoritePlaceAction: (state, {payload}: PayloadAction<IPlace>) => {
      state.favoritePlaces = [
        ...state.favoritePlaces,
        {...payload, isFavorite: true},
      ];

      state.places = state.places
        ? state.places?.map(p => {
            if (p.place_id === payload.place_id)
              return {...p, isFavorite: true};
            else return p;
          })
        : null;
    },
    onUnFavoritePlaceAction: (state, {payload}: PayloadAction<IPlace>) => {
      const updatedFavorites = state.favoritePlaces?.map(p => {
        if (p.place_id === payload.place_id) return {...p, isFavorite: false};
        else return p;
      });

      state.favoritePlaces = updatedFavorites.filter(
        places => places.isFavorite,
      );

      state.places = state.places
        ? state.places?.map(p => {
            if (p.place_id === payload.place_id)
              return {...p, isFavorite: false};
            else return p;
          })
        : null;
    },
    updatePlaceAction: (state, {payload}: PayloadAction<IPlace>) => {
      state.places = state.places
        ? state.places?.map(p => {
            if (p.place_id === payload.place_id) return payload;
            else return p;
          })
        : null;
    },
  },
});

export const {
  setPlacesAction,
  setNearbyPlacesAction,
  setFavoritePlacesAction,
  updatePlaceAction,
  onFavoritePlaceAction,
  onUnFavoritePlaceAction,
} = placesSlice.actions;
export default placesSlice.reducer;
