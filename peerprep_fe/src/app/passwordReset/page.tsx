"use client";

import { useEffect } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/common/header";
import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import { resetPasswordWithToken } from "../actions/auth";

const PasswordReset: React.FC = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const token = searchParams.get("token");

  const action = async (formData: FormData) => {
    const newPassword: string = formData.get("password") as string;

    const response = await resetPasswordWithToken(username, token, newPassword);
    console.log(response);
    if (response.message) {
      console.log(response.message);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10">
      <Header />
      <main className="relative mx-5 flex items-center flex-1">
        <div className="w-full pb-60">
          <h3 className="text-2xl font-bold">Reset Password</h3>
          <form action={action}>
            <Textfield
              name="password"
              secure={false}
              placeholder_text="New Password"
              required={true}
              minLength={2}
              maxLength={20}
            />
            <Button type="submit" text="Update Password" />
          </form>
        </div>
      </main>
    </div>
  );
};

export default PasswordReset;
