# Asteria Starter Kit

## Reference Docs

- [Asteria on-chain design document](https://github.com/txpipe/asteria/blob/main/onchain/docs/design/design.md)
- [Asteria on-chain validators](https://github.com/txpipe/asteria/tree/main/onchain/src)

## Install the toolchain

Visit the [Tx3 installation](https://docs.txpipe.io/tx3/installation) guide.

## Starting the project

First you need to install the Node dependencies:

```bash
npm install
```

### Create a wallet for the pilot 

The following command uses cardano-cli to create a new private / public key for the pilot. This is the wallet that will control the actions of the ship.

```
cardano-cli address key-gen --verification-key-file pilot.vk --signing-key-file pilot.sk
```

Run the following command to get the address of your new wallet:

```
cardano-cli address build --payment-verification-key-file pilot.vk --mainnet
```

Make sure to send some ADA to the address to use as "gas" for executing the required transactions.

### Provide the required env vars

You need to create a `.env` file with your wallet info:

```env
PLAYER_PRIVATE_KEY="1234"
PLAYER_ADDRESS="addr..."
```

### Create Ship Tx

This is the first step in order to play the game.

You need to replace the params with the required values:

`src/txs/create-ship.ts`

```ts
const positionX = 25; // Replace with your desired start X position
const positionY = 25; // Replace with your desired start Y position
const shipName = "SHIP0"; // Replace 0 with the next ship number
const pilotName = "PILOT0"; // Replace 0 with the next ship number
const tipSlot = 0; // Replace with the latest block slot
```

Rules to take into account:

- the ship number has to be exactly +1 of the last ship minted
- the tip slot must be recent because it's used during validation of the tx
- the start position has to be at a certain distance ([manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry)) of coordinates (0,0). For the mainnet challenge the minimum distance is `50`. 

You can query the next available ship and pilot token names using the following curl:

```
curl --location 'https://8000-ethereal-audience-bb83g6.us1.demeter.run/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query { nextShipTokenName(spacetimePolicyId: \"0291ae7aebaf064b785542093c2b13169effb34462301e68d4b44f43\", spacetimeAddress: \"addr1wypfrtn6awhsvjmc24pqj0ptzvtfalang33rq8ng6j6y7scnlkytx\") { shipName pilotName } }","variables":{}}'
```

You can query the tip of the chain using the following curl:

```
curl --location 'https://8000-ethereal-audience-bb83g6.us1.demeter.run/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query { lastSlot { slot } }","variables":{}}'
```

Run this in order to create and submit the transaction:

```bash
npm run create-ship
```

### Move Ship Tx

With this transaction you can move the ship through the space.

You need to replace the params with the required values:

`src/txs/move-ship.ts`
```ts
const deltaX = 5; // Replace with your desired X movement units
const deltaY = 5; // Replace with your desired Y movement units
const requiredFuel = 1; // Replace with the required fuel for the movement
const shipName = "SHIP0"; // Replace with your ship name
const pilotName = "PILOT0"; // Replace with your pilot name
const tipSlot = 0; // Replace with the latest block slot
```

Rules to take into account:

- the ship number has to be the one controlled by the pilot token in your wallet.
- the total distance you travel is constrained by the number of slots between your tx validity range (ttl end - ttl start).
- the amount of fuel you pass is proportional to the total distance you travel (deltaX + deltaY).


Run this in order to create and submit the transaction:

```bash
npm run move-ship
```
