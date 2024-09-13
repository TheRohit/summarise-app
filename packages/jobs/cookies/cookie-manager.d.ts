import { Cookie } from "tough-cookie";
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getCookie(name: string): any;

export function updateCookieValues(
  cookie: Cookie,
  values: Record<string, string | number | Date>,
): void;
