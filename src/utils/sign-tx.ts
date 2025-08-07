import { SubmitWitness } from "tx3-sdk/trp";
import { ed25519 } from "@noble/curves/ed25519";

export default function signTx(txHash: string, privateKey: string): SubmitWitness[] {
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