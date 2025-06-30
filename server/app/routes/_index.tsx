// ... existing imports ...
import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";

export const meta: MetaFunction = () => [
  { title: "e-collecting 3.0" },
  { name: "description", content: "Cast an officially verified vote on the blockchain!" },
];


import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch the QR code and verification ID from the external API
  const apiUrl = "https://www.bcs.admin.ch/bcs-web/rest/betaId/verification/create/all";
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Response("Failed to fetch QR code", { status: 500 });
  }
  const data = await response.json();
  const qrCodeBase64 = data.qrCodeBase64 || "";
  const link = data.link || "";


  // Extract the ID from the link (last part after the last '/')
  const verificationId = link ? link.replace(/\/$/, "").split("/").pop() : "";

  console.log("verification id:", verificationId)
  return json({
    qrCodeBase64,
    verificationId,
  });
}

import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import QrCodeCard from "~/components/QrCodeCard";
import SubmitCard from "~/components/SubmitCard";

export default function Index() {
  const { qrCodeBase64, verificationId } = useLoaderData<typeof loader>();
  // Create a variable to track verification status
  const [isVerified, setIsVerified] = useState(false);
  const [txData, setTxData] = useState<Record<string, string> | null>(null);
  const [signatureCount, setSignatureCount] = useState<number>(2);


  useEffect(() => {
    if (!verificationId || isVerified) return;

    // hook for periodically checking if the request was verified with the swiyu wallet
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/verification/${verificationId}`);
        if (res.status === 200) {
          setIsVerified(true);
        }
      } catch (e) {
        // Optionally handle error
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [verificationId, isVerified]);

  // periodically fetch the signature count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/getCount`);
        if (res.status === 200) {
          const data = await res.json();
          setSignatureCount(data.count);
        }
      } catch (e) {
        console.error(e)
      }
    };
    fetchCount(); // Run once at start
    const interval = setInterval(fetchCount, 20000); // start polling
    return () => clearInterval(interval);
  }, [verificationId]);

  // hook for loading transaction data upon verification.
  useEffect(() => {
    if (isVerified && verificationId) {
      (async () => {
        console.log("Getting TX data.");
        const res = await fetch(`/api/txdata/${verificationId}`);

        if (res.status === 200) {
          const data = await res.json();
          setTxData(data.transaction_data);
        }
      })();
    }
  }, [isVerified]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-200 text-black text-sm font-light md:text-sm font-medium py-2 flex justify-center items-center">
        <span>
          <a
            href="https://dss.swiss"
            className="font-semibold text-cyan-900 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Digital Sovereignty Switzerland
          </a>{" "}
          presents:
        </span>
      </header>
      {/* Main Card */}
      <div className="backdrop-blur-md bg-white/80 shadow-2xl rounded-3xl p-8 md:p-12 flex flex-col items-center max-w-lg w-full border border-gray-200">
        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-blue-700 drop-shadow-lg tracking-wide animate-fade-in">
          <span className="inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 bg-clip-text text-transparent">
            e-collecting 3.0
          </span>
        </h2>
        <br />
        <span className=" text-lg text-center  text-blue-900 drop-shadow-lg tracking-wide animate-fade-in">
          Sign the first <b>blockchain-based petition</b> ever:<br /> For a digital Democracy!
        </span>
        <span className="mb-6 mt-1 text-sm text-gray-800">Signatures collected: {signatureCount}</span>
        {!isVerified ? (
          <QrCodeCard qrCodeBase64={qrCodeBase64} />
        ) : (
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6 flex items-center justify-center shadow-lg">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="white" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 13l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                />
              </svg>
            </div>
            <div className="mt-4 text-green-700 font-semibold text-lg text-center">
              Verification complete!
            </div>
            {/* Display transaction data if available */}
            <SubmitCard
              slot_id={0}
              encrypted_verification_id={txData?.encrypted_verification_id ?? ""}
              iv={txData?.iv ?? ""}
              secret_version={txData?.secret_version ?? ""}
              contract_address={txData?.contract_address}
            />
          </div>
        )}


        <hr className="my-6 border-t-2 border-gray-200 w-full" />
        <div className="max-w-md text-center text-gray-600 text-sm  mb-4">
          This application is a proof of concept for the collection of ‘signatures’ for{" "}
          <a
            href="https://en.wikipedia.org/wiki/Popular_initiative_in_Switzerland"
            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            popular initiatives in Switzerland
          </a>
          {" "}on the blockchain.
        </div>
        <div className="max-w-md text-center text-gray-600 text-sm">
          To sign a petition (in the smart contract) you need to prove your identity with your{" "}
          <a
            href="https://www.eid.admin.ch/"
            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"

            target="_blank"
            rel="noopener noreferrer"
          >
            Swiss e-ID
          </a>
          . The Swiss e-ID is currently in BETA, so anyone can{" "}
          <a
            href="https://www.bcs.admin.ch/bcs-web/#/"
            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"

            target="_blank"
            rel="noopener noreferrer"
          >
            create a BETA e-ID
          </a>
          {" "}to interact with the smart contract.
        </div>
        <div className="max-w-md text-center text-gray-600 text-sm mt-5">
          See this blog article for more details on the concept:{" "}
          <a
            href="https://dss.swiss/2025/01/31/democracy-3-0/"
            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Democracy 3.0
          </a>
        </div>
      </div>
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-50">
        <div className="relative flex items-center justify-between px-4 md:px-10 py-2 bg-white/80 backdrop-blur border-t border-gray-200 shadow-lg text-gray-700 text-sm">
          {/* Left: GitHub */}
          <a
            href="https://github.com/romtecmax/e-collecting"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.853 0 1.337-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs">romtecmax/e-collecting</span>
          </a>
          {/* Center: Text and DSS logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-center mx-2">
            <span>
              Proudly made in Switzerland <span role="img" aria-label="Switzerland flag">🇨🇭</span>
            </span>
          </div>
          {/* Right: Copyright */}
          <div className="text-xs text-gray-500 text-right">
            &copy; {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>

  );
}