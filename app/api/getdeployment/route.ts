import { NextRequest } from "next/server";
import Subhosting from "subhosting";

const subhosting = new Subhosting();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const deploymentId = data["id"];
  const deployment = await subhosting.deployments.get(deploymentId);
  return Response.json(deployment);
}
