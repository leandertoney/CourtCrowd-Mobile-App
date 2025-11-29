import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  skill_level: string | null;
  play_hours: string | null;
  dupr: string | null;
  bio: string | null;
  push_token: string | null;
  location_sharing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  rating: number | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourtPresence {
  id: string;
  user_id: string;
  court_id: string;
  entered_at: string;
  user?: User;
}

export interface CourtMessage {
  id: string;
  court_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface Favorite {
  user_id: string;
  court_id: string;
  created_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}
