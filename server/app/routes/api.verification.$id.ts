// backend/app/routes/api/verification.$id.ts

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  if (!id) {
    return json({ error: "Missing id parameter" }, { status: 400 });
  }

  console.log(id)

  const apiUrl = `https://www.bcs.admin.ch/bcs-web/rest/betaId/verification/${id}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return json({ error: `Failed to fetch from BCS API: ${await response.text()}` }, { status: response.status });
    }
    const data = await response.json();
    if (data.state === "SUCCESS") {
      return json("Verification is complete.", { status: 200 });
    }
    else {
      return json({ message: "Verification is pending..." }, { status: 202 })
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 500 });
  }
}