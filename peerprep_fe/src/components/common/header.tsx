"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="top-0 left-0 w-full py-3 z-50 flex justify-between items-center place-self-center px-5 md:max-w-6xl">
      <Link href="/home">
        <Image
          className="dark:invert"
          src="/icons/logo-full.png"
          alt="Next.js logo"
          width={128}
          height={128}
        />
      </Link>
      <div className="shrink flex space-x-5 justify-center items-center">
        {children}
      </div>
    </header>
  );
}
