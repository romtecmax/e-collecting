// BIG WARNING: REMOVE COMMENTS BEFORE PASTING INTO SMART CONTRACT
// IF YOU DON'T REMOVE THE COMMENTS, THE FUNCTION CALL WILL ALWAYS FAIL.

//Ensure we have the secrets
if (!secrets.ENCRYPTION_SECRET) {throw Error('Encryption secret is not available.')}
if (!secrets.HASH_SECRET) { throw Error('Hash secret is not available.') }

// Decrypt the received identifier
const ciphertext = new Uint8Array(args[0].match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const iv = new Uint8Array(args[1].match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const keyBytes = new Uint8Array(secrets.ENCRYPTION_SECRET.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false,['decrypt']);
const textBytes = await crypto.subtle.decrypt( { name: 'AES-GCM', iv: iv }, key, ciphertext );
const identifier = new TextDecoder().decode(new Uint8Array(textBytes));
if (!identifier) { throw Error('Identifier not provided.'); }

// Validate request with swiss federal government API
const url = `https://www.bcs.admin.ch/bcs-web/rest/betaId/verification/${identifier}`;
const response = await Functions.makeHttpRequest({url, method: 'GET'});
if (!response || !response.data) { throw Error('Verification not successful.'); }

// Check the results
const state = response.data.state;
if (!(state === 'SUCCESS')) {throw Error('Verification has not been completed. Please verify with your e-ID.');}
const ageverified = response.data.wallet_response?.credential_subject_data?.age_over_18;
if (!(ageverified === 'true')) {throw Error('Too young to sign!');}
const person_uid = response.data.wallet_response?.credential_subject_data?.personal_administrative_number;
if (!person_uid) { throw Error('No person_uid found.'); }

// Hash the document number and return the resulting bytes.
const data = new TextEncoder().encode(`${person_uid}${secrets.HASH_SECRET}`);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
return Functions.encodeString(new Uint8Array(hashBuffer));