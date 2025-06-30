// backend/app/routes/api.getCount.tsx

import { json } from "@remix-run/node";

export const loader = async () => {

    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
    const url = process.env.INFURA_ENDPOINT;
    if (!CONTRACT_ADDRESS || !url) {
        return json({ error: "Missing Infura url or contract address" }, { status: 500 });
    }
    const data = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
            {
                to: CONTRACT_ADDRESS,
                data: "0x61bc221a"
            },
            "latest"
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.error) {
            return json({ error: result.error }, { status: 500 });
        }

        // The result will be a hex string. Convert to number.
        const countHex = result.result;
        const count = parseInt(countHex, 16);

        return json({ count });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};