import { AuthResponseSuccess, ErrorResponse, Redirect } from "./authRequest";

export type AuthReplyBasic = {
  200: AuthResponseSuccess,
  302: Redirect,
  '4xx': ErrorResponse
  500: ErrorResponse
}

export type AuthRequestHeader = {
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

export type AuthGetUserRequest = AuthRequestHeader & {
  Reply: AuthReplyBasic,
}

export type AuthValidateRequest = AuthRequestHeader & {
  Reply: {
    200: { success: boolean },
    201: { success: true, access_token: string, refresh_token: string },
    '4xx': ErrorResponse,
    500: ErrorResponse
  }
}

export type AuthLoginReply = {
  Reply: AuthReplyBasic & {
    202: { success: boolean, requires_2fa: boolean, message: string }
  }
  Body: {
    user_name?: string,
    email?: string,
    passwd: string,
    totp_token?: string,
  }
}

export type AuthLogoutRequest = AuthRequestHeader & {
  Reply: {
    200: { success: true },
    '4xx': ErrorResponse,
    500: ErrorResponse,
  }
}

export type AuthOAuthRequest = {
  Body: {
    code?: string,
  },
  Reply: AuthReplyBasic,
}

export type AuthSignUpRequest = {
  Body: {
    user_name: string,
    email: string,
    passwd: string
  }
  Reply: AuthReplyBasic,
}

export type AuthUpdateRequest = AuthRequestHeader & {
  Body: {
    user_name?: string,
    email?: string,
    passwd?: string
  },
  Reply: AuthReplyBasic,
}

export type AuthDeleteRequest = AuthRequestHeader & {
  Reply: {
    200: { success: true },
    '4xx': ErrorResponse,
    500: ErrorResponse
  }
}

export type AuthSessionRequest = {
  Body: {
    ids: number[]
  },
  Reply: {
    200: { success: true, sessions: number[] },
    '4xx': ErrorResponse,
    500: ErrorResponse
  }
}
