# Asteria Starter Kit

## Reference Docs

- [Asteria on-chain design document](https://github.com/txpipe/asteria/blob/main/onchain/docs/design/design.md)
- [Asteria on-chain validators](https://github.com/txpipe/asteria/tree/main/onchain/src)

## Using Tx3

This starter kit relies on the [Tx3 toolchain](https://docs.txpipe.io/tx3), a development toolkit for UTxO protocols. Make sure to visite the [Tx3 installation](https://docs.txpipe.io/tx3/installation) guide to setup your system before continuing.

The `main.tx3` file contains the interface definition for the Asteria protocol. This file uses the Tx3 DSL to describe the different on-chain interactions that your bot may need.

We encourage you to explore the [Tx3 language](https://docs.txpipe.io/tx3), but if you just want to keep going with Asteria, the important thing to notice is that the `main.tx` file contains definition for several function-like artifacts that describe each of the transaction of the Asteria protocol.

```js
tx create_ship(
    // Ship Position X
    p_pos_x: Int, 
    // Ship Position Y
    p_pos_y: Int,
    // Name of the ship
    ship_name: Bytes,
    // Name of the pilot
    pilot_name: Bytes,
    // The tip of the chain when submitting the Tx
    // TODO: this won't be necessary on future versions of Tx3
    tip_slot: Int, 
    // the POSIX timestamp at the time of submitting the Tx
    last_move_timestamp: Int,
) {
    ...
}
```

The body of each of these _functions_ contains the transaction building logic that you need for controlling your Asteria ship.

## Building your bot

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

### Get your wallet private key

In order to get your wallet private key you can use [cbor.me](https://cbor.me/).

Paste your `cborHex` value from the `pilot.sk` file and you'll get your wallet private key.

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

### List map items

In order to get the information about the items on the map you can query the Asteria GraphQL API.

#### GraphQL API URL

[`https://8000-ethereal-audience-bb83g6.us1.demeter.run/graphql`](https://8000-ethereal-audience-bb83g6.us1.demeter.run/graphql)

#### GraphQL Query

```graphql
query {
  objectsInRadius(
    center: { x: 0, y: 0 },
    radius: 1000,
    spacetimePolicyId: "0291ae7aebaf064b785542093c2b13169effb34462301e68d4b44f43",
    spacetimeAddress: "addr1wypfrtn6awhsvjmc24pqj0ptzvtfalang33rq8ng6j6y7scnlkytx",
    pelletPolicyId: "3babcffc6102ec25ced40e1a24fba20371925c46f0299b2b9456360e4655454c",
    pelletAddress: "addr1wya6hnluvypwcfww6s8p5f8m5gphryjugmcznxetj3trvrsc307jj",
    asteriaAddress: "addr1w824uvev63kj40lzfhaq2kxzmmwsz9xsqsjr2t4cq74vzdcdw8c77",
    tokens: [
      { name: "iagon", displayName: "IAGON", assetName: "$IAG", policyId: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114494147", decimals: 6 },
      { name: "sundae", displayName: "SundaeSwap", assetName: "$SUNDAE", policyId: "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753554e444145", decimals: 6 },
      { name: "hosky", displayName: "Hosky", assetName: "$HOSKY", policyId: "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59", decimals: 6 },
      { name: "metera", displayName: "Metera", assetName: "$METERA", policyId: "8ebb4f0eb39543cdab83eb35f5f194798817eaaa3061872b4101efdb0014df104d4554455241", decimals: 6 },
      { name: "indigo", displayName: "Indigo DAO Token", assetName: "$INDY", policyId: "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459", decimals: 6 },
      { name: "minswap", displayName: "Minswap", assetName: "$MIN", policyId: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e", decimals: 6 },
      { name: "stuff", displayName: "Stuff", assetName: "$STUFF", policyId: "51a5e236c4de3af2b8020442e2a26f454fda3b04cb621c1294a0ef34424f4f4b", decimals: 6 },
      { name: "fluid", displayName: "FluidTokens", assetName: "$FLDT", policyId: "577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454", decimals: 6 },
      { name: "vyfi", displayName: "VyFinance", assetName: "$VYFI", policyId: "804f5544c1962a40546827cab750a88404dc7108c0f588b72964754f56594649", decimals: 6 },
      { name: "white-trash-warlock", displayName: "White Trash Warlock #388", assetName: "NFT", policyId: "c5ec84e79e58cd5d7203d38738848991ddce76efad59ef701b6f4cf4576869746554726173685761726c6f636b333838" },
      { name: "silver", displayName: "SILVER #1119", assetName: "NFT", policyId: "a0bf068fda05eda2d7cd00e51cdc599059449294101e7211a12195f953494c56455231313139" },
      { name: "collecting-the-simpsons", displayName: "Collecting the Simpsons #074", assetName: "NFT", policyId: "11fb60cbc42fc2012327d82309fe0c5cb39e5b2e83a83a9272d2faad436f6c6c656374696e6753696d70736f6e73303734" },
      { name: "about-stuff", displayName: "About Stuff E0 | #9361", assetName: "NFT", policyId: "b4df23876be7207fe26e0cddfb08d6a73ff83754075efafb5344623441533039333631" },
      { name: "gutenberg-bible", displayName: "Gutenberg Bible #2603", assetName: "NFT", policyId: "477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202332363033" }
    ],
  ) {
    __typename
    position { x y }
    ... on Ship { id fuel shipTokenName { name } pilotTokenName { name } }
    ... on Pellet { id fuel }
    ... on Token { id displayName assetName amount }
    ... on Asteria { id totalRewards }
  }
}
```

#### GraphQL Query cURL

```bash
curl --location 'https://8000-ethereal-audience-bb83g6.us1.demeter.run/graphql' \
--header 'Content-Type: application/json' \
--data '{"query":"query {\n\tobjectsInRadius(center: { x: 0, y: 0 }, radius: 1000, spacetimePolicyId: \"0291ae7aebaf064b785542093c2b13169effb34462301e68d4b44f43\", spacetimeAddress: \"addr1wypfrtn6awhsvjmc24pqj0ptzvtfalang33rq8ng6j6y7scnlkytx\", pelletPolicyId: \"3babcffc6102ec25ced40e1a24fba20371925c46f0299b2b9456360e4655454c\", pelletAddress: \"addr1wya6hnluvypwcfww6s8p5f8m5gphryjugmcznxetj3trvrsc307jj\", asteriaAddress: \"addr1w824uvev63kj40lzfhaq2kxzmmwsz9xsqsjr2t4cq74vzdcdw8c77\", tokens: [{name: \"iagon\", displayName: \"IAGON\", assetName: \"$IAG\", policyId: \"5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114494147\", decimals: 6},{name: \"sundae\", displayName: \"SundaeSwap\", assetName: \"$SUNDAE\", policyId: \"9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d7753554e444145\", decimals: 6},{name: \"hosky\", displayName: \"Hosky\", assetName: \"$HOSKY\", policyId: \"a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59\", decimals: 6},{name: \"metera\", displayName: \"Metera\", assetName: \"$METERA\", policyId: \"8ebb4f0eb39543cdab83eb35f5f194798817eaaa3061872b4101efdb0014df104d4554455241\", decimals: 6},{name: \"indigo\", displayName: \"Indigo DAO Token\", assetName: \"$INDY\", policyId: \"533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459\", decimals: 6},{name: \"minswap\", displayName: \"Minswap\", assetName: \"$MIN\", policyId: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\", decimals: 6},{name: \"stuff\", displayName: \"Stuff\", assetName: \"$STUFF\", policyId: \"51a5e236c4de3af2b8020442e2a26f454fda3b04cb621c1294a0ef34424f4f4b\", decimals: 6},{name: \"fluid\", displayName: \"FluidTokens\", assetName: \"$FLDT\", policyId: \"577f0b1342f8f8f4aed3388b80a8535812950c7a892495c0ecdf0f1e0014df10464c4454\", decimals: 6},{name: \"vyfi\", displayName: \"VyFinance\", assetName: \"$VYFI\", policyId: \"804f5544c1962a40546827cab750a88404dc7108c0f588b72964754f56594649\", decimals: 6},{name: \"white-trash-warlock\", displayName: \"White Trash Warlock #388\", assetName: \"NFT\", policyId: \"c5ec84e79e58cd5d7203d38738848991ddce76efad59ef701b6f4cf4576869746554726173685761726c6f636b333838\"},{name: \"silver\", displayName: \"SILVER #1119\", assetName: \"NFT\", policyId: \"a0bf068fda05eda2d7cd00e51cdc599059449294101e7211a12195f953494c56455231313139\"},{name: \"collecting-the-simpsons\", displayName: \"Collecting the Simpsons #074\", assetName: \"NFT\", policyId: \"11fb60cbc42fc2012327d82309fe0c5cb39e5b2e83a83a9272d2faad436f6c6c656374696e6753696d70736f6e73303734\"},{name: \"about-stuff\", displayName: \"About Stuff E0 | #9361\", assetName: \"NFT\", policyId: \"b4df23876be7207fe26e0cddfb08d6a73ff83754075efafb5344623441533039333631\"},{name: \"gutenberg-bible\", displayName: \"Gutenberg Bible #2603\", assetName: \"NFT\", policyId: \"477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202332363033\"}])\n  { __typename position { x y } ... on Ship { id fuel shipTokenName { name } pilotTokenName { name } } ... on Pellet { id fuel } ... on Token { id displayName assetName amount } ... on Asteria { id totalRewards } }\n}","variables":{}}'
```

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

| Validator | Address                                                      | Policy ID                                                  |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Asteria   | `addr1w824uvev63kj40lzfhaq2kxzmmwsz9xsqsjr2t4cq74vzdcdw8c77` | `d55e332cd46d2abfe24dfa0558c2dedd0114d00424352eb807aac137` |
| Pellet    | `addr1wya6hnluvypwcfww6s8p5f8m5gphryjugmcznxetj3trvrsc307jj` | `3babcffc6102ec25ced40e1a24fba20371925c46f0299b2b9456360e` |
| Spacetime | `addr1wypfrtn6awhsvjmc24pqj0ptzvtfalang33rq8ng6j6y7scnlkytx` | `0291ae7aebaf064b785542093c2b13169effb34462301e68d4b44f43` |
| Admin     |                                                              | `db0d968cda2cc636b28c0f377e66691a065b8004e57be5129aeef822` |
