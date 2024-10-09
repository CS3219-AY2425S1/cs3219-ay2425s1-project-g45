import Image from "next/image";
import Header from "@/components/common/header";

import { LoginForm } from "@/components/auth/login-form";

export default function Login() {
  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10">
      <Header />
      <main className="relative mx-5 flex space-x-20 items-center flex-1">
        <div className="w-1/2 pl-10">
          <LoginForm />
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
