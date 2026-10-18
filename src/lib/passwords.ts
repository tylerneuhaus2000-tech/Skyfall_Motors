import "server-only";

import {
  scrypt as nodeScrypt,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;
const PARAMETERS = { N: 32_768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password, salt, KEY_LENGTH, PARAMETERS, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return {
    passwordHash: key.toString("base64url"),
    passwordSalt: salt.toString("base64url"),
    passwordAlgorithm: "scrypt-32768-8-1",
  };
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
  passwordSalt: string,
) {
  try {
    const expected = Buffer.from(passwordHash, "base64url");
    const salt = Buffer.from(passwordSalt, "base64url");
    if (expected.length !== KEY_LENGTH || salt.length !== 16) return false;
    const actual = await deriveKey(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
