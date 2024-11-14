"use client";

import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import TextButton from "../common/text-button";
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";

interface LoginFormProps {
  onForgotPassword: VoidFunction;
}

export function LoginForm(props: LoginFormProps) {
  const { onForgotPassword } = props;
  const { login } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const response = await login(username, password);
    setIsLoading(false);
    if (response.success) {
      console.log("Login successful");
    } else {
      console.log(`Login failed: ${response.error}`);
      alert(response.error);
    }
  };

  return (
    <div>
      <Textfield
        name="username"
        secure={false}
        placeholder_text="Username"
        required={true}
        minLength={2}
        maxLength={20}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Textfield
        name="password"
        secure={true}
        placeholder_text="Password"
        required={true}
        minLength={8}
        maxLength={20}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        loading={isLoading}
        type="submit"
        text="Login"
        onClick={handleLogin}
      />
      <TextButton text="Forgot your password?" onClick={onForgotPassword} />
    </div>
  );
}
