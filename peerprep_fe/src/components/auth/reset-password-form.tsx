"use client";

import { useEffect, useState } from "react";
import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import { requestResetPassword } from "../../app/actions/auth";

export function ResetPasswordForm() {
  const [isEmailSent, setIsEmailSent] = useState(false);

  const resetPassword = async (formData: FormData) => {
    const username: string = formData.get("username") as string;
    const response = await requestResetPassword(username);
    alert(response?.message);
    if (response?.message) {
      console.log(response.message);
      setIsEmailSent(true);
    }
  };

  useEffect(() => {}, [isEmailSent]);

  // TODO: Make errors look better
  return (
    <div>
      {isEmailSent ? (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-semibold mb-4 px-4">
            Email has been sent to your inbox
          </h1>
        </div>
      ) : (
        <form action={resetPassword}>
          <Textfield
            name="username"
            secure={false}
            placeholder_text="Username"
            required={true}
            minLength={2}
            maxLength={20}
          />
          <Button type="submit" text="Send Email" />
        </form>
      )}
    </div>
  );
}
