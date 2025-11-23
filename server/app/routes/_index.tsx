// ... existing imports ...
import React, { useState, useRef } from "react";
import InfoCard, { InfoCardRef } from "~/components/InfoCard";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import QrCodeCard from "~/components/QrCodeCard";
import SubmitCard from "~/components/SubmitCard";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "e-collecting 3.0" },
  { name: "description", content: "Cast an officially verified vote on the blockchain!" },
];


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
  const contract_address = process.env.CONTRACT_ADDRESS
  const page_data = {
    qrCodeBase64,
    verificationId,
    contract_address
  }
  return json(page_data);
}


const mainTranslations = {
  headline: {
    en: "Sign the first blockchain-based petition ever:\nFor a digital Democracy!",
    de: "Unterschreiben Sie die erste blockchain-basierte Petition überhaupt:\nFür eine digitale Demokratie!",
    fr: "Signez la toute première pétition basée sur la blockchain :\nPour une démocratie numérique !"
  },
  signaturesCollected: {
    en: "Signatures collected:",
    de: "Gesammelte Unterschriften:",
    fr: "Signatures collectées :"
  },
  proofConcept: {
    en: `X`,//This application is a proof of concept for the collection of ‘signatures’ for `,
    de: "X",//Diese Anwendung ist ein Proof-of-Concept für das Sammeln von «Unterschriften» für ",
    fr: "C"//Cette application est une preuve de concept pour la collecte de « signatures » pour "
  },
  popularInitiative: {
    en: "popular initiatives in Switzerland",
    de: "Volksinitiativen in der Schweiz",
    fr: "les initiatives populaires en Suisse"
  },
  onTheBlockchain: {
    en: "on the blockchain (",
    de: "auf der Blockchain (",
    fr: "sur la blockchain ("
  },
  seeSmartContract: {
    en: "see the smart contract here",
    de: "siehe den Smart Contract hier",
    fr: "voir le smart contract ici"
  },
  toSign: {
    en: "To sign a petition (in the smart contract) you need to prove your identity with your ",
    de: "Um eine Petition (im Smart Contract) zu unterschreiben, müssen Sie Ihre Identität mit Ihrer ",
    fr: "Pour signer une pétition (dans le smart contract), vous devez prouver votre identité avec votre "
  },
  swissEID: {
    en: "Swiss e-ID",
    de: "Schweizer e-ID",
    fr: "e-ID suisse"
  },
  betaExplanation: {
    en: "The Swiss e-ID is currently in BETA, so anyone can ",
    de: "Die Schweizer e-ID ist derzeit in der BETA-Phase, daher kann jeder ",
    fr: "L’e-ID suisse est actuellement en BÊTA, donc tout le monde peut "
  },
  createBeta: {
    en: "create a BETA e-ID",
    de: "eine BETA-e-ID erstellen",
    fr: "créer une e-ID BÊTA"
  },
  toInteract: {
    en: "to interact with the smart contract.",
    de: "um mit dem Smart Contract zu interagieren.",
    fr: "pour interagir avec le smart contract."
  },
  seeArticle: {
    en: "See this blog article for more details on the concept: ",
    de: "Siehe diesen Blog-Artikel für mehr Details zum Konzept: ",
    fr: "Voir cet article de blog pour plus de détails sur le concept : "
  },
  articleTitle: {
    en: "Democracy 3.0",
    de: "Democracy 3.0",
    fr: "Democracy 3.0"
  }
};

