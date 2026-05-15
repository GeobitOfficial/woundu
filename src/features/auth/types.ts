export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type RegisterCredentials = AuthCredentials &
  Readonly<{
    fullName: string;
  }>;

export type AuthProvider = "google";
