export type AuthProvider = "google" | "github" | "linkedin";

export type AuthStatus = "idle" | "loading" | "success" | "error";

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthError {
  field?: keyof LoginFormValues | "root";
  message: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  highlight?: string;
}

export interface OAuthSignInOptions {
  provider: AuthProvider;
  redirectTo?: string;
}

export interface SignInWithPasswordOptions {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ResetPasswordForEmailOptions {
  email: string;
  redirectTo?: string;
}

export interface UpdatePasswordOptions {
  password: string;
}
