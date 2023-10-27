import { BOT_TOKEN } from "$env/static/private";
import { createHash, createHmac } from "crypto";
import { z } from "zod";

const TokenSchema = z.object({
  auth_date: z.string().min(1),
  first_name: z.string().min(1),
  username: z.string().min(1),
  id: z.string().min(1),
  hash: z.string().min(1),
});
type Token = z.infer<typeof TokenSchema>;
type CheckCookieReturn = { ok: true; data: Token } | { ok: false; error: string };

/**
 * Parse and check the stored cookie string
 */
const checkCookie = (cookieString: string): CheckCookieReturn => {
  const cookie = JSON.parse(cookieString);

  const authObj = TokenSchema.safeParse(cookie);
  if (!authObj.success) {
    return { ok: false, error: "Invalid login params, something went wrong" };
  }

  const isTokenValid = checkToken(authObj.data);

  if (!isTokenValid) {
    return { ok: false, error: "Invalid auth" };
  }

  return { ok: true, data: authObj.data };
};

/**
 * Returns true if the token is valid
 */
const checkToken = (token: Token) => {
  const { auth_date, first_name, hash, id, username } = token;

  const payload = `auth_date=${auth_date}\nfirst_name=${first_name}\nid=${id}\nusername=${username}`;
  const secretKey = createHash("sha256").update(BOT_TOKEN).digest();
  const checkHash = createHmac("sha256", secretKey).update(payload).digest("hex");

  return hash === checkHash;
};

export { TokenSchema, checkCookie, checkToken };
