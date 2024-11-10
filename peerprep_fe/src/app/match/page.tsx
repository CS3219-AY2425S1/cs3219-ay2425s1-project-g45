"use client";

import Button from "../../components/common/button";
import Head from "next/head"; // Import Head from next/head
import Header from "../../components/common/header";
import { MatchForm } from "../../components/match/match-form";
import { useAuth } from "../../contexts/auth-context";
import { useRouter } from "next/navigation";

interface MatchPageProps {}

const match: React.FC<MatchPageProps> = () => {
  const router = useRouter();
  const { username } = useAuth();

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>
      <Header>
        <div className="w-full h-full flex items-center justify-center">
          Hi {username}
        </div>
        <Button
          text="History"
          onClick={() => {
            router.push("/history");
          }}
        />
        <Button text="Profile" onClick={() => router.push("/profile")} />
      </Header>
      <MatchForm />
    </div>
  );
};
export default match;
