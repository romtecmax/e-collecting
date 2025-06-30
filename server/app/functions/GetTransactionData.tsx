

import { json } from "@remix-run/node";
import { encryptString } from "~/functions/encrypt";
import { uploadSecrets } from "~/functions/upload_secret";


export async function getTransactionData(verification_id: string, slot_id: Number) {

  if (!verification_id) {
    throw new Error("Missing verification_id");
  }

  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("Encryption secret not set");
  }

  const contract_address = process.env.CONTRACT_ADDRESS;
  if (!contract_address) {
    throw new Error("Contract address not set");
  }

  let encrypted_identifier;
  try {
    encrypted_identifier = await encryptString(verification_id);
  } catch (e: any) {
      console.log("Encryption failed.")
    throw new Error(e.message);
  }

  let secret_version;
  try {
    secret_version = await uploadSecrets(slot_id);
  } catch (e: any) {
    throw new Response(e.message, { status: 500 });
  }

  return {
    encrypted_verification_id: encrypted_identifier.ciphertext_with_tag,
    iv: encrypted_identifier.iv,
    secret_version: secret_version,
    contract_address,
  };
}