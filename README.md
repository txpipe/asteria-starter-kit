# Asteria Starter Kit

## Install the toolchain

Visit the [Tx3 installation](https://docs.txpipe.io/tx3/installation) guide.

## Starting the project

First you need to install the Node dependencies:

```bash
npm install
```

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

Run this in order to create and submit the transaction:

```bash
npm run move-ship
```
