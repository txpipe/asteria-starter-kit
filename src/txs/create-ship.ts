import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { protocol, CreateShipParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

export async function run() {

  dotenv.config();

  if (!process.env.PLAYER_SEED_PHRASE) {
    throw new Error("PLAYER_SEED_PHRASE environment variable is not set");
  }

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  const playerAddress = process.env.PLAYER_ADDRESS;
  const positionX = 20;
  const positionY = 20;
  const shipName = "SHIP12";
  const pilotName = "PILOT12";
  const tipSlot = 87684701;

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
    player: ArgValue.from(playerAddress),
    pPosX: ArgValue.from(positionX),
    pPosY: ArgValue.from(positionY),
    pilotName: ArgValue.from(new TextEncoder().encode(pilotName)),
    shipName: ArgValue.from(new TextEncoder().encode(shipName)),
    tipSlot: ArgValue.from(tipSlot + 300), // 5 minutes from last block
  };

  const response = await protocol.createShipTx(args);

  console.log("-- RESOLVE");
  console.log(response);

  const playerSeedPhrase = process.env.PLAYER_SEED_PHRASE;
  const witnesses = signTx(response.hash, playerSeedPhrase);

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