import crypto from "node:crypto";

const SESSION_COOKIE = "sh_session";
const STATE_COOKIE = "sh_oauth_state";

function secret(): string {
  const value = process.env.SESSION_SECRET;

  if (!value || value.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET tem de ter pelo menos 32 caracteres.");
    }
    return "default-dev-session-secret-key-with-at-least-32-characters";
  }

  return value;
}

function sign(value: string): string {
  return crypto
    .createHmac("sha256", secret())
    .update(value)
    .digest("base64url");
}

export function createSignedValue(data: any): string {
  const payload = Buffer.from(
    JSON.stringify(data)
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function readSignedValue<T = any>(value: string | null | undefined): T | null {
  if (!value || typeof value !== "string") return null;

  const parts = value.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    if (!data.exp || data.exp < Date.now()) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function readCookie(req: { headers: { cookie?: string } } | any, name: string): string | null {
  const header = req?.headers?.cookie || "";

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (key === name) {
      try {
        return decodeURIComponent(value);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function cookie(name: string, value: string, maxAge: number): string {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookie(name: string): string {
  return cookie(name, "", 0);
}

export function stateCookieName(): string {
  return STATE_COOKIE;
}

export function sessionCookieName(): string {
  return SESSION_COOKIE;
}

export function makeSession(user: any): string {
  return createSignedValue({
    user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  });
}
