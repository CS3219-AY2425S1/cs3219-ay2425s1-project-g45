import Image from "next/image";
import Header from "@/components/common/header";
import Button from "@/components/common/button";

export default function Home() {
  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto py-10 ">
      <Header />

      <main className="relative mx-5 flex space-x-20 items-center flex-1">
        <div className="w-1/2 pl-10">
          <h1 className="text-6xl font-hairline leading-snug font-albert">
            Real Time Collaboration
          </h1>
          <p className="text-2xl font-hairline font-albert">easier than ever</p>
          <div className="mt-10 w-3/4">
            <Button text="Sign Up" link="/auth/signup" />
          </div>
        </div>

        <Image
          className="w-1/2"
          src="/icons/landing_icon.png"
          alt="Landing page icon"
          width={384}
          height={384}
          priority
        />
      </main>
    </div>
  );
}
