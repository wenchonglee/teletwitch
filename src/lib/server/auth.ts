import { BOT_TOKEN } from "$env/static/private";
import { createHash, createHmac } from "crypto";
import { z } from "zod";

const AuthSchema = z.object({
  auth_date: z.string().min(1),
  first_name: z.string().min(1),
  username: z.string().min(1),
  id: z.string().min(1),
  hash: z.string().min(1),
});

/**
 * Returns true if the token is valid
 */
const checkCookie = (cookieString: string) => {
  const cookie = JSON.parse(cookieString);

  const authObj = AuthSchema.safeParse(cookie);
  if (!authObj.success) {
    return { ok: false, error: "Invalid login params, something went wrong" };
  }

  const isTokenValid = checkToken(authObj.data);

  if (!isTokenValid) {
    return { ok: false, error: "Invalid auth" };
  }

  return { ok: true, data: authObj };
};

const checkToken = (token: z.infer<typeof AuthSchema>) => {
  const { auth_date, first_name, hash, id, username } = token;

  const payload = `auth_date=${auth_date}\nfirst_name=${first_name}\nid=${id}\nusername=${username}`;
  const secretKey = createHash("sha256").update(BOT_TOKEN).digest();
  const checkHash = createHmac("sha256", secretKey).update(payload).digest("hex");

  return hash === checkHash;
};

export { AuthSchema, checkCookie, checkToken };
