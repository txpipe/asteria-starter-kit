import dotenv from "dotenv";
import { ArgValue, SubmitParams, BytesEnvelope } from "tx3-sdk/trp";
import { protocol, CreateShipParams } from "../bindings/protocol";
import signTx from "../utils/sign-tx";

const CHALLENGE = {
  spacetimePolicyHash: new TextEncoder().encode('b6c5e14f31af0c92515ce156625afc4749e30ceef178cfae1f929fff'),
  spacetimePolicyRef: '81667fe89e20c352a8428f68efd0c9db1fef6cd15aa36ad4423797bb2c401431#1',
  pelletPolicyHash: new TextEncoder().encode('98b1c97b219c102dd0e9ba014481272d6ec069ec3ff47c63e291f1b7'),
  pelletPolicyRef: '81667fe89e20c352a8428f68efd0c9db1fef6cd15aa36ad4423797bb2c401431#2',
  asteriaPolicyHash: new TextEncoder().encode('b16a0775a5e045b482ab2a98e241c9347f8ffe265bb6acd10452a6cc'),
  asteriaPolicyRef: '81667fe89e20c352a8428f68efd0c9db1fef6cd15aa36ad4423797bb2c401431#0',
  adminTokenName: new TextEncoder().encode('asteriaAdmin'),
  adminTokenPolicyHash: new TextEncoder().encode('516238dd0a79bac4bebe041c44bad8bf880d74720733d2fc0d255d28'),
  initialFuel: 5,
  shipMintLovelaceFee: 1_000_000,
}

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
  const shipName = "SHIP0"; // Replace with the next ship number
  const pilotName = "PILOT0"; // Replace with the next ship number
  const tipSlot = 88297128; // Replace with the latest block slot
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