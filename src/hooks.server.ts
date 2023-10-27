import { checkCookie } from "$lib/server/auth";
import { error, type Handle } from "@sveltejs/kit";

const publicPaths = ["/", "/api/login"];

export const handle: Handle = async ({ event, resolve }) => {
  if (!publicPaths.includes(event.url.pathname)) {
    const auth_cookie = event.cookies.get("telegram_auth");

    if (!auth_cookie) {
      throw error(403, "Cookie not presnt");
    }

    const result = checkCookie(auth_cookie);
    if (!result.ok) {
      throw error(403, result.error);
    }
  }

  const response = await resolve(event);
  return response;
};