export default function Index() {
  const { qrCodeBase64, verificationId, contract_address } = useLoaderData<typeof loader>();
  // Create a variable to track verification status
  const [isVerified, setIsVerified] = useState(false);
  const [txData, setTxData] = useState<Record<string, string> | null>(null);
  const [signatureCount, setSignatureCount] = useState<number>(2);
  const infoCardRef = useRef<InfoCardRef>(null);
  const [currentLang, setCurrentLang] = useState<"en" | "de" | "fr">("en");
  const handleInfoLangChange = (lang: "en" | "de" | "fr") => setCurrentLang(lang);

  const youtubeVideoId = "p8c95uogwUM";

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
      <div className="backdrop-blur-md bg-white/80 mt-10  shadow-2xl rounded-3xl p-6 md:p-12 w-[95vw] max-w-[95vw] md:max-w-5xl border border-gray-200 flex flex-col items-stretch gap-8">
        {/* Container for desktop flex layout */}
        <div className="hidden md:flex flex-row h-full items-stretch gap-8">
          {/* Left column with InfoCard and YouTube embed */}
          <div className="w-1/2 flex flex-col items-center justify-center">
            {/* Title & stats */}
            <h2 className="text-2xl mt-4 md:text-3xl font-extrabold text-center text-blue-700 drop-shadow-lg tracking-wide animate-fade-in">
              <span className="inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 bg-clip-text text-transparent">
                e-collecting 3.0
              </span>
            </h2>
            <br />
            <span className="text-lg text-center text-blue-900 drop-shadow-lg tracking-wide animate-fade-in">
              {mainTranslations.headline[currentLang].split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </span>
            <span className="mb-6 mt-1 text-sm text-gray-800">
              {mainTranslations.signaturesCollected[currentLang]} {signatureCount}
            </span>

            {!isVerified ? (
              <QrCodeCard qrCodeBase64={qrCodeBase64} lang={currentLang} />
            ) : (
              <div className="flex flex-col items-center justify-center mb-6 w-full">
                <SubmitCard
                  txData={txData}
                  verificationId={verificationId}
                  lang={currentLang}
                  onSubmissionComplete={() => infoCardRef.current?.scrollIntoView()}
                />
              </div>
            )}
          </div>

          {/* Left side content with QR code/verification */}

          <div className="w-1/2 flex flex-col gap-6">
            <InfoCard
              lang={currentLang}
              onLanguageChange={setCurrentLang}
              contractAddress={contract_address}
            />
            {/* YouTube Embed - Now inside the left column */}
            <div className="aspect-w-16 aspect-h-9 w-full mt-2">
              <iframe
                className="w-full h-full min-h-60 rounded-lg shadow-lg"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Mobile layout - now using full width */}
        <div className="md:hidden w-full">
          {/* Title & stats */}
          <h2 className="text-2xl mt-3 md:text-3xl font-extrabold text-center text-blue-700 drop-shadow-lg tracking-wide animate-fade-in w-full">
            <span className="inline-block bg-gradient-to-r from-blue-600 via-blue-500 to-blue-800 bg-clip-text text-transparent">
              e-collecting 3.0
            </span>
          </h2>
          <br />
          <span className="text-lg text-center text-blue-900 drop-shadow-lg tracking-wide animate-fade-in w-full">
            {mainTranslations.headline[currentLang].split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </span>
          <span className="mb-6 mt-1 text-sm text-gray-800 w-full text-center">
            {mainTranslations.signaturesCollected[currentLang]} {signatureCount}
          </span>

          {!isVerified ? (
            <QrCodeCard qrCodeBase64={qrCodeBase64} lang={currentLang} />
          ) : (
            <div className="flex flex-col items-center justify-center mb-6 w-full">
              <SubmitCard
                txData={txData}
                verificationId={verificationId}
                lang={currentLang}
                onSubmissionComplete={() => infoCardRef.current?.scrollIntoView()}
              />
            </div>
          )}


          {/* InfoCard container - full width */}
          <div className="w-full flex-shrink-0 mb-6">
            <InfoCard
              lang={currentLang}
              onLanguageChange={setCurrentLang}
              contractAddress={contract_address}
            />
          </div>



          {/* YouTube Embed for mobile - full width */}
          <div className="aspect-w-16 aspect-h-9 w-full mb-6">
            <iframe
              className="w-full h-full min-h-60 rounded-lg shadow-lg"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="flex-1 flex flex-col items-center w-full">


          </div>
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
            <span className="hidden md:inline">
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