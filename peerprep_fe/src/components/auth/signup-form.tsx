"use client";

import { useFormState } from "react-dom";
import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import { signup } from "../../app/actions/auth";
import { useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";

export function SignupForm() {
  const [state, action] = useFormState(signup, undefined);
  const { updateToken } = useAuth();

  useEffect(() => {
    if (state?.message) {
      updateToken(state.message.token);
    } else if (state?.errors?.errorMessage) {
      alert(state.errors.errorMessage);
    }
  }, [state]);

  return (
    <div>
      <form action={action}>
        <div>
          <Textfield
            name="username"
            secure={false}
            placeholder_text="Username"
            required={true}
            minLength={2}
            maxLength={20}
          />
          <p className="error">{state?.errors?.name}</p>
        </div>
        <div>
          <Textfield
            name="email"
            secure={false}
            placeholder_text="Email"
            required={true}
            minLength={5}
            maxLength={50}
          />
          <p className="error">{state?.errors?.email}</p>
        </div>
        <div>
          <Textfield
            name="password"
            secure={true}
            placeholder_text="Password"
            required={true}
            minLength={8}
            maxLength={20}
          />
          <p className="error">{state?.errors?.password}</p>
        </div>
        <Button type="submit" text="Sign Up" />
      </form>
    </div>
  );
}
