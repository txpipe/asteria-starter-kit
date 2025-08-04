import dotenv from "dotenv";
import { ArgValue } from "tx3-sdk/trp";
import { protocol, CreateShipParams } from "../bindings/protocol";

export async function run() {

  dotenv.config();

  if (!process.env.PLAYER_ADDRESS) {
    throw new Error("PLAYER_ADDRESS environment variable is not set");
  }

  const playerAddress = process.env.PLAYER_ADDRESS;
  const positionX = 20;
  const positionY = 20;
  const shipName = "SHIP12";
  const pilotName = "PILOT12";
  const tipSlot = 87681631;

  console.log("PARAMS");
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

  console.log("RESOLVE");
  console.log(response);
}

run().catch((error) => {
  console.error("Error running transaction:", error);
  process.exit(1);
});