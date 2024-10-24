"use server";

import dotenv from "dotenv";

dotenv.config();

export async function getRoomById(id: string, token?: string | null) {
  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/room/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
    }
  );

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
