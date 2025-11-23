import React, { useImperativeHandle, forwardRef } from 'react';

export interface InfoCardRef {
    getSelectedLang: () => "en" | "de" | "fr";
}

interface InfoCardProps {
    lang: "en" | "de" | "fr";
    onLanguageChange?: (lang: "en" | "de" | "fr") => void;
    contractAddress: string;
}

const languages = [
    { code: "en", label: "English" },
    { code: "de", label: "Deutsch" },
    { code: "fr", label: "Français" }
];

const getInfoContent = (contractAddress: string) => ({
    en: {
        sections: [
            {
                content: (
                    <>
                        This application is a proof of concept for the collection of 'signatures' for{" "}
                        <a
                            href="https://en.wikipedia.org/wiki/Popular_initiative_in_Switzerland"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            popular initiatives
                        </a>  in Switzerland
                        {" "}
                        <a
                            href={`https://testnet.snowtrace.io/address/${contractAddress}/contract/43113/code`}
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            on the blockchain
                        </a>
                        .
                    </>
                )
            },
            {
                content: (
                    <>
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
                    </>
                )
            },
            {
                content: (
                    <>
                        See this blog article for more details on the concept:{" "}
                        <a
                            href="https://dss.swiss/2025/01/31/democracy-3-0/"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Democracy 3.0
                        </a>
                    </>
                )
            }
        ]
    },
    de: {
        sections: [
            {
                content: (
                    <>
                        Diese Anwendung ist ein Proof-of-Concept für das Sammeln von «Unterschriften» für{" "}
                        <a
                            href="https://de.wikipedia.org/wiki/Volksinitiative_(Schweiz)"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Volksinitiativen
                        </a> in der Schweiz
                        {" "}auf der{" "}
                        <a
                            href={`https://testnet.snowtrace.io/address/${contractAddress}/contract/43113/code`}
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                             Blockchain
                        </a>
                        .
                    </>
                )
            },
            {
                content: (
                    <>
                        Um eine Petition zu unterschreiben, müssen Sie Ihre Identität mit Ihrer{" "}
                        <a
                            href="https://www.eid.admin.ch/"
                            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Schweizer e-ID
                        </a>
                        {" "}nachweisen. Die Schweizer e-ID ist derzeit in der BETA-Phase, daher kann jede*r{" "}
                        <a
                            href="https://www.bcs.admin.ch/bcs-web/#/"
                            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            eine BETA-e-ID erstellen
                        </a>
                        , um mit dem Smart Contract zu interagieren.
                    </>
                )
            },
            {
                content: (
                    <>
                        Siehe diesen Blog-Artikel für mehr Details zum Konzept:{" "}
                        <a
                            href="https://dss.swiss/2025/01/31/democracy-3-0/"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Democracy 3.0
                        </a>
                    </>
                )
            }
        ]
    },
    fr: {
        sections: [
            {
                content: (
                    <>
                        Cette application est une preuve de concept pour la collecte de « signatures » pour les{" "}
                        <a
                            href="https://fr.wikipedia.org/wiki/Initiative_populaire_f%C3%A9d%C3%A9rale_(Suisse)"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            initiatives populaires
                        </a>
                        {" "}en Suisse sur la  {" "}
                        <a
                            href={`https://testnet.snowtrace.io/address/${contractAddress}/contract/43113/code`}
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            blockchain
                        </a>
                        .
                    </>
                )
            },
            {
                content: (
                    <>
                        Pour signer une pétition (dans le smart contract), vous devez prouver votre identité avec votre{" "}
                        <a
                            href="https://www.eid.admin.ch/"
                            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            e-ID suisse
                        </a>
                        . L'e-ID suisse est actuellement en BÊTA, donc tout le monde peut{" "}
                        <a
                            href="https://www.bcs.admin.ch/bcs-web/#/"
                            className="inline-block text-blue-600 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            créer une e-ID BÊTA
                        </a>
                        {" "}pour interagir avec le smart contract.
                    </>
                )
            },
            {
                content: (
                    <>
                        Voir cet article de blog pour plus de détails sur le concept :{" "}
                        <a
                            href="https://dss.swiss/2025/01/31/democracy-3-0/"
                            className="inline-block text-blue-700 font-semibold hover:bg-blue-100 hover:rounded px-1 transition"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Democracy 3.0
                        </a>
                    </>
                )
            }
        ]
    }
});

const InfoCard = forwardRef<InfoCardRef, InfoCardProps>(({ lang, onLanguageChange, contractAddress }, ref) => {
    const infoContent = getInfoContent(contractAddress);

    useImperativeHandle(ref, () => ({
        getSelectedLang: () => lang
    }), [lang]);

    return (
        <div className="bg-white rounded-2xl shadow-lg mt-4 p-6 w-full max-w-md">
            <div className="flex justify-center items-center mb-4 gap-4 select-none">
                {languages.map(({ code, label }) => (
                    <span
                        key={code}
                        onClick={() => onLanguageChange?.(code as "en" | "de" | "fr")}
                        className={`cursor-pointer font-semibold transition pb-0.5 border-b-2 ${lang === code
                                ? "text-blue-700 border-blue-700"
                                : "text-gray-500 border-transparent hover:text-blue-700"
                            }`}
                        style={{ userSelect: "none" }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={e =>
                            (e.key === "Enter" || e.key === " ") && onLanguageChange?.(code as "en" | "de" | "fr")
                        }
                        aria-label={`Show info in ${label}`}
                    >
                        {label}
                    </span>
                ))}
            </div>
            <div className="space-y-4 text-gray-800 text-base min-h-[100px] whitespace-pre-line">
                {infoContent[lang].sections.map((section, i) => (
                    <div key={i}>{section.content}</div>
                ))}
            </div>
        </div>
    );
});

export default InfoCard;