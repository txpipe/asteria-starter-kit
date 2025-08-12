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



```bash
npm run create-ship
```

### Move Ship Tx

```bash
npm run move-ship
```
