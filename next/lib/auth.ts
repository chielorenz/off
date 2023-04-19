import { NextApiRequest, NextApiResponse } from "next";
import { NextHandler } from "next-connect";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github";
import passport from "passport";
import { getToken, setData } from "lib/session";
import useRepo from "lib/repo";

const FACEBOOK_CREDENTIALS = {
  clientID: process.env.FACEBOOK_APP_ID as string,
  clientSecret: process.env.FACEBOOK_APP_SECRET as string,
};
const GITHUB_CREDENTIALS = {
  clientID: process.env.GITHUB_APP_ID as string,
  clientSecret: process.env.GITHUB_APP_SECRET as string,
};

const authPassport = new passport.Passport();
const providerPassport = new passport.Passport();

authPassport.use(
  new FacebookStrategy({
    ...FACEBOOK_CREDENTIALS,
    callbackURL: "/api/facebook/auth/callback",
  }, function (_accessToken, _refreshToken, profile, callback) {
    return callback(null, { id: profile.id, provider: "facebook" });
  }),
).use(
  new GitHubStrategy({
    ...GITHUB_CREDENTIALS,
    callbackURL: "/api/github/auth/callback",
  }, function (_accessToken, _refreshToken, profile, callback) {
    return callback(null, { id: profile.id, provider: "github" });
  }),
);

providerPassport.use(
  new FacebookStrategy({
    ...FACEBOOK_CREDENTIALS,
    callbackURL: "/api/facebook/adapter/callback",
  }, function (accessToken, _refreshToken, _profile, callback) {
    return callback(null, { accessToken });
  }),
).use(
  new GitHubStrategy({
    ...GITHUB_CREDENTIALS,
    callbackURL: "/api/github/adapter/callback",
  }, function (accessToken, _refreshToken, _profile, callback) {
    return callback(null, { accessToken });
  }),
);

/** Gets the correct passport based on the scope */
async function getPassport(scope: string) {
  switch (scope) {
    case "auth":
      return authPassport;
    case "adapter":
      return providerPassport;
    default:
      throw new Error("Invalid callback scope:" + scope);
  }
}

/** Parses and validates query params. Returns null if params are invalid */
async function parseQuery(request: NextApiRequest) {
  const { scope, provider } = request.query as {
    scope: string;
    provider: string;
  };

  const scopes = ["auth", "adapter"];
  const providers = ["facebook", "github"];
  if (scopes.includes(scope) && providers.includes(provider)) {
    return { scope, provider };
  }

  return null;
}

/** Middleware that inits the passport auth flow */
export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler,
) {
  const params = await parseQuery(req);
  if (params) {
    const passport = await getPassport(params.scope);
    const options = { session: false };
    passport.authenticate(params.provider, options)(req, res, next);
  } else {
    res.redirect("/404");
  }
}

/** Middleware that handles the passport auth callback */
export async function authenticated(
  request: NextApiRequest & { user: any },
  response: NextApiResponse,
  next: NextHandler,
) {
  const params = await parseQuery(request);

  if (params) {
    const { scope, provider } = params;

    /**
     * If scope is auth set user data in session, otherwise send the adapter's
     * access token to the API
     */
    if (scope === "auth") {
      const value = request.user;
      await setData({ value, response });
    } else {
      const accessToken = request.user.accessToken;
      const repo = await useRepo(async () => getToken({ request }));
      await repo.sendAdapter({ accessToken, provider });
    }

    response.redirect("/");
    next();
  } else {
    response.redirect("/404");
  }
}
