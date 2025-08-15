import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { Client, MoveShipParams } from "../bindings/protocol";
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

  const slotRequiredPerStep = 12096;
  const playerAddress = process.env.PLAYER_ADDRESS;
  const deltaX = -1; // Replace with your desired X movement units
  const deltaY = 0; // Replace with your desired Y movement units
  const requiredFuel = 1; // Replace with the required fuel for the movement
  const shipName = "SHIP33"; // Replace with your ship name
  const pilotName = "PILOT33"; // Replace with your pilot name
  const tipSlot = 163716537; // Replace with the latest block slot

  // computed values
  const distance = Math.abs(deltaX) + Math.abs(deltaY);
  const sinceSlot = tipSlot - 100; // 100 is just to be safe;
  const untilSlot = tipSlot + slotRequiredPerStep * distance;
  const lastMoveTimestamp = Date.now() + slotRequiredPerStep * distance * 1000;

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    deltaX,
    deltaY,
    requiredFuel,
    shipName,
    pilotName,
    sinceSlot,
    untilSlot,
    lastMoveTimestamp,
  });

  const args: MoveShipParams = {
    player: playerAddress,
    pDeltaX: deltaX,
    pDeltaY: deltaY,
    requiredFuel: requiredFuel,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    sinceSlot,
    untilSlot,
    lastMoveTimestamp,
  };

  const response = await client.moveShipTx(args);

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
    await client.submit(submitParams);
    console.log("-- DONE");
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
