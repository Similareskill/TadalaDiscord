import {
  readCookie,
  readSignedValue,
  clearCookie,
  stateCookieName,
  sessionCookieName,
  makeSession,
  cookie
} from "../_lib/auth.js";

export default async function handler(req, res) {
  const clearState = clearCookie(stateCookieName());

  if (req.method !== "GET") {
    res.setHeader("Set-Cookie", clearState);
    return res.status(405).end("Method not allowed");
  }

  const code = req.query.code;
  const returnedState = req.query.state;
  const stored = readSignedValue(
    readCookie(req, stateCookieName())
  );

  if (
    typeof code !== "string" ||
    typeof returnedState !== "string" ||
    !stored ||
    stored.state !== returnedState
  ) {
    res.setHeader("Set-Cookie", clearState);
    return res.status(400).send("Estado OAuth2 inválido. Tenta novamente.");
  }

  if (req.query.error) {
    res.setHeader("Set-Cookie", clearState);
    return res.redirect(302, "/?login=cancelled");
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL;

  if (!clientId || !clientSecret || !redirectUri || !frontendUrl) {
    res.setHeader("Set-Cookie", clearState);
    return res.status(500).send("OAuth2 não configurado.");
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    });

    const tokenResponse = await fetch(
      "https://discord.com/api/v10/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Falha na troca do código OAuth2.");
    }

    const tokens = await tokenResponse.json();

    const profileResponse = await fetch(
      "https://discord.com/api/v10/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!profileResponse.ok) {
      throw new Error("Não foi possível obter o perfil.");
    }

    const profile = await profileResponse.json();

    // Guardar apenas campos de perfil necessários.
    const user = {
      id: profile.id,
      username: profile.username,
      global_name: profile.global_name || profile.username,
      avatar: profile.avatar || null
    };

    const session = makeSession(user);

    res.setHeader("Set-Cookie", [
      clearState,
      cookie(sessionCookieName(), session, 7 * 24 * 60 * 60)
    ]);

    res.setHeader("Cache-Control", "no-store");
    return res.redirect(302, new URL("/", frontendUrl).toString());
  } catch (error) {
    console.error("Discord OAuth callback:", error?.message || error);
    res.setHeader("Set-Cookie", clearState);
    return res.status(502).send(
      "Não foi possível concluir o login com Discord. Tenta novamente."
    );
  }
}
