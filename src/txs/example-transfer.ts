import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { protocol, TransferParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

export async function run() {

  dotenv.config();

  if (!process.env.SENDER_PRIVATE_KEY) {
    throw new Error("SENDER_PRIVATE_KEY environment variable is not set");
  }

  if (!process.env.SENDER_ADDRESS) {
    throw new Error("SENDER_ADDRESS environment variable is not set");
  }

  if (!process.env.RECEIVER_ADDRESS) {
    throw new Error("RECEIVER_ADDRESS environment variable is not set");
  }

  const sender = process.env.SENDER_ADDRESS;
  const receiver = process.env.RECEIVER_ADDRESS;
  const quantity = 1000000;

  console.log("-- PARAMS");
  console.log({ sender, receiver, quantity });

  const args: TransferParams = {
    sender: ArgValue.from(sender),
    receiver: ArgValue.from(receiver),
    quantity: ArgValue.from(quantity),
  };

  const response = await protocol.transferTx(args);

  console.log("-- RESOLVE");
  console.log(response);

  const witnesses = signTx(response.hash, process.env.SENDER_PRIVATE_KEY);

  console.log("-- SIGN TX");
  console.log(witnesses);

  const submitParams: SubmitParams = {
    tx: {
      content: response.tx,
      encoding: 'hex'
    } as BytesEnvelope,
    witnesses
  };
  
  console.log("-- SUBMIT");
  console.log(submitParams);
  
  try {
    await protocol.submit(submitParams);
    console.log("-- DONE");
  } catch (error) {
    console.error("-- SUBMIT ERROR");
    console.error("Failed to submit transaction:", error);
  }
}

run().catch((error) => {
  console.error("-- ERROR");
  console.error("Error running transaction:", error);
  process.exit(1);
});