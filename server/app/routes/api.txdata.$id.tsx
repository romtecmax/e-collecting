// backend/app/routes/api/verification.$id.ts

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getTransactionData } from "~/functions/GetTransactionData";

export async function loader({ params }: LoaderFunctionArgs) {
    const { id } = params;
    if (!id) {
        return json({ error: "Missing id in url" }, { status: 400 });
    }

    const slot_id = 0
    const transaction_data = await getTransactionData(id, slot_id);
    return json({ transaction_data})
}