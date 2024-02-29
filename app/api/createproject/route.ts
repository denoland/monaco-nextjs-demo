import Subhosting from "subhosting";

const subhosting = new Subhosting();

export async function GET() {
  const orgId = process.env["DEPLOY_ORG_ID"];
  const project = await subhosting.organizations.projects.create(orgId, {
    name: null,
  });
  return Response.json(project);
}
