"use server";

import dotenv from "dotenv";
import { FormState } from "../types/AuthTypes";

dotenv.config();

export async function signup(state: FormState, formData: FormData) {
  const result = validateSignUpFormData(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  const data = {
    username: `${formData.get("username")}`,
    email: `${formData.get("email")}`,
    password: `${formData.get("password")}`,
  };

  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/auth/signup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  try {
    const responseData = await response.json();
    if (responseData.token) {
      return { message: responseData.token };
    } else {
      return { errors: { errorMessage: responseData } };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: { errorMessage: "An error occurred while signing up" },
    };
  }
}

export async function login(state: FormState, formData: FormData) {
  const result = validateLoginFormData(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  const data = {
    username: `${formData.get("username")}`,
    password: `${formData.get("password")}`,
  };

  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/auth/signin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  try {
    const responseData = await response.json();
    if (responseData.token) {
      return {
        message: { token: responseData.token, username: responseData.username },
      };
    } else {
      return {
        errors: { errorMessage: responseData },
      };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: { errorMessage: "An error occurred while logging in" },
    };
  }
}

function validateEmail(email: string): boolean {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

function validateName(name: string): boolean {
  return name.length >= 2;
}

interface FormValidation {
  success: boolean;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
  };
}

function validateLoginFormData(formData: FormData): FormValidation {
  if (!formData.get("username")) {
    return {
      success: false,
      errors: {
        name: "Name is required",
      },
    };
  }

  if (!formData.get("password")) {
    return {
      success: false,
      errors: {
        password: "Password is required",
      },
    };
  }

  if (!validateName(`${formData.get("username")}`)) {
    return {
      success: false,
      errors: {
        name: "Name must be at least 2 characters",
      },
    };
  }

  if (!validatePassword(`${formData.get("password")}`)) {
    return {
      success: false,
      errors: {
        password: "Password must be at least 8 characters",
      },
    };
  }

  return {
    success: true,
  };
}

function validateSignUpFormData(formData: FormData): FormValidation {
  const result = validateLoginFormData(formData);

  if (!result.success) {
    return result;
  }

  if (!formData.get("email")) {
    return {
      success: false,
      errors: {
        email: "Email is required",
      },
    };
  }

  if (!validateEmail(`${formData.get("email")}`)) {
    return {
      success: false,
      errors: {
        email: "Invalid email",
      },
    };
  }

  return {
    success: true,
  };
}
