import { writeFile } from "node:fs/promises";
import { parseSetCookie, splitCookiesString } from "set-cookie-parser";
import Cookie from "./cookie";

const WRITE_INTERVAL = 60000;
const cookie = process.env.COOKIE;
const COUNTER = Symbol("counter");

let cookies = {};
let dirty = false;
let intervalId;

const setup = async () => {
  try {
    if (!cookie) return;

    cookies = JSON.parse(cookie);

    intervalId = setInterval(writeChanges, WRITE_INTERVAL);
  } catch {
    /* no cookies for you */
  }
};

setup();

function writeChanges() {
  if (!dirty) return;
  dirty = false;

  writeFile(cookiePath, JSON.stringify(cookies, null, 4)).catch(() => {
    clearInterval(intervalId);
  });
}

export function getCookie(service) {
  if (!cookies[service] || !cookies[service].length) return;

  let n;
  if (cookies[service][COUNTER] === undefined) {
    n = cookies[service][COUNTER] = 0;
  } else {
    ++cookies[service][COUNTER];
    n = cookies[service][COUNTER] %= cookies[service].length;
  }

  const cookie = cookies[service][n];
  if (typeof cookie === "string")
    cookies[service][n] = Cookie.fromString(cookie);

  return cookies[service][n];
}

export function updateCookie(cookie, headers) {
  if (!cookie) return;

  const parsed = parseSetCookie(splitCookiesString(headers.get("set-cookie")), {
    decodeValues: false,
  });
  const values = {};

  cookie.unset(parsed.filter((c) => c.expires < new Date()).map((c) => c.name));
  // biome-ignore lint/complexity/noForEach: <explanation>
  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  parsed
    .filter((c) => !c.expires || c.expires > new Date())
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    .forEach((c) => (values[c.name] = c.value));
  updateCookieValues(cookie, values);
}

export function updateCookieValues(cookie, values) {
  cookie.set(values);
  if (Object.keys(values).length) dirty = true;
}
