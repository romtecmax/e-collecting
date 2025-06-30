// backend/app/routes/submit.tsx

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Web3 from "web3";
import contractABI from "~/functions/contractABI.json";

// Import your encryption function (adjust path as needed)
import { encryptString } from "~/functions/encrypt";
import { uploadSecrets } from "~/functions/upload_secret";


export const meta: MetaFunction = () => [
  { title: "e-collecting 3.0" },
  { name: "description", content: "Submit your Vote to the smart contract!" },
];

// Loader
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
}

export default function Submit() {
  const { id, ciphertext_with_tag, iv, slot_id, secret_version, contract_address } = useLoaderData<typeof loader>();

  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<string | Element>("");
  const [error, setError] = useState<string>("");

  // ensure we're on avalanche fuji
  const FUJI_CHAIN_ID = '0xa869';
  async function ensureFuji() {

    if (!window.ethereum) throw new Error("MetaMask not found");

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId.toLowerCase() === FUJI_CHAIN_ID) {
      return; // Already on Fuji
    }
    // Try to switch to Fuji
    setError(`Please switch to Avalanche Fuji Network, you are on ${currentChainId}. The Fuji chain id is ${FUJI_CHAIN_ID}`);
    throw new Error("Not on Fuji.")
  }

  // Connect wallet handler
  const connectWallet = async () => {
    if (window.ethereum) {
      try { // ensure we're on fuji
        await ensureFuji();
      }
      catch {
        return;
      }

      try { // connect wallet
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setStatus("Wallet connected: " + accounts[0]);
        console.log(status)
      } catch (err: any) {
        setError("Wallet connection failed: " + err.message);
        console.log("Wallet connection failed:", err);
      }
    } else {
      setError("MetaMask not detected");
      console.log("MetaMask not detected");
    }
  };

  const sendTransaction = async () => {
    setError("");
    setStatus("Sending transaction...");
    try {
      if (!window.ethereum) {
        setError("MetaMask not detected");
        return;
      }
      const web3 = new Web3(window.ethereum);

      // Create contract instance
      const contract = new web3.eth.Contract(
        contractABI as any,
        contract_address
      );

      // Prepare your method and arguments
      // Replace 'yourMethod' and arguments with your actual contract method and params
      const method = contract.methods.sendRequest(
        ciphertext_with_tag,
        iv,
        slot_id,
        secret_version,
      );

      // Encode ABI
      const data = method.encodeABI();

      // Prepare transaction object
      const txObject = {
        from: account,
        to: contract_address,
        data: data
      };

      // Send transaction
      const tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txObject],
      });

      setStatus( // set the status to snowtrace TX link
        <>
          Transaction sent! Tx hash:{" "}
          <a
            href={`https://testnet.snowtrace.io/tx/${tx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {tx}
          </a>
          <br/> It takes around 30 seconds for the vote to be counted.
        </>
      );
    } catch (err: any) {
      setError("Transaction failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <div className="bg-white rounded-xl shadow-lg px-8 py-10 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-center">Send Request to Smart Contract</h2>
        <div className="w-full mb-4 flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="font-semibold">Contract:</span>
            <span id="contract_address" className="break-all">{contract_address ?? "(none)"}</span>
          </div>
          
        </div>
        <div className="flex flex-col w-full gap-3">
          <button
            id="connectBtn"
            onClick={connectWallet}
            disabled={!!account}
            className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${account
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black text-white hover:bg-white hover:text-black border border-black"
              }`}
          >
            {account ? "Wallet Connected" : "Connect Wallet"}
          </button>
          {account && (
            <button
              id="sendBtn"
              onClick={sendTransaction}
              className="w-full py-2 px-4 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Send Transaction
            </button>
          )}
        </div>
        <div id="status" className="mt-4 text-green-700 text-center break-all">{status}</div>
        <div id="error" className="mt-2 text-red-600 text-center break-all">{error}</div>
      </div>
    </div>
  );
}