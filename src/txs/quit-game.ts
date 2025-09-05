import dotenv from "dotenv";
import { SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { Client, QuitGameParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

export async function run() {
  dotenv.config();

  if (!process.env.PLAYER_PRIVATE_KEY) {
    throw new Error("PLAYER_PRIVATE_KEY environment variable is not set");
  }

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  const DEFAULT_TRP_ENDPOINT = "https://cardano-mainnet.trp-m1.demeter.run";
  const DEFAULT_TRP_API_KEY = "trp1lrnhzcax5064cgxsaup";

  const client = new Client({
    endpoint: process.env.TRP_ENDPOINT || DEFAULT_TRP_ENDPOINT,
    headers: {
      "dmtr-api-key": process.env.TRP_API_KEY || DEFAULT_TRP_API_KEY,
    },
  });

  const shipName = "SHIP60"; // Replace with your ship name
  const pilotName = "PILOT60"; // Replace with your pilot name
  const shipFuel = 3; // Replace with the ship fuel

  const playerAddress = process.env.PLAYER_ADDRESS;
  const tipSlot = 165470021; // Replace with the latest block slot

  const sinceSlot = tipSlot - 100; // 100 is just to be safe

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    pilotName,
    shipName,
    shipFuel,
    sinceSlot,
  });

  const args: QuitGameParams = {
    player: playerAddress,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    shipFuel,
    sinceSlot,
  };

  const response = await client.quitGameTx(args);

  console.log("-- RESOLVE");
  console.dir(response, { depth: null });

  const witnesses = signTx(response.hash, process.env.PLAYER_PRIVATE_KEY);

  console.log("-- SIGN TX");
  console.log(witnesses);

  const submitParams: SubmitParams = {
    tx: {
      content: response.tx,
      encoding: "hex",
    } as BytesEnvelope,
    witnesses,
  };

  console.log("-- SUBMIT");
  console.log(submitParams);

  try {
    const response = await client.submit(submitParams);
    console.log("-- DONE");
    console.log(response);
  } catch (error) {
    console.error("-- SUBMIT ERROR");
    console.error("Failed to submit transaction:", error);
  }
}

run().catch((error) => {
  console.error("-- ERROR");
  console.dir(error, { depth: null });
  process.exit(1);
});
