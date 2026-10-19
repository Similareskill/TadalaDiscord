import crypto from "node:crypto";
import {
  createSignedValue,
  cookie,
  stateCookieName
} from "../_lib/auth.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method not allowed");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).send("OAuth2 não configurado.");
  }

  const state = crypto.randomBytes(32).toString("hex");

  const signedState = createSignedValue({
    state,
    exp: Date.now() + 10 * 60 * 1000
  });

  res.setHeader("Set-Cookie", cookie(
    stateCookieName(),
    signedState,
    600
  ));

  const url = new URL(
    "https://discord.com/oauth2/authorize"
  );

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);

  res.setHeader("Cache-Control", "no-store");
  return res.redirect(302, url.toString());
}
