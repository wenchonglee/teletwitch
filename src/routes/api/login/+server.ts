import { TokenSchema, checkToken } from "$lib/server/auth.js";
import { error, redirect } from "@sveltejs/kit";

/**
 * Get a set-cookie response with query string provided by Telegram redirect
 */
export function GET({ url, cookies }) {
  const query = Object.fromEntries(url.searchParams);

  const token = TokenSchema.safeParse(query);
  if (!token.success) {
    throw error(403, "Invalid login params, something went wrong");
  }

  const isTokenValid = checkToken(token.data);
  if (!isTokenValid) {
    throw error(403, "Invalid auth");
  }

  cookies.set("telegram_auth", JSON.stringify(token.data), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: "lax",
    httpOnly: true,
  });

  throw redirect(307, "/");
}
