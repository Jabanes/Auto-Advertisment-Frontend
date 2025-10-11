export interface UserDTO {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: string;
  emailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserDTO;
  businesses: any[];
  products: any[];
  serverToken: string; // alias for idToken returned from backend
}
