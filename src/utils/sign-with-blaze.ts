import {
  CborSet,
  Ed25519PrivateNormalKeyHex,
  HexBlob,
  NetworkId,
  Transaction,
  TransactionWitnessSet,
  TxCBOR,
  VkeyWitness,
} from "@blaze-cardano/core";
import { HotSingleWallet } from "@blaze-cardano/wallet";
import { U5C } from "@utxorpc/blaze-provider";

export function addSignature(cbor: string, signature: string): Transaction {
  const signed = TransactionWitnessSet.fromCbor(HexBlob(signature));
  const tx = Transaction.fromCbor(TxCBOR(cbor));
  const ws = tx.witnessSet();
  const vkeys = ws.vkeys()?.toCore() ?? [];

  const signedKeys = signed.vkeys();
  if (!signedKeys) {
    throw new Error(
      "signTransaction: no signed keys in wallet witness response",
    );
  }

  if (
    signedKeys.toCore().some(([vkey]) => vkeys.some(([key2]) => vkey == key2))
  ) {
    throw new Error("signTransaction: some keys were already signed");
  }

  ws.setVkeys(
    CborSet.fromCore([...signedKeys.toCore(), ...vkeys], VkeyWitness.fromCore),
  );
  tx.setWitnessSet(ws);

  return tx;
}

const provider = new U5C({
  url: "https://mainnet.utxorpc-v0.demeter.run",
  headers: { "dmtr-api-key": "some dmtr api key" },
  network: NetworkId.Mainnet,
});

const wallet = new HotSingleWallet(
  Ed25519PrivateNormalKeyHex(""),
  NetworkId.Mainnet,
  provider,
);

const txCbor = TxCBOR("");
const witnessSet = await wallet.signTransaction(Transaction.fromCbor(txCbor));

const signedCbor = addSignature(txCbor, witnessSet.toCbor()).toCbor();
console.log(signedCbor);
