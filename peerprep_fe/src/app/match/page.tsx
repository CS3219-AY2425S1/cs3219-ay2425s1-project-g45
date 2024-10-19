"use client";

import Header from "@/components/common/header";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Button from "@/components/common/button";
import { MatchForm } from "@/components/match/match-form";
import Head from "next/head"; // Import Head from next/head

interface MatchPageProps {}

const match: React.FC<MatchPageProps> = () => {
  const router = useRouter();
  const { token, deleteToken } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>
      <Header>
        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/");
          }}
        />
      </Header>
      <MatchForm />
    </div>
  );
};
export default match;
