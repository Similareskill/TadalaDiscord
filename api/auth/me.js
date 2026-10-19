import {
  readCookie,
  readSignedValue,
  sessionCookieName
} from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method not allowed");
  }

  const sessionCookie = readCookie(req, sessionCookieName());
  const session = readSignedValue(sessionCookie);

  res.setHeader("Cache-Control", "no-store");
  if (!session || !session.user) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({ user: session.user });
}
