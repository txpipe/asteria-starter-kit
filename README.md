# Asteria Dev

## Install the toolchain

To start working with Tx3 you’ll need to install the toolchain. The fastest way to setup your environment is to run tx3up, which bundles everything you need in a single install experience:

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/tx3-lang/up/releases/latest/download/tx3up-installer.sh | sh
```

Once you’ve installed tx3up, run the following command to execute the install of toolchain:

```bash
tx3up
```

You’ll see how the process downloads and install many components. By the end, you should have everything you need.

Run the following command to check the installed versions of each component:

```bash
tx3up show
```

The installer has a lot of advanced features, check our [tx3up guide](https://docs.txpipe.io/tools/tx3up) if you want to learn more.

## Starting the project

First you need to install the Node dependencies:

```bash
npm install
```
