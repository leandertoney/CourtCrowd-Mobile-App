export interface IUser {
  email: string;
  name: string;
  id?: string;
  skill: string;
  playHours: number;
  nickName?: string;
  address?: string;
  dupr?: number;
  bio?: string;
  photo?: {url: string; path: string};
  pushNotifications?: boolean;
  notifications?: boolean;
  messaging?: boolean;
  // userType?: string; // Added userType as an optional property
}

export interface ICreateUser {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  skill: string;
  playHours: number;
  photoURL?: string;
}
