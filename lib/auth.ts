import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Пользователь один (поэт), поэтому вход по одному паролю из POET_PASSWORD, без регистрации.
// В cookie лежит подпись HMAC, а не сам пароль. Смотреть открытки можно без входа.
const COOKIE = "poet";

function token(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Не задан SESSION_SECRET");
  return createHmac("sha256", secret).update("poet:v1").digest("hex");
}

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(password: string): boolean {
  const real = process.env.POET_PASSWORD;
  return !!real && same(password, real);
}

export async function signIn() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function isPoet(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  return !!value && same(value, token());
}
