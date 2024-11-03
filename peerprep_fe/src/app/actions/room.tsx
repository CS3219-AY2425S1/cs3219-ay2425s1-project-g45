"use server";

import dotenv from "dotenv";

dotenv.config();

export async function getRoomById(id: string, token?: string | null) {
  const gatewayServiceURL =
    process.env.NODE_ENV === "production"
      ? process.env.GATEWAY_SERVICE_URL
      : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

  const response = await fetch(`${gatewayServiceURL}/room/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${token}`,
    },
  });

  try {
    const data = await response.json();
    return {
      message: data,
      errors: {
        errorMessage: ["Unable to get room"],
      },
    };
  } catch (error) {
    console.error(error);
  }
}
