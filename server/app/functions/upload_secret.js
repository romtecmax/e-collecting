import { ethers } from "ethers";
import { SecretsManager } from "@chainlink/functions-toolkit";

// # infura_api_key


export const uploadSecrets = async (slotIdNumber) => {

    const routerAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0";
    const donId = "fun-avalanche-fuji-1";
    const gatewayUrls = [
        "https://01.functions-gateway.testnet.chain.link",
        "https://02.functions-gateway.testnet.chain.link",
    ];

    // Initialize ethers signer and provider to interact with the contracts onchain
    const privateKey = process.env.PRIVATE_KEY; // fetch PRIVATE_KEY
    if (!privateKey)
        throw new Error(
            "private key not provided - check your environment variables"
        );
    if (!process.env.HASH_SECRET)
        throw new Error(
            "HASH_SECRET not provided - check your environment variables"
        );
    if (!process.env.ENCRYPTION_SECRET)
        throw new Error(
            "HASH_SECRET not provided - check your environment variables"
        );




    const secrets = {
        HASH_SECRET: process.env.HASH_SECRET,
        ENCRYPTION_SECRET: process.env.ENCRYPTION_SECRET
    };
    const expirationTimeMinutes = 30; // expiration time in minutes of the secrets

    // INFURA_FUJI_URL
    const rpcUrl = process.env.INFURA_ENDPOINT; // using avalanche Fuji api

    if (!rpcUrl)
        throw new Error(`rpcUrl not provided  - check your environment variables`);

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider); // create ethers signer for signing transactions


    // First encrypt secrets and upload the encrypted secrets to the DON
    const secretsManager = new SecretsManager({
        signer: signer,
        functionsRouterAddress: routerAddress,
        donId: donId,
    });
    await secretsManager.initialize();

    // Encrypt secrets and upload to DON
    const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);

    console.log(
        `Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`
    );
    // Upload secrets
    const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
        encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
        gatewayUrls: gatewayUrls,
        slotId: slotIdNumber,
        minutesUntilExpiration: expirationTimeMinutes,
    });

    if (!uploadResult.success)
        throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`);

    console.log(
        `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
        uploadResult
    );

    return parseInt(uploadResult.version); // fetch the reference of the encrypted secrets
}