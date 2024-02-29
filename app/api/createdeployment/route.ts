import { NextRequest } from "next/server";
import Subhosting from "subhosting";

const subhosting = new Subhosting();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const code = data["code"];
  const projectId = data["project"];

  const res = await subhosting.projects.deployments.create(projectId, {
    entryPointUrl: "main.ts",
    assets: {
      "main.ts": {
        kind: "file",
        content: code,
        encoding: "utf-8",
      },
    },
    envVars: {},
  });

  console.log("Deno deployment created:", res);
  return Response.json(res);
}
