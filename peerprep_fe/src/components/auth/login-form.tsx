"use client";

import { useFormState } from "react-dom";
import Textfield from "@/components/common/text-field";
import Button from "@/components/common/button";
import { login } from "@/app/actions/auth";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { FormState } from "@/app/types/AuthTypes";

export function LoginForm() {
  const defaultState: FormState = {};
  const [state, action] = useFormState(login, defaultState);
  const { updateToken } = useAuth();

  useEffect(() => {
    if (state?.message) {
      updateToken(state.message.token);
      console.log(state.message);
    } else if (state?.errors?.errorMessage) {
      alert(state.errors.errorMessage);
    }
  }, [state]);

  // TODO: Make errors look better
  return (
    <div>
      <form action={action}>
        <Textfield
          name="username"
          secure={false}
          placeholder_text="Name"
          required={true}
          minLength={2}
          maxLength={20}
        />
        <p className="error">{state?.errors?.name}</p>
        <Textfield
          name="password"
          secure={true}
          placeholder_text="Password"
          required={true}
          minLength={8}
          maxLength={20}
        />
        <p className="error">{state?.errors?.password}</p>
        <Button type="submit" text="Login" />
      </form>
    </div>
  );
}
