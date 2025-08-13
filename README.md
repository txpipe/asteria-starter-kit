# Asteria Starter Kit

## Mainnet Challenge

The mainnet challenge is ready for play! There's 10k ADA and tokens in rewards 🎉

### Parameters

```json
{
  "ship_mint_lovelace_fee": 1000000,
  "max_asteria_mining": 50,
  "max_speed": {
    "distance": 1,
    "time": 12096000
  },
  "max_ship_fuel": 5,
  "fuel_per_step": 1,
  "initial_fuel": 5,
  "min_asteria_distance": 50
}
```

### Validators

| Validator | Address | Policy ID |
|-----------|---------|-----------|
| Asteria   | `addr1w824uvev63kj40lzfhaq2kxzmmwsz9xsqsjr2t4cq74vzdcdw8c77` | `d55e332cd46d2abfe24dfa0558c2dedd0114d00424352eb807aac137` |
| Pellet    | `addr1wya6hnluvypwcfww6s8p5f8m5gphryjugmcznxetj3trvrsc307jj` | `3babcffc6102ec25ced40e1a24fba20371925c46f0299b2b9456360e` |
| Spacetime | `addr1wypfrtn6awhsvjmc24pqj0ptzvtfalang33rq8ng6j6y7scnlkytx` | `0291ae7aebaf064b785542093c2b13169effb34462301e68d4b44f43` |
| Admin     |                                                              | `db0d968cda2cc636b28c0f377e66691a065b8004e57be5129aeef822` |

## Build your own bot

### Reference Docs

- [Asteria on-chain design document](https://github.com/txpipe/asteria/blob/main/onchain/docs/design/design.md)
- [Asteria on-chain validators](https://github.com/txpipe/asteria/tree/main/onchain/src)

### Install the toolchain

Visit the [Tx3 installation](https://docs.txpipe.io/tx3/installation) guide.

### Starting the project

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

This transaction creates a `ShipState` UTxO locking min ada, a `ShipToken` (minted in this tx) and an `INITIAL_FUEL` amount of fuel tokens (minted in this tx), specifying in the datum the initial `pos_x` and `pos_y` coordinates of the ship, the ship and pilot token names and the `last_move_latest_time` as the upper bound of the transaction's validity range (posix time). Also adds to the `AsteriaUTxO` value the `SHIP_MINT_LOVELACE_FEE` paid by the user.

![createShip](https://github.com/txpipe/asteria/blob/main/onchain/docs/design/img/createShip.png?raw=true)

You need to replace the params with the required values in `src/txs/create-ship.ts`:

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

This transaction updates the `pos_x`, `pos_y` and `fuel` datum fields of the `ShipState` UTxO by adding the `delta_x` and `delta_y` values specified in the redeemer, and subtracts from the ship value the amount of fuel tokens needed for the displacement (which are burnt in this tx). Also updates the `last_move_latest_time` field with the transaction's validity range latest posix time.

![moveShip](https://github.com/txpipe/asteria/blob/main/onchain/docs/design/img/moveShip.png?raw=true)

You need to replace the params with the required values in `src/txs/move-ship.ts`:

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