"use client";

import { cn } from "@v1/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        "w-full flex items-center justify-between p-4 z-10 bg-background",
        className
      )}
    >
      <span className="hidden md:block text-sm font-medium">Summarise</span>

      {/* <Link href="/">
        <Image
          src="/logo.png"
          alt="V1 logo"
          width={60}
          quality={100}
          height={60}
          className="md:absolute md:left-1/2 md:top-5 md:-translate-x-1/2"
        />
      </Link> */}

      <nav className="md:mt-2">
        <ul className="flex items-center gap-4">
          <li>
            <a
              href="https://github.com/TheRohit/summarise-app"
              className="text-sm px-4 py-2 bg-primary text-secondary rounded-full font-medium"
            >
              Github
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
