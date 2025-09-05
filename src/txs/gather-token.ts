import dotenv from "dotenv";
import { SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { Client, GatherTokenParams } from "../bindings/protocol";
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

  const fuelAmount = 3; // Replace with the desired fuel to gather
  const shipName = "SHIP60"; // Replace with your ship name
  const pilotName = "PILOT60"; // Replace with your pilot name
  const pelletRef = "2853b765da3e75237f1d6d70c0db3315d67afcc3c20812775ccf74246b383b6b#62"; // Pellet UTxO reference

  const tokenAmount = 1; // Token amount to gather
  const tokenName = "AS09361"; // Token name
  const tokenPolicyHash = Uint8Array.from(Buffer.from("b4df23876be7207fe26e0cddfb08d6a73ff83754075efafb53446234", "hex")); // Token policy hash

  const playerAddress = process.env.PLAYER_ADDRESS;
  const tipSlot = 165470021; // Replace with the latest block slot

  const sinceSlot = tipSlot - 100; // 100 is just to be safe

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    pilotName,
    shipName,
    pelletRef,
    fuelAmount,
    tokenAmount,
    tokenName,
    tokenPolicyHash,
    sinceSlot,
  });

  const args: GatherTokenParams = {
    player: playerAddress,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    pelletRef,
    fuelAmount: fuelAmount,
    tokenAmount,
    tokenName: new TextEncoder().encode(tokenName),
    tokenPolicyHash,
    sinceSlot,
  };

  const response = await client.gatherTokenTx(args);

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
