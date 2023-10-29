import { json } from "@sveltejs/kit";

import { readdirSync } from "node:fs";

export function GET({ url }) {
  const o: Record<string, string[]> = {};
  try {
    const base = readdirSync(url.searchParams.get("path")!);
    o["base"] = base;
  } catch (err) {
    o["base"] = ["error!"];
  }
  try {
    const cwd = readdirSync(process.cwd() + url.searchParams.get("path")!);
    o["cwd"] = cwd;
  } catch (err) {
    o["cwd"] = ["error!"];
  }

  return json(o);
}
