function base64UrlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes.buffer
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (const value of bytes) {
    binary += String.fromCharCode(value)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function mapCreationOptions(options: any): PublicKeyCredentialCreationOptions {
  return {
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    user: {
      ...options.user,
      id: base64UrlToBuffer(options.user.id),
    },
    excludeCredentials: (options.excludeCredentials ?? []).map((credential: any) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id),
    })),
  }
}

function mapRequestOptions(options: any): PublicKeyCredentialRequestOptions {
  return {
    ...options,
    challenge: base64UrlToBuffer(options.challenge),
    allowCredentials: (options.allowCredentials ?? []).map((credential: any) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id),
    })),
  }
}

export function browserSupportsPasskeys(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials
}

export async function createPasskeyCredential(options: any) {
  const credential = await navigator.credentials.create({
    publicKey: mapCreationOptions(options),
  })

  if (!credential) {
    throw new Error('Fingerprint registration was cancelled.')
  }

  return publicKeyCredentialToJSON(credential as PublicKeyCredential)
}

export async function getPasskeyCredential(options: any) {
  const credential = await navigator.credentials.get({
    publicKey: mapRequestOptions(options),
  })

  if (!credential) {
    throw new Error('Fingerprint verification was cancelled.')
  }

  return publicKeyCredentialToJSON(credential as PublicKeyCredential)
}

function publicKeyCredentialToJSON(credential: PublicKeyCredential) {
  const response = credential.response as AuthenticatorAttestationResponse | AuthenticatorAssertionResponse
  const json: Record<string, any> = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
  }

  if ('attestationObject' in response) {
    json.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
    }
  } else {
    json.response = {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : null,
    }
  }

  return json
}
