import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { protocol, MoveShipParams } from "../bindings/protocol";
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
  const deltaX = 5; // Replace with your desired X movement units
  const deltaY = 5; // Replace with your desired Y movement units
  const requiredFuel = 1; // Replace with the required fuel for the movement
  const shipName = "SHIP0"; // Replace with your ship name
  const pilotName = "PILOT0"; // Replace with your pilot name
  const tipSlot = 0; // Replace with the latest block slot
  const lastMoveTimestamp = Date.now();

  console.log("-- PARAMS");
  console.log({
    playerAddress,
    deltaX,
    deltaY,
    requiredFuel,
    shipName,
    pilotName,
    tipSlot,
    lastMoveTimestamp,
  });

  const args: MoveShipParams = {
    player: playerAddress,
    pDeltaX: deltaX,
    pDeltaY: deltaY,
    requiredFuel: requiredFuel,
    pilotName: new TextEncoder().encode(pilotName),
    shipName: new TextEncoder().encode(shipName),
    tipSlot: tipSlot + 300, // 5 minutes from last block
    lastMoveTimestamp,
  };

  const response = await protocol.moveShipTx(args);

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