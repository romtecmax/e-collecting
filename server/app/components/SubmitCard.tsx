import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "~/functions/contractABI.json";

interface SubmitCardProps {
    slot_id: number;
    encrypted_verification_id: string;
    iv: string;
    secret_version: string;
    contract_address: string;
}

const SubmitCard: React.FC<SubmitCardProps> = ({
    slot_id,
    encrypted_verification_id,
    iv,
    secret_version,
    contract_address,
}) => {

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
                encrypted_verification_id,
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

            console.log(txObject)

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
                </>
            );
        } catch (err: any) {
            setError("Transaction failed: " + err.message);
        }
    };

    return (
        <div className="text-black py-3 mt-6">
            <h2 className="text-xl font-bold text-center">Step 2: Submit Signature to Smart Contract</h2>
            <div className="mt-2 text-sm flex justify-between">
                <span className="font-semibold">Contract:</span>
                {contract_address ? (
                    <a
                        href={`https://testnet.snowtrace.io/address/${contract_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                        id="contract_address"
                    >
                        {contract_address}
                    </a>
                ) : (
                    <span id="contract_address">Loading...</span>
                )}
            </div>
            <div className="flex flex-col w-full gap-3 py-3">
                {/* Only show the connect button if NOT connected */}
                {!account && (
                    <button
                        id="connectBtn"
                        onClick={connectWallet}
                        className="w-full py-2 mt-2 rounded-md font-semibold transition-colors bg-black text-white hover:bg-white hover:text-black border border-black"
                    >
                        Connect Wallet
                    </button>
                )}
                {(account && contract_address) && (
                    <button
                        id="sendBtn"
                        onClick={sendTransaction}
                        className="w-full mt-2 py-2 px-4 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Send Transaction
                    </button>
                )}
            </div>
            <div id="status" className="mt-2 text-green-700 text-center break-all">{status}</div>
            <div id="error" className="mt-2 text-red-600 text-center break-all">{error}</div>
        </div>
    );
}

export default SubmitCard;
