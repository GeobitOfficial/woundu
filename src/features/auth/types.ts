export type AuthCredentials = Readonly<{
  email: string;
  password: string;
}>;

export type RegisterCredentials = AuthCredentials &
  Readonly<{
    fullName: string;
    country: string;
    currency: string;
    role: "buyer" | "seller";
  }>;
