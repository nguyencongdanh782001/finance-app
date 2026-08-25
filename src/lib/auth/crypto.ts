const encoder = new TextEncoder();

const base64UrlEncode = (input: ArrayBuffer | string) => {
  const bytes =
    typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
};

const base64UrlDecode = (input: string) => {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return atob(padded);
};

const getJwtSecret = () => {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_SECRET");
  }

  return secret;
};

const getKey = async () => {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getJwtSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
};

export type AuthTokenPayload = {
  sub: string;
  phone: string;
  role: string;
  sessionId?: string;
  exp: number;
  iat: number;
};

export async function signJwt(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  expiresInSeconds: number,
) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body: AuthTokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(body),
  )}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await getKey(),
    encoder.encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token: string): Promise<AuthTokenPayload | null> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = Uint8Array.from(base64UrlDecode(encodedSignature), (char) =>
    char.charCodeAt(0),
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    await getKey(),
    signature,
    encoder.encode(unsignedToken),
  );

  if (!isValid) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function hashValue(value: string) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));

  return base64UrlEncode(hash);
}

export function generateNumericCode(length = 6) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);

  return (array[0] % 10 ** length).toString().padStart(length, "0");
}

export function generateOpaqueToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);

  return base64UrlEncode(bytes.buffer);
}
