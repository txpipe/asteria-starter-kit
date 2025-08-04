import { SubmitWitness } from "tx3-sdk/trp";

import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import { ed25519 } from "@noble/curves/ed25519";

/**
 * Cardano derivation path for payment keys
 * m/1852'/1815'/0'/0/0 (first payment key)
 */
const CARDANO_PAYMENT_DERIVATION_PATH = "m/1852'/1815'/0'/0/0";

export default function signTx(txHash: string, mnemonic: string): SubmitWitness[] {
  const seed = mnemonicToSeedSync(mnemonic);
  const rootKey = HDKey.fromMasterSeed(seed);
  const privateKey = rootKey.derive(CARDANO_PAYMENT_DERIVATION_PATH).privateKey;

  if (!privateKey) {
    throw new Error("Failed to derive private key");
  }

  const signature = ed25519.sign(txHash, privateKey);
  const publicKey = ed25519.getPublicKey(privateKey);
  
  return [{
    type: 'vkey',
    key: {
      content: Buffer.from(publicKey).toString('hex'),
      encoding: 'hex'
    },
    signature: {
      content: Buffer.from(signature).toString('hex'),
      encoding: 'hex'
    }
  }];
}