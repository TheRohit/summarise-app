import { LocaleProvider } from "@/app/[locale]/provider";
import type { ReactNode } from "react";

export default function Layout({
  params: { locale },
  children,
}: {
  params: { locale: string };
  children: ReactNode;
}) {
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
