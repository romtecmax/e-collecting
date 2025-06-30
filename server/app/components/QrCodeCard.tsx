// backend/app/components/QrCodeCard.tsx
import React from "react";

interface QrCodeCardProps {
    qrCodeBase64: string;
}

const QrCodeCard: React.FC<QrCodeCardProps> = ({ qrCodeBase64 }) => (
    <div className="w-full flex flex-col items-center bg-white rounded-2xl shadow-lg p-4 transition-transform duration-200 hover:scale-105">
        {qrCodeBase64 ? (
            <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code"
                className="w-56 h-56 md:w-60 md:h-60 object-contain"
            />
        ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-gray-200 text-gray-400 rounded-xl">
                Error: No QR code available. Try again later.
            </div>
        )}
        {/* Waiting for verification */}
        <div className="mb-6 text-green-600 text-center animate-pulse font-medium">
            <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="origin-center" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" style={{ opacity: 0.7 }} />
                </svg>
                Waiting for verification...
            </span>
        </div>
        <h1 className="text-center mb-3 text-gray-900">
            Scan with the official <strong>swiyu Wallet</strong> App to cast a verified vote on the blockchain.

            <span className="relative inline-block ml-2 align-middle group">
                {/* Info icon */}
                <a
                    href="https://www.eid.admin.ch/en/public-beta-e"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download the swiyu Wallet"
                    className="text-blue-500 hover:text-blue-700 align-middle inline-flex items-center"
                    style={{ verticalAlign: "middle" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-circle-question-mark-icon lucide-circle-question-mark"
                        style={{ position: "relative", top: "-2px" }}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <path d="M12 17h.01" />
                    </svg>
                </a>
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    More information on the swiyu wallet: https://www.eid.admin.ch/en/public-beta-e
                </span>
            </span>

        </h1>
    </div>
);

export default QrCodeCard;