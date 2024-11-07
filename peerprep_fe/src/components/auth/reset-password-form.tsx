"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import { requestResetPassword } from "../../app/actions/auth";
import { FormState, ResetFormState } from "../../app/types/AuthTypes";

export function ResetPasswordForm() {
  const defaultState: ResetFormState = {};
  const [state, action] = useFormState(requestResetPassword, defaultState);

  useEffect(() => {
    if (state?.message) {
      console.log(state.message);
    } else if (state?.error) {
      alert(state.error);
    }
  }, [state]);

  // TODO: Make errors look better
  return (
    <div>
      <form action={action}>
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
    </div>
  );
}
