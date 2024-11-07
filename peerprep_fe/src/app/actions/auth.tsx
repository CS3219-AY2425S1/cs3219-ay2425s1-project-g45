"use server";

import dotenv from "dotenv";
dotenv.config();

export async function signup(
  username: string,
  password: string,
  email: string
) {
  const result = validateSignUpFormData(username, password, email);
  if (!result.success) {
    return result.error;
  }

  const data = {
    username: username,
    email: email,
    password: password,
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
      return { token: responseData.token };
    } else {
      return responseData;
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return "An error occurred while signing up";
  }
}

export async function login(username: string, password: string) {
  const result = validateLoginFormData(username, password);
  if (!result.success) {
    return result.error;
  }

  const data = {
    username: username,
    password: password,
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
      return { token: responseData.token };
    } else {
      return responseData;
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return "An error occurred while logging in";
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
  error?: string;
}

function validateLoginFormData(
  username: string,
  password: string
): FormValidation {
  if (!username || username.length === 0) {
    return {
      success: false,
      error: "Name is required",
    };
  }

  if (!password || password.length === 0) {
    return {
      success: false,
      error: "Password is required",
    };
  }

  if (!validateName(username)) {
    return {
      success: false,
      error: "Name must be at least 2 characters",
    };
  }

  if (!validatePassword(`password`)) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    };
  }

  return {
    success: true,
  };
}

function validateSignUpFormData(
  username: string,
  password: string,
  email: string
): FormValidation {
  const result = validateLoginFormData(username, password);

  if (!result.success) {
    return result;
  }

  if (!email || email.length === 0) {
    return {
      success: false,
      error: "Email is required",
    };
  }

  if (!validateEmail(email)) {
    return {
      success: false,
      error: "Invalid email",
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

  try {
    const response = await fetch(
      `${gatewayServiceURL}/auth/history/${username}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();
    return { history: responseData.history };
  } catch (error) {
    return { error: error.message || "Unable to fetch history." };
  }
}

export async function requestResetPassword(username: string) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const data = {
    username: username,
  };

  const response = await fetch(`${gatewayServiceURL}/auth/requestreset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  try {
    const responseData = await response.json();
    if (responseData.message) {
      return {
        message: responseData.message,
      };
    } else {
      console.log(responseData.error.message);
      return {
        errors: { errorMessage: responseData.error?.message },
      };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: {
        errorMessage: "An error occured while requesting to reset password",
      },
    };
  }
}

export async function resetPasswordWithPassword(
  username: string,
  password: string,
  newPassword: string
) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const data = {
    username: username,
    password: password,
    newPassword: newPassword,
  };

  const response = await fetch(
    `${gatewayServiceURL}/auth/resetpassword/password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  try {
    const responseData = await response.json();
    if (responseData.ok) {
      console.log("Reset password with password");
      return {
        message: responseData.message,
      };
    } else {
      return {
        errors: { errorMessage: responseData },
      };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: {
        errorMessage: "An error occured while attempting to reset password",
      },
    };
  }
}

export async function resetPasswordWithToken(
  username: string,
  token: string,
  newPassword: string
) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const data = {
    username: username,
    token: token,
    newPassword: newPassword,
  };

  const response = await fetch(
    `${gatewayServiceURL}/auth/resetpassword/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  try {
    const responseData = await response.json();
    if (responseData.message) {
      return {
        message: responseData.message,
      };
    } else {
      console.log(responseData.error);
      return {
        errors: { errorMessage: responseData.error },
      };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: {
        errorMessage: "An error occured while attempting to reset password",
      },
    };
  }
}

export async function deleteUser(username: string) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const data = {
    username: username,
  };

  const response = await fetch(`${gatewayServiceURL}/auth/delete/${username}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  try {
    const responseData = await response.json();
    if (responseData.message) {
      return {
        message: responseData.message,
      };
    } else {
      console.log(responseData.error);
      return {
        errors: { errorMessage: responseData.error },
      };
    }
  } catch (error) {
    console.error(`error: ${error}`);
    return {
      errors: {
        errorMessage: "An error occured while attempting to reset password",
      },
    };
  }
}
