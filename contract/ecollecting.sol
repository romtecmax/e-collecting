// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract ECollector is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // router Avalanche Fuji: 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0
    // donId Avalanche Fuji: 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000
    // 8f83ace9-88d0-4093-b30d-b1ecc655f3b9

    // Name of the Initiative
    string public name;
    // Router contract
    address public router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0; // Avalanche Fuji
    // Storage mapping to keep history of singatures
    mapping(bytes => bool) public signatures;
    // counts the collected signatures
    uint public counter = 0;

    bytes32 public s_lastRequestId;

    // Errors
    error VoteAlreadyCounted();
    error FunctionError(string message);
    error UnexpectedRequestID(bytes32 requestId);

    // Events
    event SignatureCollected(
        bytes signature,
        uint totalCount
    );
    event Response(
        bytes response,
        bytes err
    );

    // for demo purposes, we hardcode the javascript here
    string hardcoded_source =
"if (!secrets.ENCRYPTION_SECRET) {throw Error('Encryption secret is not available.')}"
"if (!secrets.HASH_SECRET) { throw Error('Hash secret is not available.') }"
"const ciphertext = new Uint8Array(args[0].match(/.{1,2}/g).map(byte => parseInt(byte, 16)));"
"const iv = new Uint8Array(args[1].match(/.{1,2}/g).map(byte => parseInt(byte, 16)));"
"const keyBytes = new Uint8Array(secrets.ENCRYPTION_SECRET.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));"
"const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false,['decrypt']);"
"const textBytes = await crypto.subtle.decrypt( { name: 'AES-GCM', iv: iv }, key, ciphertext );"
"const identifier = new TextDecoder().decode(new Uint8Array(textBytes));"
"if (!identifier) { throw Error('Identifier not provided.'); }"
"const url = `https://www.bcs.admin.ch/bcs-web/rest/betaId/verification/${identifier}`;"
"const response = await Functions.makeHttpRequest({url, method: 'GET'});"
"if (!response || !response.data) { throw Error('Verification not successful.'); }"
"const state = response.data.state;"
"if (!(state === 'SUCCESS')) {throw Error('Verification has not been completed. Please verify with your e-ID.');}"
"const ageverified = response.data.wallet_response?.credential_subject_data?.age_over_18;"
"if (!(ageverified === 'true')) {throw Error('Too young to sign!');}"
"const person_uid = response.data.wallet_response?.credential_subject_data?.personal_administrative_number;"
"if (!person_uid) { throw Error('No person_uid found.'); }"
"const data = new TextEncoder().encode(`${person_uid}${secrets.HASH_SECRET}`);"
"const hashBuffer = await crypto.subtle.digest('SHA-256', data);"
"return Functions.encodeString(new Uint8Array(hashBuffer));"
   ;

    // constructor sets the chainlink functions router
    constructor(string memory initiative_name) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        name = initiative_name;
    }

    /**
     * @notice Send a simple request
     * @param identifier verification id from the verifier
     */
    function sendRequest(
        string memory identifier,
        string memory iv,
        uint8 secret_slot,
        uint64 secret_version
    ) external returns (bytes32 requestId) {
        
        string[] memory stringarray = new string[](2);
        stringarray[0] = identifier;
        stringarray[1] = iv;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(hardcoded_source);
        req.setArgs(stringarray);

        // add DON hosted secret slot & version
        req.addDONHostedSecrets(
                secret_slot,
                secret_version
            );

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            15632, // subscription id
            300000, // gasLimit
            0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000 // donId for Avalanche Fuji Chain
        );
        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {

        // Emit an event logging the response
        emit Response(response, err);

        // check if we have an error or a response
        if (err.length == 0 && response.length > 0) {

            // if the signature has already been submitted, revert
            if (signatures[response])
            {
                revert VoteAlreadyCounted();
            } else {
                // if the signature is new, note it down
                // and increment the counter
                signatures[response] = true;
                counter += 1;
                emit SignatureCollected(response, counter);
            }
        } else {
            // An error occured in the function
            revert FunctionError(string(err));
        }

    }
}

