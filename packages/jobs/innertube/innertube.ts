import { fetch } from "undici";
import { Innertube, Session } from "youtubei.js";
import { getCookie, updateCookieValues } from "../cookies/cookie-manager";
const PLAYER_REFRESH_PERIOD = 1000 * 60 * 15; // ms

let innertube: Innertube;
let lastRefreshedAt: number;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const transformSessionData = (cookie: any) => {
  if (!cookie) return;

  const values = { ...cookie.values() };
  const REQUIRED_VALUES = ["access_token", "refresh_token"];

  if (REQUIRED_VALUES.some((x) => typeof values[x] !== "string")) {
    return;
  }

  if (values.expires) {
    values.expiry_date = values.expires;
    // biome-ignore lint/performance/noDelete: <explanation>
    delete values.expires;
  } else if (!values.expiry_date) {
    return;
  }

  return values;
};

export const cloneInnertube = async (): Promise<Innertube> => {
  const currentTime = Date.now();
  const shouldRefreshPlayer =
    !lastRefreshedAt || currentTime - lastRefreshedAt > PLAYER_REFRESH_PERIOD;
  if (!innertube || shouldRefreshPlayer) {
    innertube = await Innertube.create({
      //@ts-ignore
      fetch: fetch,
    });
    lastRefreshedAt = currentTime;
  }

  const session = new Session(
    innertube.session.context,
    innertube.session.key,
    innertube.session.api_version,
    innertube.session.account_index,
    innertube.session.player,
    undefined,
    //@ts-ignore
    fetch ?? innertube.session.http.fetch,
    innertube.session.cache,
  );

  const cookie = getCookie("youtube_oauth");

  const oauthData = transformSessionData(cookie);

  if (!session.logged_in && oauthData) {
    await session.oauth.init(oauthData);
    session.logged_in = true;
  }

  if (session.logged_in) {
    if (session.oauth.shouldRefreshToken()) {
      await session.oauth.refreshAccessToken();
    }

    const cookieValues = cookie.values();
    const oldExpiry = new Date(cookieValues.expiry_date);
    const newExpiry = session?.oauth?.oauth2_tokens?.expiry_date
      ? new Date(session.oauth.oauth2_tokens.expiry_date)
      : oldExpiry;

    if (oldExpiry.getTime() !== newExpiry.getTime()) {
      //@ts-ignore
      updateCookieValues(cookie, {
        ...session.oauth.client_id,
        ...session.oauth.oauth2_tokens,
        expiry_date: newExpiry.toISOString(),
      });
    }
  }

  return new Innertube(session);
};
