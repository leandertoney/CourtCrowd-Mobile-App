export interface IPlace {
  id?: string;
  business_status: 'OPERATIONAL';
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  onlineUsers?: string[];
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  name: string;
  opening_hours: {
    open_now: boolean;
  };
  photos: [
    {
      height: number;
      html_attributions: string[];
      photo_reference: string;
      width: number;
    },
  ];
  place_id: string;
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  rating: number;
  reference: string;
  scope: string;
  types: string[];
  user_ratings_total: number;
  vicinity: string;
  editorial_summary?: {
    overview: string | null;
  };
  reviews?: IReview[];

  // custom props
  favoritedBy?: string[];
  distance?: number;
  isFavorite?: boolean;
}

export interface IReview {
  author_name: string;
  author_url: string;
  language: 'en';
  original_language: 'en';
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  translated: boolean;
}
