"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="mx-5 flex place-content-between ">
      <Link href="/home">
        <Image
          className="dark:invert"
          src="/icons/logo-full.png"
          alt="Next.js logo"
          width={128}
          height={128}
        />
      </Link>
      <div className="flex space-x-5">{children}</div>
    </header>
  );
}
