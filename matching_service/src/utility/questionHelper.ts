interface QuestionParams {
  topic: string | string[];
  difficultyLevel: "Easy" | "Medium" | "Hard";
}

async function generateQuestion(token: string, params?: QuestionParams) {
  try {
    let url = new URL(
      "http://gateway-service:5003/api/questions/questions/random"
    );

    if (params) {
      if (params.topic) {
        if (Array.isArray(params.topic)) {
          params.topic.forEach((t) => url.searchParams.append("topic", t));
        } else {
          url.searchParams.append("topic", params.topic);
        }
      }
      if (params.difficultyLevel) {
        url.searchParams.append("difficultyLevel", params.difficultyLevel);
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question. Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
