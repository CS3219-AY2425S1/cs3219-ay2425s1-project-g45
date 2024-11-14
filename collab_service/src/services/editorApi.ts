// pistonService.ts
import axios from "axios";

interface ExecuteCodeParams {
  language: string;
  version: string;
  code: string;
  stdin?: string;
}

interface ExecuteCodeResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
  };
}

export async function executeCodeWithPiston(
  params: ExecuteCodeParams
): Promise<ExecuteCodeResult> {
  console.log("Sent request to piston");

  const response = await axios.post<ExecuteCodeResult>(
    "https://emkc.org/api/v2/piston/execute",
    // "http://piston:2000/api/v2/execute",
    {
      language: params.language,
      version: params.version,
      files: [
        {
          name: "main",
          content: params.code,
        },
      ],
      stdin: params.stdin || "",
      args: [],
      compile_timeout: 10000,
      run_timeout: 3000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    }
  );

  console.log(response.status);

  return response.data;
}
