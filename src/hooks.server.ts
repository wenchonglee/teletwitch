import { env } from "$env/dynamic/private";
import { checkCookie } from "$lib/server/auth";
import { StorageClient } from "@supabase/storage-js";
import { error, type Handle } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = env["CONNECTION_STRING"];
const client = postgres(connectionString, {
  prepare: false,
});
export const db = drizzle(client);

const STORAGE_URL = env["STORAGE_URL"];
const SERVICE_KEY = env["SERVICE_KEY"];
const storageClient = new StorageClient(STORAGE_URL, {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});
export const bucket = storageClient.from("teletwitch");

export const handle: Handle = async ({ event, resolve }) => {
  const auth_cookie = event.cookies.get("telegram_auth");

  if (["/api/login", "/faq"].includes(event.url.pathname)) {
    const response = await resolve(event);
    return response;
  }

  const result = checkCookie(auth_cookie);
  // throw if cookie is invalid and we're not at base route
  if (event.url.pathname !== "/" && !result.ok) {
    throw error(403, result.error);
  }
  event.locals.userId = result.ok ? result.data.id : undefined;

  const response = await resolve(event);
  return response;
};
