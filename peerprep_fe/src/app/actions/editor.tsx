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
