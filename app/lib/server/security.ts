import "server-only";
import {
  createHash,
  randomBytes,
  scrypt as deriveKey,
  timingSafeEqual,
} from "node:crypto";
const passwordCost = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };

function passwordKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    deriveKey(password, salt, 64, passwordCost, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}
export const token = () => randomBytes(32).toString("base64url");
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await passwordKey(password, salt);
  return `scrypt-v1:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded?: string) {
  const [algorithm, salt, hex] = (
    encoded || "scrypt-v1:00000000000000000000000000000000:" + "0".repeat(128)
  ).split(":");
  if (algorithm !== "scrypt-v1" || !salt || !/^[a-f0-9]{128}$/.test(hex || ""))
    return false;
  const key = await passwordKey(password, salt);
  return timingSafeEqual(key, Buffer.from(hex, "hex"));
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function text(value: unknown, label: string, max = 250): string {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new ApiError(400, `Enter a valid ${label} (up to ${max} characters).`);
  return value.trim();
}

export function emailAddress(value: unknown) {
  const email = text(value, "email address", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ApiError(400, "Enter a valid email address.");
  return email;
}

export function passwordValue(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length < 12 ||
    value.length > 128 ||
    !/[a-z]/i.test(value) ||
    !/\d/.test(value)
  )
    throw new ApiError(400, "Use 12–128 characters, including a letter and a number.");
  return value;
}

export function tokenHash(value: unknown) {
  if (typeof value !== "string" || !/^[\w-]{43}$/.test(value))
    throw new ApiError(410, "This link is invalid or has expired. Request a new one.");
  return digest(value);
}

export function appOrigin() {
  const value =
    process.env.APP_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  const url = new URL(value);
  if (
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(process.env.NODE_ENV !== "production" && url.protocol === "http:"))
  )
    throw new Error("APP_URL must be the application origin (HTTPS in production).");
  return url.origin;
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== appOrigin() || request.headers.get("sec-fetch-site") === "cross-site")
    throw new ApiError(403, "Reload the application and try again.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Send JSON data.");
}
