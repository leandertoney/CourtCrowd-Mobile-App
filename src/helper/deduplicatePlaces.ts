import {IPlace} from '../interfaces/IPlace';

export const deduplicatePlaces = (places: IPlace[]): IPlace[] => {
  const uniquePlacesMap = new Map<string, IPlace>();

  places.forEach(place => {
    if (!uniquePlacesMap.has(place.place_id)) {
      uniquePlacesMap.set(place.place_id, place);
    }
  });

  return Array.from(uniquePlacesMap.values());
};
