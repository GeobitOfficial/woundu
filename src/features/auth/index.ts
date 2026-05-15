export { getGoogleSignInFallbackMessage } from "./oauthErrorMessages";
export { mapSignUpAuthErrorToUserMessage } from "./signUpErrorMessages";
export {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "./services/authService";
export type { AuthCredentials, AuthProvider, RegisterCredentials } from "./types";
