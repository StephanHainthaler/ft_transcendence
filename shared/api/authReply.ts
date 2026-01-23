import { AuthResponseSuccess, ErrorResponse, Redirect } from "./authRequest";

export type AuthReplyBasic = {
  200: AuthResponseSuccess,
  302: Redirect,
  '4xx': ErrorResponse
  500: ErrorResponse
}

export interface AuthRequestHeader {
  Request: {
    cookies: {
      access_token: string,
      refresh_token: string,
    }
    params: {
      userId?: number
    }
  }
}

export interface AuthGetUserRequest extends AuthRequestHeader {
  Reply: AuthReplyBasic,
}

export interface AuthValidateRequest extends AuthRequestHeader {
  Reply: {
    200: { success: boolean },
    201: { success: true, access_token: string, refresh_token: string },
    '4xx': ErrorResponse,
    500: ErrorResponse
  }
}

export interface AuthLoginReply {
  Reply: AuthReplyBasic
  Body: {
    user_name?: string,
    email?: string,
    passwd: string
  }
}

export interface AuthLogoutRequest extends AuthRequestHeader{
  Reply: {
    200: { success: true },
    '4xx': ErrorResponse,
    500: ErrorResponse,
  }
}

export interface AuthOAuthRequest {
  Body: {
    code?: string,
  },
  Reply: AuthReplyBasic,
}

export interface AuthSignUpRequest {
  Body: {
    user_name: string,
    email: string,
    passwd: string
  }
  Reply: AuthReplyBasic,
}

export interface AuthUpdateRequest extends AuthRequestHeader {
  Body: {
    user_name?: string,
    email?: string,
    passwd?: string
  },
  Reply: AuthReplyBasic,
}

export interface AuthDeleteRequest extends AuthRequestHeader {
  Reply: {
    200: { success: true },
    '4xx': ErrorResponse,
    500: ErrorResponse
  }
}
