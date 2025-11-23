import React, { useState } from "react";
import Web3 from "web3";
import contractABI from "~/functions/contractABI.json";

const translations = {
    step2: {
        en: "Step 2: Submit Signature to Smart Contract",
        de: "Schritt 2: Signatur im Smart Contract einreichen",
        fr: "Étape 2 : Soumettre la signature au smart contract"
    },
    contract: {
        en: "Contract:",
        de: "Smart Contract:",
        fr: "Contrat :"
    },
    connectWallet: {
        en: "Connect Wallet",
        de: "Wallet verbinden",
        fr: "Connecter le portefeuille"
    },
    sendTx: {
        en: "Send Transaction",
        de: "Transaktion senden",
        fr: "Envoyer la transaction"
    },
    connecting: {
        en: "Wallet connected:",
        de: "Wallet verbunden:",
        fr: "Portefeuille connecté :"
    },
    loading: {
        en: "Loading...",
        de: "Lädt...",
        fr: "Chargement..."
    },
    txSent: {
        en: "Transaction sent! Tx hash:",
        de: "Transaktion gesendet! Tx Hash :",
        fr: "Transaction envoyée ! Hash Tx :"
    },
    errorNoMeta: {
        en: "MetaMask not detected",
        de: "MetaMask nicht gefunden",
        fr: "MetaMask introuvable"
    },
    walletFail: {
        en: "Wallet connection failed:",
        de: "Wallet-Verbindung fehlgeschlagen:",
        fr: "Échec de la connexion au portefeuille :"
    },
    pleaseFuji: {
        en: "Please switch to Avalanche Fuji Network, you are on",
        de: "Bitte wechseln Sie auf das Avalanche Fuji Netzwerk, Sie sind auf",
        fr: "Veuillez passer au réseau Avalanche Fuji, vous êtes sur"
    },
    fujiChain: {
        en: "The Fuji chain id is",
        de: "Die Fuji chain id ist",
        fr: "L'identifiant de la Fuji chain est"
    },
    txFail: {
        en: "Transaction failed:",
        de: "Transaktion fehlgeschlagen:",
        fr: "Échec de la transaction :"
    },
    sending: {
        en: "Sending transaction...",
        de: "Sende Transaktion...",
        fr: "Envoi de la transaction..."
    }
};

interface SubmitCardProps {
    slot_id: number;
    encrypted_verification_id: string;
    iv: string;
    secret_version: string;
    contract_address: string;
    lang?: "en" | "de" | "fr";
}

const SubmitCard: React.FC<SubmitCardProps> = ({
    slot_id,
    encrypted_verification_id,
    iv,
    secret_version,
    contract_address,
    lang = "en"
}) => {

    const [account, setAccount] = useState<string | null>(null);
    const [status, setStatus] = useState<string | Element>("");
    const [error, setError] = useState<string>("");

    // ensure we're on avalanche fuji
    const FUJI_CHAIN_ID = '0xa869';
    async function ensureFuji() {
        if (!window.ethereum) throw new Error(translations.errorNoMeta[lang]);
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId.toLowerCase() === FUJI_CHAIN_ID) {
            return;
        }
        setError(`${translations.pleaseFuji[lang]} ${currentChainId}. ${translations.fujiChain[lang]} ${FUJI_CHAIN_ID}`);
        throw new Error("Not on Fuji.")
    }

    // Connect wallet handler
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await ensureFuji();
            }
            catch {
                return;
            }
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                setAccount(accounts[0]);
                setStatus(`${translations.connecting[lang]} ${accounts[0]}`);
            } catch (err: any) {
                setError(`${translations.walletFail[lang]} ${err.message}`);
            }
        } else {
            setError(translations.errorNoMeta[lang]);
        }
    };

    const sendTransaction = async () => {
        setError("");
        setStatus(translations.sending[lang]);
        try {
            if (!window.ethereum) {
                setError(translations.errorNoMeta[lang]);
                return;
            }
            const web3 = new Web3(window.ethereum);

            const contract = new web3.eth.Contract(
                contractABI as any,
                contract_address
            );

            const method = contract.methods.sendRequest(
                encrypted_verification_id,
                iv,
                slot_id,
                secret_version,
            );

            const data = method.encodeABI();

            const txObject = {
                from: account,
                to: contract_address,
                data: data
            };

            const tx = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [txObject],
            });

            setStatus(
                <>
                    {translations.txSent[lang]}{" "}
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
            setError(`${translations.txFail[lang]} ${err.message}`);
        }
    };

    return (
        <div className="text-black py-3 mt-6">
            <h2 className="text-xl font-bold text-center">{translations.step2[lang]}</h2>
            <div className="mt-2 text-sm flex justify-between">
                <span className="font-semibold">{translations.contract[lang]}</span>
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
                    <span id="contract_address">{translations.loading[lang]}</span>
                )}
            </div>
            <div className="flex flex-col w-full gap-3 py-3">
                {!account && (
                    <button
                        id="connectBtn"
                        onClick={connectWallet}
                        className="w-full py-2 mt-2 rounded-md font-semibold transition-colors bg-black text-white hover:bg-white hover:text-black border border-black"
                    >
                        {translations.connectWallet[lang]}
                    </button>
                )}
                {(account && contract_address) && (
                    <button
                        id="sendBtn"
                        onClick={sendTransaction}
                        className="w-full mt-2 py-2 px-4 rounded-md font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {translations.sendTx[lang]}
                    </button>
                )}
            </div>
            <div id="status" className="mt-2 text-green-700 text-center break-all">{status}</div>
            <div id="error" className="mt-2 text-red-600 text-center break-all">{error}</div>
        </div>
    );
}

export default SubmitCard;