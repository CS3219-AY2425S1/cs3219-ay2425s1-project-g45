"use client";

import { useFormState } from "react-dom";
import Textfield from "@/components/common/text-field";
import Button from "@/components/common/button";
import TextButton from "@/components/common/text-button";
import { login } from "@/app/actions/auth";
import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-provider";

export function LoginForm() {
  const [state, action] = useFormState(login, undefined);
  const router = useRouter();
  const { setToken } = useContext(AuthContext);

  useEffect(() => {
    if (state?.message) {
      setToken(state.message);
      router.push("/home");
    } else if (state?.errors?.errorMessage) {
      alert(state.errors.errorMessage);
    }
  }, [state]);

  // TODO: Make errors look better
  return (
    <div>
      <form action={action}>
        <Textfield name="username" secure={false} placeholder_text="Name" />
        <p className="error">{state?.errors?.name}</p>
        <Textfield name="password" secure={true} placeholder_text="Password" />
        <p className="error">{state?.errors?.password}</p>
        <Button type="submit" text="Login" />
      </form>

      <div className="mt-5">
        <p className="text-sm font-hairline">
          Need an account? <TextButton text="Sign Up" link="/auth/signup" />
        </p>
      </div>
    </div>
  );
}
