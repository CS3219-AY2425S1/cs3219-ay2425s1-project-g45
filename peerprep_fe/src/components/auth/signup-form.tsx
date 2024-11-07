"use client";

import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import { useAuth } from "../../contexts/auth-context";
import { useState } from "react";

export function SignupForm() {
  const { signup } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignup = async () => {
    setIsLoading(true);
    const response = await signup(username, password, email);
    setIsLoading(false);
    if (response.success) {
      console.log("Signup successful");
    } else {
      console.log(`Signup failed: ${response.error}`);
      alert(response.error);
    }
  };

  return (
    <div>
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
      </div>
      <div>
        <Textfield
          name="email"
          secure={false}
          placeholder_text="Email"
          required={true}
          minLength={5}
          maxLength={50}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Textfield
          name="password"
          secure={true}
          placeholder_text="Password"
          required={true}
          minLength={8}
          maxLength={20}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        text="Sign Up"
        loading={isLoading}
        onClick={handleSignup}
      />
    </div>
  );
}
