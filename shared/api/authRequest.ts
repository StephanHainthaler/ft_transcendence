import type { AuthUserClient } from "../user";

export type SignupRequestBody = {
  username: string,
  email: string,
  passwd: string
};

export type LoginRequestBody = {
  username?: string,
  email?: string,
  passwd: string
};

export type UpdateCredsRequestBody = {
  username?: string,
  email?: string,
  passwd?: string
}

export type AuthResponseSuccess =  {
  success: boolean,
  auth: AuthUserClient,
  access_token?: string,
}

export type ErrorResponse = {
  success: boolean,
  message: string,
}

export type Redirect = {
  url: string,
}
