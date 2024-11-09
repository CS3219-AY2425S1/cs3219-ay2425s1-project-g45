"use server";

import { Language } from "../../contexts/editor-context";
import dotenv from "dotenv";

dotenv.config();

export async function handleRunCode(
  code: string,
  language: Language,
  token?: string
) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;
  try {
    const response = await fetch(`${gatewayServiceURL}/collab/editor/runCode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ code, language }),
    });

    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      return { error: result.error };
    }
  } catch (error: any) {
    return { error: error };
  }
}

export async function handleSaveAttempt(
  username: string,
  question: string,
  datetime: string,
  code: string,
  token?: string
) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  try {
    const response = await fetch(`${gatewayServiceURL}/collab/editor/saveAttempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify({ username, question, datetime, code }),
    });

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Try to parse JSON response
    const result = await response.json();
    
    if (response.ok) {
      // Ensure the result is a plain object
      return {
        output: result.output || '',
        error: result.error || null,
      };
    } else {
      return { error: result.error };
    }
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error during API call:", error);

    // Check if the response was HTML (common error page)
    if (error.message.includes("Unexpected token <")) {
      return { error: "Server returned an error page (possibly HTML)." };
    }

    return { error: error.message || 'An unknown error occurred' };
  }
}

export async function getHistory(username: string, token: string) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  try {
    const response = await fetch(
      `${gatewayServiceURL}/collab/editor/history/${username}`,
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
