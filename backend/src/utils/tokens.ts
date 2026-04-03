import crypto from "crypto";

export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function generateOTP(digits = 6): string {
  const max = Math.pow(10, digits);
  const num = crypto.randomInt(0, max);
  return String(num).padStart(digits, "0");
}
