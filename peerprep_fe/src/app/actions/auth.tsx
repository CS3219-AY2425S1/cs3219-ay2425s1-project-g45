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

  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;
  const response = await fetch(`${gatewayServiceURL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  try {
    const responseData = await response.json();
    if (responseData.token) {
      return {
        message: { token: responseData.token, username: data.username },
      };
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

export async function login(formState: FormState, formData: FormData) {
  const result = validateLoginFormData(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  const data = {
    username: `${formData.get("username")}`,
    password: `${formData.get("password")}`,
  };

  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const response = await fetch(`${gatewayServiceURL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

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

export async function validateToken(token: string) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const response = await fetch(`${gatewayServiceURL}/auth/validate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.status === 200;
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

export async function getHistory(username: string, token: string) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const response = await fetch(`${gatewayServiceURL}/auth/history`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  try {
    const responseData = await response.json();
    if (response.ok) {
      return { history: responseData.history };
    } else {
      return { error: responseData.message };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return { error: "An error occurred while fetching history" };
  }
}

