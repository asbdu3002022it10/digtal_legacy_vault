import client from './client'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface OtpVerifyResponse {
  otp_valid: boolean
  has_security_questions: boolean
  questions: string[]
}

export async function requestOtp(email: string, dob: string): Promise<void> {
  await client.post('/auth/request-otp', { email, dob })
}

export async function verifyOtp(
  email: string, 
  otp: string
): Promise<OtpVerifyResponse> {
  const { data } = await client.post<OtpVerifyResponse>('/auth/verify-otp', {
    email,
    otp
  })
  return data
}

export async function setupSecurity(
  email: string,
  otp: string,
  q1: string, a1: string,
  q2: string, a2: string,
  q3: string, a3: string
): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/setup-security', {
    email, otp, q1, a1, q2, a2, q3, a3
  })
  return data
}

export async function verifySecurity(
  email: string,
  otp: string,
  a1: string, a2: string, a3: string,
  country?: string,
  state?: string,
  district?: string
): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>('/auth/verify-security', {
    email, otp, a1, a2, a3, country, state, district
  })
  return data
}

