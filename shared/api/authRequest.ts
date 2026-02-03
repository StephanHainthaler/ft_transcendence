import type { AuthUserClient } from "../user";

export type SignupRequestBody = {
  user_name: string,
  email: string,
  passwd: string
};

export type LoginRequestBody = {
  user_name?: string,
  email?: string,
  passwd: string
};

export type OAuthRequestBody = {
  client_id?: string,
  redirect_uri?: string,
  state?: string,
  allow_signup?: string,
  scope?: string
};

export type OAuthCallBackBody = {
  code?: string
};

export type UpdateCredsRequestBody = {
  user_name?: string,
  email?: string,
  passwd?: string
}

export type AuthResponseSuccess = {
  success: boolean,
  auth: AuthUserClient,
}

export type ErrorResponse = {
  success: boolean,
  message: string,
}

export type Redirect = {
  url: string,
}
