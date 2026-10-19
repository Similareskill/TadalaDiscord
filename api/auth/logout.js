import { clearCookie, sessionCookieName } from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method not allowed");
  }

  res.setHeader("Set-Cookie", clearCookie(sessionCookieName()));
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({ success: true });
}
