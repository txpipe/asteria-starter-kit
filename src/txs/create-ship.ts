import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { protocol, CreateShipParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

export async function run() {

  dotenv.config();

  if (!process.env.PLAYER_PRIVATE_KEY) {
    throw new Error("PLAYER_PRIVATE_KEY environment variable is not set");
  }

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  const playerAddress = process.env.PLAYER_ADDRESS;
  const positionX = 20;
  const positionY = 20;
  const shipName = "SHIP12"; // Replace with the next ship number
  const pilotName = "PILOT12"; // Replace with the next ship number
  const tipSlot = 87863190; // Replace with the latest block slot
  const lastMoveTimestamp = Date.now();

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

  const response = await protocol.createShipTx(args);

  console.log("-- RESOLVE");
  console.log(response);

  const witnesses = signTx(response.hash, process.env.PLAYER_PRIVATE_KEY);

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