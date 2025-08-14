import dotenv from "dotenv";
import { SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { Client, CreateShipParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

export async function run() {
  dotenv.config();

  if (!process.env.PLAYER_PRIVATE_KEY) {
    throw new Error("PLAYER_PRIVATE_KEY environment variable is not set");
  }

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  // These are the default values for the Tx3 backend server running on Demeter. It has a free tier that you
  // can use. Feel free to use your own if you need more throughput. More info on https://docs.tx3.io/tx3 .
  const DEFAULT_TRP_ENDPOINT = "https://cardano-mainnet.trp-m1.demeter.run";
  const DEFAULT_TRP_API_KEY = "trp1lrnhzcax5064cgxsaup";

  const client = new Client({
    endpoint: process.env.TRP_ENDPOINT || DEFAULT_TRP_ENDPOINT,
    headers: {
      "dmtr-api-key": process.env.TRP_API_KEY || DEFAULT_TRP_API_KEY,
    },
  });

  const playerAddress = process.env.PLAYER_ADDRESS;
  const positionX = 25; // Replace with your desired start X position
  const positionY = -25; // Replace with your desired start Y position
  const shipName = "SHIP33"; // Replace 0 with the next ship number
  const pilotName = "PILOT33"; // Replace 0 with the next ship number
  const tipSlot = 163614877; // Replace with the latest block slot
  const lastMoveTimestamp = Date.now() + 300_000;

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    positionX,
    positionY,
    shipName,
    pilotName,
    tipSlot,
  });

  const args: CreateShipParams = {
    player: playerAddress,
    pPosX: positionX,
    pPosY: positionY,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    tipSlot: tipSlot + 300, // 5 minutes from last block
    lastMoveTimestamp,
  };

  const response = await client.createShipTx(args);

  console.log("-- RESOLVE");
  console.log(response);

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
    await client.submit(submitParams);
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
